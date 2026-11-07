import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import loreHandler from '../api/admin/lore.js';
import globalSagasHandler from '../api/admin/global-sagas.js';

const adminToken = 'qa-only-admin-token-with-32-characters';
process.env.RQS_ADMIN_TOKEN = adminToken;

function response() {
  return {
    statusCode: 200,
    payload: null,
    setHeader() { return this; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

function sessionHeaders() {
  const csrfToken = 'qa-csrf-token';
  const payload = Buffer.from(JSON.stringify({
    version: 1,
    csrfToken,
    nonce: 'qa-nonce',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60_000
  })).toString('base64url');
  const signature = createHmac('sha256', adminToken)
    .update(`admin-session:${payload}`)
    .digest('base64url');

  return {
    'content-type': 'application/json',
    origin: 'https://raquelsynths.com',
    'sec-fetch-site': 'same-origin',
    cookie: `__Host-rqs_admin_session=${payload}.${signature}`,
    'x-rqs-csrf': csrfToken
  };
}

async function call(handler, action, authenticated = true) {
  const result = response();
  await handler({
    method: 'POST',
    headers: authenticated
      ? sessionHeaders()
      : {
          'content-type': 'application/json',
          origin: 'https://raquelsynths.com',
          'sec-fetch-site': 'same-origin'
        },
    body: {
      action,
      mode: 'broklin',
      documentId: 'qa_document_12345',
      language: 'pt-BR',
      dryRunToken: 'qa-token'
    }
  }, result);
  return result;
}

test('legacy editorial APIs remain protected by admin authentication', async () => {
  for (const handler of [loreHandler, globalSagasHandler]) {
    const result = await call(handler, 'import', false);
    assert.equal(result.statusCode, 401);
    assert.equal(result.payload.error, 'ADMIN_SESSION_REQUIRED');
  }
});

test('Lore API rejects every legacy operation after authentication', async () => {
  for (const action of ['list', 'dry-run', 'import', 'import-en', 'preview']) {
    const result = await call(loreHandler, action);
    assert.equal(result.statusCode, 410);
    assert.equal(result.payload.error, 'EDITORIAL_MODULE_ARCHIVED');
  }
});

test('Global Sagas API rejects every legacy operation after authentication', async () => {
  for (const action of ['list', 'load', 'dry-run', 'import']) {
    const result = await call(globalSagasHandler, action);
    assert.equal(result.statusCode, 410);
    assert.equal(result.payload.error, 'EDITORIAL_MODULE_ARCHIVED');
  }
});
