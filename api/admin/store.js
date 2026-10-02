import {
  createHmac,
  randomUUID,
  timingSafeEqual
} from 'node:crypto';

import { google } from 'googleapis';

import {
  body,
  requireCsrf,
  requireOrigin,
  requireSession,
  secret
} from './system-logs.js';

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  'raquel-synths-platform';

const COLLECTION = 'products';
const DRY_RUN_TTL = 10 * 60 * 1000;

const AFFILIATE_MERCHANTS = new Set([
  'shein',
  'mercado-livre',
  'amazon',
  'aliexpress'
]);

const ALLOWED_FACTIONS = new Set([
  'tech-lead',
  'synth-general',
  'sonic-arsenal',
  'neon-witch',
  'rust-riot'
]);

const ALLOWED_STATUSES = new Set([
  'available',
  'sold_out',
  'inactive'
]);

const MERCHANT_LABELS = {
  shein: 'SHEIN',
  'mercado-livre': 'Mercado Livre',
  amazon: 'Amazon',
  aliexpress: 'AliExpress',
  stripe: 'Stripe',
  partner: 'Partner',
  unknown: 'Unknown'
};

const PRODUCT_UPDATE_FIELDS = [
  'faction',
  'image',
  'destinationUrl',
  'merchant',
  'productType',
  'status',
  'content.pt.name',
  'content.pt.shortDescription',
  'content.pt.description',
  'content.en.name',
  'content.en.shortDescription',
  'content.en.description'
];

class StoreAdminError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));

  return a.length === b.length &&
    timingSafeEqual(a, b);
}

function firestoreAuth() {
  const raw =
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new StoreAdminError(
      500,
      'MISSING_FIRESTORE_CONFIGURATION',
      'Credencial Firestore não configurada.'
    );
  }

  let credentials;

  try {
    credentials = JSON.parse(raw);

    if (credentials.private_key) {
      credentials.private_key =
        credentials.private_key.replace(/\\n/g, '\n');
    }
  } catch {
    throw new StoreAdminError(
      500,
      'INVALID_FIRESTORE_CONFIGURATION',
      'Credencial Firestore inválida.'
    );
  }

  return new google.auth.GoogleAuth({
    credentials,
    projectId:
      credentials.project_id ||
      PROJECT_ID,
    scopes: [
      'https://www.googleapis.com/auth/datastore'
    ]
  });
}

async function accessToken() {
  const auth =
    await firestoreAuth().getClient();

  const access =
    await auth.getAccessToken();

  const token =
    typeof access === 'string'
      ? access
      : access?.token;

  if (!token) {
    throw new StoreAdminError(
      502,
      'FIRESTORE_AUTH_FAILED',
      'Não foi possível autenticar no Firestore.'
    );
  }

  return token;
}

function collectionUrl() {
  return new URL(
    `https://firestore.googleapis.com/v1/projects/` +
    `${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents/` +
    `${encodeURIComponent(COLLECTION)}`
  );
}

function documentUrl(documentId) {
  return new URL(
    `${collectionUrl().toString()}/` +
    encodeURIComponent(documentId)
  );
}

function parseFirestoreValue(value = {}) {
  if ('stringValue' in value) {
    return value.stringValue;
  }

  if ('booleanValue' in value) {
    return Boolean(value.booleanValue);
  }

  if ('integerValue' in value) {
    return Number(value.integerValue);
  }

  if ('doubleValue' in value) {
    return Number(value.doubleValue);
  }

  if ('timestampValue' in value) {
    return value.timestampValue;
  }

  if ('nullValue' in value) {
    return null;
  }

  if ('arrayValue' in value) {
    return (value.arrayValue?.values || [])
      .map(parseFirestoreValue);
  }

  if ('mapValue' in value) {
    return Object.fromEntries(
      Object.entries(
        value.mapValue?.fields || {}
      ).map(([key, item]) => [
        key,
        parseFirestoreValue(item)
      ])
    );
  }

  return null;
}

function mapDocument(document) {
  const id =
    String(document?.name || '')
      .split('/')
      .pop() || '';

  const fields = Object.fromEntries(
    Object.entries(document?.fields || {})
      .map(([key, value]) => [
        key,
        parseFirestoreValue(value)
      ])
  );

  return {
    id,
    updateTime:
      document?.updateTime || null,
    ...fields
  };
}

function cleanUrl(value) {
  return String(value || '')
    .trim()
    .replace(/^["']+|["']+$/g, '');
}

function resolveDestination(product) {
  const candidates = [
    ['destinationUrl', product?.destinationUrl],
    ['stripeUrl', product?.stripeUrl],
    ['link', product?.link],
    ['url', product?.url]
  ];

  for (const [field, value] of candidates) {
    const destinationUrl = cleanUrl(value);

    if (destinationUrl) {
      return {
        destinationUrl,
        sourceUrlField: field
      };
    }
  }

  return {
    destinationUrl: '',
    sourceUrlField: null
  };
}

export function resolveStoreAdminMerchant(value) {
  const url = cleanUrl(value);

  if (!url) return 'unknown';

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return 'unknown';
  }

  if (parsed.protocol !== 'https:') {
    return 'unknown';
  }

  const host =
    parsed.hostname.toLowerCase();

  if (
    host === 'buy.stripe.com' ||
    host === 'stripe.com' ||
    host.endsWith('.stripe.com')
  ) {
    return 'stripe';
  }

  if (
    host === 'shein.com' ||
    host.endsWith('.shein.com')
  ) {
    return 'shein';
  }

  if (
    host === 'meli.la' ||
    host.endsWith('.meli.la') ||
    host.includes('mercadolivre.') ||
    host.includes('mercadolibre.')
  ) {
    return 'mercado-livre';
  }

  if (
    host === 'amzn.to' ||
    host.endsWith('.amzn.to') ||
    host.includes('amazon.')
  ) {
    return 'amazon';
  }

  if (
    host === 'aliexpress.com' ||
    host.endsWith('.aliexpress.com')
  ) {
    return 'aliexpress';
  }

  return 'partner';
}

function normalizeStatus(value) {
  const normalized =
    String(value || '')
      .trim()
      .toLowerCase();

  if (
    !normalized ||
    normalized === 'available' ||
    normalized === 'avaliable'
  ) {
    return 'available';
  }

  if (normalized === 'sold_out') {
    return 'sold_out';
  }

  if (normalized === 'inactive') {
    return 'inactive';
  }

  return 'inactive';
}

function localizedContent(value) {
  return {
    name:
      String(value?.name || '').trim(),
    shortDescription:
      String(value?.shortDescription || '').trim(),
    description:
      String(value?.description || '').trim()
  };
}

export function normalizeStoreAdminProduct(raw = {}) {
  const {
    destinationUrl,
    sourceUrlField
  } = resolveDestination(raw);

  const merchant =
    resolveStoreAdminMerchant(destinationUrl);

  const productType =
    AFFILIATE_MERCHANTS.has(merchant)
      ? 'affiliate'
      : merchant === 'stripe'
        ? 'official'
        : 'unknown';

  const rawStatus =
    raw.status === undefined ||
    raw.status === null ||
    String(raw.status).trim() === ''
      ? null
      : String(raw.status).trim();

  const status =
    normalizeStatus(rawStatus);

  const visibleInStore =
    productType === 'affiliate' &&
    AFFILIATE_MERCHANTS.has(merchant) &&
    status !== 'inactive';

  const legacyDestinationField =
    sourceUrlField === 'stripeUrl' &&
    merchant !== 'stripe';

  const pt =
    localizedContent(raw.content?.pt);

  const en =
    localizedContent(raw.content?.en);

  const warnings = [];

  if (legacyDestinationField) {
    warnings.push(
      'Affiliate destination is stored in legacy field stripeUrl.'
    );
  }

  if (!rawStatus) {
    warnings.push(
      'Status is missing and is normalized to available at runtime.'
    );
  } else if (
    rawStatus.toLowerCase() === 'avaliable'
  ) {
    warnings.push(
      'Legacy status typo "avaliable" is normalized to available.'
    );
  } else if (
    ![
      'available',
      'sold_out',
      'inactive'
    ].includes(rawStatus.toLowerCase())
  ) {
    warnings.push(
      `Unknown status "${rawStatus}" is normalized to inactive.`
    );
  }

  if (!destinationUrl) {
    warnings.push(
      'No commerce destination URL was found.'
    );
  }

  if (
    merchant === 'partner' ||
    merchant === 'unknown'
  ) {
    warnings.push(
      'Merchant is not part of the supported affiliate merchant set.'
    );
  }

  if (!pt.name) {
    warnings.push(
      'PT product name is missing.'
    );
  }

  if (!en.name) {
    warnings.push(
      'EN product name is missing.'
    );
  }

  if (!pt.shortDescription) {
    warnings.push(
      'PT shortDescription is missing.'
    );
  }

  if (!en.shortDescription) {
    warnings.push(
      'EN shortDescription is missing.'
    );
  }

  if (merchant === 'stripe') {
    warnings.push(
      'Stripe/official product is hidden from affiliate-first Store V2.'
    );
  }

  return {
    id: String(raw.id || ''),
    faction: String(raw.faction || ''),
    image: String(raw.image || ''),

    destinationUrl,
    sourceUrlField,

    merchant,
    merchantLabel:
      MERCHANT_LABELS[merchant] ||
      'Unknown',

    productType,

    rawStatus,
    status,

    visibleInStore,
    legacyDestinationField,

    updateTime:
      raw.updateTime || null,

    content: {
      pt,
      en
    },

    warnings
  };
}

function normalizeDraft(input = {}) {
  return {
    id:
      String(input.id || '')
        .trim()
        .toLowerCase(),

    faction:
      String(input.faction || '')
        .trim(),

    image:
      String(input.image || '')
        .trim(),

    destinationUrl:
      cleanUrl(input.destinationUrl),

    status:
      String(input.status || '')
        .trim()
        .toLowerCase(),

    content: {
      pt:
        localizedContent(
          input.content?.pt
        ),

      en:
        localizedContent(
          input.content?.en
        )
    }
  };
}

function validImage(value) {
  if (/^assets\/[^\s]+$/u.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateProductDraft(input = {}) {
  const draft =
    normalizeDraft(input);

  const blocked = [];
  const warnings = [];

  if (
    !/^[a-z0-9][a-z0-9-]{2,119}$/u
      .test(draft.id)
  ) {
    blocked.push(
      'Product ID must be a lowercase slug with 3–120 characters.'
    );
  }

  if (
    !ALLOWED_FACTIONS.has(
      draft.faction
    )
  ) {
    blocked.push(
      'Product sector is not supported by Neon Store V2.'
    );
  }

  if (!validImage(draft.image)) {
    blocked.push(
      'Image must be an https URL or an assets/ path.'
    );
  }

  const merchant =
    resolveStoreAdminMerchant(
      draft.destinationUrl
    );

  if (
    !AFFILIATE_MERCHANTS.has(
      merchant
    )
  ) {
    blocked.push(
      'Destination must belong to SHEIN, Mercado Livre, Amazon or AliExpress.'
    );
  }

  if (
    !ALLOWED_STATUSES.has(
      draft.status
    )
  ) {
    blocked.push(
      'Product status is invalid.'
    );
  }

  for (
    const [language, content]
    of Object.entries(draft.content)
  ) {
    if (!content.name) {
      blocked.push(
        `${language.toUpperCase()} product name is required.`
      );
    }

    if (
      content.name.length > 160
    ) {
      blocked.push(
        `${language.toUpperCase()} product name exceeds 160 characters.`
      );
    }

    if (
      !content.shortDescription
    ) {
      blocked.push(
        `${language.toUpperCase()} shortDescription is required.`
      );
    }

    if (
      content.shortDescription.length > 180
    ) {
      blocked.push(
        `${language.toUpperCase()} shortDescription exceeds 180 characters.`
      );
    }

    if (!content.description) {
      blocked.push(
        `${language.toUpperCase()} description is required.`
      );
    }

    if (
      content.description.length > 5000
    ) {
      blocked.push(
        `${language.toUpperCase()} description exceeds 5000 characters.`
      );
    }
  }

  if (
    draft.destinationUrl.length > 2048
  ) {
    blocked.push(
      'Destination URL exceeds 2048 characters.'
    );
  }

  return {
    status:
      blocked.length
        ? 'BLOCKED'
        : 'PASS',

    blocked,
    warnings,

    merchant:
      AFFILIATE_MERCHANTS.has(
        merchant
      )
        ? merchant
        : null,

    payload: {
      ...draft,
      merchant:
        AFFILIATE_MERCHANTS.has(
          merchant
        )
          ? merchant
          : '',
      productType: 'affiliate'
    }
  };
}

function stringValue(value) {
  return {
    stringValue:
      String(value || '')
  };
}

function mapValue(fields) {
  return {
    mapValue: {
      fields
    }
  };
}

function productFields(product) {
  return {
    faction:
      stringValue(product.faction),

    image:
      stringValue(product.image),

    destinationUrl:
      stringValue(
        product.destinationUrl
      ),

    merchant:
      stringValue(product.merchant),

    productType:
      stringValue('affiliate'),

    status:
      stringValue(product.status),

    content:
      mapValue({
        pt:
          mapValue({
            name:
              stringValue(
                product.content.pt.name
              ),

            shortDescription:
              stringValue(
                product.content.pt
                  .shortDescription
              ),

            description:
              stringValue(
                product.content.pt
                  .description
              )
          }),

        en:
          mapValue({
            name:
              stringValue(
                product.content.en.name
              ),

            shortDescription:
              stringValue(
                product.content.en
                  .shortDescription
              ),

            description:
              stringValue(
                product.content.en
                  .description
              )
          })
      })
  };
}

async function readProductDocument(
  documentId
) {
  const token =
    await accessToken();

  const response =
    await fetch(
      documentUrl(documentId),
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new StoreAdminError(
      502,
      'FIRESTORE_READ_FAILED',
      'O Firestore recusou a leitura do produto.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return mapDocument(
    await response.json()
  );
}

async function readProducts() {
  const token =
    await accessToken();

  const url =
    collectionUrl();

  url.searchParams.set(
    'pageSize',
    '300'
  );

  const response =
    await fetch(url, {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    });

  if (!response.ok) {
    const payload =
      await response
        .json()
        .catch(() => ({}));

    throw new StoreAdminError(
      502,
      'FIRESTORE_READ_FAILED',
      'O Firestore recusou a leitura do catálogo.',
      {
        firestoreStatus:
          response.status,

        firestoreCode:
          payload?.error?.status ||
          null
      }
    );
  }

  const payload =
    await response.json();

  return (payload.documents || [])
    .map(mapDocument)
    .map(normalizeStoreAdminProduct)
    .sort((left, right) => {
      if (
        left.visibleInStore !==
        right.visibleInStore
      ) {
        return left.visibleInStore
          ? -1
          : 1;
      }

      const merchantOrder =
        left.merchant.localeCompare(
          right.merchant
        );

      if (merchantOrder) {
        return merchantOrder;
      }

      const leftName =
        left.content.pt.name ||
        left.content.en.name ||
        left.id;

      const rightName =
        right.content.pt.name ||
        right.content.en.name ||
        right.id;

      return leftName.localeCompare(
        rightName,
        'pt-BR'
      );
    });
}

function buildSummary(products) {
  const merchantCounts = {
    shein: 0,
    'mercado-livre': 0,
    amazon: 0,
    aliexpress: 0,
    stripe: 0,
    partner: 0,
    unknown: 0
  };

  for (const product of products) {
    merchantCounts[
      product.merchant
    ] =
      (
        merchantCounts[
          product.merchant
        ] || 0
      ) + 1;
  }

  const visibleAffiliateProducts =
    products.filter(
      product =>
        product.visibleInStore
    ).length;

  return {
    totalProducts:
      products.length,

    visibleAffiliateProducts,

    hiddenProducts:
      products.length -
      visibleAffiliateProducts,

    productsWithWarnings:
      products.filter(
        product =>
          product.warnings.length > 0
      ).length,

    legacyDestinationProducts:
      products.filter(
        product =>
          product.legacyDestinationField
      ).length,

    missingShortDescriptions:
      products.filter(
        product =>
          !product.content.pt
            .shortDescription ||
          !product.content.en
            .shortDescription
      ).length,

    merchantCounts
  };
}

async function overview() {
  const products =
    await readProducts();

  return {
    generatedAt:
      new Date().toISOString(),

    collection:
      COLLECTION,

    readOnly:
      false,

    summary:
      buildSummary(products),

    products
  };
}

function digest(value) {
  return createHmac(
    'sha256',
    secret()
  )
    .update(
      JSON.stringify(value)
    )
    .digest('base64url');
}

export function makeProductDryRunToken(
  value
) {
  const payload =
    Buffer.from(
      JSON.stringify({
        digest:
          digest(value),

        expiresAt:
          Date.now() +
          DRY_RUN_TTL,

        nonce:
          randomUUID()
      })
    )
      .toString('base64url');

  const signature =
    createHmac(
      'sha256',
      secret()
    )
      .update(
        `admin-store:${payload}`
      )
      .digest('base64url');

  return `${payload}.${signature}`;
}

export function verifyProductDryRunToken(
  token,
  value
) {
  const [
    payload,
    signature,
    ...extra
  ] =
    String(token || '')
      .split('.');

  if (
    !payload ||
    !signature ||
    extra.length
  ) {
    return false;
  }

  const expected =
    createHmac(
      'sha256',
      secret()
    )
      .update(
        `admin-store:${payload}`
      )
      .digest('base64url');

  if (
    !safeEqual(
      signature,
      expected
    )
  ) {
    return false;
  }

  try {
    const decoded =
      JSON.parse(
        Buffer.from(
          payload,
          'base64url'
        ).toString('utf8')
      );

    return (
      Number(decoded.expiresAt) >
        Date.now() &&
      decoded.digest ===
        digest(value)
    );
  } catch {
    return false;
  }
}

function tokenContract(
  operation,
  payload,
  sourceUpdateTime
) {
  return {
    operation,
    payload,
    sourceUpdateTime:
      sourceUpdateTime || null
  };
}

function blockedDryRun(
  operation,
  documentId,
  blocked,
  warnings = [],
  merchant = null,
  preview = null
) {
  return {
    operation,
    status: 'BLOCKED',
    blocked,
    warnings,

    documentId,
    documentPath:
      `${COLLECTION}/${documentId}`,

    merchant,

    sourceUpdateTime:
      null,

    firestoreWrites:
      0,

    dryRunToken:
      null,

    writePlan: {
      operation:
        operation === 'create'
          ? 'CREATE'
          : operation === 'update'
            ? 'UPDATE'
            : 'ARCHIVE',

      fields:
        operation === 'archive'
          ? ['status']
          : PRODUCT_UPDATE_FIELDS
    },

    preview
  };
}

async function productDryRun(
  input
) {
  const operation =
    input.operation;

  if (
    ![
      'create',
      'update',
      'archive'
    ].includes(operation)
  ) {
    throw new StoreAdminError(
      400,
      'INVALID_PRODUCT_OPERATION',
      'Operação de produto inválida.'
    );
  }

  if (operation === 'archive') {
    const documentId =
      String(input.id || '')
        .trim()
        .toLowerCase();

    if (
      !/^[a-z0-9][a-z0-9-]{2,119}$/u
        .test(documentId)
    ) {
      return blockedDryRun(
        operation,
        documentId,
        [
          'Product ID is invalid.'
        ]
      );
    }

    const currentRaw =
      await readProductDocument(
        documentId
      );

    if (!currentRaw) {
      return blockedDryRun(
        operation,
        documentId,
        [
          'Product does not exist.'
        ]
      );
    }

    const current =
      normalizeStoreAdminProduct(
        currentRaw
      );

    if (
      current.productType !==
      'affiliate'
    ) {
      return blockedDryRun(
        operation,
        documentId,
        [
          'Only affiliate products can be archived by Module 06.'
        ]
      );
    }

    if (
      !input.sourceUpdateTime ||
      input.sourceUpdateTime !==
        current.updateTime
    ) {
      return blockedDryRun(
        operation,
        documentId,
        [
          'Product changed after it was loaded. Refresh the catalog before continuing.'
        ]
      );
    }

    const tokenValue =
      tokenContract(
        operation,
        {
          id: documentId,
          status: 'inactive'
        },
        current.updateTime
      );

    return {
      operation,
      status: 'PASS',
      blocked: [],
      warnings:
        current.warnings,

      documentId,
      documentPath:
        `${COLLECTION}/${documentId}`,

      merchant:
        current.merchant,

      sourceUpdateTime:
        current.updateTime,

      firestoreWrites:
        0,

      dryRunToken:
        makeProductDryRunToken(
          tokenValue
        ),

      writePlan: {
        operation: 'ARCHIVE',
        fields: ['status']
      },

      preview: {
        id:
          current.id,

        faction:
          current.faction,

        image:
          current.image,

        destinationUrl:
          current.destinationUrl,

        status:
          'inactive',

        content:
          current.content
      }
    };
  }

  const validation =
    validateProductDraft(
      input.product
    );

  const product =
    validation.payload;

  if (
    validation.status ===
    'BLOCKED'
  ) {
    return blockedDryRun(
      operation,
      product.id,
      validation.blocked,
      validation.warnings,
      validation.merchant,
      product
    );
  }

  const currentRaw =
    await readProductDocument(
      product.id
    );

  if (
    operation === 'create' &&
    currentRaw
  ) {
    return blockedDryRun(
      operation,
      product.id,
      [
        'Product ID already exists.'
      ],
      validation.warnings,
      validation.merchant,
      product
    );
  }

  if (
    operation === 'update' &&
    !currentRaw
  ) {
    return blockedDryRun(
      operation,
      product.id,
      [
        'Product does not exist.'
      ],
      validation.warnings,
      validation.merchant,
      product
    );
  }

  let sourceUpdateTime = null;
  const warnings = [
    ...validation.warnings
  ];

  if (
    operation === 'update'
  ) {
    const current =
      normalizeStoreAdminProduct(
        currentRaw
      );

    sourceUpdateTime =
      current.updateTime;

    if (
      !input.sourceUpdateTime ||
      input.sourceUpdateTime !==
        sourceUpdateTime
    ) {
      return blockedDryRun(
        operation,
        product.id,
        [
          'Product changed after it was loaded. Refresh the catalog before continuing.'
        ],
        [
          ...warnings,
          ...current.warnings
        ],
        validation.merchant,
        product
      );
    }

    warnings.push(
      ...current.warnings
    );
  }

  const tokenValue =
    tokenContract(
      operation,
      product,
      sourceUpdateTime
    );

  return {
    operation,
    status: 'PASS',
    blocked: [],
    warnings:
      [...new Set(warnings)],

    documentId:
      product.id,

    documentPath:
      `${COLLECTION}/${product.id}`,

    merchant:
      validation.merchant,

    sourceUpdateTime,

    firestoreWrites:
      0,

    dryRunToken:
      makeProductDryRunToken(
        tokenValue
      ),

    writePlan: {
      operation:
        operation === 'create'
          ? 'CREATE'
          : 'UPDATE',

      fields:
        PRODUCT_UPDATE_FIELDS
    },

    preview:
      product
  };
}

function requireOwnerConfirmation(
  input
) {
  if (
    input.ownerConfirmation !== true
  ) {
    throw new StoreAdminError(
      409,
      'OWNER_CONFIRMATION_REQUIRED',
      'Confirmação explícita da Owner é obrigatória.'
    );
  }
}

function requireDryRunToken(
  input
) {
  if (!input.dryRunToken) {
    throw new StoreAdminError(
      409,
      'DRY_RUN_REQUIRED',
      'Execute o DRY RUN novamente.'
    );
  }
}

async function createProduct(
  input
) {
  requireOwnerConfirmation(
    input
  );

  requireDryRunToken(
    input
  );

  const validation =
    validateProductDraft(
      input.product
    );

  if (
    validation.status !==
    'PASS'
  ) {
    throw new StoreAdminError(
      400,
      'PRODUCT_VALIDATION_FAILED',
      validation.blocked.join(' ')
    );
  }

  const product =
    validation.payload;

  const tokenValue =
    tokenContract(
      'create',
      product,
      null
    );

  if (
    !verifyProductDryRunToken(
      input.dryRunToken,
      tokenValue
    )
  ) {
    throw new StoreAdminError(
      409,
      'DRY_RUN_REQUIRED',
      'O produto mudou depois do DRY RUN.'
    );
  }

  if (
    await readProductDocument(
      product.id
    )
  ) {
    throw new StoreAdminError(
      409,
      'PRODUCT_ALREADY_EXISTS',
      'O productId já existe.'
    );
  }

  const token =
    await accessToken();

  const url =
    collectionUrl();

  url.searchParams.set(
    'documentId',
    product.id
  );

  const response =
    await fetch(url, {
      method: 'POST',

      headers: {
        Authorization:
          `Bearer ${token}`,

        'Content-Type':
          'application/json'
      },

      body:
        JSON.stringify({
          fields:
            productFields(
              product
            )
        })
    });

  if (response.status === 409) {
    throw new StoreAdminError(
      409,
      'PRODUCT_ALREADY_EXISTS',
      'O productId já existe.'
    );
  }

  if (!response.ok) {
    throw new StoreAdminError(
      502,
      'FIRESTORE_CREATE_FAILED',
      'O Firestore recusou a criação do produto.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return {
    firestore: 'CREATED',
    product:
      normalizeStoreAdminProduct(
        mapDocument(
          await response.json()
        )
      )
  };
}

async function patchProduct(
  input
) {
  requireOwnerConfirmation(
    input
  );

  requireDryRunToken(
    input
  );

  const validation =
    validateProductDraft(
      input.product
    );

  if (
    validation.status !==
    'PASS'
  ) {
    throw new StoreAdminError(
      400,
      'PRODUCT_VALIDATION_FAILED',
      validation.blocked.join(' ')
    );
  }

  const product =
    validation.payload;

  const sourceUpdateTime =
    String(
      input.sourceUpdateTime || ''
    );

  const tokenValue =
    tokenContract(
      'update',
      product,
      sourceUpdateTime
    );

  if (
    !verifyProductDryRunToken(
      input.dryRunToken,
      tokenValue
    )
  ) {
    throw new StoreAdminError(
      409,
      'DRY_RUN_REQUIRED',
      'O produto mudou depois do DRY RUN.'
    );
  }

  const currentRaw =
    await readProductDocument(
      product.id
    );

  if (!currentRaw) {
    throw new StoreAdminError(
      404,
      'PRODUCT_NOT_FOUND',
      'Produto não encontrado.'
    );
  }

  if (
    currentRaw.updateTime !==
    sourceUpdateTime
  ) {
    throw new StoreAdminError(
      409,
      'PRODUCT_STALE',
      'O produto foi alterado depois do DRY RUN.'
    );
  }

  const token =
    await accessToken();

  const url =
    documentUrl(
      product.id
    );

  for (
    const field
    of PRODUCT_UPDATE_FIELDS
  ) {
    url.searchParams.append(
      'updateMask.fieldPaths',
      field
    );
  }

  url.searchParams.set(
    'currentDocument.updateTime',
    sourceUpdateTime
  );

  const response =
    await fetch(url, {
      method: 'PATCH',

      headers: {
        Authorization:
          `Bearer ${token}`,

        'Content-Type':
          'application/json'
      },

      body:
        JSON.stringify({
          fields:
            productFields(
              product
            )
        })
    });

  if (
    response.status === 409 ||
    response.status === 412
  ) {
    throw new StoreAdminError(
      409,
      'PRODUCT_STALE',
      'O produto foi alterado por outra operação.'
    );
  }

  if (!response.ok) {
    throw new StoreAdminError(
      502,
      'FIRESTORE_UPDATE_FAILED',
      'O Firestore recusou a atualização do produto.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return {
    firestore: 'UPDATED',
    product:
      normalizeStoreAdminProduct(
        mapDocument(
          await response.json()
        )
      )
  };
}

async function archiveProduct(
  input
) {
  requireOwnerConfirmation(
    input
  );

  requireDryRunToken(
    input
  );

  const documentId =
    String(input.id || '')
      .trim()
      .toLowerCase();

  const sourceUpdateTime =
    String(
      input.sourceUpdateTime || ''
    );

  const tokenValue =
    tokenContract(
      'archive',
      {
        id: documentId,
        status: 'inactive'
      },
      sourceUpdateTime
    );

  if (
    !verifyProductDryRunToken(
      input.dryRunToken,
      tokenValue
    )
  ) {
    throw new StoreAdminError(
      409,
      'DRY_RUN_REQUIRED',
      'O produto mudou depois do DRY RUN.'
    );
  }

  const currentRaw =
    await readProductDocument(
      documentId
    );

  if (!currentRaw) {
    throw new StoreAdminError(
      404,
      'PRODUCT_NOT_FOUND',
      'Produto não encontrado.'
    );
  }

  const current =
    normalizeStoreAdminProduct(
      currentRaw
    );

  if (
    current.productType !==
    'affiliate'
  ) {
    throw new StoreAdminError(
      400,
      'PRODUCT_NOT_AFFILIATE',
      'Somente produtos afiliados podem ser arquivados por este módulo.'
    );
  }

  if (
    current.updateTime !==
    sourceUpdateTime
  ) {
    throw new StoreAdminError(
      409,
      'PRODUCT_STALE',
      'O produto foi alterado depois do DRY RUN.'
    );
  }

  const token =
    await accessToken();

  const url =
    documentUrl(
      documentId
    );

  url.searchParams.append(
    'updateMask.fieldPaths',
    'status'
  );

  url.searchParams.set(
    'currentDocument.updateTime',
    sourceUpdateTime
  );

  const response =
    await fetch(url, {
      method: 'PATCH',

      headers: {
        Authorization:
          `Bearer ${token}`,

        'Content-Type':
          'application/json'
      },

      body:
        JSON.stringify({
          fields: {
            status:
              stringValue(
                'inactive'
              )
          }
        })
    });

  if (
    response.status === 409 ||
    response.status === 412
  ) {
    throw new StoreAdminError(
      409,
      'PRODUCT_STALE',
      'O produto foi alterado por outra operação.'
    );
  }

  if (!response.ok) {
    throw new StoreAdminError(
      502,
      'FIRESTORE_ARCHIVE_FAILED',
      'O Firestore recusou o arquivamento do produto.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return {
    firestore: 'ARCHIVED',
    product:
      normalizeStoreAdminProduct(
        mapDocument(
          await response.json()
        )
      )
  };
}

export default async function handler(
  req,
  res
) {
  res.setHeader(
    'Cache-Control',
    'no-store'
  );

  res.setHeader(
    'Vary',
    'Origin, Sec-Fetch-Site'
  );

  res.setHeader(
    'X-Content-Type-Options',
    'nosniff'
  );

  try {
    if (req.method !== 'POST') {
      throw new StoreAdminError(
        405,
        'METHOD_NOT_ALLOWED',
        'Método não permitido.'
      );
    }

    if (
      !String(
        req.headers['content-type'] ||
        ''
      )
        .toLowerCase()
        .startsWith(
          'application/json'
        )
    ) {
      throw new StoreAdminError(
        415,
        'UNSUPPORTED_MEDIA_TYPE',
        'Use application/json.'
      );
    }

    requireOrigin(req);

    const session =
      requireSession(
        req,
        secret()
      );

    requireCsrf(
      req,
      session
    );

    const input =
      body(req);

    if (
      input.action ===
      'overview'
    ) {
      return res
        .status(200)
        .json(
          await overview()
        );
    }

    if (
      input.action ===
      'dry-run-product'
    ) {
      return res
        .status(200)
        .json(
          await productDryRun(
            input
          )
        );
    }

    if (
      input.action ===
      'create-product'
    ) {
      return res
        .status(201)
        .json(
          await createProduct(
            input
          )
        );
    }

    if (
      input.action ===
      'update-product'
    ) {
      return res
        .status(200)
        .json(
          await patchProduct(
            input
          )
        );
    }

    if (
      input.action ===
      'archive-product'
    ) {
      return res
        .status(200)
        .json(
          await archiveProduct(
            input
          )
        );
    }

    throw new StoreAdminError(
      400,
      'INVALID_ACTION',
      'Ação inválida.'
    );
  } catch (error) {
    const status =
      [
        400,
        401,
        403,
        404,
        405,
        409,
        415,
        502
      ].includes(error?.status)
        ? error.status
        : 500;

    if (status === 500) {
      console.error(
        '[RQS ADMIN STORE]',
        error instanceof Error
          ? error.message
          : 'Unknown error'
      );
    }

    return res
      .status(status)
      .json({
        message:
          status === 500
            ? 'Falha interna no módulo Neon Store.'
            : error.message,

        ...(error?.code
          ? {
              code:
                error.code
            }
          : {}),

        ...(error?.details || {})
      });
  }
}
