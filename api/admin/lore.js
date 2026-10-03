import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual
} from 'node:crypto';
import { google } from 'googleapis';
import {
  pairLoreDocuments,
  parseLoreDocxBuffer,
  validateLoreDocument
} from './lore-parser.js';

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT || 'raquel-synths-platform';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const DOC_MIME = 'application/msword';
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
const SESSION_COOKIE = '__Host-rqs_admin_session';
const SESSION_TTL = 20 * 60 * 1000;
const LORE_DRY_RUN_TTL = 10 * 60 * 1000;

class LoreDriveError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

function secret() {
  const value = process.env.RQS_ADMIN_TOKEN;
  if (!value || Buffer.byteLength(value) < 32) {
    throw new LoreDriveError(
      500,
      'MISSING_ADMIN_CONFIGURATION',
      'A credencial administrativa não está configurada com segurança.'
    );
  }
  return value;
}

function origin(value) {
  try {
    return new URL(
      /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`
    ).origin;
  } catch {
    return '';
  }
}

function allowedOrigins() {
  const values = new Set([
    'https://raquelsynths.com',
    'https://www.raquelsynths.com'
  ]);

  if (process.env.VERCEL_ENV === 'preview') {
    for (const value of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
      if (value) values.add(origin(value));
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    values.add('http://localhost:4200');
    values.add('http://127.0.0.1:4200');
  }

  return values;
}

function requireOrigin(req) {
  if (
    !allowedOrigins().has(origin(req.headers.origin || '')) ||
    req.headers['sec-fetch-site'] === 'cross-site'
  ) {
    throw new LoreDriveError(
      403,
      'ORIGIN_NOT_ALLOWED',
      'A origem não está autorizada.'
    );
  }
}

function cookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map(value => value.trim())
      .filter(Boolean)
      .map(value => {
        const separator = value.indexOf('=');
        return [value.slice(0, separator), value.slice(separator + 1)];
      })
  );
}

function signSession(payload, key) {
  return createHmac('sha256', key)
    .update(`admin-session:${payload}`)
    .digest('base64url');
}

function readSession(req, key) {
  const [payload, signature, ...extra] = String(
    cookies(req)[SESSION_COOKIE] || ''
  ).split('.');

  if (
    !payload ||
    !signature ||
    extra.length ||
    !safeEqual(signature, signSession(payload, key))
  ) {
    return null;
  }

  try {
    const value = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    return value.version === 1 &&
      value.csrfToken &&
      value.nonce &&
      Number(value.issuedAt) <= Date.now() &&
      Number(value.expiresAt) > Date.now() &&
      Number(value.expiresAt) - Number(value.issuedAt) <= SESSION_TTL
      ? value
      : null;
  } catch {
    return null;
  }
}

function requireSession(req, key) {
  const session = readSession(req, key);
  if (!session) {
    throw new LoreDriveError(
      401,
      'ADMIN_SESSION_REQUIRED',
      'A sessão administrativa expirou ou não existe.'
    );
  }
  return session;
}

function requireCsrf(req, session) {
  if (!safeEqual(req.headers['x-rqs-csrf'] || '', session.csrfToken)) {
    throw new LoreDriveError(
      403,
      'CSRF_VALIDATION_FAILED',
      'A proteção CSRF recusou a operação.'
    );
  }
}

function requestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new LoreDriveError(400, 'INVALID_JSON', 'JSON inválido.');
    }
  }
  return req.body;
}

function normalizeMode(value) {
  const mode = String(value || '').trim().toLowerCase();
  if (mode !== 'broklin' && mode !== 'jonah') {
    throw new LoreDriveError(
      400,
      'INVALID_LORE_MODE',
      'Mode deve ser broklin ou jonah.'
    );
  }
  return mode;
}

function sourceConfig(modeValue) {
  const mode = normalizeMode(modeValue);
  const isBroklin = mode === 'broklin';
  const folderId = isBroklin
    ? process.env.RQS_LORE_BROKLIN_DRIVE_FOLDER_ID
    : process.env.RQS_LORE_JONAH_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new LoreDriveError(
      500,
      'MISSING_LORE_DRIVE_FOLDER_CONFIGURATION',
      `A pasta Drive de ${isBroklin ? 'Broklin' : 'Jonah'} não está configurada.`
    );
  }

  return {
    mode,
    folderId,
    folderName: isBroklin ? 'Lore - Broklin' : 'Lore - Jonah',
    collection: isBroklin ? 'lore' : 'lore-jonah'
  };
}

function driveAuth() {
  const raw = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new LoreDriveError(
      500,
      'MISSING_DRIVE_CONFIGURATION',
      'Credencial Drive não configurada.'
    );
  }

  let credentials;
  try {
    credentials = JSON.parse(raw);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
  } catch {
    throw new LoreDriveError(
      500,
      'INVALID_DRIVE_CONFIGURATION',
      'Credencial Google inválida.'
    );
  }

  return new google.auth.GoogleAuth({
    credentials,
    projectId: credentials?.project_id,
    scopes: [DRIVE_SCOPE]
  });
}

function firestoreAuth() {
  const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new LoreDriveError(
      500,
      'MISSING_FIRESTORE_CONFIGURATION',
      'Credencial Firestore não configurada.'
    );
  }

  let credentials;
  try {
    credentials = JSON.parse(raw);
    if (credentials.private_key) {
      credentials.private_key =
        credentials.private_key.replace(/\\n/g, '\n');
    }
  } catch {
    throw new LoreDriveError(
      500,
      'INVALID_FIRESTORE_CONFIGURATION',
      'Credencial Firestore inválida.'
    );
  }

  return new google.auth.GoogleAuth({
    credentials,
    projectId: credentials.project_id || PROJECT_ID,
    scopes: ['https://www.googleapis.com/auth/datastore']
  });
}

async function driveClient() {
  return google.drive({
    version: 'v3',
    auth: await driveAuth().getClient()
  });
}

function isLegacyDoc(file) {
  return file.mimeType === DOC_MIME || /\.doc$/i.test(file.name || '');
}

function supportFor(file) {
  if (isLegacyDoc(file)) {
    return {
      status: 'BLOCKED',
      message: 'Formato .doc legado detectado. Converta para .docx.'
    };
  }

  if (file.mimeType !== DOCX_MIME || !/\.docx$/i.test(file.name || '')) {
    return {
      status: 'BLOCKED',
      message: 'Formato não suportado. A fonte Lore deve ser um arquivo .docx.'
    };
  }

  return { status: 'SUPPORTED', message: '' };
}

function languageHint(name) {
  const value = String(name || '');
  if (/(?:^|[\s._-])pt(?:[\s._-]*br)?(?:[\s._-]|$)/i.test(value)) return 'pt-BR';
  if (/(?:^|[\s._-])en(?:[\s._-]*us)?(?:[\s._-]|$)/i.test(value)) return 'en-US';
  return '';
}

function mapDriveFile(file, config) {
  const support = supportFor(file);
  return {
    documentId: file.id,
    name: file.name || 'Documento sem nome',
    mimeType: file.mimeType || '',
    modifiedTime: file.modifiedTime || '',
    webViewLink: file.webViewLink || '',
    size: Number(file.size || 0),
    languageHint: languageHint(file.name),
    sourceLocation: `Google Drive / ${config.folderName}`,
    mode: config.mode,
    collection: config.collection,
    support
  };
}

async function listDocuments(modeValue) {
  const config = sourceConfig(modeValue);
  const drive = await driveClient();
  const result = await drive.files.list({
    q: `'${config.folderId}' in parents and trashed = false`,
    fields: 'files(id,name,modifiedTime,mimeType,webViewLink,size)',
    orderBy: 'name',
    pageSize: 100,
    spaces: 'drive'
  });

  return (result.data.files || [])
    .filter(file => /\.docx?$/i.test(file.name || '') || file.mimeType === DOCX_MIME || file.mimeType === DOC_MIME)
    .map(file => mapDriveFile(file, config));
}

function validateDocumentId(documentId) {
  if (!/^[a-zA-Z0-9_-]{10,200}$/.test(String(documentId || ''))) {
    throw new LoreDriveError(
      400,
      'INVALID_DOCUMENT_ID',
      'Identificador do documento inválido.'
    );
  }
}

async function readDriveDocument(modeValue, documentId) {
  validateDocumentId(documentId);
  const config = sourceConfig(modeValue);
  const drive = await driveClient();
  const metadataResult = await drive.files.get({
    fileId: documentId,
    fields: 'id,name,parents,mimeType,modifiedTime,webViewLink,size'
  });
  const metadata = metadataResult.data;

  if (!(metadata.parents || []).includes(config.folderId)) {
    throw new LoreDriveError(
      404,
      'DOCUMENT_NOT_IN_LORE_FOLDER',
      `Documento não pertence à pasta ${config.folderName}.`
    );
  }

  const source = mapDriveFile(metadata, config);
  if (source.support.status === 'BLOCKED') {
    throw new LoreDriveError(
      415,
      'UNSUPPORTED_LORE_DOCUMENT',
      source.support.message,
      { source }
    );
  }

  if (source.size > MAX_DOCUMENT_BYTES) {
    throw new LoreDriveError(
      413,
      'DOCUMENT_TOO_LARGE',
      'O documento excede o limite seguro de 20 MB.'
    );
  }

  const result = await drive.files.get(
    { fileId: documentId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  const buffer = Buffer.from(result.data);

  if (buffer.byteLength > MAX_DOCUMENT_BYTES) {
    throw new LoreDriveError(
      413,
      'DOCUMENT_TOO_LARGE',
      'O documento excede o limite seguro de 20 MB.'
    );
  }

  return { source, buffer };
}

function validateLanguageIdentity(parsed, expectedLanguage) {
  const validation = validateLoreDocument(parsed, expectedLanguage);
  const blocked = [...validation.blocked];

  if (
    parsed?.inferredLanguage &&
    parsed.inferredLanguage !== expectedLanguage
  ) {
    blocked.push(
      `Nome da fonte indica ${parsed.inferredLanguage}, mas o slot esperado é ${expectedLanguage}.`
    );
  }

  return {
    ...validation,
    status: blocked.length ? 'BLOCKED' : validation.status,
    blocked
  };
}

async function parseSlot(mode, documentId, language) {
  const document = await readDriveDocument(mode, documentId);
  const parsed = await parseLoreDocxBuffer(document.buffer, {
    sourceName: document.source.name,
    language
  });

  return {
    source: document.source,
    parsed,
    validation: validateLanguageIdentity(parsed, language)
  };
}

function firestoreValue(value) {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(firestoreValue)
      }
    };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(
            ([key, item]) => [key, firestoreValue(item)]
          )
        )
      }
    };
  }
  return { stringValue: String(value) };
}

function parseFirestoreValue(value = {}) {
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) {
    return (value.arrayValue?.values || []).map(parseFirestoreValue);
  }
  if ('mapValue' in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue?.fields || {})
        .map(([key, item]) => [key, parseFirestoreValue(item)])
    );
  }
  return undefined;
}

async function firestoreToken() {
  const auth = await firestoreAuth().getClient();
  const value = await auth.getAccessToken();
  return typeof value === 'string' ? value : value.token;
}

function firestoreDocumentName(collection, id) {
  return `projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${id}`;
}

async function readExistingLoreDocuments(collection, ids) {
  const token = await firestoreToken();

  const entries = await Promise.all(ids.map(async id => {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/${firestoreDocumentName(collection, id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 404) return [id, null];

    if (!response.ok) {
      throw new LoreDriveError(
        502,
        'FIRESTORE_PREFLIGHT_FAILED',
        `Não foi possível verificar ${collection}/${id}.`
      );
    }

    const document = await response.json();

    return [id, {
      id,
      updateTime: document.updateTime || '',
      fields: Object.fromEntries(
        Object.entries(document.fields || {})
          .map(([key, value]) => [key, parseFirestoreValue(value)])
      )
    }];
  }));

  return Object.fromEntries(entries);
}

function materiallyEqual(left, right) {
  return String(left ?? '').trim() === String(right ?? '').trim();
}

function editorialFields(episode, language) {
  const base = {
    title: episode.title || '',
    category: episode.category || '',
    description: episode.description || '',
    content: episode.content || ''
  };

  if (language === 'pt-BR') return base;

  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => [`${key}_en`, value])
  );
}

function sharedFields(episode) {
  return {
    image: episode.image || '',
    releaseDate: episode.releaseDate || ''
  };
}

function createLoreWritePlan({
  mode,
  collection,
  language,
  parsed,
  existingDocuments = {}
}) {
  const items = (parsed?.episodes || []).map(episode => {
    const id = episode.id;
    const existing = existingDocuments[id] || null;
    const incomingEditorial = editorialFields(episode, language);
    const incomingShared = sharedFields(episode);

    if (!existing) {
      if (language === 'en-US') {
        return {
          id,
          action: 'BLOCKED',
          language,
          fields: [],
          issues: [
            'Base PT-BR ausente. Importe a versão PT-BR antes da EN-US.'
          ]
        };
      }

      return {
        id,
        action: 'CREATE_PT',
        language,
        fields: [
          ...Object.keys(incomingEditorial),
          ...Object.keys(incomingShared),
          'mode',
          'published'
        ],
        issues: []
      };
    }

    const existingFields = existing.fields || {};
    const issues = [];

    if (existingFields.mode !== mode) {
      issues.push(`mode existente diverge de ${mode}.`);
    }

    if (existingFields.published !== true) {
      issues.push('published existente deve permanecer true.');
    }

    if (language === 'en-US') {
      for (const requiredPtField of [
        'title',
        'category',
        'description',
        'content'
      ]) {
        if (!Object.hasOwn(existingFields, requiredPtField)) {
          issues.push(
            `Base PT-BR incompleta: ${requiredPtField} está ausente.`
          );
        }
      }

      for (const [fieldName, incomingValue] of
        Object.entries(incomingShared)) {
        if (!Object.hasOwn(existingFields, fieldName)) {
          issues.push(`${fieldName} compartilhado está ausente.`);
        } else if (!materiallyEqual(
          existingFields[fieldName],
          incomingValue
        )) {
          issues.push(
            `${fieldName} compartilhado diverge da fonte EN-US.`
          );
        }
      }
    }

    if (issues.length) {
      return {
        id,
        action: 'BLOCKED',
        language,
        fields: [],
        issues
      };
    }

    const writeFields = [];

    for (const [fieldName, incomingValue] of
      Object.entries(incomingEditorial)) {
      if (
        !Object.hasOwn(existingFields, fieldName) ||
        !materiallyEqual(existingFields[fieldName], incomingValue)
      ) {
        writeFields.push(fieldName);
      }
    }

    if (language === 'pt-BR') {
      for (const [fieldName, incomingValue] of
        Object.entries(incomingShared)) {
        if (
          !Object.hasOwn(existingFields, fieldName) ||
          !materiallyEqual(existingFields[fieldName], incomingValue)
        ) {
          writeFields.push(fieldName);
        }
      }
    }

    return {
      id,
      action: writeFields.length
        ? language === 'pt-BR' ? 'MERGE_PT' : 'MERGE_EN'
        : language === 'pt-BR' ? 'UNCHANGED_PT' : 'UNCHANGED_EN',
      language,
      fields: writeFields,
      issues: []
    };
  });

  return {
    mode,
    collection,
    language,
    items
  };
}

function loreWritesEnabled() {
  if (process.env.RQS_LORE_WRITES_ENABLED !== 'true') {
    return false;
  }

  if (process.env.VERCEL_ENV === 'preview') {
    return process.env.VERCEL_GIT_COMMIT_REF ===
      'feat/admin-lore-module-02';
  }

  return process.env.NODE_ENV !== 'production';
}

function loreWritePlanFingerprint(items) {
  return createHash('sha256')
    .update(JSON.stringify((items || []).map(item => ({
      id: item.id,
      action: item.action,
      language: item.language,
      fields: item.fields,
      issues: item.issues
    }))))
    .digest('base64url');
}

function loreDryRunIdentity({
  mode,
  collection,
  source,
  language,
  sourceChecksum,
  writePlan
}) {
  return {
    mode,
    collection,
    documentId: source.documentId,
    modifiedTime: source.modifiedTime,
    language,
    sourceChecksum,
    writePlanFingerprint: loreWritePlanFingerprint(writePlan)
  };
}

function loreDryRunDigest(identity, key) {
  return createHmac('sha256', key)
    .update(JSON.stringify(identity))
    .digest('base64url');
}

function makeLoreDryRunToken(identity, key) {
  const payload = Buffer.from(JSON.stringify({
    digest: loreDryRunDigest(identity, key),
    expiresAt: Date.now() + LORE_DRY_RUN_TTL,
    nonce: randomUUID()
  })).toString('base64url');

  const signature = createHmac('sha256', key)
    .update(`lore-dry-run:${payload}`)
    .digest('base64url');

  return `${payload}.${signature}`;
}

function verifyLoreDryRunToken(token, identity, key) {
  const [payload, signature, ...extra] =
    String(token || '').split('.');

  if (
    !payload ||
    !signature ||
    extra.length ||
    !safeEqual(
      signature,
      createHmac('sha256', key)
        .update(`lore-dry-run:${payload}`)
        .digest('base64url')
    )
  ) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    return Number(decoded.expiresAt) > Date.now() &&
      decoded.digest === loreDryRunDigest(identity, key);
  } catch {
    return false;
  }
}

function firestoreWritesForLorePlan({
  mode,
  collection,
  language,
  parsed,
  existingDocuments,
  writePlan
}) {
  if (language !== 'pt-BR') {
    throw new LoreDriveError(
      409,
      'LORE_PT_IMPORT_NOT_ALLOWED',
      'Stage 4 permite escrita somente da fonte PT-BR.'
    );
  }

  const episodeById = new Map(
    (parsed?.episodes || []).map(episode => [episode.id, episode])
  );

  return (writePlan || []).flatMap(item => {
    if (
      item.action === 'UNCHANGED_PT' ||
      item.action === 'UNCHANGED_EN'
    ) {
      return [];
    }

    if (
      item.action === 'BLOCKED' ||
      item.action === 'MERGE_EN'
    ) {
      throw new LoreDriveError(
        409,
        'LORE_WRITE_PLAN_BLOCKED',
        `Plano de escrita bloqueado em ${item.id}.`
      );
    }

    const episode = episodeById.get(item.id);
    if (!episode) {
      throw new LoreDriveError(
        409,
        'LORE_EPISODE_NOT_FOUND',
        `Episódio ${item.id} não existe na fonte atual.`
      );
    }

    const canonicalFields = {
      ...editorialFields(episode, 'pt-BR'),
      ...sharedFields(episode),
      mode,
      published: true
    };

    const fieldNames = item.action === 'CREATE_PT'
      ? [
          'title',
          'category',
          'description',
          'content',
          'image',
          'releaseDate',
          'mode',
          'published'
        ]
      : item.fields;

    const fields = Object.fromEntries(
      fieldNames.map(fieldName => [
        fieldName,
        firestoreValue(canonicalFields[fieldName])
      ])
    );

    if (item.action === 'CREATE_PT') {
      return [{
        update: {
          name: firestoreDocumentName(collection, item.id),
          fields
        },
        currentDocument: { exists: false }
      }];
    }

    if (item.action !== 'MERGE_PT') {
      throw new LoreDriveError(
        409,
        'LORE_WRITE_PLAN_BLOCKED',
        `Ação ${item.action} não é autorizada no Stage 4.`
      );
    }

    const existing = existingDocuments[item.id];
    if (!existing?.updateTime) {
      throw new LoreDriveError(
        409,
        'LORE_PRECONDITION_MISSING',
        `${item.id}: updateTime ausente para merge seguro.`
      );
    }

    return [{
      update: {
        name: firestoreDocumentName(collection, item.id),
        fields
      },
      updateMask: {
        fieldPaths: fieldNames
      },
      currentDocument: {
        updateTime: existing.updateTime
      }
    }];
  });
}

async function commitLoreWrites(writes) {
  if (!writes.length) return;

  const token = await firestoreToken();
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents:commit`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ writes })
    }
  );

  if (!response.ok) {
    throw new LoreDriveError(
      response.status === 409 ? 409 : 502,
      'LORE_COMMIT_FAILED',
      'O Firestore recusou o commit. Execute o DRY RUN novamente.'
    );
  }
}

function summarizeLorePlan(plan, existingDocuments) {
  const values = Object.values(existingDocuments || {});
  return {
    ids: plan.items.length,
    existing: values.filter(Boolean).length,
    missing: values.filter(value => !value).length,
    writable: plan.items.filter(item =>
      ['CREATE_PT', 'MERGE_PT', 'MERGE_EN'].includes(item.action)
    ).length,
    unchanged: plan.items.filter(item =>
      ['UNCHANGED_PT', 'UNCHANGED_EN'].includes(item.action)
    ).length,
    blocked: plan.items.filter(item =>
      item.action === 'BLOCKED'
    ).length
  };
}

async function dryRunSingleSource(modeValue, documentId) {
  const config = sourceConfig(modeValue);
  const document = await readDriveDocument(config.mode, documentId);
  const language = document.source.languageHint;

  if (language !== 'pt-BR' && language !== 'en-US') {
    throw new LoreDriveError(
      422,
      'LORE_LANGUAGE_NOT_IDENTIFIED',
      'O nome do DOCX deve identificar PT-BR ou EN-US.'
    );
  }

  const parsed = await parseLoreDocxBuffer(document.buffer, {
    sourceName: document.source.name,
    language
  });

  const baseValidation = validateLanguageIdentity(parsed, language);
  const ids = (parsed.episodes || []).map(episode => episode.id);
  let existingDocuments = {};
  let writePlan = {
    mode: config.mode,
    collection: config.collection,
    language,
    items: []
  };

  if (!baseValidation.blocked.length && ids.length) {
    existingDocuments = await readExistingLoreDocuments(
      config.collection,
      ids
    );

    writePlan = createLoreWritePlan({
      mode: config.mode,
      collection: config.collection,
      language,
      parsed,
      existingDocuments
    });
  } else {
    writePlan.items = ids.map(id => ({
      id,
      action: 'BLOCKED',
      language,
      fields: [],
      issues: [...baseValidation.blocked]
    }));
  }

  const planBlocked = writePlan.items
    .filter(item => item.action === 'BLOCKED')
    .flatMap(item =>
      item.issues.map(issue => `${item.id}: ${issue}`)
    );

  const blocked = [...baseValidation.blocked, ...planBlocked];
  const catalogMatch = summarizeLorePlan(
    writePlan,
    existingDocuments
  );
  const validationStatus = blocked.length ? 'BLOCKED' : 'PASS';
  const importAllowed =
    language === 'pt-BR' &&
    validationStatus === 'PASS' &&
    catalogMatch.writable > 0;
  const sourceChecksum = createHash('sha256')
    .update(document.buffer)
    .digest('base64url');
  const identity = loreDryRunIdentity({
    mode: config.mode,
    collection: config.collection,
    source: document.source,
    language,
    sourceChecksum,
    writePlan: writePlan.items
  });

  return {
    mode: config.mode,
    collection: config.collection,
    sourceLocation: `Google Drive / ${config.folderName}`,
    source: document.source,
    language,
    parsed,
    validation: {
      status: validationStatus,
      blocked,
      warnings: baseValidation.warnings
    },
    catalogMatch,
    writePlan: writePlan.items,
    dryRunToken: importAllowed
      ? makeLoreDryRunToken(identity, secret())
      : null,
    writesEnabled: loreWritesEnabled(),
    importAllowed,
    firestoreReads: ids.length,
    firestoreWrites: 0,
    sourceMutated: false
  };
}

async function importLorePt(
  modeValue,
  documentId,
  dryRunToken,
  key
) {
  if (!loreWritesEnabled()) {
    throw new LoreDriveError(
      403,
      'LORE_WRITES_DISABLED',
      'A escrita de Lore está desabilitada neste ambiente.'
    );
  }

  const config = sourceConfig(modeValue);
  const document = await readDriveDocument(
    config.mode,
    documentId
  );
  const language = document.source.languageHint;

  if (language !== 'pt-BR') {
    throw new LoreDriveError(
      409,
      'LORE_PT_IMPORT_NOT_ALLOWED',
      'Stage 4 permite importação somente de DOCX PT-BR.'
    );
  }

  const parsed = await parseLoreDocxBuffer(
    document.buffer,
    {
      sourceName: document.source.name,
      language
    }
  );

  const baseValidation =
    validateLanguageIdentity(parsed, language);

  if (baseValidation.blocked.length) {
    throw new LoreDriveError(
      409,
      'LORE_DRY_RUN_REQUIRED',
      'A fonte está bloqueada. Execute o DRY RUN novamente.'
    );
  }

  const ids = (parsed.episodes || [])
    .map(episode => episode.id);

  const existingDocuments =
    await readExistingLoreDocuments(
      config.collection,
      ids
    );

  const plan = createLoreWritePlan({
    mode: config.mode,
    collection: config.collection,
    language,
    parsed,
    existingDocuments
  });

  const blockedItems = plan.items.filter(
    item => item.action === 'BLOCKED'
  );

  if (blockedItems.length) {
    throw new LoreDriveError(
      409,
      'LORE_WRITE_PLAN_BLOCKED',
      'O catálogo mudou ou o plano contém bloqueios. Execute o DRY RUN novamente.'
    );
  }

  const catalogMatch =
    summarizeLorePlan(plan, existingDocuments);

  if (!catalogMatch.writable) {
    throw new LoreDriveError(
      409,
      'LORE_NOTHING_TO_WRITE',
      'Nenhuma alteração PT-BR está pendente.'
    );
  }

  const sourceChecksum = createHash('sha256')
    .update(document.buffer)
    .digest('base64url');

  const identity = loreDryRunIdentity({
    mode: config.mode,
    collection: config.collection,
    source: document.source,
    language,
    sourceChecksum,
    writePlan: plan.items
  });

  if (!verifyLoreDryRunToken(
    dryRunToken,
    identity,
    key
  )) {
    throw new LoreDriveError(
      409,
      'LORE_DRY_RUN_REQUIRED',
      'O documento ou o catálogo mudou, ou o DRY RUN expirou. Execute o DRY RUN novamente.'
    );
  }

  const writes = firestoreWritesForLorePlan({
    mode: config.mode,
    collection: config.collection,
    language,
    parsed,
    existingDocuments,
    writePlan: plan.items
  });

  await commitLoreWrites(writes);

  return {
    mode: config.mode,
    collection: config.collection,
    language,
    documentIds: ids,
    writtenDocumentIds: plan.items
      .filter(item =>
        ['CREATE_PT', 'MERGE_PT'].includes(item.action)
      )
      .map(item => item.id),
    episodeCount: writes.length,
    firestoreWrites: writes.length,
    sourceMutated: false
  };
}

async function previewPair(modeValue, ptDocumentId, enDocumentId) {
  const config = sourceConfig(modeValue);

  if (!ptDocumentId || !enDocumentId) {
    throw new LoreDriveError(
      400,
      'LORE_PAIR_REQUIRED',
      'Selecione um DOCX PT-BR e um DOCX EN-US.'
    );
  }

  if (ptDocumentId === enDocumentId) {
    throw new LoreDriveError(
      400,
      'LORE_PAIR_MUST_USE_TWO_DOCUMENTS',
      'PT-BR e EN-US devem usar documentos diferentes.'
    );
  }

  const [pt, en] = await Promise.all([
    parseSlot(config.mode, ptDocumentId, 'pt-BR'),
    parseSlot(config.mode, enDocumentId, 'en-US')
  ]);

  const pairing = pairLoreDocuments({
    mode: config.mode,
    pt: pt.parsed,
    en: en.parsed
  });

  const blocked = [
    ...pt.validation.blocked.map(value => `PT-BR: ${value}`),
    ...en.validation.blocked.map(value => `EN-US: ${value}`),
    ...pairing.blocked
  ];

  return {
    mode: config.mode,
    collection: config.collection,
    sourceLocation: `Google Drive / ${config.folderName}`,
    sources: {
      'pt-BR': pt.source,
      'en-US': en.source
    },
    parsed: {
      'pt-BR': pt.parsed,
      'en-US': en.parsed
    },
    validation: {
      status: blocked.length ? 'BLOCKED' : 'PASS',
      blocked,
      warnings: [
        ...pt.validation.warnings.map(value => `PT-BR: ${value}`),
        ...en.validation.warnings.map(value => `EN-US: ${value}`),
        ...(pairing.warnings || [])
      ]
    },
    pairing: {
      status: blocked.length ? 'BLOCKED' : pairing.status,
      documents: pairing.documents
    },
    firestoreWrites: 0,
    sourceMutated: false
  };
}

export {
  DOCX_MIME,
  DRIVE_SCOPE,
  MAX_DOCUMENT_BYTES,
  createLoreWritePlan,
  firestoreWritesForLorePlan,
  languageHint,
  loreDryRunIdentity,
  makeLoreDryRunToken,
  normalizeMode,
  sourceConfig,
  supportFor,
  validateLanguageIdentity,
  verifyLoreDryRunToken
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Origin, Sec-Fetch-Site');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  try {
    if (req.method !== 'POST') {
      throw new LoreDriveError(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
    }

    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      throw new LoreDriveError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json.');
    }

    requireOrigin(req);
    const input = requestBody(req);
    const key = secret();
    const session = requireSession(req, key);
    requireCsrf(req, session);
    const mode = normalizeMode(input.mode);

    if (input.action === 'list') {
      const config = sourceConfig(mode);
      return res.status(200).json({
        mode,
        collection: config.collection,
        sourceLocation: `Google Drive / ${config.folderName}`,
        documents: await listDocuments(mode),
        firestoreWrites: 0,
        sourceMutated: false
      });
    }

    if (input.action === 'dry-run') {
      return res.status(200).json(
        await dryRunSingleSource(
          mode,
          input.documentId
        )
      );
    }

    if (input.action === 'import') {
      const result = await importLorePt(
        mode,
        input.documentId,
        input.dryRunToken,
        key
      );

      return res
        .status(result.firestoreWrites ? 201 : 200)
        .json(result);
    }

    if (input.action === 'preview') {
      return res.status(200).json(
        await previewPair(
          mode,
          input.ptDocumentId,
          input.enDocumentId
        )
      );
    }

    throw new LoreDriveError(400, 'INVALID_ACTION', 'Ação inválida.');
  } catch (error) {
    const failure = error instanceof LoreDriveError
      ? error
      : new LoreDriveError(
        500,
        'INTERNAL_ERROR',
        'Falha interna na leitura de Lore.'
      );

    return res.status(failure.status).json({
      error: failure.code,
      message: failure.message,
      ...(failure.details || {})
    });
  }
}
