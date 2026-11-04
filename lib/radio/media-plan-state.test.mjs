import test from 'node:test';
import assert from 'node:assert/strict';

import {
  deriveMediaPlanStatus,
  makeMediaPlanDryRunToken,
  normalizeMediaPlanDraft,
  normalizeStudioChecklist,
  partitionMediaPlans,
  verifyMediaPlanDryRunToken
} from './media-plan-state.js';

const KEY =
  '0123456789abcdef0123456789abcdef';

test(
  'signed dry-run token is bound to the exact normalized plan payload',
  () => {
    const draft =
      normalizeMediaPlanDraft(
        'weekly-video',
        {
          title:
            'RQS // Weekly Update',
          description:
            'Atualizações e bastidores.',
          scheduledStartTime:
            '2099-11-10T18:00:00.000Z',
          visibility:
            'unlisted'
        }
      );

    const token =
      makeMediaPlanDryRunToken(
        {
          kind:
            'weekly-video',
          draft,
          dryRunStatus:
            'PASS'
        },
        KEY,
        1_000
      );

    assert.equal(
      verifyMediaPlanDryRunToken(
        token,
        {
          kind:
            'weekly-video',
          draft
        },
        KEY,
        2_000
      )?.dryRunStatus,
      'PASS'
    );

    assert.equal(
      verifyMediaPlanDryRunToken(
        token,
        {
          kind:
            'weekly-video',
          draft: {
            ...draft,
            title:
              'Changed after dry run'
          }
        },
        KEY,
        2_000
      ),
      null
    );
  }
);

test(
  'PASS plans with a future slot become SCHEDULED while unvalidated plans remain DRAFT',
  () => {
    const draft =
      normalizeMediaPlanDraft(
        'short',
        {
          title:
            'Novo Short',
          description:
            'Caption do Short.',
          scheduledStartTime:
            '2099-11-18T18:00:00.000Z',
          visibility:
            'public'
        }
      );

    assert.equal(
      deriveMediaPlanStatus(
        draft,
        'PASS',
        Date.parse(
          '2099-01-01T00:00:00.000Z'
        )
      ),
      'SCHEDULED'
    );

    assert.equal(
      deriveMediaPlanStatus(
        draft,
        'NOT_RUN'
      ),
      'DRAFT'
    );
  }
);

test(
  'queue excludes terminal cancelled and complete plans',
  () => {
    const result =
      partitionMediaPlans([
        {
          id: 'draft',
          status: 'DRAFT',
          scheduledStartTime: '',
          createdAt:
            '2026-11-04T10:00:00.000Z'
        },
        {
          id: 'scheduled',
          status: 'SCHEDULED',
          scheduledStartTime:
            '2026-11-10T10:00:00.000Z',
          createdAt:
            '2026-11-04T10:00:00.000Z'
        },
        {
          id: 'cancelled',
          status: 'CANCELLED',
          updatedAt:
            '2026-11-04T12:00:00.000Z'
        },
        {
          id: 'complete',
          status: 'COMPLETE',
          updatedAt:
            '2026-11-04T13:00:00.000Z'
        }
      ]);

    assert.deepEqual(
      result.queue
        .map(item => item.id),
      [
        'scheduled',
        'draft'
      ]
    );

    assert.deepEqual(
      result.history
        .map(item => item.id),
      [
        'complete',
        'cancelled'
      ]
    );
  }
);


test('private future video remains READY because YouTube will not schedule it', () => {
  const draft = normalizeMediaPlanDraft('weekly-video', {
    title: 'Private video',
    description: 'Private upload.',
    scheduledStartTime: '2099-11-18T18:00:00.000Z',
    visibility: 'private'
  });
  assert.equal(
    deriveMediaPlanStatus(
      draft,
      'PASS',
      Date.parse('2099-01-01T00:00:00.000Z')
    ),
    'READY'
  );
});

test('Studio checklist defaults manual confirmations to false', () => {
  assert.deepEqual(
    normalizeStudioChecklist({ cardsConfigured: true }),
    {
      endScreenConfigured: false,
      cardsConfigured: true,
      shortsRemixAudioOnly: false,
      automaticPlacesDisabled: false,
      automaticConceptsDisabled: false
    }
  );
});
