import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { normalizeSource } from '../lib/social/source-adapters.js';
import { canCancel, diagnose, draftFromInput, isSourceCurrent, makeDryRunToken, verifyDryRunToken } from '../lib/social/packages.js';
import { assertDeliveryCanStart, createDeliveryFoundation, deliveryDecision, deliveryDocumentPath, deliveryIdempotencyKey } from '../lib/social/deliveries.js';
import { diagnoseMetaConnection, META_GRAPH_API_VERSION } from '../lib/social/meta-client.js';
import socialHandler from '../api/admin/social-publishing.js';

const now = Date.parse('2026-09-23T12:00:00Z');
const str = value => ({ stringValue: value });
const bool = value => ({ booleanValue: value });
const map = value => ({ mapValue: { fields: value } });
const document = (collection, id, fields) => ({
  name: `projects/test/databases/(default)/documents/${collection}/${id}`,
  fields
});

const log = document('logs', '2026-09-01-log', {
  date: str('2026-09-01'), image: str('https://raquelsynths.com/log.webp'),
  pt: map({ title: str('Log RQS'), description: str('Resumo publicado'), techContent: str('<p>Corpo editorial.</p>') }),
  en: map({ title: str('RQS Log'), description: str('Published summary') })
});
const sourceLog = normalizeSource('system_log', 'logs', log, 'pt-BR', now);
assert.equal(sourceLog.canonicalUrl, 'https://raquelsynths.com/log-reader/2026-09-01-log');
assert.equal(normalizeSource('system_log', 'logs', document('logs', 'future', { ...log.fields, date: str('2026-10-01') }), 'pt-BR', now), null);
assert.equal(normalizeSource('system_log', 'logs', document('logs', 'hidden', { ...log.fields, published: bool(false) }), 'pt-BR', now), null);
console.log('SYSTEM_LOG_SELECTION = PASS');

const saga = document('lore-jonah', 's1-e5', {
  title: str('Jonah S1-E5'), description: str('Descrição'), content: str('<p>Corpo.</p>'),
  image: str('https://raquelsynths.com/jonah.webp'), mode: str('jonah'),
  published: bool(true), releaseDate: str('2026-09-01')
});
const sourceSaga = normalizeSource('saga_episode', 'lore-jonah', saga, 'pt-BR', now);
assert.equal(sourceSaga.canonicalUrl, 'https://raquelsynths.com/lore/jonah/s1-e5');
assert.equal(sourceSaga.episode, 5);
const broklin = document('lore', 's1-e5', { ...saga.fields, mode: str('broklin') });
assert.equal(normalizeSource('saga_episode', 'lore', broklin, 'pt-BR', now)?.canonicalUrl, 'https://raquelsynths.com/lore/broklin/s1-e5');
assert.equal(normalizeSource('saga_episode', 'global-sagas', document('global-sagas', 's1-e5', saga.fields), 'pt-BR', now)?.canonicalUrl, 'https://raquelsynths.com/hybrid-reader/s1-e5');
assert.equal(normalizeSource('saga_episode', 'lore-jonah', document('lore-jonah', 's1-e5', { ...saga.fields, published: bool(false) }), 'pt-BR', now), null);
console.log('SAGA_SELECTION = PASS');

const release = document('discography', 'single-neon-tears', {
  title: str('Neon Tears'), type: str('Single'), faction: str('broklin'),
  cover: str('https://raquelsynths.com/neon.webp'), releaseDate: str('2026-09-01'),
  soundcloud: str('https://soundcloud.com/rqs_official/neon-tears')
});
const sourceRelease = normalizeSource('music_release', 'discography', release, 'pt-BR', now);
assert.equal(sourceRelease.canonicalUrl, 'https://raquelsynths.com/discografia');
assert.equal(sourceRelease.musicDeepLinkUrl, 'https://raquelsynths.com/play/single-neon-tears');
assert.equal(normalizeSource('music_release', 'discography', document('discography', 'future', { ...release.fields, releaseDate: str('2026-10-01') }), 'pt-BR', now), null);
assert.equal(normalizeSource('music_release', 'discography', document('discography', 'no-stream', { ...release.fields, soundcloud: str('') }), 'pt-BR', now), null);
assert.equal(normalizeSource('music_release', 'discography', document('discography', 'spotify-only', { ...release.fields, soundcloud: str(''), spotify: str('https://open.spotify.com/album/example') }), 'pt-BR', now), null);
assert.equal(normalizeSource('music_release', 'discography', document('discography', 'bad-host', { ...release.fields, soundcloud: str('https://example.com/a') }), 'pt-BR', now), null);
console.log('DISCOGRAPHY_SELECTION = PASS');

const changedSaga = document('lore-jonah', 's1-e5', {
  ...saga.fields, content: str('<p>Corpo editorial alterado.</p>')
});
const editedSource = normalizeSource('saga_episode', 'lore-jonah', changedSaga, 'pt-BR', now);
assert.notEqual(sourceSaga.sourceRevision, editedSource.sourceRevision);
const input = {
  sourceRevision: sourceSaga.sourceRevision, socialAssetUrl: sourceSaga.primaryImage,
  instagramCaption: 'Leia Jonah S1-E5', destinationUrl: sourceSaga.canonicalUrl,
  destinations: ['instagram'], socialAssetType: 'IMAGE'
};
const first = draftFromInput(input, sourceSaga);
const second = draftFromInput(input, sourceSaga);
assert.notEqual(first.id, second.id);
assert.equal(first.sourceId, second.sourceId);
assert.equal(JSON.stringify(first).includes('Corpo editorial'), false);
assert.equal(diagnose(first, sourceSaga, true).status, 'PASS');
assert.equal(diagnose(first, editedSource, true).status, 'FAIL');
assert.equal(isSourceCurrent(first, editedSource), false);
assert.equal(diagnose({ ...first, destinationUrl: 'https://go.raquelsynths.com/slug' }, sourceSaga, true).status, 'FAIL');
assert.equal(diagnose({ ...first, instagramCaption: '' }, sourceSaga, true).status, 'FAIL');
assert.equal(diagnose({ ...first, socialAssetType: 'CAROUSEL' }, sourceSaga, true).status, 'FAIL');
process.env.RQS_ADMIN_TOKEN = 'qa-only-secret-32-characters-or-more';
const token = makeDryRunToken(first);
assert.equal(verifyDryRunToken(token, first), true);
assert.equal(verifyDryRunToken(token, { ...first, instagramCaption: 'Texto editado' }), false);
assert.equal(verifyDryRunToken(`${token}tampered`, first), false);
assert.equal(canCancel('DRAFT'), true);
assert.equal(canCancel('APPROVED'), true);
assert.equal(canCancel('CANCELED'), false);
console.log('MULTIPLE_PACKAGES_PER_SOURCE = PASS');
console.log('SOURCE_REVISION_INVALIDATION = PASS');
console.log('DRY_RUN_DIAGNOSTICS = PASS');

const routes = readFileSync(new URL('../src/app/app.routes.ts', import.meta.url), 'utf8');
const admin = readFileSync(new URL('../src/app/pages/admin-shell/admin-shell.html', import.meta.url), 'utf8');
for (const route of ['admin/system-logs', 'admin/lore', 'admin/global-sagas', 'admin/stream-importer', 'admin/social-publishing']) {
  assert.ok(routes.includes(`path: '${route}'`));
}
for (const index of ['01', '02', '03', '04', '05']) assert.ok(admin.includes(`module-index">${index}`));
console.log('EXISTING_ADMIN_REGRESSION = PASS');

function fakeResponse() {
  return {
    statusCode: 200, payload: null,
    setHeader() { return this; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

const baseRequest = {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'https://raquelsynths.com' },
  body: { action: 'list-sources', sourceType: 'system_log' }
};
const withoutSession = fakeResponse();
await socialHandler(baseRequest, withoutSession);
assert.equal(withoutSession.statusCode, 401);

const sessionPayload = Buffer.from(JSON.stringify({
  version: 1, csrfToken: 'qa-csrf', nonce: 'qa',
  issuedAt: Date.now(), expiresAt: Date.now() + 60_000
})).toString('base64url');
const signature = createHmac('sha256', process.env.RQS_ADMIN_TOKEN)
  .update(`admin-session:${sessionPayload}`).digest('base64url');
const withoutCsrf = fakeResponse();
await socialHandler({ ...baseRequest, headers: {
  ...baseRequest.headers,
  cookie: `__Host-rqs_admin_session=${sessionPayload}.${signature}`
} }, withoutCsrf);
assert.equal(withoutCsrf.statusCode, 403);
console.log('EXISTING_AUTH_REUSED = PASS');

const badOrigin = fakeResponse();
await socialHandler({
  ...baseRequest,
  headers: {
    ...baseRequest.headers,
    origin: 'https://invalid.example',
    'sec-fetch-site': 'cross-site',
    cookie: `__Host-rqs_admin_session=${sessionPayload}.${signature}`,
    'x-rqs-csrf': 'qa-csrf'
  },
  body: { action: 'meta-diagnostics' }
}, badOrigin);
assert.equal(badOrigin.statusCode, 403);
console.log('META_DIAGNOSTICS_AUTH_CSRF_ORIGIN = PASS');

let unconfiguredCalls = 0;
const unconfigured = await diagnoseMetaConnection({
  env: {}, fetchImpl: async () => { unconfiguredCalls += 1; throw new Error('UNEXPECTED_META_CALL'); }
});
assert.equal(unconfigured.graphApiVersion, 'v26.0');
assert.equal(unconfigured.facebook.status, 'NOT_CONFIGURED');
assert.equal(unconfigured.instagram.status, 'NOT_CONFIGURED');
assert.equal(unconfigured.publishingEnabled, false);
assert.equal(unconfiguredCalls, 0);

const metaEnv = {
  META_APP_ID: '1234567890',
  META_APP_SECRET: 'qa-meta-app-secret-never-log',
  META_FACEBOOK_PAGE_ID: '2222222222',
  META_FACEBOOK_PAGE_ACCESS_TOKEN: 'qa-page-token-never-log',
  META_IG_USER_ID: '3333333333'
};
const expectedScopes = [
  'pages_show_list', 'pages_manage_engagement', 'pages_manage_posts',
  'pages_read_engagement', 'pages_read_user_engagement', 'publish_video',
  'instagram_basic', 'instagram_content_publish'
];
const metaCalls = [];
const fakeMetaFetch = async (url, options) => {
  metaCalls.push({ url: String(url), method: options.method, authorization: options.headers.Authorization });
  let payload;
  if (url.pathname.endsWith('/debug_token')) payload = { data: { is_valid: true, app_id: metaEnv.META_APP_ID, scopes: expectedScopes } };
  else if (url.pathname.endsWith('/me/accounts')) payload = { data: [{
    id: metaEnv.META_FACEBOOK_PAGE_ID, name: 'RQS Page', tasks: ['CREATE_CONTENT', 'MANAGE'],
    instagram_business_account: { id: metaEnv.META_IG_USER_ID }
  }] };
  else payload = { id: metaEnv.META_IG_USER_ID, username: 'rqs_synths' };
  return { ok: true, status: 200, json: async () => payload };
};
const connected = await diagnoseMetaConnection({ env: metaEnv, fetchImpl: fakeMetaFetch });
assert.equal(META_GRAPH_API_VERSION, 'v26.0');
assert.equal(connected.facebook.status, 'READY');
assert.equal(connected.instagram.status, 'READY');
assert.equal(connected.relationship.status, 'MATCH');
assert.equal(connected.instagram.capabilities.stories, false);
assert.equal(connected.publishingEnabled, false);
assert.equal(metaCalls.length, 3);
assert.ok(metaCalls.every(call => call.method === 'GET'));
assert.ok(metaCalls[1].url.includes('/me/accounts'));
assert.ok(metaCalls[1].url.includes('fields=id%2Cname%2Ctasks%2Cinstagram_business_account'));
assert.ok(metaCalls[2].url.includes('fields=id%2Cusername'));
assert.equal(metaCalls[2].url.includes('account_type'), false);

const failed = await diagnoseMetaConnection({
  env: metaEnv,
  fetchImpl: async (url, options) => {
    if (!url.pathname.endsWith(`/${metaEnv.META_IG_USER_ID}`)) return fakeMetaFetch(url, options);
    return {
      ok: false, status: 400,
      json: async () => ({ error: {
        code: 100, error_subcode: 33,
        message: `Never expose ${metaEnv.META_FACEBOOK_PAGE_ACCESS_TOKEN}`
      } })
    };
  }
});
assert.equal(failed.facebook.status, 'READY');
assert.equal(failed.instagram.status, 'ERROR');
assert.equal(failed.instagram.checks.at(-1).diagnostic.requestPurpose, 'INSTAGRAM_IDENTITY');
assert.equal(failed.instagram.checks.at(-1).diagnostic.httpStatus, 400);
assert.equal(failed.instagram.checks.at(-1).diagnostic.graphErrorCode, 100);
assert.equal(failed.instagram.checks.at(-1).diagnostic.graphErrorSubcode, 33);
assert.equal(failed.instagram.checks.at(-1).diagnostic.category, 'INVALID_REQUEST');
assert.equal(JSON.stringify(failed).includes(metaEnv.META_FACEBOOK_PAGE_ACCESS_TOKEN), false);
assert.equal(JSON.stringify(failed).includes('Never expose'), false);

const failedPageDiscovery = await diagnoseMetaConnection({
  env: metaEnv,
  fetchImpl: async (url, options) => {
    if (!url.pathname.endsWith('/me/accounts')) return fakeMetaFetch(url, options);
    return {
      ok: false, status: 403,
      json: async () => ({ error: { code: 200, error_subcode: 2994021, message: 'Never expose raw Graph messages' } })
    };
  }
});
for (const platform of [failedPageDiscovery.facebook, failedPageDiscovery.instagram]) {
  assert.equal(platform.status, 'ERROR');
  assert.equal(platform.checks.at(-1).diagnostic.requestPurpose, 'PAGE_DISCOVERY');
  assert.equal(platform.checks.at(-1).diagnostic.httpStatus, 403);
  assert.equal(platform.checks.at(-1).diagnostic.graphErrorCode, 200);
  assert.equal(platform.checks.at(-1).diagnostic.graphErrorSubcode, 2994021);
  assert.equal(platform.checks.at(-1).diagnostic.category, 'PERMISSION');
}
assert.equal(JSON.stringify(failedPageDiscovery).includes('Never expose raw Graph messages'), false);
console.log('META_CLIENT_DIAGNOSTICS = PASS');
console.log('META_SECRET_REDACTION = PASS');

const deliveryInstagram = createDeliveryFoundation('package-123', 'instagram');
const deliveryFacebook = createDeliveryFoundation('package-123', 'facebook');
assert.equal(deliveryDocumentPath('package-123', 'instagram'), 'social-packages/package-123/deliveries/instagram');
assert.notEqual(deliveryInstagram.idempotencyKey, deliveryFacebook.idempotencyKey);
assert.equal(deliveryInstagram.idempotencyKey, deliveryIdempotencyKey('package-123', 'instagram'));
assert.equal(deliveryDecision(deliveryInstagram), 'READY');
assert.equal(assertDeliveryCanStart(deliveryInstagram), true);
assert.equal(deliveryDecision({ ...deliveryInstagram, remotePostId: 'remote-post' }), 'ALREADY_PUBLISHED');
assert.throws(() => assertDeliveryCanStart({ ...deliveryInstagram, remotePostId: 'remote-post' }), /DELIVERY_ALREADY_PUBLISHED/);
assert.equal(deliveryDecision({ ...deliveryInstagram, remoteContainerId: 'remote-container' }), 'RECONCILE_REQUIRED');
assert.equal(deliveryDecision({ ...deliveryInstagram, status: 'FAILED', attemptCount: 1 }), 'MANUAL_REVIEW_REQUIRED');
assert.equal(JSON.stringify(createDeliveryFoundation('package-123', 'instagram')).includes('qa-page-token'), false);
console.log('DELIVERY_IDEMPOTENCY_FOUNDATION = PASS');

const metaClientSource = readFileSync(new URL('../lib/social/meta-client.js', import.meta.url), 'utf8');
const deliverySource = readFileSync(new URL('../lib/social/deliveries.js', import.meta.url), 'utf8');
const frontendSource = [
  '../src/app/models/social-publishing.model.ts',
  '../src/app/pages/social-publishing-admin/social-publishing-admin.ts',
  '../src/app/pages/social-publishing-admin/social-publishing-admin.html'
].map(path => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');
assert.equal(metaClientSource.includes("method: 'POST'"), false);
assert.equal(metaClientSource.includes('media_publish'), false);
assert.equal(metaClientSource.includes('video_reels'), false);
assert.equal(frontendSource.includes('process.env'), false);
assert.equal(deliverySource.includes('fetch('), false);
console.log('NO_META_PUBLISHING_SURFACE = PASS');
console.log('CLIENT_SECRET_EXPOSURE = PASS');
console.log('FIRESTORE_SECRET_EXPOSURE = PASS');
