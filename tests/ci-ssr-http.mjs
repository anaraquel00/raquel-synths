import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer, request as httpRequest } from 'node:http';

const HOST = '127.0.0.1';
const PORT = 4000;
const BASE_URL = `http://${HOST}:${PORT}`;
const FIRESTORE_ORIGIN = 'https://firestore.googleapis.com';
const PROJECT_PATH =
  '/v1/projects/raquel-synths-platform/databases/(default)/';

const realFetch = globalThis.fetch;
let firestoreMode = 'ok';

const firestoreArchiveHits = {
  ok: 0,
  empty: 0,
  fail: 0
};

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });

const stringValue = (value) => ({ stringValue: value });
const booleanValue = (value) => ({ booleanValue: value });
const mapValue = (fields) => ({ mapValue: { fields } });

function episodeDocument(collection, id, mode) {
  const label =
    mode === 'jonah'
      ? 'Jonah'
      : mode === 'hybrid'
        ? 'Hybrid'
        : 'Broklin';

  return {
    name:
      `projects/raquel-synths-platform/databases/(default)/documents/${collection}/${id}`,
    fields: {
      id: stringValue(id),
      mode: stringValue(mode),
      title: stringValue(`CI ${label} Episode`),
      title_en: stringValue(`CI ${label} Episode`),
      description: stringValue('Fixture SSR determinística para validação de CI.'),
      description_en: stringValue('Deterministic SSR fixture for CI validation.'),
      content: stringValue('<p>CI fixture content.</p>'),
      content_en: stringValue('<p>CI fixture content.</p>'),
      releaseDate: stringValue('2026-01-01T00:00:00.000Z'),
      published: booleanValue(true)
    },
    updateTime: '2026-01-02T00:00:00.000Z'
  };
}

const episodeCollections = {
  lore: [episodeDocument('lore', 's1-e1', 'broklin')],
  'lore-jonah': [episodeDocument('lore-jonah', 's1-e1', 'jonah')],
  'global-sagas': [episodeDocument('global-sagas', 's1-e1', 'hybrid')],
  discography: []
};

const logDocuments = Array.from({ length: 44 }, (_, index) => {
  const date = new Date(
    Date.UTC(2026, 9, 31) - index * 24 * 60 * 60 * 1000
  ).toISOString();

  const id = `ci-log-${String(index + 1).padStart(2, '0')}`;

  return {
    name:
      `projects/raquel-synths-platform/databases/(default)/documents/logs/${id}`,
    fields: {
      date: stringValue(date),
      orderDate: stringValue(date),
      published: booleanValue(true),
      pt: mapValue({
        title: stringValue(`CI Log ${index + 1}`),
        description: stringValue('Descrição determinística do CI.'),
        techContent: stringValue('Conteúdo técnico determinístico do CI.')
      }),
      en: mapValue({
        title: stringValue(`CI Log ${index + 1}`),
        description: stringValue('Deterministic CI description.'),
        techContent: stringValue('Deterministic CI technical content.')
      })
    },
    updateTime: date
  };
});

function collectionDocuments(collection) {
  if (collection === 'logs') {
    return firestoreMode === 'empty' ? [] : logDocuments;
  }

  return episodeCollections[collection] ?? [];
}

async function mockFirestoreFetch(request) {
  const url = new URL(request.url);

  if (url.pathname === `${PROJECT_PATH}documents:runQuery`) {
    let payload = {};

    try {
      payload = await request.clone().json();
    } catch {
      payload = {};
    }

    const collection =
      payload?.structuredQuery?.from?.[0]?.collectionId ?? '';

    if (collection === 'logs') {
      firestoreArchiveHits[firestoreMode] += 1;

      if (firestoreMode === 'fail') {
        return jsonResponse(
          {
            error: {
              code: 503,
              message: 'CI simulated Firestore outage'
            }
          },
          503
        );
      }
    }

    return jsonResponse(
      collectionDocuments(collection).map(document => ({ document }))
    );
  }

  const marker = `${PROJECT_PATH}documents/`;

  if (!url.pathname.startsWith(marker)) {
    return jsonResponse({ documents: [] });
  }

  const suffix = decodeURIComponent(
    url.pathname.slice(marker.length)
  );
  const segments = suffix.split('/').filter(Boolean);
  const collection = segments[0] ?? '';

  if (segments.length >= 2) {
    const id = segments.slice(1).join('/');
    const document = collectionDocuments(collection).find(candidate =>
      candidate.name.endsWith(`/${collection}/${id}`)
    );

    return document
      ? jsonResponse(document)
      : jsonResponse(
          { error: { code: 404, message: 'CI fixture not found' } },
          404
        );
  }

  return jsonResponse({
    documents: collectionDocuments(collection)
  });
}

globalThis.fetch = async (input, init) => {
  const request =
    input instanceof Request
      ? new Request(input, init)
      : new Request(input, init);

  const url = new URL(request.url);

  if (url.origin === FIRESTORE_ORIGIN) {
    return mockFirestoreFetch(request);
  }

  if (
    url.protocol === 'http:' &&
    url.hostname === HOST &&
    Number(url.port || 80) === PORT
  ) {
    return realFetch(request);
  }

  throw new Error(
    `CI SSR attempted unexpected external fetch: ${url.origin}${url.pathname}`
  );
};

const { reqHandler } =
  await import('../dist/raquel-synths/server/server.mjs');

const server = createServer((req, res) => {
  const requestedMode =
    String(req.headers['x-rqs-ci-firestore-mode'] ?? 'ok');

  firestoreMode =
    requestedMode === 'fail' || requestedMode === 'empty'
      ? requestedMode
      : 'ok';

  let responseFinished = false;

  const resetFirestoreMode = () => {
    if (responseFinished) {
      return;
    }

    responseFinished = true;
    firestoreMode = 'ok';
  };

  res.once('finish', resetFirestoreMode);
  res.once('close', resetFirestoreMode);

  const handleRequestError = error => {
    console.error('[CI SSR] Unhandled request failure:', error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('CI SSR unhandled request failure');
    } else if (!res.writableEnded) {
      res.end();
    }
  };

  try {
    void Promise.resolve(reqHandler(req, res))
      .catch(handleRequestError);
  } catch (error) {
    handleRequestError(error);
  }
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(PORT, HOST, resolve);
});

async function request(path, mode = 'ok') {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        hostname: HOST,
        port: PORT,
        path,
        method: 'GET',
        headers: {
          Host: 'raquelsynths.com',
          'x-rqs-ci-firestore-mode': mode
        }
      },
      res => {
        const chunks = [];

        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const headers = new Headers();

          for (const [name, value] of Object.entries(res.headers)) {
            if (Array.isArray(value)) {
              headers.set(name, value.join(', '));
            } else if (value !== undefined) {
              headers.set(name, String(value));
            }
          }

          resolve({
            status: res.statusCode ?? 0,
            headers,
            html: Buffer.concat(chunks).toString('utf8')
          });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

function extractCanonical(html) {
  return (
    html.match(
      /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i
    )?.[1] ??
    html.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i
    )?.[1] ??
    null
  );
}

function extractRobots(html) {
  return (
    html.match(
      /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i
    )?.[1] ??
    html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']robots["'][^>]*>/i
    )?.[1] ??
    null
  );
}

function assertHtml(response, label) {
  assert.equal(
    /<html(?:\s|>)/i.test(response.html),
    true,
    `${label}: expected an HTML document`
  );
  assert.equal(
    /<title>[^<]+<\/title>/i.test(response.html),
    true,
    `${label}: expected a rendered title`
  );
}

function assertIndexable(response, label) {
  const robots = extractRobots(response.html)?.toLowerCase() ?? '';
  assert.equal(
    robots.includes('noindex'),
    false,
    `${label}: unexpectedly contains noindex (${robots})`
  );
}

function assertNoindexFollow(response, label) {
  const robots = extractRobots(response.html)?.toLowerCase() ?? '';
  assert.equal(
    robots.includes('noindex'),
    true,
    `${label}: expected noindex`
  );
  assert.equal(
    robots.includes('follow'),
    true,
    `${label}: expected follow`
  );
}

async function validateHome() {
  const home = await request('/');

  assert.equal(home.status, 200, 'home: expected HTTP 200');
  assertHtml(home, 'home');
  assert.equal(
    extractCanonical(home.html),
    'https://raquelsynths.com/',
    'home: unexpected canonical'
  );
  assertIndexable(home, 'home');
}

async function validateSagaConsolidation() {
  const routesSource = await readFile(
    new URL('../src/app/app.routes.ts', import.meta.url),
    'utf8'
  );
  const sitemapSource = await readFile(
    new URL('../api/sitemap.js', import.meta.url),
    'utf8'
  );

  const loreNoindex =
    /path:\s*'lore\/:mode\/:id'[\s\S]{0,360}robots:\s*'noindex, follow'/.test(
      routesSource
    );
  const hybridNoindex =
    /path:\s*'hybrid-reader\/:id'[\s\S]{0,300}robots:\s*'noindex, follow'/.test(
      routesSource
    );
  const previewsRemovedFromSitemap =
    !sitemapSource.includes("fetchCollection('lore')") &&
    !sitemapSource.includes("fetchCollection('lore-jonah')") &&
    !sitemapSource.includes("fetchCollection('global-sagas')");

  if (!(loreNoindex && hybridNoindex && previewsRemovedFromSitemap)) {
    return;
  }

  const previews = [
    [
      '/lore/broklin/s1-e1',
      'https://raquelsynths.com/lore/broklin/s1-e1'
    ],
    [
      '/lore/jonah/s1-e1',
      'https://raquelsynths.com/lore/jonah/s1-e1'
    ],
    [
      '/hybrid-reader/s1-e1',
      'https://raquelsynths.com/hybrid-reader/s1-e1'
    ]
  ];

  for (const [path, canonical] of previews) {
    const response = await request(path);

    assert.equal(response.status, 200, `${path}: expected HTTP 200`);
    assertHtml(response, path);
    assertNoindexFollow(response, path);
    assert.equal(
      extractCanonical(response.html),
      canonical,
      `${path}: canonical must remain individual`
    );
  }

  const seasonRoutes = [
    '/visual-novel/broklin/s1',
    '/visual-novel/broklin/s2',
    '/visual-novel/jonah/s1',
    '/visual-novel/jonah/s2'
  ];

  for (const path of seasonRoutes) {
    const response = await request(path);

    assert.equal(response.status, 200, `${path}: expected HTTP 200`);
    assertHtml(response, path);
    assertIndexable(response, path);
    assert.equal(
      extractCanonical(response.html),
      `https://raquelsynths.com${path}`,
      `${path}: unexpected canonical`
    );
  }

  for (const [path, canonical] of [
    ['/saga', 'https://raquelsynths.com/saga'],
    ['/hybrid-saga', 'https://raquelsynths.com/hybrid-saga']
  ]) {
    const response = await request(path);

    assert.equal(response.status, 200, `${path}: expected HTTP 200`);
    assertHtml(response, path);
    assertIndexable(response, path);

    if (path === '/hybrid-saga') {
      assert.equal(
        extractCanonical(response.html),
        canonical,
        `${path}: unexpected canonical`
      );
    }
  }
}

async function validateLegacyRouteRetirement() {
  const routesSource = await readFile(
    new URL('../src/app/app.routes.ts', import.meta.url),
    'utf8'
  );

  for (const legacyImport of [
    "./pages/store/store",
    "./app-discography/app-discography",
    "./pages/musical-archives/musical-archives"
  ]) {
    assert.equal(
      routesSource.includes(legacyImport),
      false,
      `legacy route still loads retired component: ${legacyImport}`
    );
  }

  const retiredRoutes = [
    '/store',
    '/store?dept=legacy',
    '/store/legacy-dept',
    '/discografia',
    '/musical-archives',
    '/musical-archives?page=2'
  ];

  for (const path of retiredRoutes) {
    const response = await request(path);

    assert.equal(
      response.status,
      410,
      `${path}: expected HTTP 410 Gone`
    );

    assertHtml(response, path);

    const robots =
      extractRobots(response.html)?.toLowerCase() ?? '';

    for (const directive of [
      'noindex',
      'nofollow',
      'noarchive'
    ]) {
      assert.equal(
        robots.includes(directive),
        true,
        `${path}: expected ${directive} (${robots})`
      );
    }

    assert.match(
      response.html,
      />410</,
      `${path}: expected visible 410 state`
    );
  }
}

async function validateLogsArchive() {
  const utilsPath = new URL(
    '../src/app/pages/logs-archive/logs-archive.utils.ts',
    import.meta.url
  );

  if (!existsSync(utilsPath)) {
    return;
  }

  const cases = [
    ['/logs-archive', 200, 'https://raquelsynths.com/logs-archive'],
    ['/logs-archive?page=1', 200, 'https://raquelsynths.com/logs-archive?page=1'],
    ['/logs-archive?page=8', 200, 'https://raquelsynths.com/logs-archive?page=8']
  ];

  for (const [path, expectedStatus, canonical] of cases) {
    const response = await request(path);

    assert.equal(
      response.status,
      expectedStatus,
      `${path}: unexpected HTTP status`
    );
    assertHtml(response, path);
    assertIndexable(response, path);
    assert.equal(
      extractCanonical(response.html),
      canonical,
      `${path}: unexpected canonical`
    );
  }

  const redirect = await request('/logs-archive?page=0');

  assert.equal(redirect.status, 308, 'page=0: expected HTTP 308');
  assert.equal(
    redirect.headers.get('location'),
    '/logs-archive',
    'page=0: unexpected redirect target'
  );

  for (const path of [
    '/logs-archive?page=999',
    '/logs-archive?page=-1',
    '/logs-archive?page=abc',
    '/logs-archive?page=1.5'
  ]) {
    const response = await request(path);
    assert.equal(response.status, 404, `${path}: expected HTTP 404`);
  }

  const emptyHitsBefore = firestoreArchiveHits.empty;
  const empty = await request('/logs-archive', 'empty');

  assert.ok(
    firestoreArchiveHits.empty > emptyHitsBefore,
    'empty archive: fixture did not reach the logs REST query in empty mode'
  );

  assert.equal(empty.status, 200, 'empty archive: expected HTTP 200');
  assert.equal(
    extractCanonical(empty.html),
    'https://raquelsynths.com/logs-archive',
    'empty archive: unexpected canonical'
  );

  const failureHitsBefore = firestoreArchiveHits.fail;
  const failure = await request('/logs-archive', 'fail');

  assert.ok(
    firestoreArchiveHits.fail > failureHitsBefore,
    'Firestore outage: fixture did not reach the logs REST query in fail mode'
  );

  assert.equal(
    failure.status,
    503,
    'Firestore outage: expected HTTP 503'
  );
}

let validationError = null;

try {
  await validateHome();
  await validateSagaConsolidation();
  await validateLogsArchive();
  await validateLegacyRouteRetirement();
} catch (error) {
  validationError = error;
  console.error('[CI SSR] Validation failed:', error);
} finally {
  globalThis.fetch = realFetch;

  await new Promise(resolve => {
    server.close(() => resolve());
  });
}

if (validationError) {
  process.exitCode = 1;
} else {
  console.log(
    'CI LOCAL SSR PASS — deterministic Firestore fixtures, no Production data access'
  );
}
