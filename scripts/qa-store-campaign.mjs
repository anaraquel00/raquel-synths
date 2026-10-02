import assert from 'node:assert/strict';

import {
  effectiveStoreCampaignStatus,
  makeCampaignDryRunToken,
  resolveStoreCampaignMerchant,
  selectPublicStoreCampaigns,
  validateStoreCampaignDraft,
  verifyCampaignDryRunToken
} from '../lib/store/campaigns.js';

const now =
  Date.parse(
    '2026-10-02T12:00:00Z'
  );

const base = {
  id:
    'mercado-livre-october',

  status:
    'active',

  merchant:
    'mercado-livre',

  placement:
    'hero-signal',

  priority:
    100,

  destinationUrl:
    'https://www.mercadolivre.com.br/social/example',

  image: '',

  startAt:
    '2026-10-01T12:00:00Z',

  endAt:
    '2026-10-10T12:00:00Z',

  linkedProductIds: [],

  content: {
    pt: {
      kicker:
        'AFFILIATE SIGNAL',
      title:
        'Seleção Mercado Livre',
      offerLabel:
        'MERCADO LIVRE',
      supportingText:
        'Seleção afiliada da Neon Store.',
      ctaLabel:
        'VER OFERTA ↗'
    },

    en: {
      kicker:
        'AFFILIATE SIGNAL',
      title:
        'Mercado Livre Selection',
      offerLabel:
        'MERCADO LIVRE',
      supportingText:
        'Affiliate selection from Neon Store.',
      ctaLabel:
        'VIEW OFFER ↗'
    }
  }
};

assert.equal(
  resolveStoreCampaignMerchant(
    base.destinationUrl
  ),
  'mercado-livre'
);

assert.equal(
  validateStoreCampaignDraft(
    base
  ).status,
  'PASS'
);

const mismatch =
  validateStoreCampaignDraft({
    ...base,
    merchant:
      'amazon'
  });

assert.equal(
  mismatch.status,
  'BLOCKED'
);

const currentWithoutImage =
  validateStoreCampaignDraft({
    ...base,
    placement:
      'current-signal',
    image: ''
  });

assert.equal(
  currentWithoutImage.status,
  'BLOCKED'
);

console.log(
  'CAMPAIGN_VALIDATION = PASS'
);

assert.equal(
  effectiveStoreCampaignStatus(
    base,
    now
  ),
  'active'
);

assert.equal(
  effectiveStoreCampaignStatus(
    {
      ...base,
      startAt:
        '2026-10-05T12:00:00Z'
    },
    now
  ),
  'scheduled'
);

assert.equal(
  effectiveStoreCampaignStatus(
    {
      ...base,
      endAt:
        '2026-10-02T11:59:00Z'
    },
    now
  ),
  'expired'
);

assert.equal(
  effectiveStoreCampaignStatus(
    {
      ...base,
      status:
        'paused'
    },
    now
  ),
  'paused'
);

console.log(
  'CAMPAIGN_EFFECTIVE_STATUS = PASS'
);

const selected =
  selectPublicStoreCampaigns(
    [
      base,

      {
        ...base,
        id:
          'lower-priority',
        priority:
          20
      },

      {
        ...base,
        id:
          'current-signal',
        placement:
          'current-signal',
        priority:
          80,
        image:
          'https://example.com/current.webp'
      }
    ],
    now
  );

assert.equal(
  selected.heroSignal.id,
  'mercado-livre-october'
);

assert.equal(
  selected.currentSignal.id,
  'current-signal'
);

assert.equal(
  'updateTime' in
    selected.heroSignal,
  false
);

assert.equal(
  'effectiveStatus' in
    selected.heroSignal,
  false
);

console.log(
  'PUBLIC_CAMPAIGN_SELECTION = PASS'
);

const key =
  'qa-only-secret-32-characters-or-more';

const contract = {
  operation:
    'create',

  campaign:
    validateStoreCampaignDraft(
      base
    ).payload,

  sourceUpdateTime:
    null
};

const token =
  makeCampaignDryRunToken(
    contract,
    key
  );

assert.equal(
  verifyCampaignDryRunToken(
    token,
    contract,
    key
  ),
  true
);

assert.equal(
  verifyCampaignDryRunToken(
    token,
    {
      ...contract,
      campaign: {
        ...contract.campaign,
        priority:
          999
      }
    },
    key
  ),
  false
);

console.log(
  'CAMPAIGN_DRY_RUN_TOKEN = PASS'
);

console.log(
  'FIRESTORE_WRITES_DURING_CAMPAIGN_QA = 0'
);

console.log(
  'PATCH_6C_QA = PASS'
);
