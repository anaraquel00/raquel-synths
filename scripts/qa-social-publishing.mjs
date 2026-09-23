import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { normalizeSource } from '../lib/social/source-adapters.js';
import { canCancel, diagnose, draftFromInput, isSourceCurrent, makeDryRunToken, verifyDryRunToken } from '../lib/social/packages.js';
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
