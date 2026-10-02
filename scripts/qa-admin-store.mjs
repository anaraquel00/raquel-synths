import assert from 'node:assert/strict';
import {
  createHmac
} from 'node:crypto';
import {
  readFileSync
} from 'node:fs';

import storeAdminHandler, {
  makeProductDryRunToken,
  normalizeStoreAdminProduct,
  resolveStoreAdminMerchant,
  validateProductDraft,
  verifyProductDryRunToken
} from '../api/admin/store.js';

const validDraft = {
  id: 'corset-rosa-enganoso',
  faction: 'neon-witch',
  image:
    'https://example.com/corset.webp',
  destinationUrl:
    'https://www.shein.com/example',
  status: 'available',

  content: {
    pt: {
      name:
        'O Corset Rosa Enganoso',
      shortDescription:
        'Corset rosa-choque de visual cyberpunk e ajuste marcado.',
      description:
        'Descrição editorial longa do produto em português.'
    },

    en: {
      name:
        'The Deceptive Pink Corset',
      shortDescription:
        'Hot-pink cyberpunk corset with a fitted silhouette.',
      description:
        'Long editorial product description in English.'
    }
  }
};

const sheinLegacy =
  normalizeStoreAdminProduct({
    id: 'legacy-shein',
    faction: 'neon-witch',
    stripeUrl:
      'https://www.shein.com/example',
    status: 'avaliable',
    updateTime:
      '2026-10-01T00:00:00Z',

    content: {
      pt: {
        name: 'Corset',
        description:
          'Descrição longa.'
      },

      en: {
        name: 'Corset',
        description:
          'Long description.'
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

assert.equal(
  sheinLegacy.updateTime,
  '2026-10-01T00:00:00Z'
);

assert.ok(
  sheinLegacy.warnings.some(
    warning =>
      warning.includes(
        'avaliable'
      )
  )
);

const mercadoLivre =
  normalizeStoreAdminProduct({
    id: 'meli',
    destinationUrl:
      'https://www.mercadolivre.com.br/example',
    status: 'available',

    content: {
      pt: {
        name:
          'Produto ML',
        shortDescription:
          'Curta.',
        description:
          'Longa.'
      },

      en: {
        name:
          'ML Product',
        shortDescription:
          'Short.',
        description:
          'Long.'
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

const stripe =
  normalizeStoreAdminProduct({
    id: 'official',
    stripeUrl:
      'https://buy.stripe.com/example',
    status: 'available',

    content: {
      pt: {
        name: 'Official'
      },

      en: {
        name: 'Official'
      }
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
      pt: {
        name: 'Amazon'
      },

      en: {
        name: 'Amazon'
      }
    }
  });

assert.equal(
  missingStatus.status,
  'available'
);

console.log(
  'STORE_PRODUCT_NORMALIZATION = PASS'
);

assert.equal(
  resolveStoreAdminMerchant(
    'https://meli.la/example'
  ),
  'mercado-livre'
);

assert.equal(
  resolveStoreAdminMerchant(
    'https://www.amazon.com.br/example'
  ),
  'amazon'
);

assert.equal(
  resolveStoreAdminMerchant(
    'https://s.click.aliexpress.com/example'
  ),
  'aliexpress'
);

const valid =
  validateProductDraft(
    validDraft
  );

assert.equal(
  valid.status,
  'PASS'
);

assert.equal(
  valid.merchant,
  'shein'
);

assert.equal(
  valid.payload.productType,
  'affiliate'
);

const unsupported =
  validateProductDraft({
    ...validDraft,
    destinationUrl:
      'https://example.com/product'
  });

assert.equal(
  unsupported.status,
  'BLOCKED'
);

assert.equal(
  unsupported.merchant,
  null
);

const missingShort =
  validateProductDraft({
    ...validDraft,

    content: {
      ...validDraft.content,

      pt: {
        ...validDraft.content.pt,
        shortDescription: ''
      }
    }
  });

assert.equal(
  missingShort.status,
  'BLOCKED'
);

console.log(
  'STORE_PRODUCT_VALIDATION = PASS'
);

const legacyIdCreate =
  validateProductDraft({
    ...validDraft,

    id:
      'studio_noir_dress'
  });

assert.equal(
  legacyIdCreate.status,
  'BLOCKED'
);

const legacyIdUpdate =
  validateProductDraft(
    {
      ...validDraft,

      id:
        'studio_noir_dress'
    },
    'update'
  );

assert.equal(
  legacyIdUpdate.status,
  'PASS'
);

assert.ok(
  legacyIdUpdate.warnings.some(
    warning =>
      warning.includes(
        'Legacy Product ID'
      )
  )
);

console.log(
  'STORE_LEGACY_PRODUCT_ID = PASS'
);


const originCases = [
  {
    type:
      'broklin-saga',
    collection:
      'lore',
    sourceId:
      's1-e10',
    title:
      'ASHES OF ME'
  },
  {
    type:
      'jonah-saga',
    collection:
      'lore-jonah',
    sourceId:
      's1-e6',
    title:
      'Jonah Episode'
  },
  {
    type:
      'global-saga',
    collection:
      'global-sagas',
    sourceId:
      's1-e10',
    title:
      'Global Episode'
  },
  {
    type:
      'system-log',
    collection:
      'logs',
    sourceId:
      '2025-12-08-log',
    title:
      'Paternity Protocol'
  },
  {
    type:
      'discography',
    collection:
      'discography',
    sourceId:
      'ep-saudade-sintetica',
    title:
      'Saudade Sintética (Lado A/B)'
  }
];

for (
  const originCase
  of originCases
) {
  const result =
    validateProductDraft({
      ...validDraft,

      origin: {
        type:
          originCase.type,

        title:
          originCase.title,

        featuredIn:
          originCase.type ===
            'discography'
            ? 'Fitas Desbotadas'
            : '',

        sourceCollection:
          'wrong-value',

        sourceId:
          originCase.sourceId
      }
    });

  assert.equal(
    result.status,
    'PASS'
  );

  assert.equal(
    result.payload
      .origin.sourceCollection,
    originCase.collection
  );

  assert.equal(
    result.payload
      .origin.sourceId,
    originCase.sourceId
  );
}

const invalidSourceId =
  validateProductDraft({
    ...validDraft,

    origin: {
      type:
        'broklin-saga',

      title:
        'ASHES OF ME',

      featuredIn: '',

      sourceCollection:
        'lore',

      sourceId:
        'bad/id'
    }
  });

assert.equal(
  invalidSourceId.status,
  'BLOCKED'
);

const legacyBroklinOrigin =
  normalizeStoreAdminProduct({
    id:
      'studio_noir_dress',

    faction:
      'synth-general',

    destinationUrl:
      'https://www.shein.com/example',

    status:
      'available',

    origin: {
      type:
        'saga',

      title:
        'ASHES OF ME',

      route:
        '/lore/broklin/s1-e10'
    },

    content: {
      pt: {
        name:
          'Vestido',

        shortDescription:
          'Curta.',

        description:
          'Longa.'
      },

      en: {
        name:
          'Dress',

        shortDescription:
          'Short.',

        description:
          'Long.'
      }
    }
  });

assert.equal(
  legacyBroklinOrigin
    .origin.type,
  'broklin-saga'
);

assert.equal(
  legacyBroklinOrigin
    .origin.sourceCollection,
  'lore'
);

assert.equal(
  legacyBroklinOrigin
    .origin.sourceId,
  's1-e10'
);

const legacyDiscographyOrigin =
  normalizeStoreAdminProduct({
    origin: {
      type:
        'discography',

      title:
        'Saudade Sintética',

      releaseId:
        'ep-saudade-sintetica',

      route:
        '/musical-archives'
    }
  });

assert.equal(
  legacyDiscographyOrigin
    .origin.sourceCollection,
  'discography'
);

assert.equal(
  legacyDiscographyOrigin
    .origin.sourceId,
  'ep-saudade-sintetica'
);

console.log(
  'STORE_UNIVERSAL_ORIGIN_REFERENCE = PASS'
);

console.log(
  'STORE_PRODUCT_ORIGIN_VALIDATION = PASS'
);


process.env.RQS_ADMIN_TOKEN =
  'qa-only-secret-32-characters-or-more';

const tokenContract = {
  operation: 'create',
  payload: valid.payload,
  sourceUpdateTime: null
};

const token =
  makeProductDryRunToken(
    tokenContract
  );

assert.equal(
  verifyProductDryRunToken(
    token,
    tokenContract
  ),
  true
);

assert.equal(
  verifyProductDryRunToken(
    token,
    {
      ...tokenContract,
      payload: {
        ...tokenContract.payload,
        status: 'inactive'
      }
    }
  ),
  false
);

assert.equal(
  verifyProductDryRunToken(
    `${token}tampered`,
    tokenContract
  ),
  false
);

console.log(
  'STORE_PRODUCT_DRY_RUN_TOKEN = PASS'
);

const routes =
  readFileSync(
    new URL(
      '../src/app/app.routes.ts',
      import.meta.url
    ),
    'utf8'
  );

const admin =
  readFileSync(
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
    'content-type':
      'application/json',

    origin:
      'https://raquelsynths.com',

    'sec-fetch-site':
      'same-origin'
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

const authHeaders = {
  ...baseRequest.headers,

  cookie:
    `__Host-rqs_admin_session=` +
    `${sessionPayload}.${signature}`,

  'x-rqs-csrf':
    'qa-csrf'
};

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

const blockedDryRun =
  fakeResponse();

await storeAdminHandler(
  {
    ...baseRequest,

    headers:
      authHeaders,

    body: {
      action:
        'dry-run-product',

      operation:
        'create',

      product: {
        ...validDraft,

        destinationUrl:
          'https://example.com/not-affiliate'
      }
    }
  },
  blockedDryRun
);

assert.equal(
  blockedDryRun.statusCode,
  200
);

assert.equal(
  blockedDryRun.payload.status,
  'BLOCKED'
);

assert.equal(
  blockedDryRun.payload.firestoreWrites,
  0
);

assert.equal(
  blockedDryRun.payload.dryRunToken,
  null
);

console.log(
  'ADMIN_STORE_DRY_RUN_NO_WRITE = PASS'
);

const withoutConfirmation =
  fakeResponse();

await storeAdminHandler(
  {
    ...baseRequest,

    headers:
      authHeaders,

    body: {
      action:
        'create-product',

      product:
        validDraft,

      dryRunToken:
        'not-used',

      ownerConfirmation:
        false
    }
  },
  withoutConfirmation
);

assert.equal(
  withoutConfirmation.statusCode,
  409
);

assert.equal(
  withoutConfirmation.payload.code,
  'OWNER_CONFIRMATION_REQUIRED'
);

console.log(
  'ADMIN_STORE_OWNER_CONFIRMATION_GATE = PASS'
);

const withoutDryRun =
  fakeResponse();

await storeAdminHandler(
  {
    ...baseRequest,

    headers:
      authHeaders,

    body: {
      action:
        'create-product',

      product:
        validDraft,

      ownerConfirmation:
        true
    }
  },
  withoutDryRun
);

assert.equal(
  withoutDryRun.statusCode,
  409
);

assert.equal(
  withoutDryRun.payload.code,
  'DRY_RUN_REQUIRED'
);

console.log(
  'ADMIN_STORE_WRITE_REQUIRES_DRY_RUN = PASS'
);

const invalidAction =
  fakeResponse();

await storeAdminHandler(
  {
    ...baseRequest,

    headers:
      authHeaders,

    body: {
      action:
        'delete-product'
    }
  },
  invalidAction
);

assert.equal(
  invalidAction.statusCode,
  400
);

console.log(
  'ADMIN_STORE_DELETE_DISABLED = PASS'
);

const deleteCampaign =
  fakeResponse();

await storeAdminHandler(
  {
    ...baseRequest,

    headers:
      authHeaders,

    body: {
      action:
        'delete-campaign'
    }
  },
  deleteCampaign
);

assert.equal(
  deleteCampaign.statusCode,
  400
);

console.log(
  'ADMIN_STORE_CAMPAIGN_DELETE_DISABLED = PASS'
);

console.log(
  'FIRESTORE_WRITES_DURING_QA = 0'
);

console.log(
  'PATCH_6B_QA = PASS'
);
