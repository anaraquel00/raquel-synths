import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import sitemapHandler from '../api/sitemap.js';

const documentName = (collection, id) =>
  `projects/raquel-synths-platform/databases/(default)/documents/${collection}/${id}`;

const publicEpisode = (collection, id, updateTime) => ({
  name: documentName(collection, id),
  updateTime,
  fields: {
    published: { booleanValue: true },
    releaseDate: { stringValue: '2026-09-01' }
  }
});

const substantiveLog = (id, updateTime, overrides = {}) => ({
  name: documentName('logs', id),
  updateTime,
  fields: {
    published: { booleanValue: true },
    date: { stringValue: '2026-09-01' },
    pt: {
      mapValue: {
        fields: {
          title: { stringValue: 'Log público' },
          description: { stringValue: 'Conteúdo editorial.' }
        }
      }
    },
    ...overrides
  }
});

const collections = {
  lore: [
    publicEpisode('lore', 'broklin-publico', '2026-09-18T11:30:00Z'),
    {
      ...publicEpisode('lore', 'broklin-futuro', '2026-09-18T11:30:00Z'),
      fields: { published: { booleanValue: true }, releaseDate: { stringValue: '2999-01-01' } }
    },
    {
      ...publicEpisode('lore', 'broklin-nao-publicado', '2026-09-18T11:30:00Z'),
      fields: { published: { booleanValue: false }, releaseDate: { stringValue: '2026-09-01' } }
    }
  ],
  'lore-jonah': [publicEpisode('lore-jonah', 'jonah-publico', '2026-09-17T08:00:00Z')],
  'global-sagas': [publicEpisode('global-sagas', 'hybrid-publico', '2026-09-16T09:00:00Z')],
  logs: [
    substantiveLog('log-publico', '2026-09-15T10:00:00Z'),
    substantiveLog('system-archive', '2026-09-20T10:00:00Z'),
    substantiveLog('log-futuro', '2026-09-15T10:00:00Z', { date: { stringValue: '2999-01-01' } }),
    substantiveLog('log-nao-publicado', '2026-09-15T10:00:00Z', { published: { booleanValue: false } })
  ]
};

const renderSitemap = async () => {
  const originalFetch = globalThis.fetch;
  let statusCode;
  let body;
  const headers = new Map();
  globalThis.fetch = async (url) => {
    const collection = new URL(url).pathname.split('/').pop();
    return { ok: true, json: async () => ({ documents: collections[collection] ?? [] }) };
  };
  const response = {
    setHeader: (name, value) => headers.set(name.toLowerCase(), value),
    status: (value) => { statusCode = value; return response; },
    send: (value) => { body = value; return response; }
  };
  try {
    await sitemapHandler({}, response);
  } finally {
    globalThis.fetch = originalFetch;
  }
  return { body, headers, statusCode };
};

const parseEntries = (xml) => [...xml.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/g)].map((match) => {
  const block = match[1];
  return {
    loc: block.match(/<loc>([^<]+)<\/loc>/)?.[1],
    lastmod: block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]
  };
});

test('gera XML válido, URLs únicas e exclui rotas/conteúdo não indexáveis', async () => {
  const { body, headers, statusCode } = await renderSitemap();
  const entries = parseEntries(body);
  const locs = entries.map(({ loc }) => loc);
  const xmlValidation = spawnSync(
    'python3',
    ['-c', 'import sys, xml.etree.ElementTree as ET; ET.fromstring(sys.stdin.read())'],
    { input: body, encoding: 'utf8' }
  );
  assert.equal(statusCode, 200);
  assert.equal(xmlValidation.status, 0, xmlValidation.stderr);
  assert.equal(new Set(locs).size, locs.length);
  assert.ok(locs.every((loc) => !new URL(loc).search && !new URL(loc).hash));
  assert.ok(locs.every((loc) => !loc.includes('/admin') && !loc.includes('/diagnostic')));
  assert.ok(locs.every((loc) => !loc.includes('/log-reader/system-archive')));
  assert.ok(locs.every((loc) => !loc.includes('futuro') && !loc.includes('nao-publicado')));
  assert.equal(headers.get('cache-control'), 'public, max-age=300, s-maxage=3600, stale-while-revalidate=300');
});

test('emite lastmod estático somente para mudanças comprovadas', async () => {
  const first = await renderSitemap();
  const second = await renderSitemap();
  const entries = parseEntries(first.body);
  const byLoc = new Map(entries.map((entry) => [entry.loc, entry]));
  const staticLastmods = entries.filter(({ loc, lastmod }) =>
    lastmod && !loc.includes('/lore/') && !loc.includes('/hybrid-reader/') && !loc.includes('/log-reader/')
  );
  assert.equal(first.body, second.body);
  assert.deepEqual(staticLastmods, [
    { loc: 'https://raquelsynths.com', lastmod: '2026-09-19' },
    { loc: 'https://raquelsynths.com/compliance', lastmod: '2026-09-19' }
  ]);
  assert.equal(byLoc.get('https://raquelsynths.com/discografia')?.lastmod, undefined);
  assert.ok(entries.filter(({ lastmod }) => lastmod).every(({ lastmod }) => /^\d{4}-\d{2}-\d{2}$/.test(lastmod)));
});

test('mantém Firestore updateTime autoritativo nas páginas dinâmicas', async () => {
  const { body } = await renderSitemap();
  const byLoc = new Map(parseEntries(body).map((entry) => [entry.loc, entry]));
  assert.equal(byLoc.get('https://raquelsynths.com/lore/broklin/broklin-publico')?.lastmod, '2026-09-18');
  assert.equal(byLoc.get('https://raquelsynths.com/lore/jonah/jonah-publico')?.lastmod, '2026-09-17');
  assert.equal(byLoc.get('https://raquelsynths.com/hybrid-reader/hybrid-publico')?.lastmod, '2026-09-16');
  assert.equal(byLoc.get('https://raquelsynths.com/log-reader/log-publico')?.lastmod, '2026-09-15');
});
