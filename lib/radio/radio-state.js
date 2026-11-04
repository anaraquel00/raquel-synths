export const RADIO_OPERATIONAL_STATUSES = Object.freeze([
  'DRAFT',
  'PROVISIONING',
  'SCHEDULED',
  'READY',
  'WAITING_FOR_SIGNAL',
  'SIGNAL_ACTIVE',
  'LIVE',
  'FINALIZING',
  'COMPLETE',
  'CANCELLED',
  'RECOVERY_REQUIRED'
]);

export const RADIO_VISIBILITIES = Object.freeze([
  'private',
  'unlisted',
  'public'
]);

function text(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function validHttps(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password;
  } catch {
    return false;
  }
}

function validScheduledStart(value) {
  if (!value) return false;

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) &&
    timestamp > Date.now();
}

export function normalizeRadioDraft(input = {}) {
  const visibility =
    RADIO_VISIBILITIES.includes(input.visibility)
      ? input.visibility
      : 'unlisted';

  const setlist =
    Array.isArray(input.setlist)
      ? input.setlist
      : String(input.setlist ?? '').split('\n');

  return {
    title:
      text(input.title, 100),

    description:
      text(input.description, 5000),

    scheduledStartTime:
      text(input.scheduledStartTime, 64),

    visibility,

    thumbnailUrl:
      text(input.thumbnailUrl, 2048),

    setlist:
      setlist
        .map(item => text(item, 180))
        .filter(Boolean)
        .slice(0, 100),

    playlistId:
      text(input.playlistId, 128),

    autoStart:
      input.autoStart === true,

    autoStop:
      input.autoStop === true
  };
}

function check(
  code,
  pass,
  message
) {
  return {
    code,
    status:
      pass
        ? 'PASS'
        : 'FAIL',
    message
  };
}

export function diagnoseRadioDraft(
  draft,
  youtube = {}
) {
  const checks = [
    check(
      'TITLE',
      draft.title.length >= 3,
      'Informe um título com pelo menos 3 caracteres.'
    ),

    check(
      'DESCRIPTION',
      draft.description.length >= 10,
      'Informe uma descrição operacional da transmissão.'
    ),

    check(
      'SCHEDULED_START',
      validScheduledStart(
        draft.scheduledStartTime
      ),
      'Agende a transmissão para uma data futura.'
    ),

    check(
      'VISIBILITY',
      RADIO_VISIBILITIES
        .includes(
          draft.visibility
        ),
      'A visibilidade deve ser private, unlisted ou public.'
    ),

    check(
      'THUMBNAIL_URL',
      validHttps(
        draft.thumbnailUrl
      ),
      'A thumbnail deve usar uma URL HTTPS válida.'
    ),

    check(
      'YOUTUBE_OPERATIONS_CONFIGURATION',
      youtube.configurationStatus ===
        'READY',
      'YouTube Operations precisa estar habilitado e configurado para o Preview.'
    ),

    check(
      'EXPECTED_CHANNEL',
      youtube.expectedChannelIdConfigured ===
        true,
      'O Channel ID esperado precisa estar configurado. A identidade real será validada no CONNECT YOUTUBE LIVE.'
    )
  ];

  return {
    status:
      checks.every(
        item =>
          item.status === 'PASS'
      )
        ? 'PASS'
        : 'FAIL',

    checks
  };
}

export function buildRadioDryRunPlan(
  draft
) {
  return [
    {
      step:
        'BROADCAST',
      status:
        'WOULD_CREATE',
      detail:
        `${draft.visibility.toUpperCase()} · ` +
        `${draft.scheduledStartTime || 'NO DATE'}`
    },

    {
      step:
        'STREAM',
      status:
        'REQUIRES_EXISTING_REUSABLE',
      detail:
        'Reusable stream selecionado após browser OAuth; stream key permanece somente no OBS.'
    },

    {
      step:
        'BIND',
      status:
        'WOULD_BIND',
      detail:
        'Broadcast ↔ existing reusable liveStream'
    },

    {
      step:
        'THUMBNAIL',
      status:
        draft.thumbnailUrl
          ? 'WOULD_SET'
          : 'OPTIONAL_FILE',
      detail:
        draft.thumbnailUrl
          ? 'HTTPS asset configured'
          : 'Thumbnail can be selected during Live Operations'
    },

    {
      step:
        'PLAYLIST',
      status:
        draft.playlistId
          ? 'WOULD_ATTACH_AFTER_COMPLETE'
          : 'SKIP',
      detail:
        draft.playlistId ||
        'No playlist configured'
    }
  ];
}
