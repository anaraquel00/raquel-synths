import {
  body,
  requireCsrf,
  requireOrigin,
  requireSession,
  secret
} from './system-logs.js';

import {
  buildMediaDryRunPlan,
  diagnoseMediaDraft,
  normalizeMediaDraft
} from '../../lib/radio/media-state.js';

import {
  makeMediaPlanDryRunToken,
  normalizeMediaPlanDraft,
  partitionMediaPlans,
  verifyMediaPlanDryRunToken
} from '../../lib/radio/media-plan-state.js';

import {
  beginLiveProvisioning,
  beginYoutubeUpload,
  cancelMediaPlan,
  deleteMediaPlan,
  listMediaPlans,
  MediaPlanError,
  recordLiveProgress,
  recordYoutubePublishResult,
  saveMediaPlan,
  updateStudioChecklist
} from '../../lib/radio/media-plan-repository.js';

import {
  radioAudit
} from '../../lib/radio/radio-audit.js';

import {
  buildRadioDryRunPlan,
  diagnoseRadioDraft,
  normalizeRadioDraft,
  RADIO_OPERATIONAL_STATUSES
} from '../../lib/radio/radio-state.js';

import {
  newRadioTransmission
} from '../../lib/radio/radio-repository.js';

function youtubeOperationsReadiness(
  env = process.env
) {
  const clientId =
    String(
      env.RQS_YOUTUBE_OPERATIONS_CLIENT_ID ||
      ''
    ).trim();

  const expectedChannelId =
    String(
      env.RQS_YOUTUBE_EXPECTED_CHANNEL_ID ||
      ''
    ).trim();

  const enabled =
    env.RQS_YOUTUBE_OPERATIONS_ENABLED ===
    'true';

  const clientConfigured =
    Boolean(
      clientId &&
      clientId.endsWith(
        '.apps.googleusercontent.com'
      )
    );

  const expectedChannelIdConfigured =
    Boolean(
      expectedChannelId &&
      expectedChannelId.startsWith('UC')
    );

  const configured =
    clientConfigured &&
    expectedChannelIdConfigured;

  const missingConfiguration = [];

  if (!enabled) {
    missingConfiguration.push(
      'RQS_YOUTUBE_OPERATIONS_ENABLED'
    );
  }

  if (!clientConfigured) {
    missingConfiguration.push(
      'RQS_YOUTUBE_OPERATIONS_CLIENT_ID'
    );
  }

  if (!expectedChannelIdConfigured) {
    missingConfiguration.push(
      'RQS_YOUTUBE_EXPECTED_CHANNEL_ID'
    );
  }

  return {
    configurationStatus:
      enabled && configured
        ? 'READY'
        : configured
          ? 'LOCKED'
          : 'NOT_CONFIGURED',

    operationsEnabled:
      enabled && configured,

    clientConfigured,

    expectedChannelIdConfigured,

    expectedChannelId:
      expectedChannelIdConfigured
        ? expectedChannelId
        : null,

    channelStatus:
      expectedChannelIdConfigured
        ? 'DEFERRED_TO_BROWSER'
        : 'NOT_CHECKED',

    channel:
      expectedChannelIdConfigured
        ? {
            id:
              expectedChannelId,
            title:
              'Validated on browser connect'
          }
        : null,

    reusableStream:
      null,

    streams:
      [],

    missingConfiguration,

    checkedAt:
      new Date()
        .toISOString()
  };
}

function statusFor(error) {
  if (
    error instanceof
    MediaPlanError
  ) {
    return error.status;
  }

  const status =
    Number(
      error?.status || 0
    );

  return [
    400,
    401,
    403,
    404,
    405,
    409,
    415,
    429,
    502
  ].includes(status)
    ? status
    : 500;
}

function errorCodeFor(
  error,
  status
) {
  if (
    error instanceof
    MediaPlanError
  ) {
    return error.code;
  }

  return status >= 500
    ? 'RADIO_INTERNAL_ERROR'
    : String(
        error?.code ||
        'RADIO_REQUEST_FAILED'
      );
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
    if (
      req.method !==
      'POST'
    ) {
      return res
        .status(405)
        .json({
          code:
            'METHOD_NOT_ALLOWED',
          message:
            'Método não permitido.'
        });
    }

    if (
      !String(
        req.headers[
          'content-type'
        ] || ''
      )
        .toLowerCase()
        .startsWith(
          'application/json'
        )
    ) {
      return res
        .status(415)
        .json({
          code:
            'UNSUPPORTED_MEDIA_TYPE',
          message:
            'Use application/json.'
        });
    }

    requireOrigin(req);

    const adminSecret =
      secret();

    const session =
      requireSession(
        req,
        adminSecret
      );

    requireCsrf(
      req,
      session
    );

    const input =
      body(req);

    const action =
      String(
        input.action || ''
      );

    if (
      action ===
      'diagnostics'
    ) {
      const youtube =
        youtubeOperationsReadiness();

      radioAudit(
        'DIAGNOSTICS',
        {
          configurationStatus:
            youtube
              .configurationStatus,
          channelStatus:
            youtube
              .channelStatus,
          reusableStreamId:
            youtube
              .reusableStream
              ?.id || null
        }
      );

      return res
        .status(200)
        .json({
          mode:
            'BROWSER_OAUTH_OPERATIONS_READINESS',
          writesEnabled:
            youtube.operationsEnabled === true,
          youtube,
          operationalStatuses:
            RADIO_OPERATIONAL_STATUSES
        });
    }

    if (
      action ===
      'operations-config'
    ) {
      const readiness =
        youtubeOperationsReadiness();

      const clientId =
        String(
          process.env
            .RQS_YOUTUBE_OPERATIONS_CLIENT_ID ||
          ''
        ).trim();

      return res
        .status(200)
        .json({
          enabled:
            readiness.operationsEnabled,
          configured:
            readiness.configurationStatus ===
              'READY',
          clientId:
            readiness.clientConfigured
              ? clientId
              : null,
          expectedChannelId:
            readiness.expectedChannelId,
          scope:
            'https://www.googleapis.com/auth/youtube.force-ssl'
        });
    }

    if (
      action ===
      'plans-list'
    ) {
      const plans =
        await listMediaPlans();

      const {
        queue,
        history
      } =
        partitionMediaPlans(
          plans
        );

      return res
        .status(200)
        .json({
          collection:
            'media-plans',
          queue,
          history,
          total:
            plans.length
        });
    }

    if (
      action ===
      'dry-run'
    ) {
      const draft =
        normalizeRadioDraft(
          input.transmission
        );

      const youtube =
        youtubeOperationsReadiness();

      const diagnostics =
        diagnoseRadioDraft(
          draft,
          youtube
        );

      const plan =
        buildRadioDryRunPlan(
          draft,
          youtube
        );

      const modelPreview =
        newRadioTransmission(
          draft
        );

      const dryRunToken =
        makeMediaPlanDryRunToken(
          {
            kind:
              'monthly-radio',
            draft: {
              kind:
                'monthly-radio',
              ...draft
            },
            dryRunStatus:
              diagnostics.status
          },
          adminSecret
        );

      radioAudit(
        'RADIO_DRY_RUN',
        {
          status:
            diagnostics.status,
          visibility:
            draft.visibility,
          scheduledStartTime:
            draft
              .scheduledStartTime,
          youtubeConfigurationStatus:
            youtube
              .configurationStatus,
          youtubeChannelStatus:
            youtube
              .channelStatus
        }
      );

      return res
        .status(200)
        .json({
          mode:
            'BROWSER_OAUTH_DRY_RUN',
          writesEnabled:
            false,
          operationsEnabled:
            youtube.operationsEnabled === true,
          contentType:
            'monthly-radio',
          diagnostics,
          plan,
          dryRunToken,
          modelPreview: {
            ...modelPreview,
            idempotencyKey:
              '[GENERATED_ON_REAL_PROVISION]',
            id:
              '[GENERATED_ON_REAL_PROVISION]'
          }
        });
    }

    if (
      action ===
      'content-plan'
    ) {
      const draft =
        normalizeMediaDraft(
          input.content
        );

      const youtube =
        draft.kind ===
        'special-stream'
          ? youtubeOperationsReadiness()
          : {};

      const diagnostics =
        diagnoseMediaDraft(
          draft,
          youtube
        );

      const plan =
        buildMediaDryRunPlan(
          draft,
          youtube
        );

      const dryRunToken =
        makeMediaPlanDryRunToken(
          {
            kind:
              draft.kind,
            draft,
            dryRunStatus:
              diagnostics.status
          },
          adminSecret
        );

      radioAudit(
        'CONTENT_PLAN_DRY_RUN',
        {
          kind:
            draft.kind,
          status:
            diagnostics.status,
          visibility:
            draft.visibility,
          scheduledStartTime:
            draft
              .scheduledStartTime
        }
      );

      return res
        .status(200)
        .json({
          mode:
            'BROWSER_OAUTH_DRY_RUN',
          writesEnabled:
            false,
          operationsEnabled:
            draft.kind === 'special-stream'
              ? youtube.operationsEnabled === true
              : null,
          contentType:
            draft.kind,
          diagnostics,
          plan,
          dryRunToken,
          draft
        });
    }

    if (
      action ===
      'plan-save'
    ) {
      const kind =
        String(
          input.plan?.kind ||
          ''
        );

      const draft =
        normalizeMediaPlanDraft(
          kind,
          input.plan?.content
        );

      let dryRunStatus =
        'NOT_RUN';

      if (
        input.plan
          ?.dryRunToken
      ) {
        const verified =
          verifyMediaPlanDryRunToken(
            input.plan
              .dryRunToken,
            {
              kind,
              draft
            },
            adminSecret
          );

        if (!verified) {
          throw new MediaPlanError(
            409,
            'DRY_RUN_STALE',
            'O formulário mudou depois do Dry Run. Execute o Dry Run novamente antes de salvar como validado.'
          );
        }

        dryRunStatus =
          verified
            .dryRunStatus;
      }

      const saved =
        await saveMediaPlan({
          id:
            input.plan?.id,
          sourceUpdateTime:
            input.plan
              ?.updateTime,
          draft,
          dryRunStatus
        });

      radioAudit(
        'MEDIA_PLAN_SAVED',
        {
          id:
            saved.id,
          kind:
            saved.kind,
          status:
            saved.status,
          dryRunStatus:
            saved
              .dryRunStatus,
          revision:
            saved.revision
        }
      );

      return res
        .status(
          input.plan?.id
            ? 200
            : 201
        )
        .json({
          plan:
            saved
        });
    }

    if (
      action ===
      'plan-live-intent'
    ) {
      if (
        process.env
          .RQS_YOUTUBE_OPERATIONS_ENABLED !==
        'true'
      ) {
        throw new MediaPlanError(
          403,
          'YOUTUBE_OPERATIONS_LOCKED',
          'YouTube Operations está bloqueado neste ambiente.'
        );
      }

      const updated =
        await beginLiveProvisioning({
          id:
            String(input.id || ''),
          sourceUpdateTime:
            input.updateTime
        });

      radioAudit(
        'YOUTUBE_LIVE_INTENT',
        {
          id:
            updated.id,
          kind:
            updated.kind,
          revision:
            updated.revision
        }
      );

      return res
        .status(200)
        .json({
          plan:
            updated
        });
    }

    if (
      action ===
      'plan-live-progress'
    ) {
      const updated =
        await recordLiveProgress({
          id:
            String(input.id || ''),
          sourceUpdateTime:
            input.updateTime,
          progress:
            input.progress
        });

      radioAudit(
        'YOUTUBE_LIVE_PROGRESS',
        {
          id:
            updated.id,
          kind:
            updated.kind,
          stage:
            updated.liveProvisioningStage,
          status:
            updated.status,
          youtubeBroadcastId:
            updated.youtubeBroadcastId,
          youtubeStreamId:
            updated.youtubeStreamId,
          youtubeBroadcastStatus:
            updated.youtubeBroadcastStatus,
          youtubeStreamStatus:
            updated.youtubeStreamStatus,
          youtubeHealthStatus:
            updated.youtubeHealthStatus
        }
      );

      return res
        .status(200)
        .json({
          plan:
            updated
        });
    }

    if (
      action ===
      'plan-upload-intent'
    ) {
      if (
        process.env
          .RQS_YOUTUBE_OPERATIONS_ENABLED !==
        'true'
      ) {
        throw new MediaPlanError(
          403,
          'YOUTUBE_OPERATIONS_LOCKED',
          'YouTube Operations está bloqueado neste ambiente.'
        );
      }

      const updated =
        await beginYoutubeUpload({
          id:
            String(input.id || ''),
          sourceUpdateTime:
            input.updateTime
        });

      radioAudit(
        'YOUTUBE_UPLOAD_INTENT',
        {
          id: updated.id,
          kind: updated.kind,
          revision: updated.revision
        }
      );

      return res
        .status(200)
        .json({
          plan: updated
        });
    }

    if (
      action ===
      'plan-youtube-result'
    ) {
      const updated =
        await recordYoutubePublishResult({
          id:
            String(input.id || ''),
          sourceUpdateTime:
            input.updateTime,
          result:
            input.result
        });

      radioAudit(
        'YOUTUBE_PUBLISH_RESULT',
        {
          id: updated.id,
          kind: updated.kind,
          youtubeVideoId:
            updated.youtubeVideoId,
          uploadStatus:
            updated.uploadStatus,
          processingStatus:
            updated.processingStatus,
          thumbnailStatus:
            updated.thumbnailStatus,
          playlistStatus:
            updated.playlistStatus
        }
      );

      return res
        .status(200)
        .json({
          plan: updated
        });
    }

    if (
      action ===
      'plan-studio-checklist'
    ) {
      const updated =
        await updateStudioChecklist({
          id: String(input.id || ''),
          sourceUpdateTime: input.updateTime,
          checklist: input.checklist
        });

      radioAudit(
        'STUDIO_CHECKLIST_UPDATED',
        {
          id: updated.id,
          kind: updated.kind,
          revision: updated.revision,
          youtubeVideoId: updated.youtubeVideoId
        }
      );

      return res.status(200).json({ plan: updated });
    }

    if (
      action ===
      'plan-cancel'
    ) {
      const cancelled =
        await cancelMediaPlan({
          id:
            String(
              input.id || ''
            ),
          sourceUpdateTime:
            input.updateTime
        });

      radioAudit(
        'MEDIA_PLAN_CANCELLED',
        {
          id:
            cancelled.id,
          kind:
            cancelled.kind,
          revision:
            cancelled.revision
        }
      );

      return res
        .status(200)
        .json({
          plan:
            cancelled
        });
    }

    if (
      action ===
      'plan-delete'
    ) {
      const deleted =
        await deleteMediaPlan({
          id:
            String(
              input.id || ''
            ),
          sourceUpdateTime:
            input.updateTime
        });

      radioAudit(
        'MEDIA_PLAN_DELETED',
        {
          id:
            deleted.id
        }
      );

      return res
        .status(200)
        .json(
          deleted
        );
    }

    return res
      .status(400)
      .json({
        code:
          'INVALID_ACTION',
        message:
          'Ação inválida.'
      });
  } catch (error) {
    const status =
      statusFor(error);

    radioAudit(
      'REQUEST_FAILED',
      {
        status,
        code:
          error?.code ||
          null,
        message:
          status >= 500
            ? 'internal'
            : error?.message ||
              'request failed'
      }
    );

    return res
      .status(status)
      .json({
        code:
          errorCodeFor(
            error,
            status
          ),
        message:
          status >= 500
            ? 'Falha interna no Media Control Plane.'
            : String(
                error?.message ||
                'Falha no Media Control Plane.'
              ),
        ...(
          error instanceof
          MediaPlanError
            ? error.details ||
              {}
            : {}
        )
      });
  }
}
