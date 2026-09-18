import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual
} from 'node:crypto';

import { google } from 'googleapis';

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  'raquel-synths-platform';

const COLLECTION = 'discography';
const FACTIONS = new Set(['broklin', 'hybrid', 'jonah']);
const RELEASE_TYPES = new Set(['EP', 'Album', 'Single']);
const DRY_RUN_TTL_MS = 10 * 60 * 1000;
const ADMIN_SESSION_TTL_MS = 20 * 60 * 1000;
const ADMIN_SESSION_COOKIE = '__Host-rqs_sc_importer_session';

let soundCloudTokenCache = null;
let soundCloudTokenRequest = null;
let firestoreAuthClientPromise = null;

class ImporterError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ImporterError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function logOperation({ operationId, action, documentId, outcome }) {
  console.info('[RQS SOUNDCLOUD IMPORTER]', JSON.stringify({
    operationId,
    action,
    documentId: documentId || null,
    outcome,
    timestamp: new Date().toISOString()
  }));
}

function getRequestBody(req) {
  if (!req.body) return {};

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new ImporterError(
        400,
        'INVALID_JSON',
        'O corpo da requisição não contém JSON válido.'
      );
    }
  }

  return req.body;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  return leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer);
}

function getAdminSecret() {
  const configuredToken =
    process.env.RQS_SOUNDCLOUD_IMPORTER_TOKEN;

  if (
    !configuredToken ||
    Buffer.byteLength(configuredToken, 'utf8') < 32
  ) {
    throw new ImporterError(
      500,
      'MISSING_ADMIN_CONFIGURATION',
      'A credencial administrativa do importer não está configurada com segurança.'
    );
  }

  return configuredToken;
}

function normalizeOrigin(value) {
  if (typeof value !== 'string' || !value) return null;

  try {
    const parsed = new URL(
      /^[a-z][a-z0-9+.-]*:\/\//i.test(value)
        ? value
        : `https://${value}`
    );

    if (parsed.username || parsed.password) return null;

    return parsed.origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins() {
  const origins = new Set([
    'https://raquelsynths.com',
    'https://www.raquelsynths.com'
  ]);

  if (process.env.VERCEL_ENV === 'preview') {
    for (const previewHost of [
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL
    ]) {
      const origin = normalizeOrigin(previewHost);
      if (origin) origins.add(origin);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:4200');
    origins.add('http://127.0.0.1:4200');
  }

  return origins;
}

function requireAllowedOrigin(req) {
  const origin = normalizeOrigin(req.headers.origin);
  const fetchSite = req.headers['sec-fetch-site'];

  if (
    !origin ||
    !getAllowedOrigins().has(origin) ||
    fetchSite === 'cross-site'
  ) {
    throw new ImporterError(
      403,
      'ORIGIN_NOT_ALLOWED',
      'A origem da requisição não está autorizada.'
    );
  }
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map(value => value.trim())
      .filter(Boolean)
      .map(value => {
        const separator = value.indexOf('=');

        if (separator === -1) return [value, ''];

        return [
          value.slice(0, separator),
          value.slice(separator + 1)
        ];
      })
  );
}

function signSessionPayload(payload, secret) {
  return createHmac('sha256', secret)
    .update(`admin-session:${payload}`)
    .digest('base64url');
}

function createAdminSession(secret) {
  const csrfToken = randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  const payload = Buffer.from(JSON.stringify({
    version: 1,
    csrfToken,
    issuedAt: Date.now(),
    expiresAt,
    nonce: randomUUID()
  })).toString('base64url');
  const signature = signSessionPayload(payload, secret);

  return {
    csrfToken,
    expiresAt,
    token: `${payload}.${signature}`
  };
}

function sessionCookie(token) {
  return [
    `${ADMIN_SESSION_COOKIE}=${token}`,
    `Max-Age=${Math.floor(ADMIN_SESSION_TTL_MS / 1000)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict'
  ].join('; ');
}

function expiredSessionCookie() {
  return [
    `${ADMIN_SESSION_COOKIE}=`,
    'Max-Age=0',
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict'
  ].join('; ');
}

function readAdminSession(req, secret) {
  const token = parseCookies(req)[ADMIN_SESSION_COOKIE];
  const [payload, suppliedSignature, ...extra] =
    String(token || '').split('.');

  if (!payload || !suppliedSignature || extra.length) return null;

  const expectedSignature = signSessionPayload(payload, secret);
  if (!safeEqual(suppliedSignature, expectedSignature)) return null;

  try {
    const session = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    if (
      session.version !== 1 ||
      typeof session.csrfToken !== 'string' ||
      !session.csrfToken ||
      Number(session.expiresAt) <= Date.now()
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function requireAdminSession(req, secret) {
  const session = readAdminSession(req, secret);

  if (!session) {
    throw new ImporterError(
      401,
      'ADMIN_SESSION_REQUIRED',
      'A sessão administrativa expirou ou não existe.'
    );
  }

  return session;
}

function requireCsrf(req, session) {
  const suppliedToken = req.headers['x-rqs-csrf'] || '';

  if (!safeEqual(suppliedToken, session.csrfToken)) {
    throw new ImporterError(
      403,
      'CSRF_VALIDATION_FAILED',
      'A proteção CSRF recusou a operação.'
    );
  }
}

function validateSoundCloudUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(String(rawUrl || '').trim());
  } catch {
    throw new ImporterError(
      400,
      'INVALID_SOUNDCLOUD_URL',
      'Informe uma URL pública válida do SoundCloud.'
    );
  }

  const allowedHosts = new Set([
    'soundcloud.com',
    'www.soundcloud.com',
    'm.soundcloud.com',
    'on.soundcloud.com'
  ]);

  if (
    parsed.protocol !== 'https:' ||
    !allowedHosts.has(parsed.hostname.toLowerCase()) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname === '/'
  ) {
    throw new ImporterError(
      400,
      'INVALID_SOUNDCLOUD_URL',
      'A URL deve apontar para um release público em soundcloud.com.'
    );
  }

  parsed.hash = '';
  return parsed.toString();
}

async function getSoundCloudAccessToken() {
  if (
    soundCloudTokenCache &&
    soundCloudTokenCache.expiresAt > Date.now() + 60_000
  ) {
    return soundCloudTokenCache.accessToken;
  }

  if (soundCloudTokenRequest) {
    return soundCloudTokenRequest;
  }

  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new ImporterError(
      500,
      'MISSING_SOUNDCLOUD_CONFIGURATION',
      'As credenciais do SoundCloud não estão configuradas no servidor.'
    );
  }

  soundCloudTokenRequest = (async () => {
    const credentials = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString('base64');

    const response = await fetch(
      'https://secure.soundcloud.com/oauth/token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json; charset=utf-8',
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials'
        })
      }
    );

    if (!response.ok) {
      throw new ImporterError(
        response.status === 429 ? 429 : 502,
        'SOUNDCLOUD_AUTH_FAILED',
        'O servidor não conseguiu autenticar na API do SoundCloud.'
      );
    }

    const body = await response.json();

    if (!body.access_token) {
      throw new ImporterError(
        502,
        'SOUNDCLOUD_AUTH_FAILED',
        'A API do SoundCloud não retornou um access token.'
      );
    }

    soundCloudTokenCache = {
      accessToken: body.access_token,
      expiresAt:
        Date.now() + Math.max(Number(body.expires_in) || 3600, 60) * 1000
    };

    return soundCloudTokenCache.accessToken;
  })();

  try {
    return await soundCloudTokenRequest;
  } finally {
    soundCloudTokenRequest = null;
  }
}

function formatReleaseDate(resource) {
  if (
    typeof resource.release_date === 'string' &&
    /^\d{4}-\d{2}-\d{2}/.test(resource.release_date)
  ) {
    return resource.release_date.slice(0, 10);
  }

  const year = Number(resource.release_year);
  const month = Number(resource.release_month);
  const day = Number(resource.release_day);

  if (!year || !month || !day) return '';

  const value =
    `${String(year).padStart(4, '0')}-` +
    `${String(month).padStart(2, '0')}-` +
    String(day).padStart(2, '0');

  return isValidDate(value) ? value : '';
}

function inferReleaseType(resource) {
  if (resource.kind === 'track') return 'Single';

  const soundCloudType = String(
    resource.playlist_type || resource.type || ''
  ).toLowerCase();

  if (soundCloudType === 'album') return 'Album';
  if (soundCloudType === 'ep') return 'EP';
  if (soundCloudType === 'single') return 'Single';

  return '';
}

export function normalizeSoundCloudArtworkUrl(artworkUrl) {
  if (typeof artworkUrl !== 'string') return '';

  try {
    const url = new URL(artworkUrl);

    if (
      url.protocol !== 'https:' ||
      !/^i\d+\.sndcdn\.com$/iu.test(url.hostname)
    ) {
      return artworkUrl;
    }

    const namedReducedVariant =
      /-(?:mini|tiny|small|badge|large|crop)(?=\.[a-z0-9]+$)/iu;
    const sizedVariant =
      /-t(\d+)x(\d+)(?=\.[a-z0-9]+$)/iu;
    const dimensions = url.pathname.match(sizedVariant);

    if (namedReducedVariant.test(url.pathname)) {
      url.pathname = url.pathname.replace(
        namedReducedVariant,
        '-t500x500'
      );
    } else if (
      dimensions &&
      (Number(dimensions[1]) < 500 || Number(dimensions[2]) < 500)
    ) {
      url.pathname = url.pathname.replace(
        sizedVariant,
        '-t500x500'
      );
    }

    return url.toString();
  } catch {
    return artworkUrl;
  }
}

function findArtwork(resource) {
  if (typeof resource.artwork_url === 'string') {
    return normalizeSoundCloudArtworkUrl(resource.artwork_url);
  }

  if (Array.isArray(resource.tracks)) {
    const trackWithArtwork = resource.tracks.find(
      track => typeof track?.artwork_url === 'string'
    );

    return normalizeSoundCloudArtworkUrl(
      trackWithArtwork?.artwork_url
    );
  }

  return '';
}

async function resolveSoundCloudRelease(rawUrl) {
  const requestedUrl = validateSoundCloudUrl(rawUrl);
  const accessToken = await getSoundCloudAccessToken();
  const resolveUrl = new URL('https://api.soundcloud.com/resolve');
  resolveUrl.searchParams.set('url', requestedUrl);

  const response = await fetch(resolveUrl, {
    headers: {
      Accept: 'application/json; charset=utf-8',
      Authorization: `OAuth ${accessToken}`
    },
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new ImporterError(
      response.status === 404 ? 404 : 502,
      'SOUNDCLOUD_RESOLVE_FAILED',
      response.status === 404
        ? 'O release não foi encontrado no SoundCloud.'
        : 'A API do SoundCloud não conseguiu resolver esta URL.'
    );
  }

  const resource = await response.json();

  if (!['playlist', 'track'].includes(resource.kind)) {
    throw new ImporterError(
      400,
      'UNSUPPORTED_SOUNDCLOUD_RESOURCE',
      'A URL deve apontar para uma playlist, álbum, EP ou faixa.'
    );
  }

  if (resource.sharing && resource.sharing !== 'public') {
    throw new ImporterError(
      400,
      'PRIVATE_SOUNDCLOUD_RESOURCE',
      'O release precisa estar público no SoundCloud.'
    );
  }

  const canonicalUrl = validateSoundCloudUrl(
    resource.permalink_url || requestedUrl
  );

  return {
    title: typeof resource.title === 'string' ? resource.title : '',
    descriptionEN:
      typeof resource.description === 'string'
        ? resource.description
        : '',
    cover: findArtwork(resource),
    releaseDate: formatReleaseDate(resource),
    soundcloud: canonicalUrl,
    typeSuggestion: inferReleaseType(resource)
  };
}

export function createDocumentId(title, type) {
  if (!RELEASE_TYPES.has(type)) return '';

  const rawTitle = String(title || '');
  const blueprintTitle = rawTitle.match(
    /^\s*(the\s+blueprint\s+sessions)\s+vol(?:ume)?\.?\s*(\d+)\b/iu
  );
  const canonicalTitle = blueprintTitle
    ? `${blueprintTitle[1]} v${blueprintTitle[2]}`
    : rawTitle.split(/\s+[—–]\s+/u, 1)[0];
  const baseTitle = canonicalTitle
    .replace(/\bvol(?:ume)?\.?\s*(\d+)/giu, 'v$1')
    .replace(/\bv\.?\s*(\d+)/giu, 'v$1')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180)
    .replace(/-+$/g, '');

  return baseTitle ? `${type.toLowerCase()}-${baseTitle}` : '';
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function escapeEditorialHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitTrailingUrlPunctuation(value) {
  let url = value;
  let suffix = '';

  while (/[.,;:!?]$/u.test(url)) {
    suffix = url.at(-1) + suffix;
    url = url.slice(0, -1);
  }

  for (const [opening, closing] of [
    ['(', ')'],
    ['[', ']'],
    ['{', '}']
  ]) {
    while (
      url.endsWith(closing) &&
      url.split(closing).length > url.split(opening).length
    ) {
      suffix = closing + suffix;
      url = url.slice(0, -1);
    }
  }

  return { url, suffix };
}

function normalizeEditorialLine(line) {
  const urlPattern = /https?:\/\/[^\s<>"']+/giu;
  let normalized = '';
  let previousIndex = 0;

  for (const match of line.matchAll(urlPattern)) {
    const index = match.index ?? 0;
    const { url, suffix } = splitTrailingUrlPunctuation(match[0]);

    normalized += escapeEditorialHtml(
      line.slice(previousIndex, index)
    );

    try {
      const parsed = new URL(url);

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Unsupported editorial URL protocol.');
      }

      const escapedUrl = escapeEditorialHtml(url);
      normalized +=
        `<a href="${escapedUrl}" target="_blank" ` +
        `rel="noopener noreferrer">${escapedUrl}</a>`;
    } catch {
      normalized += escapeEditorialHtml(url);
    }

    normalized += escapeEditorialHtml(suffix);
    previousIndex = index + match[0].length;
  }

  return normalized + escapeEditorialHtml(line.slice(previousIndex));
}

export function normalizeEditorialDescription(rawDescription) {
  if (typeof rawDescription !== 'string') return '';

  const normalizedLineEndings = rawDescription
    .replace(/\r\n?/g, '\n')
    .trim();

  if (!normalizedLineEndings) return '';

  return normalizedLineEndings
    .split(/\n[ \t]*\n+/u)
    .map(block => (
      '<p>' +
      block
        .split('\n')
        .map(normalizeEditorialLine)
        .join('<br>\n') +
      '</p>'
    ))
    .join('\n\n');
}

export function validateRelease(rawRelease) {
  const rawDescriptionPT =
    typeof rawRelease?.descriptionPT === 'string'
      ? rawRelease.descriptionPT
      : '';
  const rawDescriptionEN =
    typeof rawRelease?.descriptionEN === 'string'
      ? rawRelease.descriptionEN
      : '';
  const release = {
    title:
      typeof rawRelease?.title === 'string'
        ? rawRelease.title
        : '',
    descriptionPT: normalizeEditorialDescription(rawDescriptionPT),
    descriptionEN: normalizeEditorialDescription(rawDescriptionEN),
    cover:
      typeof rawRelease?.cover === 'string'
        ? rawRelease.cover
        : '',
    releaseDate:
      typeof rawRelease?.releaseDate === 'string'
        ? rawRelease.releaseDate
        : '',
    soundcloud:
      typeof rawRelease?.soundcloud === 'string'
        ? rawRelease.soundcloud
        : '',
    faction:
      typeof rawRelease?.faction === 'string'
        ? rawRelease.faction
        : '',
    type:
      typeof rawRelease?.type === 'string'
        ? rawRelease.type
        : ''
  };

  const documentId = createDocumentId(release.title, release.type);
  const suppliedDocumentId =
    typeof rawRelease?.documentId === 'string'
      ? rawRelease.documentId
      : '';
  const missingFields = [];

  if (!release.title.trim() || release.title.length > 300) {
    missingFields.push('title');
  }
  if (
    !rawDescriptionPT.trim() ||
    rawDescriptionPT.length > 100_000
  ) {
    missingFields.push('descriptionPT');
  }
  if (
    !rawDescriptionEN.trim() ||
    rawDescriptionEN.length > 100_000
  ) {
    missingFields.push('descriptionEN');
  }
  if (
    !release.cover ||
    release.cover.length > 2048 ||
    !isHttpsUrl(release.cover)
  ) {
    missingFields.push('cover');
  }
  if (!isValidDate(release.releaseDate)) {
    missingFields.push('releaseDate');
  }

  try {
    validateSoundCloudUrl(release.soundcloud);
  } catch {
    missingFields.push('soundcloud');
  }

  if (!FACTIONS.has(release.faction)) {
    missingFields.push('faction');
  }
  if (!RELEASE_TYPES.has(release.type)) {
    missingFields.push('type');
  }
  if (!documentId || suppliedDocumentId !== documentId) {
    missingFields.push('documentId');
  }

  return {
    release,
    documentId,
    missingFields: [...new Set(missingFields)]
  };
}

function getServiceAccountCredentials() {
  const rawCredentials =
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

  if (!rawCredentials) return undefined;

  try {
    const credentials = JSON.parse(rawCredentials);

    if (typeof credentials.private_key === 'string') {
      credentials.private_key =
        credentials.private_key.replace(/\\n/g, '\n');
    }

    return credentials;
  } catch {
    throw new ImporterError(
      500,
      'INVALID_FIREBASE_CONFIGURATION',
      'A credencial Firebase Admin configurada no servidor é inválida.'
    );
  }
}

async function getFirestoreAccessToken() {
  if (!firestoreAuthClientPromise) {
    const credentials = getServiceAccountCredentials();
    const auth = new google.auth.GoogleAuth({
      credentials,
      projectId: credentials?.project_id || PROJECT_ID,
      scopes: ['https://www.googleapis.com/auth/datastore']
    });

    firestoreAuthClientPromise = auth.getClient();
  }

  let client;

  try {
    client = await firestoreAuthClientPromise;
  } catch {
    firestoreAuthClientPromise = null;
    throw new ImporterError(
      500,
      'FIRESTORE_AUTH_FAILED',
      'O servidor não conseguiu autenticar no Firestore.'
    );
  }

  const tokenResponse = await client.getAccessToken();
  const token =
    typeof tokenResponse === 'string'
      ? tokenResponse
      : tokenResponse?.token;

  if (!token) {
    throw new ImporterError(
      500,
      'FIRESTORE_AUTH_FAILED',
      'O servidor não obteve um access token para o Firestore.'
    );
  }

  return token;
}

function firestoreDocumentUrl(documentId) {
  return (
    'https://firestore.googleapis.com/v1/projects/' +
    `${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents/` +
    `${encodeURIComponent(COLLECTION)}/${encodeURIComponent(documentId)}`
  );
}

async function firestoreDocumentExists(documentId, accessToken) {
  const response = await fetch(firestoreDocumentUrl(documentId), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (response.status === 404) return false;
  if (response.ok) return true;

  throw new ImporterError(
    502,
    'FIRESTORE_READ_FAILED',
    'Não foi possível verificar o documentId no Firestore.'
  );
}

function toFirestoreFields(release) {
  return Object.fromEntries(
    Object.entries(release).map(([key, value]) => [
      key,
      { stringValue: value }
    ])
  );
}

async function createFirestoreDocument(
  documentId,
  release,
  accessToken
) {
  const collectionUrl =
    'https://firestore.googleapis.com/v1/projects/' +
    `${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents/` +
    encodeURIComponent(COLLECTION);
  const url = new URL(collectionUrl);
  url.searchParams.set('documentId', documentId);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: toFirestoreFields(release)
    })
  });

  if (response.status === 409) {
    throw new ImporterError(
      409,
      'DOCUMENT_ALREADY_EXISTS',
      'O documentId já existe. Nenhum documento foi alterado.'
    );
  }

  if (!response.ok) {
    throw new ImporterError(
      502,
      'FIRESTORE_CREATE_FAILED',
      'O Firestore recusou a criação do documento.'
    );
  }
}

function releaseDigest(documentId, release) {
  return createHash('sha256')
    .update(JSON.stringify([documentId, release]))
    .digest('base64url');
}

function createDryRunToken(documentId, release, secret) {
  const payload = Buffer.from(JSON.stringify({
    documentId,
    digest: releaseDigest(documentId, release),
    expiresAt: Date.now() + DRY_RUN_TTL_MS,
    nonce: randomUUID()
  })).toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(`dry-run:${payload}`)
    .digest('base64url');

  return `${payload}.${signature}`;
}

function verifyDryRunToken(
  token,
  documentId,
  release,
  secret
) {
  const [payload, suppliedSignature, ...extra] =
    String(token || '').split('.');

  if (!payload || !suppliedSignature || extra.length) return false;

  const expectedSignature = createHmac('sha256', secret)
    .update(`dry-run:${payload}`)
    .digest('base64url');

  if (!safeEqual(suppliedSignature, expectedSignature)) return false;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    return parsed.documentId === documentId &&
      parsed.digest === releaseDigest(documentId, release) &&
      Number(parsed.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

function buildDryRunChecks(release, documentId, missingFields) {
  const missing = new Set(missingFields);
  const descriptionCheck = field => ({
    raw: missing.has(field) ? 'MISSING' : 'FOUND',
    htmlNormalization: missing.has(field) ? 'BLOCKED' : 'PASS',
    renderedPreview: missing.has(field) ? 'UNAVAILABLE' : 'AVAILABLE'
  });

  return {
    documentId:
      documentId && !missing.has('documentId')
        ? documentId
        : 'MISSING',
    title: missing.has('title') ? 'MISSING' : release.title,
    cover: missing.has('cover') ? 'MISSING' : 'FOUND',
    descriptionEN: descriptionCheck('descriptionEN'),
    descriptionPT: descriptionCheck('descriptionPT'),
    releaseDate:
      missing.has('releaseDate') ? 'MISSING' : 'FOUND',
    soundcloud:
      missing.has('soundcloud') ? 'MISSING' : 'FOUND',
    faction:
      missing.has('faction') ? 'MISSING' : release.faction,
    type: missing.has('type') ? 'MISSING' : release.type
  };
}

async function handleDryRun(rawRelease, adminSecret, operationId) {
  const validation = validateRelease(rawRelease);
  const accessToken = await getFirestoreAccessToken();
  const exists = validation.documentId
    ? await firestoreDocumentExists(
        validation.documentId,
        accessToken
      )
    : false;
  const blocked = validation.missingFields.length > 0 || exists;
  const firestore = blocked
    ? 'BLOCKED'
    : 'WOULD CREATE';

  logOperation({
    operationId,
    action: 'dry-run',
    documentId: validation.documentId,
    outcome: exists
      ? 'blocked-existing-document'
      : blocked
        ? 'blocked-validation'
        : 'would-create'
  });

  return {
    operationId,
    checks: buildDryRunChecks(
      validation.release,
      validation.documentId,
      validation.missingFields
    ),
    missingFields: validation.missingFields,
    firestore,
    existingDocument: exists,
    preview: {
      descriptionEN: validation.missingFields.includes('descriptionEN')
        ? ''
        : validation.release.descriptionEN,
      descriptionPT: validation.missingFields.includes('descriptionPT')
        ? ''
        : validation.release.descriptionPT
    },
    dryRunToken: blocked
      ? null
      : createDryRunToken(
          validation.documentId,
          validation.release,
          adminSecret
        )
  };
}

async function handleImport(
  rawRelease,
  dryRunToken,
  adminSecret,
  operationId
) {
  const validation = validateRelease(rawRelease);

  if (validation.missingFields.length) {
    throw new ImporterError(
      400,
      'VALIDATION_FAILED',
      'A importação foi bloqueada por campos inválidos.',
      { missingFields: validation.missingFields }
    );
  }

  if (!verifyDryRunToken(
    dryRunToken,
    validation.documentId,
    validation.release,
    adminSecret
  )) {
    throw new ImporterError(
      409,
      'DRY_RUN_REQUIRED',
      'Execute novamente o DRY RUN antes de importar.'
    );
  }

  const accessToken = await getFirestoreAccessToken();

  if (await firestoreDocumentExists(
    validation.documentId,
    accessToken
  )) {
    throw new ImporterError(
      409,
      'DOCUMENT_ALREADY_EXISTS',
      'O documentId já existe. Nenhum documento foi alterado.'
    );
  }

  await createFirestoreDocument(
    validation.documentId,
    validation.release,
    accessToken
  );

  logOperation({
    operationId,
    action: 'import',
    documentId: validation.documentId,
    outcome: 'created'
  });

  return {
    operationId,
    success: true,
    documentId: validation.documentId,
    firestore: 'CREATED'
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Origin, Sec-Fetch-Site');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const operationId = randomUUID();
  let action = 'unknown';
  let documentId = null;

  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      throw new ImporterError(
        405,
        'METHOD_NOT_ALLOWED',
        'Método não permitido.'
      );
    }

    if (!String(req.headers['content-type'] || '')
      .toLowerCase()
      .startsWith('application/json')) {
      throw new ImporterError(
        415,
        'UNSUPPORTED_MEDIA_TYPE',
        'O endpoint aceita somente application/json.'
      );
    }

    const body = getRequestBody(req);
    action = body.action;
    documentId = body.release?.documentId || null;
    requireAllowedOrigin(req);

    const adminSecret = getAdminSecret();

    if (action === 'login') {
      const suppliedCredential =
        typeof body.credential === 'string'
          ? body.credential
          : '';

      if (
        !suppliedCredential ||
        !safeEqual(suppliedCredential, adminSecret)
      ) {
        throw new ImporterError(
          401,
          'INVALID_ADMIN_CREDENTIAL',
          'Credencial administrativa inválida.'
        );
      }

      const session = createAdminSession(adminSecret);
      res.setHeader('Set-Cookie', sessionCookie(session.token));

      logOperation({
        operationId,
        action,
        outcome: 'session-created'
      });

      return res.status(200).json({
        operationId,
        authenticated: true,
        csrfToken: session.csrfToken,
        expiresAt: session.expiresAt
      });
    }

    if (action === 'session') {
      const session = readAdminSession(req, adminSecret);

      if (!session) {
        res.setHeader('Set-Cookie', expiredSessionCookie());
        return res.status(200).json({
          operationId,
          authenticated: false
        });
      }

      return res.status(200).json({
        operationId,
        authenticated: true,
        csrfToken: session.csrfToken,
        expiresAt: session.expiresAt
      });
    }

    const adminSession = requireAdminSession(req, adminSecret);
    requireCsrf(req, adminSession);

    if (action === 'logout') {
      res.setHeader('Set-Cookie', expiredSessionCookie());

      logOperation({
        operationId,
        action,
        outcome: 'session-cleared'
      });

      return res.status(200).json({
        operationId,
        authenticated: false
      });
    }

    if (action === 'resolve') {
      const release = await resolveSoundCloudRelease(body.url);

      logOperation({
        operationId,
        action,
        outcome: 'resolved'
      });

      return res.status(200).json({
        operationId,
        release
      });
    }

    if (action === 'dry-run') {
      const result = await handleDryRun(
        body.release,
        adminSecret,
        operationId
      );

      return res.status(200).json(result);
    }

    if (action === 'import') {
      const result = await handleImport(
        body.release,
        body.dryRunToken,
        adminSecret,
        operationId
      );

      return res.status(201).json(result);
    }

    throw new ImporterError(
      400,
      'INVALID_ACTION',
      'Ação inválida.'
    );
  } catch (error) {
    const importerError = error instanceof ImporterError
      ? error
      : new ImporterError(
          500,
          'INTERNAL_ERROR',
          'Falha interna no RQS SoundCloud Importer.'
        );

    logOperation({
      operationId,
      action,
      documentId,
      outcome: `error:${importerError.code}`
    });

    if (!(error instanceof ImporterError)) {
      console.error(
        '[RQS SOUNDCLOUD IMPORTER] Internal error:',
        error?.message || error
      );
    }

    return res.status(importerError.status).json({
      operationId,
      error: importerError.code,
      message: importerError.message,
      ...(importerError.details || {})
    });
  }
}
