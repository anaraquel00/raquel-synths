import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const template = readFileSync(
  new URL('../src/app/pages/logs-archive/logs-archive.html', import.meta.url),
  'utf8'
);

const component = readFileSync(
  new URL('../src/app/pages/logs-archive/logs-archive.ts', import.meta.url),
  'utf8'
);

const routes = readFileSync(
  new URL('../src/app/app.routes.ts', import.meta.url),
  'utf8'
);

test('archive exposes crawlable log and pagination anchors', () => {
  assert.match(
    template,
    /<a[\s\S]*?\[routerLink\]="\['\/log-reader', log\.id\]"/
  );
  assert.match(
    template,
    /<a[\s\S]*?\[routerLink\]="\['\/logs-archive'\]"[\s\S]*?previousQueryParams/
  );
  assert.match(
    template,
    /<a[\s\S]*?\[routerLink\]="\['\/logs-archive'\]"[\s\S]*?nextQueryParams/
  );
});

test('archive owns paginated SEO so global route metadata cannot strip page query', () => {
  const routeBlock = routes.match(
    /path:\s*'logs-archive'[\s\S]*?\n\s*\},/
  )?.[0] ?? '';

  assert.equal(routeBlock.includes('seo:'), false);
  assert.match(component, /buildLogsArchiveCanonical/);
  assert.match(component, /updateMetaTags\(\{/);
});

test('archive no longer contains a fixed four-log omission', () => {
  assert.equal(component.includes('slice(4)'), false);
});
