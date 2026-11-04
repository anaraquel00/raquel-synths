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
    visibility: 'unlisted'
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
    'MANUAL_UPLOAD_REQUIRED'
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
      channelStatus:
        'NOT_CHECKED'
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
      channelStatus:
        'NOT_CHECKED'
    });

  assert.equal(
    diagnostics.status,
    'FAIL'
  );

  assert.equal(
    diagnostics.checks.find(
      check =>
        check.code ===
        'YOUTUBE_CONFIGURATION'
    )?.status,
    'FAIL'
  );
});
