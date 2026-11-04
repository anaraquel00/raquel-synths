import {
  createHmac,
  randomUUID,
  timingSafeEqual
} from 'node:crypto';

import {
  normalizeMediaDraft
} from './media-state.js';

import {
  normalizeRadioDraft
} from './radio-state.js';

export const MEDIA_PLAN_KINDS = Object.freeze([
  'monthly-radio',
  'weekly-video',
  'short',
  'special-stream'
]);

export const MEDIA_PLAN_STATUSES = Object.freeze([
  'DRAFT',
  'READY',
  'SCHEDULED',
  'LIVE',
  'COMPLETE',
  'CANCELLED',
  'ERROR'
]);

export const MEDIA_PLAN_DRY_RUN_STATUSES =
  Object.freeze([
    'NOT_RUN',
    'PASS',
    'FAIL'
  ]);

const DRY_RUN_TTL_MS =
  30 * 60 * 1000;

function safeEqual(
  left,
  right
) {
  const a =
    Buffer.from(
      String(left)
    );

  const b =
    Buffer.from(
      String(right)
    );

  return (
    a.length === b.length &&
    timingSafeEqual(a, b)
  );
}

function digest(
  value,
  key
) {
  return createHmac(
    'sha256',
    key
  )
    .update(
      JSON.stringify(value)
    )
    .digest('base64url');
}

export function normalizeMediaPlanDraft(
  kind,
  input = {}
) {
  if (
    kind ===
    'monthly-radio'
  ) {
    return {
      kind,
      ...normalizeRadioDraft(
        input
      )
    };
  }

  const normalized =
    normalizeMediaDraft({
      ...input,
      kind
    });

  return {
    ...normalized,
    kind
  };
}

export function makeMediaPlanDryRunToken(
  {
    kind,
    draft,
    dryRunStatus
  },
  key,
  now = Date.now()
) {
  if (
    !MEDIA_PLAN_KINDS
      .includes(kind) ||
    !['PASS', 'FAIL']
      .includes(dryRunStatus)
  ) {
    throw new Error(
      'INVALID_DRY_RUN_TOKEN_INPUT'
    );
  }

  const contract = {
    kind,
    draft
  };

  const payload =
    Buffer
      .from(
        JSON.stringify({
          digest:
            digest(
              contract,
              key
            ),
          dryRunStatus,
          expiresAt:
            now +
            DRY_RUN_TTL_MS,
          nonce:
            randomUUID()
        })
      )
      .toString(
        'base64url'
      );

  const signature =
    createHmac(
      'sha256',
      key
    )
      .update(
        `media-plan:${payload}`
      )
      .digest(
        'base64url'
      );

  return (
    `${payload}.` +
    `${signature}`
  );
}

export function verifyMediaPlanDryRunToken(
  token,
  {
    kind,
    draft
  },
  key,
  now = Date.now()
) {
  if (!token) return null;

  const [
    payload,
    signature,
    ...extra
  ] =
    String(token)
      .split('.');

  if (
    !payload ||
    !signature ||
    extra.length
  ) {
    return null;
  }

  const expected =
    createHmac(
      'sha256',
      key
    )
      .update(
        `media-plan:${payload}`
      )
      .digest(
        'base64url'
      );

  if (
    !safeEqual(
      signature,
      expected
    )
  ) {
    return null;
  }

  try {
    const decoded =
      JSON.parse(
        Buffer
          .from(
            payload,
            'base64url'
          )
          .toString(
            'utf8'
          )
      );

    const contract = {
      kind,
      draft
    };

    if (
      Number(
        decoded.expiresAt
      ) <= now ||
      decoded.digest !==
        digest(
          contract,
          key
        ) ||
      !['PASS', 'FAIL']
        .includes(
          decoded.dryRunStatus
        )
    ) {
      return null;
    }

    return {
      dryRunStatus:
        decoded.dryRunStatus,
      expiresAt:
        Number(
          decoded.expiresAt
        )
    };
  } catch {
    return null;
  }
}

export function deriveMediaPlanStatus(
  draft,
  dryRunStatus,
  now = Date.now()
) {
  if (
    dryRunStatus !==
    'PASS'
  ) {
    return 'DRAFT';
  }

  const scheduled =
    Date.parse(
      draft
        .scheduledStartTime ||
      ''
    );

  if (
    Number.isFinite(
      scheduled
    ) &&
    scheduled > now
  ) {
    return 'SCHEDULED';
  }

  return 'READY';
}

export function partitionMediaPlans(
  plans = []
) {
  const queueStatuses =
    new Set([
      'DRAFT',
      'READY',
      'SCHEDULED',
      'LIVE',
      'ERROR'
    ]);

  const queue =
    plans
      .filter(plan =>
        queueStatuses.has(
          plan.status
        )
      )
      .sort(
        comparePlans
      );

  const history =
    plans
      .filter(plan =>
        !queueStatuses.has(
          plan.status
        )
      )
      .sort(
        compareHistory
      );

  return {
    queue,
    history
  };
}

function comparePlans(
  left,
  right
) {
  const leftTime =
    Date.parse(
      left.scheduledStartTime ||
      ''
    );

  const rightTime =
    Date.parse(
      right.scheduledStartTime ||
      ''
    );

  const leftValid =
    Number.isFinite(
      leftTime
    );

  const rightValid =
    Number.isFinite(
      rightTime
    );

  if (
    leftValid &&
    rightValid &&
    leftTime !== rightTime
  ) {
    return (
      leftTime -
      rightTime
    );
  }

  if (
    leftValid !==
    rightValid
  ) {
    return leftValid
      ? -1
      : 1;
  }

  return String(
    left.createdAt || ''
  ).localeCompare(
    String(
      right.createdAt || ''
    )
  );
}

function compareHistory(
  left,
  right
) {
  return String(
    right.updatedAt || ''
  ).localeCompare(
    String(
      left.updatedAt || ''
    )
  );
}
