import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMediaDryRunPlan,
  diagnoseMediaDraft,
  normalizeMediaDraft
} from './media-state.js';

const futureDate =
  '2099-11-18T18:00:00.000Z';

test('weekly video plan keeps media upload outside the backend', () => {
  const draft = normalizeMediaDraft({
    kind: 'weekly-video',
    title: 'RQS // Weekly Update #142',
    description: 'Atualizações do ecossistema e bastidores da RQS.',
    scheduledStartTime: futureDate,
    visibility: 'unlisted',
    tags: [
      'DJ mix',
      'RQS',
      'RaQuel Synths',
      'RQS'
    ]
  });

  const diagnostics =
    diagnoseMediaDraft(draft);

  const plan =
    buildMediaDryRunPlan(draft);

  assert.equal(
    diagnostics.status,
    'PASS'
  );

  assert.equal(
    plan[0].status,
    'DIRECT_BROWSER_UPLOAD'
  );

  assert.deepEqual(
    draft.tags,
    [
      'DJ mix',
      'RQS',
      'RaQuel Synths'
    ]
  );

  assert.ok(
    plan.every(step =>
      !['CREATED', 'UPDATED', 'PUBLISHED']
        .includes(step.status)
    )
  );
});

test('short planning is independent from live-stream OAuth', () => {
  const draft = normalizeMediaDraft({
    kind: 'short',
    title: 'O próximo sinal já está no ar',
    description: 'Bastidores, contexto e o que vem por aí na RQS.',
    scheduledStartTime: futureDate,
    visibility: 'public'
  });

  const diagnostics =
    diagnoseMediaDraft(draft, {
      configurationStatus:
        'NOT_CONFIGURED',
      expectedChannelIdConfigured:
        false
    });

  assert.equal(
    diagnostics.status,
    'PASS'
  );
});

test('special stream requires YouTube OAuth readiness', () => {
  const draft = normalizeMediaDraft({
    kind: 'special-stream',
    title: 'RQS // Solstice Live',
    description: 'Transmissão especial da RQS.',
    scheduledStartTime: futureDate,
    visibility: 'unlisted'
  });

  const diagnostics =
    diagnoseMediaDraft(draft, {
      configurationStatus:
        'NOT_CONFIGURED',
      expectedChannelIdConfigured:
        false
    });

  assert.equal(
    diagnostics.status,
    'FAIL'
  );

  assert.equal(
    diagnostics.checks.find(
      check =>
        check.code ===
        'YOUTUBE_OPERATIONS_CONFIGURATION'
    )?.status,
    'FAIL'
  );
});


test('tag limit rejects metadata over 500 characters', () => {
  const draft = normalizeMediaDraft({
    kind: 'weekly-video',
    title: 'RQS // Tag Test',
    description: 'Metadata test.',
    scheduledStartTime: futureDate,
    visibility: 'public',
    tags: [
      'x'.repeat(100), 'y'.repeat(100), 'z'.repeat(100),
      'a'.repeat(100), 'b'.repeat(100), 'c'.repeat(100)
    ]
  });
  const diagnostics = diagnoseMediaDraft(draft);
  assert.equal(
    diagnostics.checks.find(check => check.code === 'TAGS')?.status,
    'FAIL'
  );
});


test(
  'special stream passes readiness with browser OAuth configuration and existing-stream contract',
  () => {
    const draft = normalizeMediaDraft({
      kind: 'special-stream',
      title: 'RQS // Preview Live',
      description: 'Preview live test.',
      scheduledStartTime: futureDate,
      visibility: 'private'
    });

    const diagnostics =
      diagnoseMediaDraft(draft, {
        configurationStatus:
          'READY',
        expectedChannelIdConfigured:
          true
      });

    const plan =
      buildMediaDryRunPlan(draft);

    assert.equal(
      diagnostics.status,
      'PASS'
    );

    assert.equal(
      plan.find(
        step =>
          step.step === 'STREAM'
      )?.status,
      'REQUIRES_EXISTING_REUSABLE'
    );
  }
);
