import {
  createHmac,
  randomUUID,
  timingSafeEqual
} from 'node:crypto';

import { google } from 'googleapis';

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  'raquel-synths-platform';

const COLLECTION = 'store-campaigns';
const DRY_RUN_TTL = 10 * 60 * 1000;

const MERCHANTS = new Set([
  'shein',
  'mercado-livre',
  'amazon',
  'aliexpress'
]);

const PLACEMENTS = new Set([
  'hero-signal',
  'current-signal'
]);

const STATUSES = new Set([
  'draft',
  'scheduled',
  'active',
  'paused',
  'expired'
]);

const MERCHANT_LABELS = {
  shein: 'SHEIN',
  'mercado-livre': 'Mercado Livre',
  amazon: 'Amazon',
  aliexpress: 'AliExpress'
};

const UPDATE_FIELDS = [
  'status',
  'merchant',
  'placement',
  'priority',
  'destinationUrl',
  'image',
  'startAt',
  'endAt',
  'linkedProductIds',
  'content'
];

class CampaignError extends Error {
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

function cleanUrl(value) {
  return String(value || '')
    .trim()
    .replace(/^["']+|["']+$/g, '');
}

export function resolveStoreCampaignMerchant(value) {
  const raw = cleanUrl(value);

  if (!raw) return 'unknown';

  let url;

  try {
    url = new URL(raw);
  } catch {
    return 'unknown';
  }

  if (url.protocol !== 'https:') {
    return 'unknown';
  }

  const host = url.hostname.toLowerCase();

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

  return 'unknown';
}

function localizedContent(value = {}) {
  return {
    kicker:
      String(value.kicker || '').trim(),

    title:
      String(value.title || '').trim(),

    offerLabel:
      String(value.offerLabel || '').trim(),

    supportingText:
      String(value.supportingText || '').trim(),

    ctaLabel:
      String(value.ctaLabel || '').trim()
  };
}

function normalizeDate(value) {
  const raw = String(value || '').trim();

  if (!raw) return null;

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function validImage(value) {
  const raw = String(value || '').trim();

  if (!raw) return false;

  if (/^assets\/[^\s]+$/u.test(raw)) {
    return true;
  }

  try {
    return new URL(raw).protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeLinkedProductIds(value) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map(item => String(item || '').trim())
        .filter(Boolean)
    )
  ];
}

function normalizeCampaignDraft(input = {}) {
  return {
    id:
      String(input.id || '')
        .trim()
        .toLowerCase(),

    status:
      String(input.status || '')
        .trim()
        .toLowerCase(),

    merchant:
      String(input.merchant || '')
        .trim()
        .toLowerCase(),

    placement:
      String(input.placement || '')
        .trim()
        .toLowerCase(),

    priority:
      Number(input.priority),

    destinationUrl:
      cleanUrl(input.destinationUrl),

    image:
      String(input.image || '').trim(),

    startAt:
      normalizeDate(input.startAt),

    endAt:
      normalizeDate(input.endAt),

    linkedProductIds:
      normalizeLinkedProductIds(
        input.linkedProductIds
      ),

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

export function validateStoreCampaignDraft(
  input = {}
) {
  const campaign =
    normalizeCampaignDraft(input);

  const blocked = [];
  const warnings = [];

  if (
    !/^[a-z0-9][a-z0-9-]{2,119}$/u
      .test(campaign.id)
  ) {
    blocked.push(
      'Campaign ID must be a lowercase slug with 3–120 characters.'
    );
  }

  if (!STATUSES.has(campaign.status)) {
    blocked.push(
      'Campaign status is invalid.'
    );
  }

  if (!MERCHANTS.has(campaign.merchant)) {
    blocked.push(
      'Campaign merchant is invalid.'
    );
  }

  if (!PLACEMENTS.has(campaign.placement)) {
    blocked.push(
      'Campaign placement is invalid.'
    );
  }

  if (
    !Number.isInteger(campaign.priority) ||
    campaign.priority < 0 ||
    campaign.priority > 9999
  ) {
    blocked.push(
      'Campaign priority must be an integer between 0 and 9999.'
    );
  }

  const destinationMerchant =
    resolveStoreCampaignMerchant(
      campaign.destinationUrl
    );

  if (!MERCHANTS.has(destinationMerchant)) {
    blocked.push(
      'Campaign destination must belong to a supported affiliate merchant.'
    );
  } else if (
    campaign.merchant !==
    destinationMerchant
  ) {
    blocked.push(
      'Campaign merchant does not match destination URL.'
    );
  }

  if (
    campaign.placement === 'current-signal' &&
    !validImage(campaign.image)
  ) {
    blocked.push(
      'Current Signal campaigns require a valid https image or assets/ path.'
    );
  }

  if (
    campaign.image &&
    !validImage(campaign.image)
  ) {
    blocked.push(
      'Campaign image is invalid.'
    );
  }

  if (
    String(input.startAt || '').trim() &&
    !campaign.startAt
  ) {
    blocked.push(
      'Campaign startAt is invalid.'
    );
  }

  if (
    String(input.endAt || '').trim() &&
    !campaign.endAt
  ) {
    blocked.push(
      'Campaign endAt is invalid.'
    );
  }

  if (
    campaign.status === 'scheduled' &&
    !campaign.startAt
  ) {
    blocked.push(
      'Scheduled campaigns require startAt.'
    );
  }

  if (
    campaign.startAt &&
    campaign.endAt &&
    Date.parse(campaign.endAt) <=
      Date.parse(campaign.startAt)
  ) {
    blocked.push(
      'Campaign endAt must be later than startAt.'
    );
  }

  for (
    const [language, content]
    of Object.entries(campaign.content)
  ) {
    const label =
      language.toUpperCase();

    if (!content.title) {
      blocked.push(
        `${label} campaign title is required.`
      );
    }

    if (content.title.length > 160) {
      blocked.push(
        `${label} campaign title exceeds 160 characters.`
      );
    }

    if (!content.supportingText) {
      blocked.push(
        `${label} supportingText is required.`
      );
    }

    if (
      content.supportingText.length >
      500
    ) {
      blocked.push(
        `${label} supportingText exceeds 500 characters.`
      );
    }

    if (!content.ctaLabel) {
      blocked.push(
        `${label} CTA label is required.`
      );
    }

    if (
      content.ctaLabel.length > 80
    ) {
      blocked.push(
        `${label} CTA label exceeds 80 characters.`
      );
    }
  }

  if (
    campaign.endAt &&
    Date.parse(campaign.endAt) <= Date.now()
  ) {
    warnings.push(
      'Campaign endAt is already in the past and will resolve as expired.'
    );
  }

  return {
    status:
      blocked.length
        ? 'BLOCKED'
        : 'PASS',

    blocked,
    warnings,
    payload:
      campaign
  };
}

export function effectiveStoreCampaignStatus(
  campaign,
  now = Date.now()
) {
  const configured =
    String(campaign?.status || '')
      .toLowerCase();

  if (
    configured === 'draft' ||
    configured === 'paused' ||
    configured === 'expired'
  ) {
    return configured;
  }

  const start =
    campaign?.startAt
      ? Date.parse(campaign.startAt)
      : null;

  const end =
    campaign?.endAt
      ? Date.parse(campaign.endAt)
      : null;

  if (
    Number.isFinite(end) &&
    now >= end
  ) {
    return 'expired';
  }

  if (
    Number.isFinite(start) &&
    now < start
  ) {
    return 'scheduled';
  }

  if (
    configured === 'scheduled' ||
    configured === 'active'
  ) {
    return 'active';
  }

  return 'draft';
}

function parseFirestoreValue(value = {}) {
  if ('stringValue' in value) {
    return value.stringValue;
  }

  if ('integerValue' in value) {
    return Number(value.integerValue);
  }

  if ('doubleValue' in value) {
    return Number(value.doubleValue);
  }

  if ('booleanValue' in value) {
    return Boolean(value.booleanValue);
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

function mapFirestoreDocument(document) {
  const id =
    String(document?.name || '')
      .split('/')
      .pop() || '';

  return {
    id,
    updateTime:
      document?.updateTime || null,

    ...Object.fromEntries(
      Object.entries(
        document?.fields || {}
      ).map(([key, value]) => [
        key,
        parseFirestoreValue(value)
      ])
    )
  };
}

export function normalizeStoreCampaign(
  raw = {},
  now = Date.now()
) {
  const validation =
    validateStoreCampaignDraft(raw);

  const campaign =
    validation.payload;

  const destinationMerchant =
    resolveStoreCampaignMerchant(
      campaign.destinationUrl
    );

  const warnings = [
    ...validation.warnings
  ];

  if (
    MERCHANTS.has(campaign.merchant) &&
    MERCHANTS.has(destinationMerchant) &&
    campaign.merchant !== destinationMerchant
  ) {
    warnings.push(
      'Stored merchant does not match destination URL.'
    );
  }

  return {
    ...campaign,

    merchantLabel:
      MERCHANT_LABELS[
        campaign.merchant
      ] || campaign.merchant,

    effectiveStatus:
      effectiveStoreCampaignStatus(
        campaign,
        now
      ),

    updateTime:
      raw.updateTime || null,

    warnings: [
      ...new Set(warnings)
    ]
  };
}

function publicCampaign(campaign) {
  return {
    id:
      campaign.id,

    merchant:
      campaign.merchant,

    merchantLabel:
      campaign.merchantLabel,

    placement:
      campaign.placement,

    priority:
      campaign.priority,

    destinationUrl:
      campaign.destinationUrl,

    image:
      campaign.image,

    content:
      campaign.content
  };
}

export function selectPublicStoreCampaigns(
  campaigns,
  now = Date.now()
) {
  const normalized =
    campaigns
      .map(item =>
        normalizeStoreCampaign(
          item,
          now
        )
      )
      .filter(item =>
        item.effectiveStatus ===
          'active' &&
        MERCHANTS.has(
          item.merchant
        ) &&
        PLACEMENTS.has(
          item.placement
        )
      );

  const pick =
    placement =>
      normalized
        .filter(item =>
          item.placement ===
          placement
        )
        .sort((left, right) => {
          if (
            right.priority !==
            left.priority
          ) {
            return (
              right.priority -
              left.priority
            );
          }

          const rightStart =
            right.startAt
              ? Date.parse(
                  right.startAt
                )
              : 0;

          const leftStart =
            left.startAt
              ? Date.parse(
                  left.startAt
                )
              : 0;

          return (
            rightStart -
            leftStart
          );
        })[0] || null;

  return {
    heroSignal:
      pick('hero-signal')
        ? publicCampaign(
            pick('hero-signal')
          )
        : null,

    currentSignal:
      pick('current-signal')
        ? publicCampaign(
            pick('current-signal')
          )
        : null
  };
}

function firestoreAuth() {
  const raw =
    process.env
      .FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new CampaignError(
      500,
      'MISSING_FIRESTORE_CONFIGURATION',
      'Credencial Firestore não configurada.'
    );
  }

  let credentials;

  try {
    credentials =
      JSON.parse(raw);

    if (
      credentials.private_key
    ) {
      credentials.private_key =
        credentials.private_key
          .replace(/\\n/g, '\n');
    }
  } catch {
    throw new CampaignError(
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
    throw new CampaignError(
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

async function readCampaignDocument(
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
    throw new CampaignError(
      502,
      'CAMPAIGN_READ_FAILED',
      'O Firestore recusou a leitura da campanha.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return mapFirestoreDocument(
    await response.json()
  );
}

export async function listStoreCampaigns() {
  const token =
    await accessToken();

  const url =
    collectionUrl();

  url.searchParams.set(
    'pageSize',
    '100'
  );

  const response =
    await fetch(url, {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    });

  if (!response.ok) {
    throw new CampaignError(
      502,
      'CAMPAIGN_LIST_FAILED',
      'O Firestore recusou a leitura das campanhas.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  const payload =
    await response.json();

  return (
    payload.documents || []
  )
    .map(mapFirestoreDocument)
    .map(item =>
      normalizeStoreCampaign(item)
    )
    .sort((left, right) => {
      if (
        right.priority !==
        left.priority
      ) {
        return (
          right.priority -
          left.priority
        );
      }

      return left.id.localeCompare(
        right.id
      );
    });
}

export async function getPublicStoreCampaignSelection() {
  const campaigns =
    await listStoreCampaigns();

  return selectPublicStoreCampaigns(
    campaigns
  );
}

function stringValue(value) {
  return {
    stringValue:
      String(value || '')
  };
}

function integerValue(value) {
  return {
    integerValue:
      String(
        Math.trunc(Number(value))
      )
  };
}

function arrayValue(values) {
  return {
    arrayValue: {
      values:
        values.map(item =>
          stringValue(item)
        )
    }
  };
}

function mapValue(fields) {
  return {
    mapValue: {
      fields
    }
  };
}

function campaignFields(campaign) {
  return {
    status:
      stringValue(
        campaign.status
      ),

    merchant:
      stringValue(
        campaign.merchant
      ),

    placement:
      stringValue(
        campaign.placement
      ),

    priority:
      integerValue(
        campaign.priority
      ),

    destinationUrl:
      stringValue(
        campaign.destinationUrl
      ),

    image:
      stringValue(
        campaign.image
      ),

    startAt:
      stringValue(
        campaign.startAt || ''
      ),

    endAt:
      stringValue(
        campaign.endAt || ''
      ),

    linkedProductIds:
      arrayValue(
        campaign.linkedProductIds
      ),

    content:
      mapValue({
        pt:
          mapValue({
            kicker:
              stringValue(
                campaign.content.pt
                  .kicker
              ),

            title:
              stringValue(
                campaign.content.pt
                  .title
              ),

            offerLabel:
              stringValue(
                campaign.content.pt
                  .offerLabel
              ),

            supportingText:
              stringValue(
                campaign.content.pt
                  .supportingText
              ),

            ctaLabel:
              stringValue(
                campaign.content.pt
                  .ctaLabel
              )
          }),

        en:
          mapValue({
            kicker:
              stringValue(
                campaign.content.en
                  .kicker
              ),

            title:
              stringValue(
                campaign.content.en
                  .title
              ),

            offerLabel:
              stringValue(
                campaign.content.en
                  .offerLabel
              ),

            supportingText:
              stringValue(
                campaign.content.en
                  .supportingText
              ),

            ctaLabel:
              stringValue(
                campaign.content.en
                  .ctaLabel
              )
          })
      })
  };
}

function digest(value, key) {
  return createHmac(
    'sha256',
    key
  )
    .update(
      JSON.stringify(value)
    )
    .digest('base64url');
}

export function makeCampaignDryRunToken(
  value,
  key
) {
  const payload =
    Buffer.from(
      JSON.stringify({
        digest:
          digest(value, key),

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
      key
    )
      .update(
        `store-campaign:${payload}`
      )
      .digest('base64url');

  return `${payload}.${signature}`;
}

export function verifyCampaignDryRunToken(
  token,
  value,
  key
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
      key
    )
      .update(
        `store-campaign:${payload}`
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
        digest(value, key)
    );
  } catch {
    return false;
  }
}

function tokenContract(
  operation,
  campaign,
  sourceUpdateTime
) {
  return {
    operation,
    campaign,
    sourceUpdateTime:
      sourceUpdateTime || null
  };
}

function blockedDryRun(
  operation,
  validation,
  sourceUpdateTime = null
) {
  return {
    operation,
    status: 'BLOCKED',

    blocked:
      validation.blocked,

    warnings:
      validation.warnings,

    documentId:
      validation.payload.id,

    documentPath:
      `${COLLECTION}/${validation.payload.id}`,

    sourceUpdateTime,

    firestoreWrites: 0,
    dryRunToken: null,

    writePlan: {
      operation:
        operation === 'create'
          ? 'CREATE'
          : 'UPDATE',

      fields:
        UPDATE_FIELDS
    },

    preview:
      validation.payload
  };
}

export async function dryRunStoreCampaign(
  input,
  key
) {
  const operation =
    input.operation;

  if (
    operation !== 'create' &&
    operation !== 'update'
  ) {
    throw new CampaignError(
      400,
      'INVALID_CAMPAIGN_OPERATION',
      'Operação de campanha inválida.'
    );
  }

  const validation =
    validateStoreCampaignDraft(
      input.campaign
    );

  if (
    validation.status ===
    'BLOCKED'
  ) {
    return blockedDryRun(
      operation,
      validation
    );
  }

  const campaign =
    validation.payload;

  const current =
    await readCampaignDocument(
      campaign.id
    );

  if (
    operation === 'create' &&
    current
  ) {
    return {
      ...blockedDryRun(
        operation,
        validation
      ),

      blocked: [
        'Campaign ID already exists.'
      ]
    };
  }

  if (
    operation === 'update' &&
    !current
  ) {
    return {
      ...blockedDryRun(
        operation,
        validation
      ),

      blocked: [
        'Campaign does not exist.'
      ]
    };
  }

  let sourceUpdateTime = null;

  if (
    operation === 'update'
  ) {
    sourceUpdateTime =
      current.updateTime;

    if (
      !input.sourceUpdateTime ||
      input.sourceUpdateTime !==
        sourceUpdateTime
    ) {
      return {
        ...blockedDryRun(
          operation,
          validation,
          sourceUpdateTime
        ),

        blocked: [
          'Campaign changed after it was loaded. Refresh before continuing.'
        ]
      };
    }
  }

  const contract =
    tokenContract(
      operation,
      campaign,
      sourceUpdateTime
    );

  return {
    operation,
    status: 'PASS',
    blocked: [],
    warnings:
      validation.warnings,

    documentId:
      campaign.id,

    documentPath:
      `${COLLECTION}/${campaign.id}`,

    sourceUpdateTime,

    firestoreWrites: 0,

    dryRunToken:
      makeCampaignDryRunToken(
        contract,
        key
      ),

    writePlan: {
      operation:
        operation === 'create'
          ? 'CREATE'
          : 'UPDATE',

      fields:
        UPDATE_FIELDS
    },

    preview: {
      ...campaign,

      effectiveStatus:
        effectiveStoreCampaignStatus(
          campaign
        )
    }
  };
}

export async function createStoreCampaign(
  input,
  key
) {
  const validation =
    validateStoreCampaignDraft(
      input.campaign
    );

  if (
    validation.status !== 'PASS'
  ) {
    throw new CampaignError(
      400,
      'CAMPAIGN_VALIDATION_FAILED',
      validation.blocked.join(' ')
    );
  }

  const campaign =
    validation.payload;

  const contract =
    tokenContract(
      'create',
      campaign,
      null
    );

  if (
    !verifyCampaignDryRunToken(
      input.dryRunToken,
      contract,
      key
    )
  ) {
    throw new CampaignError(
      409,
      'DRY_RUN_REQUIRED',
      'A campanha mudou depois do DRY RUN.'
    );
  }

  const existing =
    await readCampaignDocument(
      campaign.id
    );

  if (existing) {
    throw new CampaignError(
      409,
      'CAMPAIGN_ALREADY_EXISTS',
      'O campaignId já existe.'
    );
  }

  const token =
    await accessToken();

  const url =
    collectionUrl();

  url.searchParams.set(
    'documentId',
    campaign.id
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
            campaignFields(
              campaign
            )
        })
    });

  if (response.status === 409) {
    throw new CampaignError(
      409,
      'CAMPAIGN_ALREADY_EXISTS',
      'O campaignId já existe.'
    );
  }

  if (!response.ok) {
    throw new CampaignError(
      502,
      'CAMPAIGN_CREATE_FAILED',
      'O Firestore recusou a criação da campanha.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return {
    firestore: 'CREATED',

    campaign:
      normalizeStoreCampaign(
        mapFirestoreDocument(
          await response.json()
        )
      )
  };
}

export async function updateStoreCampaign(
  input,
  key
) {
  const validation =
    validateStoreCampaignDraft(
      input.campaign
    );

  if (
    validation.status !== 'PASS'
  ) {
    throw new CampaignError(
      400,
      'CAMPAIGN_VALIDATION_FAILED',
      validation.blocked.join(' ')
    );
  }

  const campaign =
    validation.payload;

  const sourceUpdateTime =
    String(
      input.sourceUpdateTime || ''
    );

  const contract =
    tokenContract(
      'update',
      campaign,
      sourceUpdateTime
    );

  if (
    !verifyCampaignDryRunToken(
      input.dryRunToken,
      contract,
      key
    )
  ) {
    throw new CampaignError(
      409,
      'DRY_RUN_REQUIRED',
      'A campanha mudou depois do DRY RUN.'
    );
  }

  const current =
    await readCampaignDocument(
      campaign.id
    );

  if (!current) {
    throw new CampaignError(
      404,
      'CAMPAIGN_NOT_FOUND',
      'Campanha não encontrada.'
    );
  }

  if (
    current.updateTime !==
    sourceUpdateTime
  ) {
    throw new CampaignError(
      409,
      'CAMPAIGN_STALE',
      'A campanha foi alterada depois do DRY RUN.'
    );
  }

  const token =
    await accessToken();

  const url =
    documentUrl(
      campaign.id
    );

  for (
    const field
    of UPDATE_FIELDS
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
            campaignFields(
              campaign
            )
        })
    });

  if (
    response.status === 409 ||
    response.status === 412
  ) {
    throw new CampaignError(
      409,
      'CAMPAIGN_STALE',
      'A campanha foi alterada por outra operação.'
    );
  }

  if (!response.ok) {
    throw new CampaignError(
      502,
      'CAMPAIGN_UPDATE_FAILED',
      'O Firestore recusou a atualização da campanha.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return {
    firestore: 'UPDATED',

    campaign:
      normalizeStoreCampaign(
        mapFirestoreDocument(
          await response.json()
        )
      )
  };
}
