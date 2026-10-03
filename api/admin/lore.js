import { createHmac, timingSafeEqual } from 'node:crypto';
import { google } from 'googleapis';
import {
  pairLoreDocuments,
  parseLoreDocxBuffer,
  validateLoreDocument
} from './lore-parser.js';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const DOC_MIME = 'application/msword';
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
const SESSION_COOKIE = '__Host-rqs_admin_session';
const SESSION_TTL = 20 * 60 * 1000;

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
  languageHint,
  normalizeMode,
  sourceConfig,
  supportFor,
  validateLanguageIdentity
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
