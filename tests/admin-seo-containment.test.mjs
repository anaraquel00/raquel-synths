import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = readFileSync(
  new URL('../src/app/app.routes.ts', import.meta.url),
  'utf8'
);

const vercel = readFileSync(
  new URL('../vercel.json', import.meta.url),
  'utf8'
);

const sitemap = readFileSync(
  new URL('../api/sitemap.js', import.meta.url),
  'utf8'
);

const adminPaths = [
  'admin',
  'admin/radio',
  'admin/social-publishing',
  'admin/system-logs',
  'admin/lore',
  'admin/lore/broklin',
  'admin/lore/jonah',
  'admin/global-sagas'
];

test('all admin routes declare noindex nofollow noarchive', () => {
  for (const path of adminPaths) {
    const start = routes.indexOf(`path: '${path}'`);

    assert.notEqual(
      start,
      -1,
      `missing route ${path}`
    );

    const next = routes.indexOf(
      "\n  {\n    path:",
      start + 1
    );

    const block = routes.slice(
      start,
      next === -1 ? routes.length : next
    );

    assert.match(
      block,
      /robots:\s*'noindex, nofollow, noarchive'/,
      `${path} must be noindex`
    );
  }
});

test('vercel sends X-Robots-Tag for the admin namespace', () => {
  assert.match(
    vercel,
    /"source": "\/admin\/:path\*"/
  );

  assert.match(
    vercel,
    /"value": "noindex, nofollow, noarchive"/
  );
});

test('dynamic sitemap never publishes admin routes', () => {
  assert.equal(
    sitemap.includes("path: '/admin"),
    false
  );

  assert.equal(
    sitemap.includes('`/admin'),
    false
  );
});
