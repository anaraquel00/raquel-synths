import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { normalizeSource } from '../lib/social/source-adapters.js';
import { canCancel, diagnose, draftFromInput, isSourceCurrent, makeDryRunToken, verifyDryRunToken } from '../lib/social/packages.js';
import { assertDeliveryCanStart, createDeliveryFoundation, deliveryDecision, deliveryDocumentPath, deliveryIdempotencyKey } from '../lib/social/deliveries.js';
import { diagnoseMetaConnection, META_GRAPH_API_VERSION } from '../lib/social/meta-client.js';
import { evaluateInstagramPilot, publishInstagramPilot } from '../lib/social/publish-instagram.js';
import { instagramPilotWriteGate, instagramPilotWriteGateDiagnostics } from '../lib/social/write-gates.js';
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
assert.deepEqual(unconfigured.writeGate, {
  flagEnabled: false, previewEnvironment: false, branchMatch: false, enabled: false
});
assert.equal(unconfiguredCalls, 0);

const metaEnv = {
  META_APP_ID: '1234567890',
  META_APP_SECRET: 'qa-meta-app-secret-never-log',
  META_FACEBOOK_PAGE_ID: '2222222222',
  META_FACEBOOK_PAGE_ACCESS_TOKEN: 'qa-page-token-never-log',
  META_IG_USER_ID: '3333333333'
};
const expectedScopes = [
  'pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'publish_video',
  'instagram_basic', 'instagram_content_publish'
];
const metaCalls = [];
const fakeMetaFetch = async (url, options) => {
  metaCalls.push({ url: String(url), method: options.method, authorization: options.headers.Authorization });
  let payload;
  if (url.pathname.endsWith('/debug_token')) payload = { data: { is_valid: true, app_id: metaEnv.META_APP_ID, scopes: expectedScopes } };
  else if (url.pathname.endsWith(`/${metaEnv.META_FACEBOOK_PAGE_ID}`)) payload = {
    id: metaEnv.META_FACEBOOK_PAGE_ID, name: 'RQS Page',
    instagram_business_account: { id: metaEnv.META_IG_USER_ID }
  };
  else payload = { id: metaEnv.META_IG_USER_ID, username: 'rqs_synths' };
  return { ok: true, status: 200, json: async () => payload };
};
const connected = await diagnoseMetaConnection({ env: metaEnv, fetchImpl: fakeMetaFetch });
assert.equal(META_GRAPH_API_VERSION, 'v26.0');
assert.equal(connected.facebook.status, 'READY');
assert.equal(connected.instagram.status, 'READY');
assert.equal(connected.relationship.status, 'MATCH');
assert.equal(connected.facebook.identity.id, metaEnv.META_FACEBOOK_PAGE_ID);
assert.equal(connected.instagram.identity.id, metaEnv.META_IG_USER_ID);
assert.equal(connected.instagram.identity.username, 'rqs_synths');
assert.equal(connected.instagram.capabilities.stories, false);
assert.equal(connected.publishingEnabled, false);
assert.equal(metaCalls.length, 3);
assert.ok(metaCalls.every(call => call.method === 'GET'));
assert.ok(metaCalls[1].url.includes(`/${metaEnv.META_FACEBOOK_PAGE_ID}`));
assert.ok(metaCalls[1].url.includes('fields=id%2Cname%2Cinstagram_business_account'));
assert.equal(metaCalls[1].url.includes('/me/accounts'), false);
assert.equal(metaCalls[1].url.includes('tasks'), false);
assert.ok(metaCalls[2].url.includes('fields=id%2Cusername'));
assert.equal(metaCalls[2].url.includes('account_type'), false);

const enabledWriteEnv = {
  ...metaEnv,
  SOCIAL_PUBLISHING_WRITES_ENABLED: 'true',
  VERCEL_ENV: 'preview',
  VERCEL_GIT_COMMIT_REF: 'feat/social-publishing-phase-1d-instagram-pilot'
};
let gateMetaCalls = 0;
const connectedWithWriteGate = await diagnoseMetaConnection({
  env: enabledWriteEnv,
  fetchImpl: async (...args) => {
    gateMetaCalls += 1;
    return fakeMetaFetch(...args);
  }
});
assert.equal(connectedWithWriteGate.publishingEnabled, true);
assert.deepEqual(connectedWithWriteGate.writeGate, {
  flagEnabled: true, previewEnvironment: true, branchMatch: true, enabled: true
});
assert.equal(gateMetaCalls, 3);
assert.equal(JSON.stringify(connectedWithWriteGate.writeGate).includes(enabledWriteEnv.VERCEL_GIT_COMMIT_REF), false);

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

const failedPageIdentity = await diagnoseMetaConnection({
  env: metaEnv,
  fetchImpl: async (url, options) => {
    if (!url.pathname.endsWith(`/${metaEnv.META_FACEBOOK_PAGE_ID}`)) return fakeMetaFetch(url, options);
    return {
      ok: false, status: 403,
      json: async () => ({ error: { code: 200, error_subcode: 2994021, message: 'Never expose raw Graph messages' } })
    };
  }
});
for (const platform of [failedPageIdentity.facebook, failedPageIdentity.instagram]) {
  assert.equal(platform.status, 'ERROR');
  assert.equal(platform.checks.at(-1).diagnostic.requestPurpose, 'PAGE_IDENTITY');
  assert.equal(platform.checks.at(-1).diagnostic.httpStatus, 403);
  assert.equal(platform.checks.at(-1).diagnostic.graphErrorCode, 200);
  assert.equal(platform.checks.at(-1).diagnostic.graphErrorSubcode, 2994021);
  assert.equal(platform.checks.at(-1).diagnostic.category, 'PERMISSION');
}
assert.equal(JSON.stringify(failedPageIdentity).includes('Never expose raw Graph messages'), false);
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

const pilotSource = {
  ...sourceRelease,
  sourceId: 'discography/ep-the-blueprint-sessions-v022',
  sourceUrl: 'https://raquelsynths.com/discografia',
  title: 'THE BLUEPRINT SESSIONS Vol.022',
  primaryImage: 'https://i1.sndcdn.com/artworks-zGhtyO5DravOFJdc-paN8Cw-t500x500.jpg',
  musicDeepLinkUrl: 'https://raquelsynths.com/play/ep-the-blueprint-sessions-v022',
  sourceRevision: 'qa-current-source-revision'
};
const pilotPackage = {
  id: 'pilot-blueprint-v022',
  sourceType: 'music_release',
  sourceId: pilotSource.sourceId,
  sourceUrl: pilotSource.sourceUrl,
  sourceRevision: pilotSource.sourceRevision,
  language: 'pt-BR',
  socialAssetUrl: pilotSource.primaryImage,
  socialAssetType: 'IMAGE',
  instagramCaption: 'THE BLUEPRINT SESSIONS Vol.022',
  facebookCaption: '',
  cta: 'Ouça agora',
  destinationUrl: pilotSource.musicDeepLinkUrl,
  utmCampaign: 'blueprint_v022',
  utmContent: 'instagram_image',
  destinations: ['instagram'],
  createdAt: '2026-09-23T10:00:00.000Z',
  approvedAt: '2026-09-23T11:00:00.000Z',
  status: 'APPROVED',
  updateTime: '2026-09-23T11:00:00.000000Z'
};
const readyMeta = connected;
const pilotEnv = enabledWriteEnv;

function failedPilotChecks(packageValue, source = pilotSource, meta = readyMeta, delivery = null) {
  return evaluateInstagramPilot(packageValue, source, meta, delivery).checks
    .filter(item => item.status === 'FAIL')
    .map(item => item.code);
}

assert.equal(evaluateInstagramPilot(pilotPackage, pilotSource, readyMeta, null).status, 'PASS');
assert.ok(failedPilotChecks({ ...pilotPackage, sourceId: 'discography/another-release' }).includes('PILOT_SOURCE'));
assert.ok(failedPilotChecks({ ...pilotPackage, status: 'DRAFT' }).includes('PACKAGE_APPROVED'));
assert.ok(failedPilotChecks({ ...pilotPackage, status: 'CANCELED' }).includes('PACKAGE_APPROVED'));
assert.ok(failedPilotChecks({ ...pilotPackage, socialAssetType: 'REEL' }).includes('IMAGE_ONLY'));
assert.ok(failedPilotChecks({ ...pilotPackage, destinations: ['facebook'] }).includes('INSTAGRAM_ONLY'));
assert.ok(failedPilotChecks(pilotPackage, { ...pilotSource, sourceRevision: 'changed' }).includes('SOURCE_CURRENT'));
assert.ok(failedPilotChecks({ ...pilotPackage, socialAssetUrl: '' }).includes('ASSET_URL'));
assert.ok(failedPilotChecks(pilotPackage, pilotSource, readyMeta, {
  ...createDeliveryFoundation(pilotPackage.id, 'instagram'), remotePostId: '4444444444'
}).includes('DELIVERY_READY'));
assert.ok(failedPilotChecks(pilotPackage, pilotSource, readyMeta, {
  ...createDeliveryFoundation(pilotPackage.id, 'instagram'), remoteContainerId: '5555555555'
}).includes('DELIVERY_READY'));
assert.equal(instagramPilotWriteGate({ ...pilotEnv, SOCIAL_PUBLISHING_WRITES_ENABLED: 'false' }), false);
assert.equal(instagramPilotWriteGate({ ...pilotEnv, VERCEL_ENV: 'production' }), false);
assert.equal(instagramPilotWriteGate({ ...pilotEnv, VERCEL_GIT_COMMIT_REF: 'master' }), false);
assert.equal(instagramPilotWriteGate(pilotEnv), true);
assert.deepEqual(instagramPilotWriteGateDiagnostics(pilotEnv), connectedWithWriteGate.writeGate);
console.log('INSTAGRAM_PILOT_ELIGIBILITY = PASS');

function makePilotRepository({ packageValue = pilotPackage, source = pilotSource, delivery = null } = {}) {
  let currentPackage = { ...packageValue };
  let currentDelivery = delivery ? { ...delivery } : null;
  let revision = 0;
  const events = [];
  return {
    events,
    snapshot() { return { package: currentPackage, delivery: currentDelivery }; },
    async getPackage() { return currentPackage; },
    async resolveSource() { return source; },
    async getDelivery() { return currentDelivery; },
    async transitionPackagePublication(existing, status, fields = {}) {
      events.push({ type: 'package', from: existing.status, to: status });
      currentPackage = { ...existing, ...fields, status, updateTime: `package-${++revision}` };
      return currentPackage;
    },
    async claimDelivery(packageId, destination) {
      assert.equal(currentDelivery, null);
      currentDelivery = {
        ...createDeliveryFoundation(packageId, destination),
        status: 'PENDING', attemptCount: 1, packageId, destination,
        updateTime: `delivery-${++revision}`
      };
      events.push({ type: 'delivery', to: 'PENDING' });
      return currentDelivery;
    },
    async updateDelivery(existing, fields) {
      currentDelivery = { ...existing, ...fields, updateTime: `delivery-${++revision}` };
      events.push({ type: 'delivery', to: currentDelivery.status });
      return currentDelivery;
    }
  };
}

const writeGateRepository = makePilotRepository();
await assert.rejects(
  publishInstagramPilot(pilotPackage.id, {
    env: { ...pilotEnv, SOCIAL_PUBLISHING_WRITES_ENABLED: 'false' },
    repository: writeGateRepository,
    diagnoseMeta: async () => readyMeta,
    fetchImpl: async () => { throw new Error('UNEXPECTED_META_WRITE'); }
  }),
  error => error.code === 'SOCIAL_WRITES_DISABLED' && error.status === 403
);
assert.equal(writeGateRepository.events.length, 0);

const previousWriteGate = process.env.SOCIAL_PUBLISHING_WRITES_ENABLED;
process.env.SOCIAL_PUBLISHING_WRITES_ENABLED = 'false';
const disabledPublishResponse = fakeResponse();
await socialHandler({
  ...baseRequest,
  headers: {
    ...baseRequest.headers,
    cookie: `__Host-rqs_admin_session=${sessionPayload}.${signature}`,
    'x-rqs-csrf': 'qa-csrf'
  },
  body: { action: 'publish-instagram-now', id: pilotPackage.id }
}, disabledPublishResponse);
if (previousWriteGate === undefined) delete process.env.SOCIAL_PUBLISHING_WRITES_ENABLED;
else process.env.SOCIAL_PUBLISHING_WRITES_ENABLED = previousWriteGate;
assert.equal(disabledPublishResponse.statusCode, 403);
assert.equal(disabledPublishResponse.payload.code, 'SOCIAL_WRITES_DISABLED');

const successfulRepository = makePilotRepository();
const publishCalls = [];
const successfulPublish = await publishInstagramPilot(pilotPackage.id, {
  env: pilotEnv,
  repository: successfulRepository,
  diagnoseMeta: async () => readyMeta,
  now: () => new Date('2026-09-23T12:34:56.000Z'),
  fetchImpl: async (url, options) => {
    publishCalls.push({ url: String(url), options });
    const id = String(url).endsWith('/media_publish') ? '777777777777777' : '666666666666666';
    return { ok: true, status: 200, json: async () => ({ id }) };
  }
});
assert.equal(publishCalls.length, 2);
assert.ok(publishCalls[0].url.endsWith(`/${META_GRAPH_API_VERSION}/${metaEnv.META_IG_USER_ID}/media`));
assert.ok(publishCalls[1].url.endsWith(`/${META_GRAPH_API_VERSION}/${metaEnv.META_IG_USER_ID}/media_publish`));
assert.equal(publishCalls.every(call => call.options.method === 'POST'), true);
assert.equal(publishCalls.every(call => !call.url.includes(metaEnv.META_FACEBOOK_PAGE_ACCESS_TOKEN)), true);
assert.equal(publishCalls.every(call => call.options.headers.Authorization === `Bearer ${metaEnv.META_FACEBOOK_PAGE_ACCESS_TOKEN}`), true);
assert.equal(publishCalls[0].options.body.get('image_url'), pilotPackage.socialAssetUrl);
assert.equal(publishCalls[0].options.body.get('caption'), pilotPackage.instagramCaption);
assert.equal(publishCalls[1].options.body.get('creation_id'), '666666666666666');
assert.equal(successfulPublish.package.status, 'PUBLISHED');
assert.equal(successfulPublish.delivery.status, 'PUBLISHED');
assert.equal(successfulPublish.delivery.remoteContainerId, '666666666666666');
assert.equal(successfulPublish.delivery.remotePostId, '777777777777777');
assert.equal(successfulPublish.delivery.publishedAt, '2026-09-23T12:34:56.000Z');
assert.deepEqual(successfulRepository.events.map(event => event.to), [
  'PUBLISHING', 'PENDING', 'CONTAINER_CREATED', 'PUBLISHED', 'PUBLISHED'
]);
console.log('INSTAGRAM_PILOT_SUCCESS_PERSISTENCE = PASS');

const failingRepository = makePilotRepository();
let sanitizedPublishError;
try {
  await publishInstagramPilot(pilotPackage.id, {
    env: pilotEnv,
    repository: failingRepository,
    diagnoseMeta: async () => readyMeta,
    fetchImpl: async () => ({
      ok: false, status: 400,
      json: async () => ({ error: {
        code: 100, error_subcode: 2207009,
        message: `Never expose ${metaEnv.META_FACEBOOK_PAGE_ACCESS_TOKEN}`
      } })
    })
  });
} catch (error) {
  sanitizedPublishError = error;
}
assert.equal(sanitizedPublishError.code, 'INSTAGRAM_CREATE_IMAGE_CONTAINER_INVALID_REQUEST');
assert.equal(sanitizedPublishError.metaDiagnostic.requestPurpose, 'CREATE_IMAGE_CONTAINER');
assert.equal(sanitizedPublishError.metaDiagnostic.httpStatus, 400);
assert.equal(sanitizedPublishError.metaDiagnostic.graphErrorCode, 100);
assert.equal(sanitizedPublishError.metaDiagnostic.graphErrorSubcode, 2207009);
assert.equal(JSON.stringify(sanitizedPublishError).includes(metaEnv.META_FACEBOOK_PAGE_ACCESS_TOKEN), false);
assert.equal(JSON.stringify(sanitizedPublishError).includes('Never expose'), false);
assert.equal(failingRepository.snapshot().package.status, 'FAILED');
assert.equal(failingRepository.snapshot().delivery.status, 'FAILED');
assert.equal(failingRepository.snapshot().delivery.attemptCount, 1);
assert.equal(failingRepository.snapshot().delivery.lastError, 'INSTAGRAM_CREATE_IMAGE_CONTAINER_INVALID_REQUEST');
assert.deepEqual(failingRepository.events.map(event => event.to), ['PUBLISHING', 'PENDING', 'FAILED', 'FAILED']);

const reconciliationRepository = makePilotRepository();
let mediaPublishCalls = 0;
await assert.rejects(
  publishInstagramPilot(pilotPackage.id, {
    env: pilotEnv,
    repository: reconciliationRepository,
    diagnoseMeta: async () => readyMeta,
    fetchImpl: async () => {
      mediaPublishCalls += 1;
      if (mediaPublishCalls === 1) {
        return { ok: true, status: 200, json: async () => ({ id: '888888888888888' }) };
      }
      return {
        ok: false, status: 500,
        json: async () => ({ error: { code: 2, message: 'Transient but no automatic retry' } })
      };
    }
  }),
  error => error.code === 'INSTAGRAM_PUBLISH_IMAGE_CONTAINER_META_SERVICE'
);
assert.equal(mediaPublishCalls, 2);
assert.equal(reconciliationRepository.snapshot().package.status, 'FAILED');
assert.equal(reconciliationRepository.snapshot().delivery.status, 'FAILED');
assert.equal(reconciliationRepository.snapshot().delivery.remoteContainerId, '888888888888888');
assert.equal(reconciliationRepository.snapshot().delivery.remotePostId, null);
assert.equal(deliveryDecision(reconciliationRepository.snapshot().delivery), 'RECONCILE_REQUIRED');
console.log('INSTAGRAM_PILOT_FAILURE_NO_RETRY = PASS');

const metaClientSource = readFileSync(new URL('../lib/social/meta-client.js', import.meta.url), 'utf8');
const deliverySource = readFileSync(new URL('../lib/social/deliveries.js', import.meta.url), 'utf8');
const instagramPublisherSource = readFileSync(new URL('../lib/social/instagram-publisher.js', import.meta.url), 'utf8');
const instagramPilotSource = readFileSync(new URL('../lib/social/publish-instagram.js', import.meta.url), 'utf8');
const writeGateSource = readFileSync(new URL('../lib/social/write-gates.js', import.meta.url), 'utf8');
const frontendSource = [
  '../src/app/models/social-publishing.model.ts',
  '../src/app/pages/social-publishing-admin/social-publishing-admin.ts',
  '../src/app/pages/social-publishing-admin/social-publishing-admin.html'
].map(path => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');
assert.equal(metaClientSource.includes("method: 'POST'"), false);
assert.equal(metaClientSource.includes('media_publish'), false);
assert.equal(metaClientSource.includes('video_reels'), false);
assert.ok(instagramPublisherSource.includes("method: 'POST'"));
assert.ok(instagramPublisherSource.includes('/media_publish'));
assert.ok(instagramPublisherSource.includes("graphPost('CREATE_IMAGE_CONTAINER'"));
assert.equal(instagramPublisherSource.includes('access_token'), false);
assert.equal(instagramPublisherSource.includes('console.'), false);
assert.ok(writeGateSource.includes("SOCIAL_PUBLISHING_WRITES_ENABLED === 'true'"));
assert.ok(writeGateSource.includes("VERCEL_ENV === 'preview'"));
assert.ok(writeGateSource.includes('VERCEL_GIT_COMMIT_REF === INSTAGRAM_PILOT_BRANCH'));
assert.ok(instagramPilotSource.includes("from './write-gates.js'"));
assert.ok(metaClientSource.includes("from './write-gates.js'"));
assert.equal(instagramPilotSource.includes('SOCIAL_PUBLISHING_WRITES_ENABLED'), false);
assert.equal(instagramPilotSource.includes('setTimeout'), false);
assert.equal(frontendSource.includes('process.env'), false);
assert.equal(deliverySource.includes('fetch('), false);
console.log('INSTAGRAM_PILOT_SCOPE_GUARD = PASS');
console.log('CLIENT_SECRET_EXPOSURE = PASS');
console.log('FIRESTORE_SECRET_EXPOSURE = PASS');
console.log('META_WRITE_CALLS = 0');
console.log('INSTAGRAM_POSTS_CREATED = 0');
