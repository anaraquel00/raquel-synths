import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import systemLogsHandler, {
  parseSystemLogDocument,
  validateTechContent
} from '../api/admin/system-logs.js';

const passingHtml = [
  '<p>text</p>',
  '<h2>heading</h2>',
  '<h3>subheading</h3>',
  '<ul><li>item</li></ul>',
  '<ol><li>first</li><li>second</li></ol>',
  '<ol><li>text<ul><li>nested item</li></ul></li></ol>'
];

for (const html of passingHtml) {
  const result = validateTechContent(html);
  assert.equal(result.content, html);
  assert.deepEqual(result.diagnostic, {
    sourceFormat: 'HTML',
    htmlValidation: 'PASS',
    allowedTagsOnly: 'PASS',
    renderableContent: 'PASS',
    publishAllowed: 'YES'
  });
}

const failingHtml = [
  '<h4>heading</h4>',
  '<div>content</div>',
  '<ol class="x"><li>item</li></ol>',
  '<h3 style="color:red">heading</h3>',
  '<script>alert(1)</script>',
  '<img src="https://example.com/image.webp">',
  '<style>body{display:none}</style>',
  '<iframe src="https://example.com"></iframe>',
  '<video src="https://example.com/video.mp4"></video>',
  '<object data="https://example.com"></object>',
  '<embed src="https://example.com">',
  '<form><input></form>',
  '<button>click</button>',
  '<svg><path></path></svg>',
  '<math><mi>x</mi></math>',
  '<span onclick="alert(1)">text</span>',
  '<p style="color:red">text</p>',
  '<ol><li>item</ol></li>',
  '<ol><li>item</li>'
];

for (const html of failingHtml) {
  assert.equal(
    validateTechContent(html).diagnostic.publishAllowed,
    'NO',
    html
  );
}

assert.equal(
  validateTechContent(
    '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">safe link</a></p>'
  ).diagnostic.publishAllowed,
  'YES'
);

for (const unsafeAnchor of [
  '<p><a href="javascript:alert(1)">link</a></p>',
  '<p><a href="https://example.com" onclick="alert(1)">link</a></p>',
  '<p><a href="https://example.com" target="_self">link</a></p>',
  '<p><a href="https://example.com" rel="nofollow">link</a></p>'
]) {
  assert.equal(
    validateTechContent(unsafeAnchor).diagnostic.publishAllowed,
    'NO',
    unsafeAnchor
  );
}

const nestedList = [
  '<h2>COLLISION REQUEST</h2>',
  '<h3>Safe semantic subheading</h3>',
  '<p>Editorial <strong>content</strong> with <em>emphasis</em>.<br>Next line.</p>',
  '<ol>',
  '<li>First step<ul><li>Nested signal</li></ul></li>',
  '<li>Second step</li>',
  '</ol>',
  '<hr>',
  '<p><a href="https://raquelsynths.com" target="_blank" rel="noopener noreferrer">RQS</a></p>'
].join('');

const documentFixture = [
  'DATE',
  '2026-10-19',
  'IMAGE',
  'https://example.com/system-log.webp',
  'PT TITLE',
  'SYSTEM LOG // PEDIDO DE COLISÃO: COMO COMEÇARAM AS REDBLUE SESSIONS',
  'PT DESCRIPTION',
  'Descrição editorial em português.',
  'PT TECH CONTENT',
  nestedList,
  'PT JONAH COMMENT',
  '',
  'EN TITLE',
  'SYSTEM LOG // SYSTEM LOG // COLLISION REQUEST: HOW THE REDBLUE SESSIONS BEGAN',
  'EN DESCRIPTION',
  'English editorial description.',
  'EN TECH CONTENT',
  nestedList,
  'EN JONAH COMMENT',
  ''
].join('\n');

const parsed = parseSystemLogDocument(documentFixture);

for (const language of [parsed.pt, parsed.en]) {
  assert.deepEqual(language.techContentDiagnostic, {
    sourceFormat: 'HTML',
    htmlValidation: 'PASS',
    allowedTagsOnly: 'PASS',
    renderableContent: 'PASS',
    publishAllowed: 'YES'
  });
  assert.match(language.techContent, /<h3>/u);
  assert.match(language.techContent, /<ol>/u);
  assert.match(language.techContent, /<ol><li>First step<ul><li>Nested signal<\/li><\/ul><\/li>/u);
}

assert.equal(
  parsed.en.title,
  'SYSTEM LOG // SYSTEM LOG // COLLISION REQUEST: HOW THE REDBLUE SESSIONS BEGAN'
);

function responseRecorder() {
  const result = {
    headers: new Map(),
    statusCode: 200,
    value: null
  };

  return {
    result,
    setHeader(name, value) {
      result.headers.set(String(name).toLowerCase(), value);
    },
    status(statusCode) {
      result.statusCode = statusCode;
      return this;
    },
    json(value) {
      result.value = value;
      return this;
    }
  };
}

async function callAdmin(body, headers = {}) {
  const response = responseRecorder();
  await systemLogsHandler({
    method: 'POST',
    headers: {
      origin: 'http://localhost:4200',
      'sec-fetch-site': 'same-origin',
      'content-type': 'application/json',
      ...headers
    },
    body
  }, response);
  return response.result;
}

const previousAdminToken = process.env.RQS_ADMIN_TOKEN;
const previousNodeEnv = process.env.NODE_ENV;
const previousFetch = globalThis.fetch;
const testCredential = 'system-log-html-contract-test-token-2026';

process.env.RQS_ADMIN_TOKEN = testCredential;
process.env.NODE_ENV = 'test';
globalThis.fetch = async () => {
  throw new Error('EXTERNAL_OR_FIRESTORE_CALL_NOT_ALLOWED');
};

try {
  const login = await callAdmin({
    action: 'login',
    credential: testCredential
  });

  assert.equal(login.statusCode, 200);
  assert.equal(login.value.authenticated, true);

  const sessionCookie = String(login.headers.get('set-cookie')).split(';')[0];
  const dryRun = await callAdmin({
    action: 'dry-run',
    payload: parsed,
    sourceDocument: '2026-10-19 - System Log',
    sourceDocumentId: 'qa-system-log-2026-10-19',
    sourceModifiedTime: '2026-10-14T12:00:00.000Z'
  }, {
    cookie: sessionCookie,
    'x-rqs-csrf': login.value.csrfToken
  });

  assert.equal(dryRun.statusCode, 200);
  assert.equal(dryRun.value.checks.pt.techContent.htmlValidation, 'PASS');
  assert.equal(dryRun.value.checks.pt.techContent.allowedTagsOnly, 'PASS');
  assert.equal(dryRun.value.checks.pt.techContent.renderableContent, 'PASS');
  assert.equal(dryRun.value.checks.pt.techContent.publishAllowed, 'YES');
  assert.equal(dryRun.value.checks.en.techContent.htmlValidation, 'PASS');
  assert.equal(dryRun.value.checks.en.techContent.allowedTagsOnly, 'PASS');
  assert.equal(dryRun.value.checks.en.techContent.renderableContent, 'PASS');
  assert.equal(dryRun.value.checks.en.techContent.publishAllowed, 'YES');
  assert.equal(dryRun.value.firestore, 'WOULD CREATE');
  assert.match(dryRun.value.preview.pt, /<h3>/u);
  assert.match(dryRun.value.preview.pt, /<ol>/u);
  assert.match(dryRun.value.preview.en, /<h3>/u);
  assert.match(dryRun.value.preview.en, /<ol>/u);
} finally {
  if (previousAdminToken === undefined) delete process.env.RQS_ADMIN_TOKEN;
  else process.env.RQS_ADMIN_TOKEN = previousAdminToken;

  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;

  globalThis.fetch = previousFetch;
}

const globalStyles = readFileSync(
  new URL('../src/styles.scss', import.meta.url),
  'utf8'
);

assert.match(globalStyles, /\.tech-body ol\s*\{[^}]*list-style:\s*decimal;/su);
assert.match(globalStyles, /\.tech-body ol\s*>\s*li::before\s*\{[^}]*content:\s*none;/su);
assert.match(globalStyles, /\.tech-body li::before\s*\{[^}]*content:\s*'>';/su);

console.log('SYSTEM_LOG_HTML_ALLOWLIST = PASS');
console.log('SYSTEM_LOG_DRY_RUN_PT = PASS');
console.log('SYSTEM_LOG_DRY_RUN_EN = PASS');
console.log('SYSTEM_LOG_PREVIEW_STRUCTURE = PASS');
console.log('SYSTEM_LOG_ORDERED_LIST_STYLES = PASS');
console.log('FIRESTORE_WRITES = 0');
console.log('IMPORT = NO');
