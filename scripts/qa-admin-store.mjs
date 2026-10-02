import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';

import storeAdminHandler, {
  normalizeStoreAdminProduct
} from '../api/admin/store.js';

const sheinLegacy = normalizeStoreAdminProduct({
  id: 'legacy-shein',
  faction: 'neon-witch',
  stripeUrl: 'https://www.shein.com/example',
  status: 'avaliable',
  content: {
    pt: {
      name: 'Corset',
      description: 'Descrição longa.'
    },
    en: {
      name: 'Corset',
      description: 'Long description.'
    }
  }
});

assert.equal(
  sheinLegacy.merchant,
  'shein'
);
assert.equal(
  sheinLegacy.productType,
  'affiliate'
);
assert.equal(
  sheinLegacy.status,
  'available'
);
assert.equal(
  sheinLegacy.visibleInStore,
  true
);
assert.equal(
  sheinLegacy.legacyDestinationField,
  true
);
assert.ok(
  sheinLegacy.warnings.some(
    warning =>
      warning.includes('avaliable')
  )
);

const mercadoLivre = normalizeStoreAdminProduct({
  id: 'meli',
  destinationUrl:
    'https://www.mercadolivre.com.br/example',
  status: 'available',
  content: {
    pt: {
      name: 'Produto ML',
      shortDescription: 'Curta.',
      description: 'Longa.'
    },
    en: {
      name: 'ML Product',
      shortDescription: 'Short.',
      description: 'Long.'
    }
  }
});

assert.equal(
  mercadoLivre.merchant,
  'mercado-livre'
);
assert.equal(
  mercadoLivre.visibleInStore,
  true
);

const stripe = normalizeStoreAdminProduct({
  id: 'official',
  stripeUrl:
    'https://buy.stripe.com/example',
  status: 'available',
  content: {
    pt: { name: 'Official' },
    en: { name: 'Official' }
  }
});

assert.equal(
  stripe.merchant,
  'stripe'
);
assert.equal(
  stripe.productType,
  'official'
);
assert.equal(
  stripe.visibleInStore,
  false
);

const missingStatus =
  normalizeStoreAdminProduct({
    id: 'missing-status',
    destinationUrl:
      'https://www.amazon.com.br/example',
    content: {
      pt: { name: 'Amazon' },
      en: { name: 'Amazon' }
    }
  });

assert.equal(
  missingStatus.status,
  'available'
);

console.log(
  'STORE_PRODUCT_NORMALIZATION = PASS'
);

const routes = readFileSync(
  new URL(
    '../src/app/app.routes.ts',
    import.meta.url
  ),
  'utf8'
);

const admin = readFileSync(
  new URL(
    '../src/app/pages/admin-shell/admin-shell.html',
    import.meta.url
  ),
  'utf8'
);

assert.ok(
  routes.includes(
    "path: 'admin/store'"
  )
);

assert.ok(
  admin.includes(
    'module-index">06'
  )
);

console.log(
  'ADMIN_MODULE_06_ROUTE = PASS'
);

process.env.RQS_ADMIN_TOKEN =
  'qa-only-secret-32-characters-or-more';

function fakeResponse() {
  return {
    statusCode: 200,
    payload: null,

    setHeader() {
      return this;
    },

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

const baseRequest = {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    origin: 'https://raquelsynths.com',
    'sec-fetch-site': 'same-origin'
  },
  body: {
    action: 'overview'
  }
};

const withoutSession =
  fakeResponse();

await storeAdminHandler(
  baseRequest,
  withoutSession
);

assert.equal(
  withoutSession.statusCode,
  401
);

console.log(
  'ADMIN_STORE_SESSION_REQUIRED = PASS'
);

const sessionPayload =
  Buffer.from(
    JSON.stringify({
      version: 1,
      csrfToken: 'qa-csrf',
      nonce: 'qa',
      issuedAt: Date.now(),
      expiresAt:
        Date.now() + 60_000
    })
  ).toString('base64url');

const signature =
  createHmac(
    'sha256',
    process.env.RQS_ADMIN_TOKEN
  )
    .update(
      `admin-session:${sessionPayload}`
    )
    .digest('base64url');

const withoutCsrf =
  fakeResponse();

await storeAdminHandler(
  {
    ...baseRequest,
    headers: {
      ...baseRequest.headers,
      cookie:
        `__Host-rqs_admin_session=` +
        `${sessionPayload}.${signature}`
    }
  },
  withoutCsrf
);

assert.equal(
  withoutCsrf.statusCode,
  403
);

console.log(
  'ADMIN_STORE_CSRF_REQUIRED = PASS'
);

const invalidAction =
  fakeResponse();

await storeAdminHandler(
  {
    ...baseRequest,
    headers: {
      ...baseRequest.headers,
      cookie:
        `__Host-rqs_admin_session=` +
        `${sessionPayload}.${signature}`,
      'x-rqs-csrf': 'qa-csrf'
    },
    body: {
      action: 'not-a-write-action'
    }
  },
  invalidAction
);

assert.equal(
  invalidAction.statusCode,
  400
);

console.log(
  'ADMIN_STORE_READ_ONLY_ACTION_SURFACE = PASS'
);

console.log(
  'PATCH_6A_QA = PASS'
);
