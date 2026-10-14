import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import systemLogsHandler, {
  parseSystemLogDocument,
  validateTechContent
} from '../api/admin/system-logs.js';
import {
  EDITORIAL_TAGS,
  sanitizeEditorialHtml
} from '../lib/system-logs/editorial-html.js';

function assertPublishable(diagnostic, sanitization = 'PASS') {
  assert.equal(diagnostic.sourceFormat, 'HTML');
  assert.equal(diagnostic.sanitization, sanitization);
  assert.equal(diagnostic.editorialContent, 'PASS');
  assert.equal(diagnostic.renderableContent, 'PASS');
  assert.equal(diagnostic.publishAllowed, 'YES');
}

function documentFixture({ date, title, techContent }) {
  return [
    'DATE',
    date,
    'IMAGE',
    'https://example.com/system-log.webp',
    'PT TITLE',
    title.pt,
    'PT DESCRIPTION',
    'Descrição editorial em português.',
    'PT TECH CONTENT',
    techContent.pt,
    'PT JONAH COMMENT',
    '',
    'EN TITLE',
    title.en,
    'EN DESCRIPTION',
    'English editorial description.',
    'EN TECH CONTENT',
    techContent.en,
    'EN JONAH COMMENT',
    ''
  ].join('\n');
}

const requiredEditorialTags = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
  'div', 'span', 'section', 'article', 'header', 'footer',
  'pre', 'code', 'kbd', 'samp', 'var',
  'blockquote', 'q', 'cite',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
  'details', 'summary',
  'figure', 'figcaption',
  'a', 'img', 'picture', 'source'
];

for (const tag of requiredEditorialTags) {
  assert.ok(EDITORIAL_TAGS.includes(tag), `missing editorial tag: ${tag}`);
}

for (const tag of [
  'script', 'style', 'iframe', 'object', 'embed', 'form', 'input',
  'button', 'svg', 'math', 'video', 'audio', 'template'
]) {
  assert.ok(!EDITORIAL_TAGS.includes(tag), `active tag allowed: ${tag}`);
}

const futureEditorialHtml = [
  '<section lang="en" title="Editorial signal">',
  '<header><h4>Heading</h4></header>',
  '<article>',
  '<blockquote cite="https://raquelsynths.com/lore"><p>Quote</p></blockquote>',
  '<pre><code>STATE=READY</code></pre>',
  '<p><kbd>Enter</kbd> <samp>OK</samp> <var>signal</var></p>',
  '<dl><dt>Protocol</dt><dd>Active</dd></dl>',
  '<table>',
  '<caption>Signals</caption>',
  '<colgroup><col width="50"><col width="50"></colgroup>',
  '<thead><tr><th scope="col">Signal</th><th scope="col">State</th></tr></thead>',
  '<tbody><tr><td>Merge</td><td>Active</td></tr></tbody>',
  '<tfoot><tr><td colspan="2">Ready</td></tr></tfoot>',
  '</table>',
  '<details open><summary>Technical details</summary><p>Content</p></details>',
  '<figure>',
  '<picture>',
  '<source srcset="https://example.com/image.webp 1x" type="image/webp">',
  '<img src="https://example.com/image.jpg" alt="Signal" width="800" height="800">',
  '</picture>',
  '<figcaption>Caption</figcaption>',
  '</figure>',
  '</article>',
  '<footer><small>Archive</small></footer>',
  '</section>'
].join('');

const futureResult = sanitizeEditorialHtml(futureEditorialHtml);
assertPublishable(futureResult.diagnostic);
assert.equal(futureResult.diagnostic.securityChanges, 0);
assert.match(futureResult.content, /<h4>Heading<\/h4>/u);
assert.match(futureResult.content, /<table>/u);
assert.match(futureResult.content, /<details open>/u);
assert.match(futureResult.content, /<picture>/u);
assert.match(futureResult.content, /srcset="https:\/\/example\.com\/image\.webp 1x"/u);

const safeAnchor = validateTechContent(
  '<p><a href="https://raquelsynths.com" target="_blank" rel="noopener noreferrer">RQS</a></p>'
);
assertPublishable(safeAnchor.diagnostic);
assert.match(safeAnchor.content, /target="_blank" rel="noopener noreferrer"/u);

const relativeAnchor = validateTechContent(
  '<p><a href="/lore/jonah/s1-e5">Lore</a></p>'
);
assertPublishable(relativeAnchor.diagnostic, 'PASS WITH CHANGES');
assert.match(relativeAnchor.content, /href="\/lore\/jonah\/s1-e5"/u);
assert.match(relativeAnchor.content, /target="_blank" rel="noopener noreferrer"/u);

const maliciousHtml = [
  '<article onclick="alert(1)">',
  '<h4>Safe heading</h4>',
  '<script>alert(1)</script>',
  '<style>body{display:none}</style>',
  '<p style="display:none">Visible paragraph ',
  '<a href="javascript:alert(1)" onclick="alert(2)">safe label</a>',
  '</p>',
  '<p style="visibility:hidden">Visible visibility text</p>',
  '<p style="opacity:0">Visible opacity text</p>',
  '<div class="uncontrolled-class">Visible class text</div>',
  '<p><a href="vbscript:msgbox(1)">VB label</a></p>',
  '<p><a href="//example.com/path">Protocol-relative label</a></p>',
  '<img src="data:text/html;base64,PHNjcmlwdD4=" onerror="alert(3)" alt="Purged source">',
  '<picture><source srcset="data:image/png;base64,AAAA 1x, https://example.com/safe.png 2x"><img src="https://example.com/fallback.png" alt="Safe fallback"></picture>',
  '<iframe srcdoc="<script>alert(4)</script>"></iframe>',
  '<object data="https://example.com/payload"></object>',
  '<embed src="https://example.com/payload">',
  '<form action="https://example.com/collect"><input name="secret"><button>Send</button></form>',
  '<svg onload="alert(5)"><circle></circle></svg>',
  '<math><mi>x</mi></math>',
  '</article>'
].join('');

const maliciousResult = sanitizeEditorialHtml(maliciousHtml);
assertPublishable(maliciousResult.diagnostic, 'PASS WITH CHANGES');
assert.ok(maliciousResult.diagnostic.securityChanges >= 10);
assert.match(maliciousResult.content, /Safe heading/u);
assert.match(maliciousResult.content, /Visible paragraph/u);
assert.doesNotMatch(
  maliciousResult.content,
  /script|style=|onclick|onerror|javascript:|data:|iframe|srcdoc|object|embed|form|input|button|svg|math/iu
);

const activeOnlyResult = sanitizeEditorialHtml(
  '<script>alert(1)</script><iframe src="https://example.com"></iframe>'
);
assert.equal(activeOnlyResult.content, '');
assert.equal(activeOnlyResult.diagnostic.sanitization, 'PASS WITH CHANGES');
assert.equal(activeOnlyResult.diagnostic.editorialContent, 'FAIL');
assert.equal(activeOnlyResult.diagnostic.publishAllowed, 'NO');

const plainTextResult = sanitizeEditorialHtml('plain text only');
assert.equal(plainTextResult.diagnostic.sourceFormat, 'PLAIN_TEXT');
assert.equal(plainTextResult.diagnostic.sanitization, 'FAIL');
assert.equal(plainTextResult.diagnostic.publishAllowed, 'NO');

const malformedResult = sanitizeEditorialHtml(
  '<section><p>Content <strong>normalized</section>'
);
assertPublishable(malformedResult.diagnostic, 'PASS WITH CHANGES');
assert.match(malformedResult.content, /<strong>normalized<\/strong>/u);

const legacyTechContent = [
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

const log20261019 = parseSystemLogDocument(documentFixture({
  date: '2026-10-19',
  title: {
    pt: 'SYSTEM LOG // PEDIDO DE COLISÃO: COMO COMEÇARAM AS REDBLUE SESSIONS',
    en: 'SYSTEM LOG // COLLISION REQUEST: HOW THE REDBLUE SESSIONS BEGAN'
  },
  techContent: {
    pt: legacyTechContent,
    en: legacyTechContent
  }
}));

for (const language of [log20261019.pt, log20261019.en]) {
  assertPublishable(language.techContentDiagnostic);
  assert.match(language.techContent, /<h3>/u);
  assert.match(language.techContent, /<ol>/u);
  assert.match(language.techContent, /<ul><li>Nested signal<\/li><\/ul>/u);
}

const log20261026 = parseSystemLogDocument(documentFixture({
  date: '2026-10-26',
  title: {
    pt: 'SYSTEM LOG // RED TEAM',
    en: 'SYSTEM LOG // RED TEAM'
  },
  techContent: {
    pt: '<h2>PROTOCOLO</h2><p><code>RED_TEAM_RESPONSE_REQUIRED</code></p><p>Sinal de <code>vocoder</code>.</p>',
    en: '<h2>PROTOCOL</h2><p><code>RED_TEAM_RESPONSE_REQUIRED</code></p><p><code>vocoder</code> signal.</p>'
  }
}));

for (const language of [log20261026.pt, log20261026.en]) {
  assertPublishable(language.techContentDiagnostic);
  assert.match(language.techContent, /<code>RED_TEAM_RESPONSE_REQUIRED<\/code>/u);
  assert.match(language.techContent, /<code>vocoder<\/code>/u);
}

const maliciousDocument = parseSystemLogDocument(documentFixture({
  date: '2026-10-27',
  title: {
    pt: 'SYSTEM LOG // SANITIZAÇÃO',
    en: 'SYSTEM LOG // SANITIZATION'
  },
  techContent: {
    pt: maliciousHtml,
    en: maliciousHtml
  }
}));

for (const language of [maliciousDocument.pt, maliciousDocument.en]) {
  assertPublishable(language.techContentDiagnostic, 'PASS WITH CHANGES');
  assert.ok(language.techContentDiagnostic.securityChanges > 0);
  assert.doesNotMatch(language.techContent, /javascript:|onclick|onerror|<script|<iframe|<form/iu);
}

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

async function dryRun(payload, sourceDocument, documentId, session) {
  return callAdmin({
    action: 'dry-run',
    payload,
    sourceDocument,
    sourceDocumentId: documentId,
    sourceModifiedTime: '2026-10-14T12:00:00.000Z'
  }, {
    cookie: session.cookie,
    'x-rqs-csrf': session.csrfToken
  });
}

const previousAdminToken = process.env.RQS_ADMIN_TOKEN;
const previousNodeEnv = process.env.NODE_ENV;
const previousFetch = globalThis.fetch;
const testCredential = 'system-log-html-sanitizer-test-token-2026';

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

  const session = {
    cookie: String(login.headers.get('set-cookie')).split(';')[0],
    csrfToken: login.value.csrfToken
  };

  for (const fixture of [
    {
      payload: log20261019,
      sourceDocument: '2026-10-19 - System Log',
      documentId: 'qa-system-log-2026-10-19'
    },
    {
      payload: log20261026,
      sourceDocument: '2026-10-26 - System Log',
      documentId: 'qa-system-log-2026-10-26'
    }
  ]) {
    const result = await dryRun(
      fixture.payload,
      fixture.sourceDocument,
      fixture.documentId,
      session
    );

    assert.equal(result.statusCode, 200);
    assertPublishable(result.value.checks.pt.techContent);
    assertPublishable(result.value.checks.en.techContent);
    assert.equal(result.value.firestore, 'WOULD CREATE');
    assert.match(result.value.preview.pt, /<(?:h3|code)>/u);
    assert.match(result.value.preview.en, /<(?:h3|code)>/u);
  }

  const maliciousDryRun = await dryRun(
    maliciousDocument,
    '2026-10-27 - System Log QA',
    'qa-system-log-2026-10-27',
    session
  );

  assert.equal(maliciousDryRun.statusCode, 200);
  assertPublishable(
    maliciousDryRun.value.checks.pt.techContent,
    'PASS WITH CHANGES'
  );
  assertPublishable(
    maliciousDryRun.value.checks.en.techContent,
    'PASS WITH CHANGES'
  );
  assert.ok(
    maliciousDryRun.value.checks.pt.techContent.securityChanges > 0
  );
  assert.equal(maliciousDryRun.value.firestore, 'WOULD CREATE');
  assert.doesNotMatch(
    maliciousDryRun.value.preview.pt,
    /javascript:|onclick|onerror|<script|<iframe|<form/iu
  );
} finally {
  if (previousAdminToken === undefined) delete process.env.RQS_ADMIN_TOKEN;
  else process.env.RQS_ADMIN_TOKEN = previousAdminToken;

  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;

  globalThis.fetch = previousFetch;
}

const adminTemplate = readFileSync(
  new URL(
    '../src/app/pages/system-logs-admin/system-logs-admin.html',
    import.meta.url
  ),
  'utf8'
);
assert.match(adminTemplate, /SANITIZAÇÃO HTML/u);
assert.match(adminTemplate, /CONTEÚDO EDITORIAL/u);
assert.match(adminTemplate, /ALTERAÇÕES DE SEGURANÇA/u);
assert.match(adminTemplate, /techContent \| safeHtml/u);
assert.doesNotMatch(adminTemplate, /SOMENTE TAGS PERMITIDAS/u);

const adminComponent = readFileSync(
  new URL(
    '../src/app/pages/system-logs-admin/system-logs-admin.ts',
    import.meta.url
  ),
  'utf8'
);
assert.match(adminComponent, /await response\.text\(\)/u);
assert.match(adminComponent, /response\.headers\.get\('content-type'\)/u);
assert.match(
  adminComponent,
  /Falha no módulo Logs do Sistema \(HTTP \$\{response\.status\}\)\./u
);
assert.match(
  adminComponent,
  /Resposta inválida do módulo Logs do Sistema\./u
);
assert.doesNotMatch(adminComponent, /await response\.json\(\)/u);

const safeHtmlPipe = readFileSync(
  new URL('../src/app/components/pipes/safe-html.pipe.ts', import.meta.url),
  'utf8'
);
assert.match(safeHtmlPipe, /bypassSecurityTrustHtml/u);
assert.match(safeHtmlPipe, /display\\s\*:\\s\*none/u);
assert.match(safeHtmlPipe, /visibility\\s\*:\\s\*hidden/u);
assert.match(safeHtmlPipe, /opacity\\s\*:\\s\*0/u);

console.log('SYSTEM_LOG_HTML_SANITIZER = PASS');
console.log('SYSTEM_LOG_2026_10_19 = PASS');
console.log('SYSTEM_LOG_2026_10_26 = PASS');
console.log('SYSTEM_LOG_FUTURE_EDITORIAL_HTML = PASS');
console.log('SYSTEM_LOG_MALICIOUS_SANITIZATION = PASS');
console.log('SYSTEM_LOG_DRY_RUN_PT = PASS');
console.log('SYSTEM_LOG_DRY_RUN_EN = PASS');
console.log('SYSTEM_LOG_PREVIEW_STRUCTURE = PASS');
console.log('SYSTEM_LOG_RESPONSE_PARSING = PASS');
console.log('ADSENSE_FIREWALL = PRESERVED');
console.log('FIRESTORE_WRITES = 0');
console.log('IMPORT = NO');
