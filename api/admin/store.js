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

const AFFILIATE_MERCHANTS = new Set([
  'shein',
  'mercado-livre',
  'amazon',
  'aliexpress'
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

class StoreAdminError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
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

function resolveMerchant(value) {
  const url = cleanUrl(value);

  if (!url) return 'unknown';

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return 'unknown';
  }

  if (
    parsed.protocol !== 'http:' &&
    parsed.protocol !== 'https:'
  ) {
    return 'unknown';
  }

  const host = parsed.hostname.toLowerCase();

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
    name: String(value?.name || '').trim(),
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
    resolveMerchant(destinationUrl);

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
    warnings.push('PT product name is missing.');
  }

  if (!en.name) {
    warnings.push('EN product name is missing.');
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

    content: {
      pt,
      en
    },

    warnings
  };
}

async function readProducts() {
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
      'Não foi possível autenticar a leitura do catálogo.'
    );
  }

  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/` +
    `${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents/` +
    `${encodeURIComponent(COLLECTION)}`
  );

  url.searchParams.set('pageSize', '300');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const payload =
      await response.json().catch(() => ({}));

    throw new StoreAdminError(
      502,
      'FIRESTORE_READ_FAILED',
      'O Firestore recusou a leitura do catálogo.',
      {
        firestoreStatus: response.status,
        firestoreCode:
          payload?.error?.status || null
      }
    );
  }

  const payload = await response.json();

  return (payload.documents || [])
    .map(mapDocument)
    .map(normalizeStoreAdminProduct)
    .sort((left, right) => {
      if (
        left.visibleInStore !==
        right.visibleInStore
      ) {
        return left.visibleInStore ? -1 : 1;
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
    merchantCounts[product.merchant] =
      (merchantCounts[product.merchant] || 0) + 1;
  }

  const visibleAffiliateProducts =
    products.filter(
      product => product.visibleInStore
    ).length;

  return {
    totalProducts: products.length,
    visibleAffiliateProducts,
    hiddenProducts:
      products.length -
      visibleAffiliateProducts,
    productsWithWarnings:
      products.filter(
        product => product.warnings.length > 0
      ).length,
    legacyDestinationProducts:
      products.filter(
        product =>
          product.legacyDestinationField
      ).length,
    missingShortDescriptions:
      products.filter(
        product =>
          !product.content.pt.shortDescription ||
          !product.content.en.shortDescription
      ).length,
    merchantCounts
  };
}

async function overview() {
  const products = await readProducts();

  return {
    generatedAt: new Date().toISOString(),
    collection: COLLECTION,
    readOnly: true,
    summary: buildSummary(products),
    products
  };
}

export default async function handler(req, res) {
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
        req.headers['content-type'] || ''
      )
        .toLowerCase()
        .startsWith('application/json')
    ) {
      throw new StoreAdminError(
        415,
        'UNSUPPORTED_MEDIA_TYPE',
        'Use application/json.'
      );
    }

    requireOrigin(req);

    const session =
      requireSession(req, secret());

    requireCsrf(req, session);

    const input = body(req);

    if (input.action === 'overview') {
      return res.status(200).json(
        await overview()
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
        405,
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

    return res.status(status).json({
      message:
        status === 500
          ? 'Falha interna no módulo Neon Store.'
          : error.message,
      ...(error?.code
        ? { code: error.code }
        : {}),
      ...(error?.details || {})
    });
  }
}
