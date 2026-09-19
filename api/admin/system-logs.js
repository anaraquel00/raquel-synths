import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual
} from 'node:crypto';
import { google } from 'googleapis';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'raquel-synths-platform';
const COLLECTION = 'logs';
const SESSION_COOKIE = '__Host-rqs_admin_session';
const LEGACY_SESSION_COOKIE = '__Host-rqs_sc_importer_session';
const SESSION_TTL = 20 * 60 * 1000;
const DRY_RUN_TTL = 10 * 60 * 1000;
const DRIVE_FOLDER_ID = process.env.RQS_SYSTEM_LOGS_DRIVE_FOLDER_ID || '';
const HEADERS = [
  'DATE',
  'IMAGE',

  // Metadados editoriais reconhecidos, mas não persistidos no Firestore.
  'TYPE',
  'CATEGORY',
  'TAGS',

  'PT TITLE',
  'PT DESCRIPTION',
  'PT TECH CONTENT',
  'PT JONAH COMMENT',

  'EN TITLE',
  'EN DESCRIPTION',
  'EN TECH CONTENT',
  'EN JONAH COMMENT',

  // Metadados SEO/editoriais reconhecidos, mas não persistidos.
  'PT SEO DESCRIPTION',
  'EN SEO DESCRIPTION',
  'SLUG PT',
  'SLUG EN'
];

class SystemLogsError extends Error {
  constructor(status, code, message, details) {
    super(message); this.status = status; this.code = code; this.details = details;
  }
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a)); const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}
function secret() {
  const value = process.env.RQS_ADMIN_TOKEN;
  if (!value || Buffer.byteLength(value) < 32) throw new SystemLogsError(500, 'MISSING_ADMIN_CONFIGURATION', 'A credencial administrativa não está configurada com segurança.');
  return value;
}
function origin(value) {
  try { return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`).origin; } catch { return ''; }
}
function allowedOrigins() {
  const values = new Set(['https://raquelsynths.com', 'https://www.raquelsynths.com']);
  if (process.env.VERCEL_ENV === 'preview') for (const value of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) if (value) values.add(origin(value));
  if (process.env.NODE_ENV !== 'production') { values.add('http://localhost:4200'); values.add('http://127.0.0.1:4200'); }
  return values;
}
function requireOrigin(req) {
  if (!allowedOrigins().has(origin(req.headers.origin || '')) || req.headers['sec-fetch-site'] === 'cross-site') throw new SystemLogsError(403, 'ORIGIN_NOT_ALLOWED', 'A origem não está autorizada.');
}
function cookies(req) { return Object.fromEntries(String(req.headers.cookie || '').split(';').map(v => v.trim()).filter(Boolean).map(v => { const i = v.indexOf('='); return [v.slice(0, i), v.slice(i + 1)]; })); }
function signSession(payload, key) { return createHmac('sha256', key).update(`admin-session:${payload}`).digest('base64url'); }
function newSession(key) {
  const csrfToken = randomBytes(32).toString('base64url'); const expiresAt = Date.now() + SESSION_TTL;
  const payload = Buffer.from(JSON.stringify({ version: 1, csrfToken, expiresAt, issuedAt: Date.now(), nonce: randomUUID() })).toString('base64url');
  return { csrfToken, expiresAt, token: `${payload}.${signSession(payload, key)}` };
}
function cookie(token, maxAge = SESSION_TTL) { return [`${SESSION_COOKIE}=${token}`, `Max-Age=${Math.floor(maxAge / 1000)}`, 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Strict'].join('; '); }
function expiredCookies() { return [cookie('', 0), `${LEGACY_SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`]; }
function readSession(req, key) {
  const [payload, signature, ...extra] = String(cookies(req)[SESSION_COOKIE] || '').split('.'); if (!payload || !signature || extra.length || !safeEqual(signature, signSession(payload, key))) return null;
  try { const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); return value.version === 1 && value.csrfToken && value.nonce && Number(value.issuedAt) <= Date.now() && Number(value.expiresAt) > Date.now() ? value : null; } catch { return null; }
}
function requireSession(req, key) { const session = readSession(req, key); if (!session) throw new SystemLogsError(401, 'ADMIN_SESSION_REQUIRED', 'A sessão administrativa expirou ou não existe.'); return session; }
function requireCsrf(req, session) { if (!safeEqual(req.headers['x-rqs-csrf'] || '', session.csrfToken)) throw new SystemLogsError(403, 'CSRF_VALIDATION_FAILED', 'A proteção CSRF recusou a operação.'); }
function body(req) { if (!req.body) return {}; if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { throw new SystemLogsError(400, 'INVALID_JSON', 'JSON inválido.'); } } return req.body; }

function driveAuth() {
  const raw = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON;
  let credentials;
  if (!raw) throw new SystemLogsError(500, 'MISSING_DRIVE_CONFIGURATION', 'Credencial Drive não configurada.');
  try { credentials = JSON.parse(raw); if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n'); } catch { throw new SystemLogsError(500, 'INVALID_DRIVE_CONFIGURATION', 'Credencial Google inválida.'); }
  return new google.auth.GoogleAuth({ credentials, projectId: credentials?.project_id || PROJECT_ID, scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/documents.readonly'] });
}
function firestoreAuth() {
  const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new SystemLogsError(500, 'MISSING_FIRESTORE_CONFIGURATION', 'Credencial Firestore não configurada.');
  let credentials;
  try { credentials = JSON.parse(raw); if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n'); } catch { throw new SystemLogsError(500, 'INVALID_FIRESTORE_CONFIGURATION', 'Credencial Firestore inválida.'); }
  return new google.auth.GoogleAuth({ credentials, projectId: credentials.project_id || PROJECT_ID, scopes: ['https://www.googleapis.com/auth/datastore'] });
}
async function driveClient() { if (!DRIVE_FOLDER_ID) throw new SystemLogsError(500, 'MISSING_DRIVE_FOLDER_CONFIGURATION', 'RQS_SYSTEM_LOGS_DRIVE_FOLDER_ID não está configurada.'); return { drive: google.drive({ version: 'v3', auth: await driveAuth().getClient() }), docs: google.docs({ version: 'v1', auth: await driveAuth().getClient() }) }; }
async function listDocuments() {
  const { drive } = await driveClient(); const result = await drive.files.list({ q: `'${DRIVE_FOLDER_ID}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.document'`, fields: 'files(id,name,modifiedTime,mimeType,webViewLink)', orderBy: 'modifiedTime desc', pageSize: 100, spaces: 'drive' });
  return (result.data.files || []).map(file => ({ documentId: file.id, name: file.name, modifiedTime: file.modifiedTime, webViewLink: file.webViewLink }));
}
async function documentText(documentId) {
  const { drive, docs } = await driveClient(); const metadata = await drive.files.get({ fileId: documentId, fields: 'id,parents,mimeType,modifiedTime' });
  if (metadata.data.mimeType !== 'application/vnd.google-apps.document' || !(metadata.data.parents || []).includes(DRIVE_FOLDER_ID)) throw new SystemLogsError(404, 'DOCUMENT_NOT_IN_SYSTEM_LOGS_FOLDER', 'Documento não pertence à pasta System Logs.');
  const result = await docs.documents.get({ documentId });
  return { text: (result.data.body?.content || []).map(block => (block.paragraph?.elements || []).map(element => element.textRun?.content || '').join('')).join(''), modifiedTime: metadata.data.modifiedTime || '' };
}
function isDate(value) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false; const d = new Date(`${value}T00:00:00.000Z`); return d.toISOString().slice(0, 10) === value; }
function parseSystemLogDocument(text) {
  const lines = String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u000b/g, '\n')
    .split('\n');

  const sections = Object.fromEntries(
    HEADERS.map(header => [header, ''])
  );

  const seen = new Set();
  let current = null;

  for (const line of lines) {
    const header = line.trim();

    // Separadores editoriais não fazem parte do conteúdo.
    if (header === '---') {
      continue;
    }

    if (HEADERS.includes(header)) {
      if (current) {
        sections[current] = sections[current].trim();
      }

      if (seen.has(header)) {
        throw new SystemLogsError(
          400,
          'DUPLICATE_HEADER',
          `Header duplicado: ${header}`
        );
      }

      seen.add(header);
      current = header;
      continue;
    }

    if (current) {
      sections[current] += `${line}\n`;
    } else if (line.trim()) {
      throw new SystemLogsError(
        400,
        'CONTENT_BEFORE_HEADER',
        'Conteúdo encontrado antes do primeiro header.'
      );
    }
  }

  if (current) {
    sections[current] = sections[current].trim();
  }

  const required = [
    'DATE',
    'IMAGE',
    'PT TITLE',
    'PT DESCRIPTION',
    'PT TECH CONTENT',
    'EN TITLE',
    'EN DESCRIPTION',
    'EN TECH CONTENT'
  ];

  const missing = required.filter(
    header => !sections[header]
  );

  if (missing.length || !isDate(sections.DATE)) {
    throw new SystemLogsError(
      400,
      'INVALID_DOCUMENT_FORMAT',
      'O documento não atende ao contrato de System Logs.',
      { missing }
    );
  }

  if (!/^https?:\/\//i.test(sections.IMAGE)) {
    throw new SystemLogsError(
      400,
      'INVALID_IMAGE_URL',
      'IMAGE deve ser uma URL http(s).'
    );
  }

  const ptTechContent =
    validateTechContent(sections['PT TECH CONTENT']);

  const enTechContent =
    validateTechContent(sections['EN TECH CONTENT']);

  return {
    date: sections.DATE,
    image: sections.IMAGE,

    pt: {
      title: sections['PT TITLE'],
      description: sections['PT DESCRIPTION'],
      techContent: ptTechContent.content,
      techContentDiagnostic: ptTechContent.diagnostic,
      jonahComment: sections['PT JONAH COMMENT']
    },

    en: {
      title: sections['EN TITLE'],
      description: sections['EN DESCRIPTION'],
      techContent: enTechContent.content,
      techContentDiagnostic: enTechContent.diagnostic,
      jonahComment: sections['EN JONAH COMMENT']
    }
  };
}
function escapeText(value) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function invalidTechContent(sourceFormat) {
  return {
    content: '',
    diagnostic: {
      sourceFormat,
      htmlValidation: 'FAIL',
      allowedTagsOnly: 'FAIL',
      renderableContent: 'FAIL',
      publishAllowed: 'NO'
    }
  };
}
function safeAnchor(attributes) {
  const values = new Map();
  const pattern = /([a-z][a-z0-9:-]*)\s*=\s*(["'])(.*?)\2/giu;
  let cursor = 0;
  let match;
  while ((match = pattern.exec(attributes))) {
    if (attributes.slice(cursor, match.index).trim()) return '';
    const name = match[1].toLowerCase();
    if (!['href', 'target', 'rel'].includes(name) || values.has(name)) return '';
    values.set(name, match[3]);
    cursor = pattern.lastIndex;
  }
  if (attributes.slice(cursor).trim()) return '';
  const href = values.get('href') || '';
  if (!/^https?:\/\/[^\s"'<>]+$/iu.test(href)) return '';
  if (values.has('target') && values.get('target') !== '_blank') return '';
  if (values.has('rel')) {
    const rel = values.get('rel').trim().split(/\s+/u);
    if (rel.some(value => !['noopener', 'noreferrer'].includes(value))) return '';
  }
  return `<a href="${escapeText(href)}" target="_blank" rel="noopener noreferrer">`;
}
function validateTechContent(value) {
  const source = String(value || '').replace(/\r\n?/g, '\n').trim();

  if (!source) {
    return invalidTechContent('PLAIN_TEXT');
  }

  if (!/[<>]/u.test(source)) {
    return invalidTechContent('PLAIN_TEXT');
  }

  const tokens = source.match(/<[^>]*>|[^<>]+|[<>]/gu) || [];

  if (tokens.join('') !== source) {
    return invalidTechContent('HTML');
  }

  const stack = [];
  let content = '';
  let hasText = false;

  for (const token of tokens) {
    if (!token.startsWith('<')) {
      if (token === '>' || token.trim().startsWith('<')) {
        return invalidTechContent('HTML');
      }

      content += token;

      if (
        token
          .replace(/&(?:[a-z]+|#\d+|#x[\da-f]+);/giu, '')
          .trim()
      ) {
        hasText = true;
      }

      continue;
    }

    const close =
      /^<\s*\/\s*(p|h2|strong|em|a|ul|li)\s*>$/iu.exec(token);

    if (close) {
      const tag = close[1].toLowerCase();

      if (stack.pop() !== tag) {
        return invalidTechContent('HTML');
      }

      content += `</${tag}>`;
      continue;
    }

    if (/^<\s*br\s*\/?>$/iu.test(token)) {
      content += '<br>';
      continue;
    }

    if (/^<\s*hr\s*\/?>$/iu.test(token)) {
      content += '<hr>';
      continue;
    }

    const open =
      /^<\s*(p|h2|strong|em|ul|li)\s*>$/iu.exec(token);

    if (open) {
      const tag = open[1].toLowerCase();
      stack.push(tag);
      content += `<${tag}>`;
      continue;
    }

    const anchor = /^<\s*a\s+([^>]*)>$/iu.exec(token);

    if (anchor) {
      const safe = safeAnchor(anchor[1]);

      if (!safe) {
        return invalidTechContent('HTML');
      }

      stack.push('a');
      content += safe;
      continue;
    }

    return invalidTechContent('HTML');
  }

  if (stack.length || !hasText) {
    return invalidTechContent('HTML');
  }

  return {
    content,
    diagnostic: {
      sourceFormat: 'HTML',
      htmlValidation: 'PASS',
      allowedTagsOnly: 'PASS',
      renderableContent: 'PASS',
      publishAllowed: 'YES'
    }
  };
}
function techContentDiagnostic(language) {
  const validated = validateTechContent(language?.techContent);
  const declared = language?.techContentDiagnostic;
  if (
    validated.diagnostic.publishAllowed === 'NO' &&
    ['HTML', 'PLAIN_TEXT'].includes(declared?.sourceFormat)
  ) {
    validated.diagnostic.sourceFormat = declared.sourceFormat;
  }
  return validated.diagnostic;
}
function releaseDate(value) { const date = new Date(`${value}T00:00:00.000Z`); return date.getTime() <= Date.now() ? 'PUBLIC' : 'SCHEDULED'; }
function docId(value) { return `${value}-log`; }
function normalizePayload(payload) { return { date: String(payload?.date || '').trim(), image: String(payload?.image || '').trim(), pt: { title: String(payload?.pt?.title || ''), description: String(payload?.pt?.description || ''), techContent: validateTechContent(payload?.pt?.techContent).content, jonahComment: String(payload?.pt?.jonahComment || '') }, en: { title: String(payload?.en?.title || ''), description: String(payload?.en?.description || ''), techContent: validateTechContent(payload?.en?.techContent).content, jonahComment: String(payload?.en?.jonahComment || '') } }; }
function digest(payload) { return createHmac('sha256', secret()).update(JSON.stringify(payload)).digest('base64url'); }
function makeDryRunToken(payload, source) { const data = Buffer.from(JSON.stringify({ digest: digest(payload), source, expiresAt: Date.now() + DRY_RUN_TTL, nonce: randomUUID() })).toString('base64url'); return `${data}.${createHmac('sha256', secret()).update(`system-logs:${data}`).digest('base64url')}`; }
function verifyToken(token, payload, source) { const [data, sig, ...extra] = String(token || '').split('.'); if (!data || !sig || extra.length || !safeEqual(sig, createHmac('sha256', secret()).update(`system-logs:${data}`).digest('base64url'))) return false; try { const value = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')); return Number(value.expiresAt) > Date.now() && value.digest === digest(payload) && JSON.stringify(value.source) === JSON.stringify(source); } catch { return false; } }
function firestoreFields(payload) { const string = value => ({ stringValue: value }); const map = value => ({ mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, string(item)])) } }); return { date: string(payload.date), image: string(payload.image), pt: map(payload.pt), en: map(payload.en) }; }
async function firestoreCreate(payload) {
  const auth = await firestoreAuth().getClient(); const token = await auth.getAccessToken(); const url = new URL(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents/${COLLECTION}`); url.searchParams.set('documentId', docId(payload.date));
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${typeof token === 'string' ? token : token.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: firestoreFields(payload) }) });
  if (response.status === 409) throw new SystemLogsError(409, 'DOCUMENT_ALREADY_EXISTS', 'O documentId já existe.', { FIRESTORE_HTTP_STATUS: 409 });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const firestoreError = body?.error || {};
    throw new SystemLogsError(502, 'FIRESTORE_CREATE_FAILED', 'O Firestore recusou a criação.', {
      FIRESTORE_HTTP_STATUS: response.status,
      FIRESTORE_ERROR_CODE: firestoreError.status || firestoreError.code || null,
      FIRESTORE_ERROR_MESSAGE: typeof firestoreError.message === 'string' ? firestoreError.message : null
    });
  }
}

export { parseSystemLogDocument, releaseDate, docId, firestoreFields, validateTechContent };
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('Vary', 'Origin, Sec-Fetch-Site'); res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    if (req.method !== 'POST') throw new SystemLogsError(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw new SystemLogsError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json.');
    requireOrigin(req); const input = body(req); const action = input.action; const key = secret();
    if (action === 'login') { if (!input.credential || !safeEqual(input.credential, key)) throw new SystemLogsError(401, 'INVALID_ADMIN_CREDENTIAL', 'Credencial inválida.'); const session = newSession(key); res.setHeader('Set-Cookie', cookie(session.token)); return res.status(200).json({ authenticated: true, csrfToken: session.csrfToken, expiresAt: session.expiresAt }); }
    if (action === 'session') { const session = readSession(req, key); if (!session) { res.setHeader('Set-Cookie', expiredCookies()); return res.status(200).json({ authenticated: false }); } return res.status(200).json({ authenticated: true, csrfToken: session.csrfToken, expiresAt: session.expiresAt }); }
    const session = requireSession(req, key); requireCsrf(req, session);
    if (action === 'logout') { res.setHeader('Set-Cookie', expiredCookies()); return res.status(200).json({ authenticated: false }); }
    if (action === 'list') return res.status(200).json({ documents: await listDocuments() });
    if (action === 'load') { const document = await documentText(input.documentId); return res.status(200).json({ documentId: input.documentId, modifiedTime: document.modifiedTime, parsed: parseSystemLogDocument(document.text) }); }
    if (action === 'dry-run') {
      const finalPayload = normalizePayload(input.payload);
      const source = {
        documentId: input.sourceDocumentId || '',
        modifiedTime: input.sourceModifiedTime || ''
      };

      if (!finalPayload?.date || !isDate(finalPayload.date) || !source.documentId || !source.modifiedTime) {
        throw new SystemLogsError(400, 'INVALID_PAYLOAD', 'Payload ou fonte do Drive inválida.');
      }

      const ptTechContent = techContentDiagnostic(input.payload?.pt);
      const enTechContent = techContentDiagnostic(input.payload?.en);
      const checks = {
        documentId: docId(finalPayload.date),
        sourceDocument: input.sourceDocument || '',
        date: finalPayload.date,
        scheduleStatus: releaseDate(finalPayload.date),
        image: finalPayload.image ? 'FOUND' : 'MISSING',
        pt: {
          title: finalPayload.pt?.title ? 'FOUND' : 'MISSING',
          description: finalPayload.pt?.description ? 'FOUND' : 'MISSING',
          techContent: ptTechContent,
          jonahComment: finalPayload.pt?.jonahComment ? 'FOUND' : 'EMPTY'
        },
        en: {
          title: finalPayload.en?.title ? 'FOUND' : 'MISSING',
          description: finalPayload.en?.description ? 'FOUND' : 'MISSING',
          techContent: enTechContent,
          jonahComment: finalPayload.en?.jonahComment ? 'FOUND' : 'EMPTY'
        }
      };
      const missing = [
        checks.image === 'MISSING' ? 'image' : '',
        checks.pt.title === 'MISSING' ? 'pt.title' : '',
        checks.pt.description === 'MISSING' ? 'pt.description' : '',
        checks.pt.techContent.publishAllowed === 'NO' ? 'pt.techContent' : '',
        checks.en.title === 'MISSING' ? 'en.title' : '',
        checks.en.description === 'MISSING' ? 'en.description' : '',
        checks.en.techContent.publishAllowed === 'NO' ? 'en.techContent' : ''
      ].filter(Boolean);
      const firestore = missing.length ? 'BLOCKED' : 'WOULD CREATE';

      return res.status(200).json({
        checks,
        firestore,
        dryRunToken: firestore === 'WOULD CREATE'
          ? makeDryRunToken(finalPayload, source)
          : null,
        preview: {
          pt: finalPayload.pt.techContent,
          en: finalPayload.en.techContent
        },
        payload: finalPayload,
        source
      });
    }
    if (action === 'create') { const payload = input.payload; const source = input.source; if (!verifyToken(input.dryRunToken, payload, source)) throw new SystemLogsError(409, 'DRY_RUN_REQUIRED', 'Execute o DRY RUN novamente.'); const current = await documentText(source.documentId); if (current.modifiedTime !== source.modifiedTime) throw new SystemLogsError(409, 'DRY_RUN_REQUIRED', 'O Google Doc foi alterado depois do DRY RUN.'); await firestoreCreate(payload); return res.status(201).json({ documentId: docId(payload.date), firestore: 'CREATED' }); }
    throw new SystemLogsError(400, 'INVALID_ACTION', 'Ação inválida.');
  } catch (error) { const failure = error instanceof SystemLogsError ? error : new SystemLogsError(500, 'INTERNAL_ERROR', 'Falha interna no módulo System Logs.'); return res.status(failure.status).json({ error: failure.code, message: failure.message, ...(failure.details || {}) }); }
}
