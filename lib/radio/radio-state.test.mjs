import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRadioDryRunPlan, diagnoseRadioDraft, normalizeRadioDraft } from './radio-state.js';

test('Foundation dry run never describes a live mutation as executed', () => {
  const draft = normalizeRadioDraft({
    title: 'RQS RADIO // TEST',
    description: 'Private operational rehearsal for RQS Radio.',
    scheduledStartTime: new Date(Date.now() + 3_600_000).toISOString(),
    visibility: 'private',
    setlist: ['Track 01']
  });

  const youtube = {
    configurationStatus: 'READY',
    channelStatus: 'MATCH',
    reusableStream: { id: 'stream-safe-id', title: 'RQS RADIO MAIN INGEST' }
  };

  const diagnostics = diagnoseRadioDraft(draft, youtube);
  const plan = buildRadioDryRunPlan(draft, youtube);

  assert.equal(diagnostics.status, 'PASS');
  assert.ok(plan.every(step => step.status.startsWith('WOULD_') || step.status === 'SKIP'));
});

test('Foundation blocks readiness when YouTube OAuth is not configured', () => {
  const draft = normalizeRadioDraft({
    title: 'RQS RADIO // TEST',
    description: 'Private operational rehearsal for RQS Radio.',
    scheduledStartTime: new Date(Date.now() + 3_600_000).toISOString(),
    visibility: 'private'
  });

  const diagnostics = diagnoseRadioDraft(draft, {
    configurationStatus: 'NOT_CONFIGURED',
    channelStatus: 'NOT_CHECKED'
  });

  assert.equal(diagnostics.status, 'FAIL');
  assert.equal(
    diagnostics.checks.find(check => check.code === 'YOUTUBE_CONFIGURATION')?.status,
    'FAIL'
  );
});
