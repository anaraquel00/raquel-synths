import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual
} from 'node:crypto';
import { google } from 'googleapis';
import mammoth from 'mammoth';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'raquel-synths-platform';
const COLLECTION = 'global-sagas';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const TARGET_SEASON = 2;
const TARGET_EPISODE_COUNT = 8;
const SESSION_COOKIE = '__Host-rqs_admin_session';
const SESSION_TTL = 20 * 60 * 1000;
const DRY_RUN_TTL = 10 * 60 * 1000;
const DRIVE_FOLDER_ID = process.env.RQS_GLOBAL_SAGAS_DRIVE_FOLDER_ID || '';
const SOURCE_LOCATION = 'RQS Editorial / Global Sagas';
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const DOC_MIME = 'application/msword';
const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document';
const SUPPORTED_MIME_TYPES = new Set([DOCX_MIME, GOOGLE_DOC_MIME]);
let resolvedDriveFolderId = '';

class GlobalSagasError extends Error {
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
    throw new GlobalSagasError(
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
    throw new GlobalSagasError(
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
    throw new GlobalSagasError(
      401,
      'ADMIN_SESSION_REQUIRED',
      'A sessão administrativa expirou ou não existe.'
    );
  }
  return session;
}

function requireCsrf(req, session) {
  if (!safeEqual(req.headers['x-rqs-csrf'] || '', session.csrfToken)) {
    throw new GlobalSagasError(
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
      throw new GlobalSagasError(400, 'INVALID_JSON', 'JSON inválido.');
    }
  }
  return req.body;
}

function driveAuth() {
  const raw = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new GlobalSagasError(
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
    throw new GlobalSagasError(
      500,
      'INVALID_DRIVE_CONFIGURATION',
      'Credencial Google inválida.'
    );
  }
  return new google.auth.GoogleAuth({
    credentials,
    projectId: credentials?.project_id || PROJECT_ID,
    scopes: [DRIVE_SCOPE]
  });
}

function firestoreAuth() {
  const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new GlobalSagasError(
      500,
      'MISSING_FIRESTORE_CONFIGURATION',
      'Credencial Firestore não configurada.'
    );
  }
  let credentials;
  try {
    credentials = JSON.parse(raw);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
  } catch {
    throw new GlobalSagasError(
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

async function driveFolderId(drive) {
  if (DRIVE_FOLDER_ID) return DRIVE_FOLDER_ID;
  if (resolvedDriveFolderId) return resolvedDriveFolderId;

  const folders = await drive.files.list({
    q: "name = 'Global Sagas' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'files(id,name,parents)',
    pageSize: 20,
    spaces: 'drive'
  });
  for (const folder of folders.data.files || []) {
    for (const parentId of folder.parents || []) {
      const parent = await drive.files.get({
        fileId: parentId,
        fields: 'id,name,mimeType,trashed'
      });
      if (
        parent.data.name === 'RQS Editorial' &&
        parent.data.mimeType === 'application/vnd.google-apps.folder' &&
        parent.data.trashed !== true
      ) {
        resolvedDriveFolderId = folder.id;
        return resolvedDriveFolderId;
      }
    }
  }
  throw new GlobalSagasError(
    500,
    'MISSING_DRIVE_FOLDER_CONFIGURATION',
    'A pasta RQS Editorial / Global Sagas não foi encontrada. Configure RQS_GLOBAL_SAGAS_DRIVE_FOLDER_ID.'
  );
}

function isLegacyDoc(file) {
  return file.mimeType === DOC_MIME || /\.doc$/i.test(file.name || '');
}

function supportFor(file) {
  if (isLegacyDoc(file)) {
    return {
      status: 'BLOCKED',
      message: 'Formato .doc legado detectado. Converta para .docx antes da importação.'
    };
  }
  if (!SUPPORTED_MIME_TYPES.has(file.mimeType)) {
    return {
      status: 'BLOCKED',
      message: 'Formato não suportado. Use um documento .docx.'
    };
  }
  return { status: 'SUPPORTED', message: '' };
}

function mapDriveFile(file) {
  const support = supportFor(file);
  return {
    documentId: file.id,
    name: file.name || 'Documento sem nome',
    mimeType: file.mimeType || '',
    modifiedTime: file.modifiedTime || '',
    webViewLink: file.webViewLink || '',
    sourceLocation: SOURCE_LOCATION,
    support
  };
}

async function listDocuments() {
  const drive = await driveClient();
  const folderId = await driveFolderId(drive);
  const result = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id,name,modifiedTime,mimeType,webViewLink,size)',
    orderBy: 'modifiedTime desc',
    pageSize: 100,
    spaces: 'drive'
  });
  return (result.data.files || [])
    .filter(file =>
      SUPPORTED_MIME_TYPES.has(file.mimeType) ||
      isLegacyDoc(file)
    )
    .map(mapDriveFile);
}

async function driveFile(documentId) {
  if (!/^[a-zA-Z0-9_-]{10,200}$/.test(String(documentId || ''))) {
    throw new GlobalSagasError(
      400,
      'INVALID_DOCUMENT_ID',
      'Identificador do documento inválido.'
    );
  }
  const drive = await driveClient();
  const folderId = await driveFolderId(drive);
  const metadataResult = await drive.files.get({
    fileId: documentId,
    fields: 'id,name,parents,mimeType,modifiedTime,webViewLink,size'
  });
  const metadata = metadataResult.data;
  if (!(metadata.parents || []).includes(folderId)) {
    throw new GlobalSagasError(
      404,
      'DOCUMENT_NOT_IN_GLOBAL_SAGAS_FOLDER',
      'Documento não pertence à pasta Global Sagas.'
    );
  }
  const source = mapDriveFile(metadata);
  if (source.support.status === 'BLOCKED') {
    return { source, buffer: null };
  }
  const result = metadata.mimeType === GOOGLE_DOC_MIME
    ? await drive.files.export(
      { fileId: documentId, mimeType: DOCX_MIME },
      { responseType: 'arraybuffer' }
    )
    : await drive.files.get(
      { fileId: documentId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
  const buffer = Buffer.from(result.data);
  if (buffer.byteLength > MAX_DOCUMENT_BYTES) {
    throw new GlobalSagasError(
      413,
      'DOCUMENT_TOO_LARGE',
      'O documento excede o limite seguro de 20 MB.'
    );
  }
  return { source, buffer };
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function htmlText(value) {
  return decodeEntities(
    String(value || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  ).trim();
}

function htmlBlocks(html) {
  const blocks = [];
  const pattern = /<(h[1-6]|p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>|<img\b[^>]*>/gi;
  let match;
  let imageIndex = 0;
  while ((match = pattern.exec(String(html || '')))) {
    if (/^<img\b/i.test(match[0])) {
      imageIndex += 1;
      blocks.push({
        tag: 'img',
        text: `[IMAGEM INCORPORADA ${imageIndex}]`
      });
      continue;
    }
    const text = htmlText(match[2]);
    if (text) {
      blocks.push({
        tag: match[1].toLowerCase(),
        text,
        html: match[2]
      });
    }
    const nestedImages = match[2].match(/<img\b[^>]*>/gi) || [];
    for (const _image of nestedImages) {
      imageIndex += 1;
      blocks.push({
        tag: 'img',
        text: `[IMAGEM INCORPORADA ${imageIndex}]`
      });
    }
  }
  return blocks;
}

async function docxBlocks(buffer) {
  let embeddedImage = 0;
  const result = await mammoth.convertToHtml(
    { buffer },
    {
      includeDefaultStyleMap: true,
      styleMap: [
        "p[style-name='Episode'] => h2:fresh",
        "p[style-name='Episódio'] => h2:fresh",
        "p[style-name='Episode Title'] => h2:fresh",
        "p[style-name='Título do Episódio'] => h2:fresh"
      ],
      convertImage: mammoth.images.imgElement(async () => {
        embeddedImage += 1;
        return {
          src: `rqs-editorial-image://embedded-${embeddedImage}`,
          alt: `Imagem incorporada ${embeddedImage}`
        };
      })
    }
  );
  return {
    blocks: htmlBlocks(result.value),
    parserWarnings: (result.messages || []).map(message => message.message)
  };
}

function normalizeLanguage(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace('_', '-');
  if (['pt', 'pt-br', 'portuguese', 'português', 'portugues'].includes(normalized)) {
    return 'pt-BR';
  }
  if (['en', 'en-us', 'english', 'inglês', 'ingles'].includes(normalized)) {
    return 'en-US';
  }
  return '';
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function field(line, names) {
  const joined = names.join('|');
  const match = new RegExp(`^(?:${joined})\\s*[:：]\\s*(.+)$`, 'i').exec(line);
  return match?.[1]?.trim() || '';
}

function episodeMarker(line) {
  const canonical = /^EPISODE\s+(s(\d+)-e(\d+))(?:\s*[-—]\s*(.+))?$/i.exec(line);
  if (canonical) {
    return {
      number: Number(canonical[3]),
      title: canonical[4]?.trim() || '',
      season: Number(canonical[2]),
      episodeId: canonical[1].toLowerCase()
    };
  }
  const standard = /^(?:EPIS[ÓO]DIO|EPISODE)\s*(?:#|N[º°O.]?\s*)?(\d+)(?:\s*[-—:|]\s*(.*))?$/i.exec(line);
  if (standard) {
    return { number: Number(standard[1]), title: standard[2]?.trim() || '' };
  }
  const compact = /^S(\d+)[-_ ]?E(?:P)?(\d+)(?:\s*[-—:|]\s*(.*))?$/i.exec(line);
  if (compact) {
    return {
      number: Number(compact[2]),
      title: compact[3]?.trim() || '',
      season: Number(compact[1]),
      episodeId: `s${Number(compact[1])}-e${Number(compact[2])}`
    };
  }
  return null;
}

function canonicalHeader(line) {
  const match = /^(.+?)\s*-\s*S(\d+)\s*\/\/\s*(.+)$/i.exec(line);
  return match
    ? {
      saga: match[1].trim(),
      season: Number(match[2]),
      edition: match[3].trim()
    }
    : null;
}

function logicalBlocks(inputBlocks) {
  return inputBlocks.flatMap((sourceBlock, sourceIndex) => {
    const rawText = String(sourceBlock?.text || '').replace(/\r\n?/g, '\n');
    if (typeof sourceBlock?.html !== 'string') {
      return rawText.split('\n').map((text, index) => ({
        tag: sourceBlock?.tag || '',
        text: text.trim(),
        html: '',
        contentHtml: decodeEntities(text.trim()),
        hasHtml: false,
        separatorBefore: index ? '\n' : '',
        sourceIndex
      }));
    }

    const lines = [];
    const html = sourceBlock.html;
    const breakPattern = /<br\s*\/?>/gi;
    let cursor = 0;
    let separatorBefore = '';
    let match;
    while ((match = breakPattern.exec(html))) {
      const segment = html.slice(cursor, match.index);
      lines.push({
        tag: sourceBlock.tag || '',
        text: htmlText(segment),
        html: segment,
        contentHtml: decodeEntities(segment),
        hasHtml: true,
        separatorBefore,
        sourceIndex
      });
      separatorBefore = '\n';
      cursor = match.index + match[0].length;
    }
    const segment = html.slice(cursor);
    lines.push({
      tag: sourceBlock.tag || '',
      text: htmlText(segment),
      html: segment,
      contentHtml: decodeEntities(segment),
      hasHtml: true,
      separatorBefore,
      sourceIndex
    });
    return lines;
  });
}

function blockType(line, activeType = 'body') {
  if (/^(?:DI[ÁA]LOGO|DIALOGUE)(?:\s*[:：]|\s*$)/i.test(line)) return 'dialogue';
  if (/^(?:SYSTEM[ -]?LOG|LOG DO SISTEMA|REGISTRO DO SISTEMA)(?:\s*[:：]|\s*$)/i.test(line)) return 'system-log';
  if (/^(?:IMAGEM|IMAGE|PLACEHOLDER)(?:\s*[:：]|\s*$)|^\[IMAGEM INCORPORADA \d+\]$/i.test(line)) return 'image';
  if (/^(?:CR[ÉE]DITOS|CREDITS)(?:\s*[:：]|\s*$)/i.test(line)) return 'credits';
  return activeType;
}

function sectionType(line) {
  if (/^(?:DI[ÁA]LOGO|DIALOGUE)\s*[:：]?\s*$/i.test(line)) return 'dialogue';
  if (/^(?:SYSTEM[ -]?LOG|LOG DO SISTEMA|REGISTRO DO SISTEMA)\s*[:：]?\s*$/i.test(line)) return 'system-log';
  if (/^(?:IMAGEM|IMAGE|PLACEHOLDER)\s*[:：]?\s*$/i.test(line)) return 'image';
  if (/^(?:CR[ÉE]DITOS|CREDITS)\s*[:：]?\s*$/i.test(line)) return 'credits';
  if (/^(?:CORPO|BODY)\s*[:：]?\s*$/i.test(line)) return 'body';
  return '';
}

function parseEditorialBlocks(inputBlocks, sourceName = '') {
  const metadata = {
    saga: '',
    season: 0,
    edition: '',
    language: ''
  };
  const preamble = [];
  const episodes = [];
  let current = null;
  let activeType = 'body';
  let pendingTitle = false;
  let pendingField = '';
  let inContent = false;
  let lastContentSourceIndex = -1;

  const startEpisode = marker => {
    const episodeId = marker.episodeId || '';
    if (
      current &&
      episodeId &&
      (current.episodeId || current.slug) === episodeId
    ) {
      current.number = marker.number;
      current.episodeId = episodeId;
      current.slug = episodeId;
      current.season = marker.season || current.season;
      if (!current.title && marker.title) current.title = marker.title;
      pendingTitle = !current.title;
      pendingField = '';
      return;
    }
    closeEpisode();
    if (!metadata.season && marker.season) metadata.season = marker.season;
    current = {
      number: marker.number,
      episodeId,
      slug: episodeId,
      category: '',
      releaseDate: '',
      image: '',
      title: marker.title,
      description: '',
      subtitle: '',
      blocks: [],
      season: marker.season || metadata.season,
      contentBlocks: []
    };
    pendingTitle = !marker.title;
    pendingField = '';
    inContent = false;
    lastContentSourceIndex = -1;
    activeType = 'body';
  };

  const closeEpisode = () => {
    if (!current) return;
    current.title = current.title.trim();
    current.subtitle = current.subtitle.trim();
    current.slug = current.slug || `s${metadata.season || current.season || 0}-e${String(current.number).padStart(2, '0')}`;
    current.episodeId = current.episodeId || current.slug;
    if (current.contentBlocks.length) {
      current.content = current.contentBlocks
        .map(block => block.content)
        .join('');
    }
    delete current.contentBlocks;
    delete current.season;
    const existingIndex = episodes.findIndex(
      episode => episode.slug === current.slug
    );
    if (existingIndex >= 0) {
      const existing = episodes[existingIndex];
      episodes[existingIndex] = {
        ...existing,
        ...current,
        category: current.category || existing.category,
        releaseDate: current.releaseDate || existing.releaseDate,
        image: current.image || existing.image,
        title: current.title || existing.title,
        description: current.description || existing.description,
        subtitle: current.subtitle || existing.subtitle,
        blocks: current.blocks.length ? current.blocks : existing.blocks,
        ...(current.content || existing.content
          ? { content: current.content || existing.content }
          : {})
      };
    } else {
      episodes.push(current);
    }
    current = null;
    pendingField = '';
    inContent = false;
    lastContentSourceIndex = -1;
  };

  const setEpisodeField = (name, value) => {
    if (!current) return;
    if (name === 'episode') {
      const marker = episodeMarker(value);
      if (marker) {
        current.number = marker.number;
        current.episodeId = marker.episodeId || current.episodeId;
        current.slug = marker.episodeId || current.slug;
        if (!metadata.season && marker.season) metadata.season = marker.season;
      }
      return;
    }
    current[name] = value.trim();
    if (name === 'title') pendingTitle = false;
  };

  const appendContent = sourceBlock => {
    const value = sourceBlock.contentHtml;
    if (
      lastContentSourceIndex === sourceBlock.sourceIndex &&
      current.contentBlocks.length
    ) {
      const block = current.contentBlocks[current.contentBlocks.length - 1];
      block.content += `${sourceBlock.separatorBefore}${value}`;
    } else {
      const block = { type: 'body', content: value };
      current.blocks.push(block);
      current.contentBlocks.push(block);
    }
    lastContentSourceIndex = sourceBlock.sourceIndex;
  };

  for (const sourceBlock of logicalBlocks(inputBlocks)) {
    const text = sourceBlock.text;

    if (inContent) {
      if (/^END EPISODE$/i.test(text)) {
        closeEpisode();
        continue;
      }
      appendContent(sourceBlock);
      continue;
    }

    if (!text) continue;

    if (/^END EPISODE$/i.test(text)) {
      closeEpisode();
      continue;
    }

    if (pendingField) {
      if (pendingField === 'episode') {
        const marker = episodeMarker(text);
        if (marker) {
          startEpisode(marker);
          continue;
        }
      } else if (current) {
        setEpisodeField(pendingField, text);
        pendingField = '';
        continue;
      }
      pendingField = '';
    }

    if (!current) {
      const header = canonicalHeader(text);
      if (header) {
        metadata.saga = header.saga;
        metadata.season = header.season;
        metadata.edition = header.edition;
        continue;
      }
      const saga = field(text, ['SAGA']);
      const season = field(text, ['SEASON', 'TEMPORADA']);
      const edition = field(text, ['EDITION', 'EDIÇÃO', 'EDICAO']);
      const language = field(text, ['LANGUAGE', 'IDIOMA']);
      if (saga) { metadata.saga = saga; continue; }
      if (season && /^\d+$/.test(season)) { metadata.season = Number(season); continue; }
      if (edition) { metadata.edition = edition; continue; }
      if (language) { metadata.language = normalizeLanguage(language); continue; }
      const looseSeason = /^(?:SEASON|TEMPORADA)\s+(\d+)$/i.exec(text);
      if (looseSeason) { metadata.season = Number(looseSeason[1]); continue; }
      const looseLanguage = normalizeLanguage(text);
      if (looseLanguage) { metadata.language = looseLanguage; continue; }
      if (/^h[1-2]$/.test(sourceBlock.tag || '')) {
        if (!metadata.saga) { metadata.saga = text; continue; }
        if (!metadata.edition) { metadata.edition = text; continue; }
      }
      if (/^EPISODE$/i.test(text)) {
        pendingField = 'episode';
        continue;
      }
    }

    const marker = episodeMarker(text);
    if (marker) {
      startEpisode(marker);
      continue;
    }

    if (!current) {
      preamble.push({ type: 'body', content: text });
      continue;
    }

    const slug = field(text, ['EPISODE ID', 'ID DO EPISÓDIO', 'ID DO EPISODIO', 'SLUG']);
    if (slug) {
      current.slug = slugify(slug);
      current.episodeId = current.slug;
      continue;
    }
    const category = field(text, ['CATEGORY', 'CATEGORIA']);
    if (category) { current.category = category; continue; }
    const releaseDate = field(text, ['RELEASE DATE', 'DATA DE LANÇAMENTO', 'DATA DE LANCAMENTO']);
    if (releaseDate) { current.releaseDate = releaseDate; continue; }
    const image = field(text, ['IMAGE', 'IMAGEM']);
    if (image) { current.image = image; continue; }
    const title = field(text, ['TITLE', 'TÍTULO', 'TITULO']);
    if (title) {
      current.title = title;
      pendingTitle = false;
      continue;
    }
    const subtitle = field(text, ['SUBTITLE', 'SUBTÍTULO', 'SUBTITULO']);
    if (subtitle) {
      current.subtitle = subtitle;
      continue;
    }
    const description = field(text, ['DESCRIPTION', 'DESCRIÇÃO', 'DESCRICAO']);
    if (description) { current.description = description; continue; }
    const standaloneField = /^(EPISODE|CATEGORY|CATEGORIA|RELEASE DATE|DATA DE LAN[ÇC]AMENTO|IMAGE|IMAGEM|TITLE|T[ÍI]TULO|DESCRIPTION|DESCRI[ÇC][ÃA]O)$/i.exec(text);
    if (standaloneField) {
      const label = standaloneField[1].toUpperCase();
      if (label === 'EPISODE') {
        pendingField = 'episode';
      } else if (/^(CATEGORY|CATEGORIA)$/.test(label)) {
        pendingField = 'category';
      } else if (/^(RELEASE DATE|DATA DE LAN[ÇC]AMENTO)$/.test(label)) {
        pendingField = 'releaseDate';
      } else if (/^(IMAGE|IMAGEM)$/.test(label)) {
        pendingField = 'image';
      } else if (/^(TITLE|T[ÍI]TULO)$/.test(label)) {
        pendingField = 'title';
      } else {
        pendingField = 'description';
      }
      continue;
    }
    if (/^CONTENT\s*[:：]?\s*$/i.test(text)) {
      inContent = true;
      current.contentBlocks = [];
      lastContentSourceIndex = -1;
      continue;
    }
    if (pendingTitle && /^h[1-6]$/.test(sourceBlock.tag || '')) {
      current.title = text;
      pendingTitle = false;
      continue;
    }

    const section = sectionType(text);
    if (section) activeType = section;
    const type = blockType(text, activeType);
    current.blocks.push({ type, content: text });
  }
  closeEpisode();

  if (!metadata.language) {
    const inferred = /(?:^|[\s._-])(pt(?:-br)?|en(?:-us)?)(?:[\s._-]|$)/i.exec(sourceName);
    metadata.language = normalizeLanguage(inferred?.[1] || '');
  }

  return {
    ...metadata,
    canonicalKey: canonicalKey(metadata),
    preamble,
    episodes
  };
}

function canonicalKey(value) {
  const saga = slugify(value?.saga);
  const edition = slugify(value?.edition);
  const season = Number(value?.season || 0);
  return saga && edition && season > 0
    ? `${saga}-s${season}-${edition}`
    : '';
}

function sourceIdentityFromName(name) {
  const match = /^(.*?)[\s._-]+S(\d+)[\s._-]+(.+?)[\s._-]+(PT(?:[\s._-]*BR)?|EN(?:[\s._-]*US)?)\.docx$/i.exec(
    String(name || '').trim()
  );
  if (!match) return null;
  const identity = {
    saga: match[1].replace(/[._-]+/g, ' ').trim(),
    season: Number(match[2]),
    edition: match[3].replace(/[._-]+/g, ' ').trim(),
    language: normalizeLanguage(match[4])
  };
  return {
    ...identity,
    canonicalKey: canonicalKey(identity)
  };
}

function sourcePairingStatus(canonical, documents) {
  const pairing = { 'pt-BR': 'MISSING', 'en-US': 'MISSING' };
  if (!canonical) return pairing;
  for (const document of documents || []) {
    if (document.support?.status !== 'SUPPORTED') continue;
    const identity = sourceIdentityFromName(document.name);
    if (
      identity?.canonicalKey === canonical &&
      Object.hasOwn(pairing, identity.language)
    ) {
      pairing[identity.language] = 'CONNECTED';
    }
  }
  return pairing;
}

function validateParsed(parsed, confirmedLanguage, parserWarnings = []) {
  const blocked = [];
  const warnings = [...parserWarnings];
  if (!parsed.saga) blocked.push('SAGA não identificada.');
  if (!Number.isInteger(parsed.season) || parsed.season < 1) {
    blocked.push('SEASON/TEMPORADA não identificada.');
  }
  if (!parsed.edition) blocked.push('EDITION/EDIÇÃO não identificada.');
  if (!parsed.episodes.length) blocked.push('Nenhum episódio foi identificado.');
  if (!['pt-BR', 'en-US'].includes(confirmedLanguage)) {
    blocked.push('Confirme o idioma PT-BR ou EN-US.');
  }
  if (parsed.language && parsed.language !== confirmedLanguage) {
    blocked.push(
      `O idioma detectado (${parsed.language}) diverge do idioma confirmado (${confirmedLanguage}).`
    );
  }
  const ids = new Set();
  for (const episode of parsed.episodes) {
    if (!episode.title) blocked.push(`Episódio ${episode.number} sem título.`);
    if (!episode.description) blocked.push(`Episódio ${episode.number} sem descrição.`);
    if (!episode.category) blocked.push(`Episódio ${episode.number} sem categoria.`);
    if (!episode.releaseDate) blocked.push(`Episódio ${episode.number} sem data de lançamento.`);
    if (!episode.image) blocked.push(`Episódio ${episode.number} sem imagem.`);
    if (!episode.blocks.length) blocked.push(`Episódio ${episode.number} sem corpo editorial.`);
    if (ids.has(episode.slug)) blocked.push(`Slug de episódio duplicado: ${episode.slug}.`);
    ids.add(episode.slug);
  }
  if (parsed.preamble.length) {
    warnings.push('Conteúdo editorial anterior ao primeiro episódio foi preservado como preâmbulo.');
  }
  return {
    status: blocked.length ? 'BLOCKED' : warnings.length ? 'WARNING' : 'VALID',
    blocked,
    warnings
  };
}

async function parseSource(documentId) {
  const document = await driveFile(documentId);
  if (!document.buffer) {
    return {
      source: document.source,
      parsed: null,
      parserWarnings: [],
      validation: {
        status: 'BLOCKED',
        blocked: [document.source.support.message],
        warnings: []
      },
      checksum: ''
    };
  }
  const converted = await docxBlocks(document.buffer);
  const parsed = parseEditorialBlocks(converted.blocks, document.source.name);
  return {
    source: document.source,
    parsed,
    parserWarnings: converted.parserWarnings,
    validation: validateParsed(
      parsed,
      parsed.language,
      converted.parserWarnings
    ),
    checksum: createHash('sha256').update(document.buffer).digest('base64url')
  };
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(firestoreValue) } };
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, item]) => [key, firestoreValue(item)])
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

function expectedEpisodeIds() {
  return Array.from(
    { length: TARGET_EPISODE_COUNT },
    (_, index) => `s${TARGET_SEASON}-e${index + 1}`
  );
}

function episodeId(episode) {
  return String(episode?.episodeId || episode?.slug || '').toLowerCase();
}

function targetSetIssues(parsed, language) {
  const issues = [];
  const ids = parsed.episodes.map(episodeId);
  const expected = expectedEpisodeIds();
  if (parsed.season !== TARGET_SEASON) {
    issues.push(`Somente a Season ${TARGET_SEASON} está autorizada neste importador.`);
  }
  if (!['pt-BR', 'en-US'].includes(language)) {
    issues.push('Idioma de importação inválido.');
  }
  if (
    ids.length !== expected.length ||
    new Set(ids).size !== expected.length ||
    expected.some(id => !ids.includes(id))
  ) {
    issues.push(`Os documentos alvo devem ser exatamente ${expected.join(', ')}.`);
  }
  for (const episode of parsed.episodes) {
    const expectedId = `s${parsed.season}-e${episode.number}`;
    if (episodeId(episode) !== expectedId) {
      issues.push(`ID incompatível com o episódio ${episode.number}: ${episodeId(episode) || 'ausente'}.`);
    }
    const required = {
      title: episode.title,
      category: episode.category,
      description: episode.description,
      content: typeof episode.content === 'string'
        ? episode.content
        : (episode.blocks || []).map(block => block.content).join('\n'),
      image: episode.image,
      releaseDate: episode.releaseDate
    };
    for (const [fieldName, value] of Object.entries(required)) {
      if (!String(value || '').trim()) {
        issues.push(`${episodeId(episode) || expectedId}: ${fieldName} está ausente.`);
      }
    }
  }
  return issues;
}

function editorialFields(episode, language) {
  const content = typeof episode.content === 'string'
    ? episode.content
    : (episode.blocks || []).map(block => block.content).join('\n');
  const fields = {
    title: episode.title || '',
    category: episode.category || '',
    description: episode.description || '',
    content
  };
  if (language === 'pt-BR') return fields;
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [`${key}_en`, value])
  );
}

function sharedFields(episode) {
  return {
    image: episode.image || '',
    releaseDate: episode.releaseDate || ''
  };
}

function materiallyEqual(left, right) {
  return String(left ?? '').trim() === String(right ?? '').trim();
}

function createEpisodeWritePlan(
  parsed,
  language,
  sourceChecksum,
  existingDocuments = {}
) {
  const targetIssues = targetSetIssues(parsed, language);
  if (!sourceChecksum) {
    targetIssues.push('Checksum da fonte está ausente.');
  }
  const expected = expectedEpisodeIds();
  if (targetIssues.length) {
    return {
      collection: COLLECTION,
      season: parsed.season,
      language,
      sourceChecksum,
      items: expected.map(id => ({
        id,
        action: 'BLOCKED',
        language,
        sourceChecksum,
        writeFields: {},
        issues: targetIssues
      }))
    };
  }

  const episodeById = new Map(
    parsed.episodes.map(episode => [episodeId(episode), episode])
  );
  const items = expected.map(id => {
    const episode = episodeById.get(id);
    const incomingEditorial = editorialFields(episode, language);
    const incomingShared = sharedFields(episode);
    const existing = existingDocuments[id] || null;
    if (!existing) {
      return {
        id,
        action: 'CREATE',
        language,
        sourceChecksum,
        writeFields: {
          ...incomingEditorial,
          ...incomingShared,
          mode: 'hybrid',
          published: false
        },
        issues: []
      };
    }

    const issues = [];
    const fields = existing.fields || {};
    if (fields.mode !== 'hybrid') {
      issues.push('mode existente diverge de hybrid.');
    }
    if (fields.published !== false) {
      issues.push('published existente deve permanecer false durante a importação.');
    }
    for (const [fieldName, incomingValue] of Object.entries(incomingShared)) {
      if (!Object.hasOwn(fields, fieldName)) {
        issues.push(`${fieldName} compartilhado está ausente.`);
      } else if (!materiallyEqual(fields[fieldName], incomingValue)) {
        issues.push(`${fieldName} compartilhado diverge da fonte.`);
      }
    }

    const writeFields = {};
    for (const [fieldName, incomingValue] of Object.entries(incomingEditorial)) {
      if (!Object.hasOwn(fields, fieldName)) {
        writeFields[fieldName] = incomingValue;
      } else if (fields[fieldName] !== incomingValue) {
        issues.push(`${fieldName} existente diverge da fonte.`);
      }
    }
    if (!existing.updateTime) {
      issues.push('updateTime ausente para precondition segura.');
    }

    return {
      id,
      action: issues.length
        ? 'CONFLICT'
        : Object.keys(writeFields).length
          ? language === 'pt-BR' ? 'MERGE_PT' : 'MERGE_EN'
          : 'UNCHANGED',
      language,
      sourceChecksum,
      updateTime: existing.updateTime || '',
      writeFields: issues.length ? {} : writeFields,
      issues
    };
  });

  return {
    collection: COLLECTION,
    season: parsed.season,
    language,
    sourceChecksum,
    items
  };
}

function writePlanHasBlocking(plan) {
  return plan.items.some(item =>
    item.action === 'BLOCKED' || item.action === 'CONFLICT'
  );
}

function writePlanCount(plan) {
  return plan.items.filter(item =>
    ['CREATE', 'MERGE_PT', 'MERGE_EN'].includes(item.action)
  ).length;
}

function publicWritePlan(plan) {
  return plan.items.map(item => ({
    id: item.id,
    action: item.action,
    language: item.language,
    fields: Object.keys(item.writeFields),
    issues: item.issues
  }));
}

function dryRunContract(plan, blocked = false) {
  return {
    catalog: blocked
      ? 'BLOCKED'
      : `WOULD WRITE ${writePlanCount(plan)} EPISODES TO ${COLLECTION}`,
    initialPublicState: 'published = false',
    firestoreWrites: 0,
    writePlan: publicWritePlan(plan)
  };
}

function firestoreDocumentName(id) {
  return `projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}/${id}`;
}

function firestoreWritesForPlan(plan) {
  if (writePlanHasBlocking(plan)) {
    throw new GlobalSagasError(
      409,
      'WRITE_PLAN_BLOCKED',
      'O plano contém conflitos ou documentos bloqueados.'
    );
  }
  return plan.items.flatMap(item => {
    if (item.action === 'UNCHANGED') return [];
    const fields = Object.fromEntries(
      Object.entries(item.writeFields)
        .map(([key, value]) => [key, firestoreValue(value)])
    );
    if (item.action === 'CREATE') {
      return [{
        update: { name: firestoreDocumentName(item.id), fields },
        currentDocument: { exists: false }
      }];
    }
    const fieldPaths = Object.keys(item.writeFields);
    if (!fieldPaths.length) return [];
    return [{
      update: { name: firestoreDocumentName(item.id), fields },
      updateMask: { fieldPaths },
      currentDocument: { updateTime: item.updateTime }
    }];
  });
}

function dryRunDigest(value, key) {
  return createHmac('sha256', key)
    .update(JSON.stringify(value))
    .digest('base64url');
}

function makeDryRunToken(value, key) {
  const payload = Buffer.from(JSON.stringify({
    digest: dryRunDigest(value, key),
    expiresAt: Date.now() + DRY_RUN_TTL,
    nonce: randomUUID()
  })).toString('base64url');
  const signature = createHmac('sha256', key)
    .update(`global-sagas:${payload}`)
    .digest('base64url');
  return `${payload}.${signature}`;
}

function verifyDryRunToken(token, value, key) {
  const [payload, signature, ...extra] = String(token || '').split('.');
  if (
    !payload ||
    !signature ||
    extra.length ||
    !safeEqual(
      signature,
      createHmac('sha256', key)
        .update(`global-sagas:${payload}`)
        .digest('base64url')
    )
  ) {
    return false;
  }
  try {
    const valueFromToken = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );
    return Number(valueFromToken.expiresAt) > Date.now() &&
      valueFromToken.digest === dryRunDigest(value, key);
  } catch {
    return false;
  }
}

async function firestoreToken() {
  const auth = await firestoreAuth().getClient();
  const value = await auth.getAccessToken();
  return typeof value === 'string' ? value : value.token;
}

async function pairingStatus(canonical) {
  return sourcePairingStatus(canonical, await listDocuments());
}

async function readEpisodeDocuments(ids) {
  const token = await firestoreToken();
  const entries = await Promise.all(ids.map(async id => {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/${firestoreDocumentName(id)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.status === 404) return [id, null];
    if (!response.ok) {
      throw new GlobalSagasError(
        502,
        'FIRESTORE_PREFLIGHT_FAILED',
        `Não foi possível verificar ${COLLECTION}/${id}.`
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

async function preflightWritePlan(parsed, language, sourceChecksum) {
  const initialPlan = createEpisodeWritePlan(
    parsed,
    language,
    sourceChecksum,
    {}
  );
  if (writePlanHasBlocking(initialPlan)) return initialPlan;
  const existing = await readEpisodeDocuments(expectedEpisodeIds());
  return createEpisodeWritePlan(parsed, language, sourceChecksum, existing);
}

function validationWithWritePlan(validation, plan) {
  const planFailures = plan.items
    .filter(item => item.action === 'BLOCKED' || item.action === 'CONFLICT')
    .map(item => `${item.id}: ${item.action} — ${item.issues.join(' ')}`);
  const blocked = [...validation.blocked, ...planFailures];
  return {
    status: blocked.length
      ? 'BLOCKED'
      : validation.warnings.length ? 'WARNING' : 'VALID',
    blocked,
    warnings: validation.warnings
  };
}

function writePlanFingerprint(plan) {
  return createHash('sha256')
    .update(JSON.stringify(plan.items.map(item => ({
      id: item.id,
      action: item.action,
      updateTime: item.updateTime || '',
      writeFields: item.writeFields,
      issues: item.issues
    }))))
    .digest('base64url');
}

async function commitEpisodeWrites(plan) {
  const writes = firestoreWritesForPlan(plan);
  if (!writes.length) return [];
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
    },
  );
  if (!response.ok) {
    throw new GlobalSagasError(
      response.status === 409 ? 409 : 502,
      'EPISODE_COMMIT_FAILED',
      'O Firestore recusou o commit atômico. Execute o DRY RUN novamente; nenhum plano deve ser reutilizado.'
    );
  }
  return plan.items
    .filter(item => ['CREATE', 'MERGE_PT', 'MERGE_EN'].includes(item.action))
    .map(item => item.id);
}

function dryRunIdentity(result, language, plan) {
  return {
    documentId: result.source.documentId,
    modifiedTime: result.source.modifiedTime,
    checksum: result.checksum,
    canonicalKey: result.parsed.canonicalKey,
    language,
    writePlanFingerprint: writePlanFingerprint(plan)
  };
}

export {
  COLLECTION,
  DRIVE_SCOPE,
  SOURCE_LOCATION,
  canonicalKey,
  createEpisodeWritePlan,
  docxBlocks,
  dryRunContract,
  expectedEpisodeIds,
  firestoreWritesForPlan,
  isLegacyDoc,
  parseEditorialBlocks,
  sourcePairingStatus,
  supportFor,
  validateParsed
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Origin, Sec-Fetch-Site');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    if (req.method !== 'POST') {
      throw new GlobalSagasError(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
    }
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      throw new GlobalSagasError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json.');
    }
    requireOrigin(req);
    const input = requestBody(req);
    const key = secret();
    const session = requireSession(req, key);
    requireCsrf(req, session);

    if (input.action === 'list') {
      return res.status(200).json({
        documents: await listDocuments(),
        sourceLocation: SOURCE_LOCATION
      });
    }

    if (input.action === 'load') {
      const result = await parseSource(input.documentId);
      const pairing = result.parsed?.canonicalKey
        ? await pairingStatus(result.parsed.canonicalKey)
        : { 'pt-BR': 'MISSING', 'en-US': 'MISSING' };
      return res.status(200).json({
        source: result.source,
        parsed: result.parsed,
        validation: result.validation,
        pairing
      });
    }

    if (input.action === 'dry-run') {
      const language = normalizeLanguage(input.language);
      const result = await parseSource(input.documentId);
      if (!result.parsed) {
        return res.status(200).json({
          source: result.source,
          parsed: null,
          validation: result.validation,
          pairing: { 'pt-BR': 'MISSING', 'en-US': 'MISSING' },
          dryRunToken: null,
          catalog: 'BLOCKED',
          publication: 'NO',
          initialPublicState: 'published = false',
          firestoreWrites: 0,
          writePlan: []
        });
      }
      const baseValidation = validateParsed(
        result.parsed,
        language,
        result.parserWarnings
      );
      const writePlan = await preflightWritePlan(
        result.parsed,
        language,
        result.checksum
      );
      const validation = validationWithWritePlan(baseValidation, writePlan);
      const identity = dryRunIdentity(result, language, writePlan);
      const contract = dryRunContract(
        writePlan,
        validation.status === 'BLOCKED'
      );
      return res.status(200).json({
        source: result.source,
        parsed: { ...result.parsed, language },
        validation,
        pairing: await pairingStatus(result.parsed.canonicalKey),
        dryRunToken: validation.status === 'BLOCKED'
          ? null
          : makeDryRunToken(identity, key),
        ...contract,
        publication: 'NO'
      });
    }

    if (input.action === 'import') {
      const language = normalizeLanguage(input.language);
      const result = await parseSource(input.documentId);
      if (!result.parsed) {
        throw new GlobalSagasError(
          409,
          'DRY_RUN_REQUIRED',
          'Execute o DRY RUN novamente.'
        );
      }
      const baseValidation = validateParsed(
        result.parsed,
        language,
        result.parserWarnings
      );
      const writePlan = await preflightWritePlan(
        result.parsed,
        language,
        result.checksum
      );
      const validation = validationWithWritePlan(baseValidation, writePlan);
      const identity = dryRunIdentity(result, language, writePlan);
      if (
        validation.status === 'BLOCKED' ||
        !verifyDryRunToken(input.dryRunToken, identity, key)
      ) {
        throw new GlobalSagasError(
          409,
          'DRY_RUN_REQUIRED',
          'O documento mudou ou o DRY RUN expirou. Execute o DRY RUN novamente.'
        );
      }
      const writtenDocumentIds = await commitEpisodeWrites(writePlan);
      return res.status(writtenDocumentIds.length ? 201 : 200).json({
        documentIds: expectedEpisodeIds(),
        writtenDocumentIds,
        episodeCount: writtenDocumentIds.length,
        catalogStatus: `${writtenDocumentIds.length} EPISODES WRITTEN TO ${COLLECTION}`,
        publication: 'NO',
        initialPublicState: 'published = false',
        sourceMutated: false,
        pairing: await pairingStatus(result.parsed.canonicalKey)
      });
    }

    throw new GlobalSagasError(400, 'INVALID_ACTION', 'Ação inválida.');
  } catch (error) {
    const failure = error instanceof GlobalSagasError
      ? error
      : new GlobalSagasError(
        500,
        'INTERNAL_ERROR',
        'Falha interna no importador de Sagas Globais.'
      );
    return res.status(failure.status).json({
      error: failure.code,
      message: failure.message,
      ...(failure.details || {})
    });
  }
}
