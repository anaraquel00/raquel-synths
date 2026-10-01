import assert from 'node:assert/strict';

import {
  createDeliveryFoundation
} from '../lib/social/deliveries.js';

import {
  evaluateFacebookPilot,
  publishFacebookPilot
} from '../lib/social/publish-facebook.js';

import {
  evaluateInstagramPilot,
  publishInstagramPilot
} from '../lib/social/publish-instagram.js';

import {
  facebookWriteGateDiagnostics,
  instagramProductionWriteGateDiagnostics,
  instagramProductionWriteGate,
  instagramWriteGateDiagnostics
} from '../lib/social/write-gates.js';

const SOURCE_ID = 'discography/ep-the-blueprint-sessions-v023';

const source = {
  sourceType: 'music_release',
  sourceId: SOURCE_ID,
  sourceUrl: 'firestore://discography/ep-the-blueprint-sessions-v023',
  sourceRevision: 'qa-v023-revision',
  language: 'pt-BR',
  title: 'THE BLUEPRINT SESSIONS Vol.023 - FORGOTTEN BLUEPRINTS',
  canonicalUrl: 'https://raquelsynths.com/discografia',
  primaryImage: 'https://i1.sndcdn.com/qa-rqs-cover.jpg',
  musicDeepLinkUrl:
    'https://raquelsynths.com/play/ep-the-blueprint-sessions-v023'
};

const basePackage = {
  id: 'qa-multidestination-v023',
  sourceType: 'music_release',
  sourceId: SOURCE_ID,
  sourceUrl: source.sourceUrl,
  sourceRevision: source.sourceRevision,
  language: 'pt-BR',
  socialAssetUrl: source.primaryImage,
  socialAssetType: 'IMAGE',
  instagramCaption: 'RQS Vol.023 — Instagram QA',
  facebookCaption: 'RQS Vol.023 — Facebook QA',
  cta: 'Ouça agora',
  destinationUrl: source.musicDeepLinkUrl,
  utmCampaign: 'blueprint_v023',
  utmContent: 'multidestination_qa',
  destinations: ['instagram', 'facebook'],
  createdAt: '2026-10-01T12:00:00.000Z',
  approvedAt: '2026-10-01T12:05:00.000Z',
  status: 'APPROVED',
  updateTime: 'package-0'
};

const env = {
  SOCIAL_PUBLISHING_WRITES_ENABLED: 'true',

  SOCIAL_FACEBOOK_PRODUCTION_ENABLED: 'true',
  SOCIAL_INSTAGRAM_PRODUCTION_ENABLED: 'true',

  VERCEL_ENV: 'production',
  VERCEL_TARGET_ENV: 'production',

  META_APP_ID: 'qa-app-id',
  META_APP_SECRET: 'qa-app-secret',
  META_FACEBOOK_PAGE_ID: '2222222222',
  META_FACEBOOK_PAGE_ACCESS_TOKEN: 'qa-page-token',
  META_IG_USER_ID: '3333333333'
};

const readyMeta = {
  graphApiVersion: 'v26.0',
  checkedAt: '2026-10-01T12:00:00.000Z',
  publishingEnabled: true,
  token: {
    valid: true,
    appIdMatches: true,
    expiresAt: null,
    dataAccessExpiresAt: null
  },
  relationship: {
    status: 'MATCH'
  },
  facebook: {
    platform: 'facebook',
    status: 'READY',
    missingConfiguration: [],
    requiredPermissions: [],
    missingPermissions: [],
    identity: {
      id: env.META_FACEBOOK_PAGE_ID,
      name: 'RaQuel Synths'
    },
    capabilities: {
      feed: true,
      reels: true,
      stories: false
    },
    checks: []
  },
  instagram: {
    platform: 'instagram',
    status: 'READY',
    missingConfiguration: [],
    requiredPermissions: [],
    missingPermissions: [],
    identity: {
      id: env.META_IG_USER_ID,
      username: 'rqs_synths'
    },
    capabilities: {
      feed: true,
      reels: true,
      stories: false
    },
    checks: []
  }
};

function makeRepository({
  packageValue = basePackage,
  sourceValue = source,
  initialDeliveries = {}
} = {}) {
  let currentPackage = { ...packageValue };
  let revision = 0;

  const deliveries = {
    instagram: initialDeliveries.instagram
      ? { ...initialDeliveries.instagram }
      : null,
    facebook: initialDeliveries.facebook
      ? { ...initialDeliveries.facebook }
      : null
  };

  const events = [];

  function exposedPackage() {
    return {
      ...currentPackage,
      updateTime: `package-${revision}`,
      instagramDelivery: deliveries.instagram
        ? { ...deliveries.instagram }
        : null,
      facebookDelivery: deliveries.facebook
        ? { ...deliveries.facebook }
        : null
    };
  }

  return {
    events,

    snapshot() {
      return {
        package: exposedPackage(),
        deliveries: {
          instagram: deliveries.instagram
            ? { ...deliveries.instagram }
            : null,
          facebook: deliveries.facebook
            ? { ...deliveries.facebook }
            : null
        }
      };
    },

    async getPackage() {
      return exposedPackage();
    },

    async resolveSource() {
      return sourceValue;
    },

    async getDelivery(_packageId, destination) {
      return deliveries[destination]
        ? { ...deliveries[destination] }
        : null;
    },

    async claimDelivery(packageId, destination, status = 'PENDING') {
      if (deliveries[destination]) {
        throw Object.assign(
          new Error('DELIVERY_ALREADY_EXISTS'),
          { status: 409 }
        );
      }

      revision += 1;

      deliveries[destination] = {
        ...createDeliveryFoundation(packageId, destination),
        packageId,
        destination,
        status,
        attemptCount: 1,
        updateTime: `delivery-${revision}`
      };

      events.push({
        type: 'delivery',
        destination,
        status
      });

      return { ...deliveries[destination] };
    },

    async updateDelivery(existing, patch) {
      const destination = existing.destination;

      revision += 1;

      deliveries[destination] = {
        ...existing,
        ...patch,
        updateTime: `delivery-${revision}`
      };

      events.push({
        type: 'delivery',
        destination,
        status: deliveries[destination].status
      });

      return { ...deliveries[destination] };
    },

    async reconcilePackagePublication(packageId, publishedAt) {
      assert.equal(packageId, currentPackage.id);

      const allPublished = currentPackage.destinations.every(destination => {
        const delivery = deliveries[destination];

        return delivery?.status === 'PUBLISHED' &&
          Boolean(delivery?.remotePostId);
      });

      if (allPublished) {
        revision += 1;
        currentPackage = {
          ...currentPackage,
          status: 'PUBLISHED',
          publishedAt,
          updateTime: `package-${revision}`
        };

        events.push({
          type: 'package',
          status: 'PUBLISHED'
        });
      } else {
        events.push({
          type: 'package',
          status: currentPackage.status
        });
      }

      return exposedPackage();
    }
  };
}

function makeMetaFetch(calls) {
  return async (url, options) => {
    const value = String(url);

    calls.push({
      url: value,
      method: options?.method
    });

    if (value.endsWith('/media')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: '666666666666666'
        })
      };
    }

    if (value.endsWith('/media_publish')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: '777777777777777'
        })
      };
    }

    if (value.endsWith('/feed')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: '2222222222_9999999999'
        })
      };
    }

    throw new Error(`UNEXPECTED_META_URL: ${value}`);
  };
}

function productionOptions(repository, calls, now) {
  return {
    env,
    repository,
    diagnoseMeta: async () => readyMeta,
    fetchImpl: makeMetaFetch(calls),
    now: () => new Date(now)
  };
}

/* -------------------------------------------------------
 * Production Instagram gate
 * ----------------------------------------------------- */

const instagramGate =
  instagramProductionWriteGateDiagnostics(env, {
    sourceId: SOURCE_ID,
    destination: 'instagram'
  });

assert.equal(instagramGate.configurationEnabled, true);
assert.equal(instagramGate.enabled, true);
assert.equal(instagramGate.productionEnvironment, true);
assert.equal(instagramGate.authorizedSourceId, null);
assert.equal(instagramGate.sourceConfigured, true);

assert.equal(
  instagramWriteGateDiagnostics(env, {
    sourceId: SOURCE_ID,
    destination: 'instagram'
  }).gateMode,
  'PRODUCTION'
);

assert.equal(
  instagramProductionWriteGate(
    {
      ...env,
      SOCIAL_INSTAGRAM_PRODUCTION_ENABLED: 'false'
    },
    {
      sourceId: SOURCE_ID,
      destination: 'instagram'
    }
  ),
  false
);

assert.equal(
  instagramProductionWriteGate(
    env,
    {
      sourceId: 'discography/another-approved-release',
      destination: 'instagram'
    }
  ),
  true
);

assert.equal(
  instagramProductionWriteGate(
    env,
    {
      sourceId: SOURCE_ID,
      destination: 'facebook'
    }
  ),
  false
);

console.log('INSTAGRAM_PRODUCTION_GATE = PASS');

/* -------------------------------------------------------
 * Facebook + Instagram no MESMO pacote
 * ----------------------------------------------------- */

const fbGate = facebookWriteGateDiagnostics(env, {
  sourceId: SOURCE_ID,
  destination: 'facebook'
});

assert.equal(fbGate.configurationEnabled, true);
assert.equal(fbGate.enabled, true);
assert.equal(fbGate.authorizedSourceId, null);

assert.equal(
  facebookWriteGateDiagnostics(env, {
    sourceId: 'discography/another-approved-release',
    destination: 'facebook'
  }).enabled,
  true
);

const facebookEligibility = evaluateFacebookPilot(
  basePackage,
  source,
  readyMeta,
  null,
  {
    sourceGatePassed: true,
    expectedPageId: env.META_FACEBOOK_PAGE_ID,
    writeGateEnabled: true,
    ownerConfirmation: true
  }
);

assert.equal(facebookEligibility.status, 'PASS');
assert.equal(
  facebookEligibility.checks.some(
    item => item.code === 'FACEBOOK_ONLY'
  ),
  false
);

const instagramEligibility = evaluateInstagramPilot(
  basePackage,
  source,
  readyMeta,
  null,
  {
    sourceGatePassed: true,
    writeGateEnabled: true,
    ownerConfirmation: true
  }
);

assert.equal(instagramEligibility.status, 'PASS');
assert.equal(
  instagramEligibility.checks.some(
    item => item.code === 'INSTAGRAM_ONLY'
  ),
  false
);

console.log('MULTIDESTINATION_ELIGIBILITY = PASS');

/* -------------------------------------------------------
 * Ordem 1: Facebook -> Instagram
 * ----------------------------------------------------- */

{
  const repository = makeRepository();
  const calls = [];

  const facebookResult = await publishFacebookPilot(
    basePackage.id,
    true,
    productionOptions(
      repository,
      calls,
      '2026-10-01T12:10:00.000Z'
    )
  );

  assert.equal(
    facebookResult.delivery.status,
    'PUBLISHED'
  );

  assert.equal(
    facebookResult.delivery.remotePostId,
    '2222222222_9999999999'
  );

  assert.equal(
    facebookResult.package.status,
    'APPROVED'
  );

  assert.equal(
    facebookResult.package.facebookDelivery.status,
    'PUBLISHED'
  );

  assert.equal(
    facebookResult.package.instagramDelivery,
    null
  );

  const instagramResult = await publishInstagramPilot(
    basePackage.id,
    true,
    productionOptions(
      repository,
      calls,
      '2026-10-01T12:11:00.000Z'
    )
  );

  assert.equal(
    instagramResult.delivery.status,
    'PUBLISHED'
  );

  assert.equal(
    instagramResult.delivery.remotePostId,
    '777777777777777'
  );

  assert.equal(
    instagramResult.package.status,
    'PUBLISHED'
  );

  assert.equal(
    instagramResult.package.facebookDelivery.status,
    'PUBLISHED'
  );

  assert.equal(
    instagramResult.package.instagramDelivery.status,
    'PUBLISHED'
  );

  assert.equal(
    calls.filter(call => call.url.endsWith('/feed')).length,
    1
  );

  assert.equal(
    calls.filter(call => call.url.endsWith('/media')).length,
    1
  );

  assert.equal(
    calls.filter(call =>
      call.url.endsWith('/media_publish')
    ).length,
    1
  );
}

console.log('FACEBOOK_THEN_INSTAGRAM = PASS');

/* -------------------------------------------------------
 * Ordem 2: Instagram -> Facebook
 * ----------------------------------------------------- */

{
  const repository = makeRepository();
  const calls = [];

  const instagramResult = await publishInstagramPilot(
    basePackage.id,
    true,
    productionOptions(
      repository,
      calls,
      '2026-10-01T12:20:00.000Z'
    )
  );

  assert.equal(
    instagramResult.package.status,
    'APPROVED'
  );

  assert.equal(
    instagramResult.package.instagramDelivery.status,
    'PUBLISHED'
  );

  assert.equal(
    instagramResult.package.facebookDelivery,
    null
  );

  const facebookResult = await publishFacebookPilot(
    basePackage.id,
    true,
    productionOptions(
      repository,
      calls,
      '2026-10-01T12:21:00.000Z'
    )
  );

  assert.equal(
    facebookResult.package.status,
    'PUBLISHED'
  );

  assert.equal(
    facebookResult.package.instagramDelivery.status,
    'PUBLISHED'
  );

  assert.equal(
    facebookResult.package.facebookDelivery.status,
    'PUBLISHED'
  );
}

console.log('INSTAGRAM_THEN_FACEBOOK = PASS');

/* -------------------------------------------------------
 * Idempotência: Facebook já publicado
 * ----------------------------------------------------- */

{
  const existingFacebook = {
    ...createDeliveryFoundation(
      basePackage.id,
      'facebook'
    ),
    packageId: basePackage.id,
    destination: 'facebook',
    status: 'PUBLISHED',
    attemptCount: 1,
    remotePostId: 'existing-facebook-post',
    publishedAt: '2026-10-01T12:30:00.000Z',
    updateTime: 'existing-delivery'
  };

  const repository = makeRepository({
    initialDeliveries: {
      facebook: existingFacebook
    }
  });

  let metaWriteCalls = 0;

  await assert.rejects(
    publishFacebookPilot(
      basePackage.id,
      true,
      {
        env,
        repository,
        diagnoseMeta: async () => readyMeta,
        fetchImpl: async () => {
          metaWriteCalls += 1;
          throw new Error('UNEXPECTED_META_WRITE');
        }
      }
    ),
    error =>
      error.code === 'FACEBOOK_PILOT_NOT_ELIGIBLE' &&
      error.diagnostics?.checks?.some(
        item =>
          item.code === 'DELIVERY_READY' &&
          item.status === 'FAIL'
      )
  );

  assert.equal(metaWriteCalls, 0);
}

console.log('FACEBOOK_DUPLICATE_BLOCKED = PASS');

/* -------------------------------------------------------
 * Instagram gate OFF = zero write
 * ----------------------------------------------------- */

{
  const repository = makeRepository();
  let metaWriteCalls = 0;

  await assert.rejects(
    publishInstagramPilot(
      basePackage.id,
      true,
      {
        env: {
          ...env,
          SOCIAL_INSTAGRAM_PRODUCTION_ENABLED: 'false'
        },
        repository,
        diagnoseMeta: async () => readyMeta,
        fetchImpl: async () => {
          metaWriteCalls += 1;
          throw new Error('UNEXPECTED_META_WRITE');
        }
      }
    ),
    error =>
      error.code === 'INSTAGRAM_SOCIAL_WRITES_DISABLED' &&
      error.status === 403
  );

  assert.equal(metaWriteCalls, 0);
  assert.equal(repository.events.length, 0);
}

console.log('INSTAGRAM_GATE_OFF_ZERO_WRITE = PASS');

/* -------------------------------------------------------
 * Novo release aprovado NÃO exige alterar env/source gate
 * ----------------------------------------------------- */

{
  const alternateSource = {
    ...source,
    sourceId: 'discography/ep-the-bloodprint-sessions-v008-corrupted',
    sourceUrl:
      'firestore://discography/ep-the-bloodprint-sessions-v008-corrupted',
    sourceRevision: 'qa-v008-current-revision',
    title: 'THE BLOODPRINT SESSIONS Vol.008 Corrupted Files',
    musicDeepLinkUrl:
      'https://raquelsynths.com/play/ep-the-bloodprint-sessions-v008-corrupted'
  };

  const alternatePackage = {
    ...basePackage,
    id: 'qa-multidestination-v008',
    sourceId: alternateSource.sourceId,
    sourceUrl: alternateSource.sourceUrl,
    sourceRevision: alternateSource.sourceRevision,
    destinationUrl: alternateSource.musicDeepLinkUrl,
    status: 'APPROVED'
  };

  const repository = makeRepository({
    packageValue: alternatePackage,
    sourceValue: alternateSource
  });

  const calls = [];

  const instagramResult = await publishInstagramPilot(
    alternatePackage.id,
    true,
    productionOptions(
      repository,
      calls,
      '2026-10-01T12:40:00.000Z'
    )
  );

  assert.equal(
    instagramResult.package.status,
    'APPROVED'
  );

  const facebookResult = await publishFacebookPilot(
    alternatePackage.id,
    true,
    productionOptions(
      repository,
      calls,
      '2026-10-01T12:41:00.000Z'
    )
  );

  assert.equal(
    facebookResult.package.status,
    'PUBLISHED'
  );

  assert.equal(
    calls.filter(call => call.url.endsWith('/feed')).length,
    1
  );

  assert.equal(
    calls.filter(call => call.url.endsWith('/media')).length,
    1
  );

  assert.equal(
    calls.filter(call => call.url.endsWith('/media_publish')).length,
    1
  );
}

console.log('PRODUCTION_APPROVED_SOURCE_NO_ENV_UPDATE = PASS');

/* -------------------------------------------------------
 * Owner confirmation obrigatória
 * ----------------------------------------------------- */

{
  const repository = makeRepository();
  let metaWriteCalls = 0;

  await assert.rejects(
    publishInstagramPilot(
      basePackage.id,
      false,
      {
        env,
        repository,
        diagnoseMeta: async () => readyMeta,
        fetchImpl: async () => {
          metaWriteCalls += 1;
          throw new Error('UNEXPECTED_META_WRITE');
        }
      }
    ),
    error =>
      error.code === 'OWNER_CONFIRMATION_REQUIRED' &&
      error.status === 409
  );

  assert.equal(metaWriteCalls, 0);
  assert.equal(repository.events.length, 0);
}

console.log('INSTAGRAM_OWNER_CONFIRMATION = PASS');

console.log('');
console.log('RQS SOCIAL MULTIDESTINATION QA = PASS');
