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

import { radioAudit } from '../../lib/radio/radio-audit.js';

import {
  buildRadioDryRunPlan,
  diagnoseRadioDraft,
  normalizeRadioDraft,
  RADIO_OPERATIONAL_STATUSES
} from '../../lib/radio/radio-state.js';

import {
  newRadioTransmission
} from '../../lib/radio/radio-repository.js';

import {
  diagnoseYouTubeConnection
} from '../../lib/radio/youtube-client.js';

function statusFor(error) {
  const status =
    Number(error?.status || 0);

  return [
    400,
    401,
    403,
    405,
    409,
    415,
    429,
    502
  ].includes(status)
    ? status
    : 500;
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
    if (req.method !== 'POST') {
      return res.status(405).json({
        code: 'METHOD_NOT_ALLOWED',
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
      return res.status(415).json({
        code:
          'UNSUPPORTED_MEDIA_TYPE',
        message:
          'Use application/json.'
      });
    }

    requireOrigin(req);

    const session =
      requireSession(
        req,
        secret()
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
        await diagnoseYouTubeConnection();

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

      return res.status(200).json({
        mode:
          'FOUNDATION_READ_ONLY',
        writesEnabled: false,
        youtube,
        operationalStatuses:
          RADIO_OPERATIONAL_STATUSES
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
        await diagnoseYouTubeConnection();

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

      return res.status(200).json({
        mode:
          'FOUNDATION_READ_ONLY',
        writesEnabled: false,
        contentType:
          'monthly-radio',
        diagnostics,
        plan,
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
          ? await diagnoseYouTubeConnection()
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

      radioAudit(
        'CONTENT_PLAN_DRY_RUN',
        {
          kind: draft.kind,
          status:
            diagnostics.status,
          visibility:
            draft.visibility,
          scheduledStartTime:
            draft
              .scheduledStartTime
        }
      );

      return res.status(200).json({
        mode:
          'FOUNDATION_READ_ONLY',
        writesEnabled: false,
        contentType:
          draft.kind,
        diagnostics,
        plan,
        draft
      });
    }

    return res.status(400).json({
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
          error?.code || null,
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
          status >= 500
            ? 'RADIO_INTERNAL_ERROR'
            : String(
                error?.code ||
                'RADIO_REQUEST_FAILED'
              ),
        message:
          status >= 500
            ? 'Falha interna no Media Control Plane.'
            : String(
                error?.message ||
                'Falha no Media Control Plane.'
              )
      });
  }
}
