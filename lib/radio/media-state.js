export const MEDIA_KINDS = Object.freeze([
  'weekly-video',
  'short',
  'special-stream'
]);

export const MEDIA_VISIBILITIES = Object.freeze([
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

function check(code, pass, message) {
  return {
    code,
    status: pass ? 'PASS' : 'FAIL',
    message
  };
}

export function normalizeMediaDraft(input = {}) {
  const kind = MEDIA_KINDS.includes(input.kind)
    ? input.kind
    : 'weekly-video';

  const visibility = MEDIA_VISIBILITIES.includes(input.visibility)
    ? input.visibility
    : 'unlisted';

  const setlist = Array.isArray(input.setlist)
    ? input.setlist
    : String(input.setlist ?? '').split('\n');

  return {
    kind,
    title: text(input.title, 100),
    description: text(input.description, 5000),
    scheduledStartTime: text(input.scheduledStartTime, 64),
    visibility,
    thumbnailUrl: text(input.thumbnailUrl, 2048),
    playlistId: text(input.playlistId, 128),
    setlist: setlist
      .map(item => text(item, 180))
      .filter(Boolean)
      .slice(0, 100),
    autoStart: input.autoStart === true,
    autoStop: input.autoStop === true
  };
}

export function diagnoseMediaDraft(draft, youtube = {}) {
  const live = draft.kind === 'special-stream';

  const checks = [
    check(
      'CONTENT_TYPE',
      MEDIA_KINDS.includes(draft.kind),
      'Selecione um tipo de conteúdo suportado.'
    ),
    check(
      'TITLE',
      draft.title.length >= 3,
      draft.kind === 'short'
        ? 'Informe um hook/título com pelo menos 3 caracteres.'
        : 'Informe um título com pelo menos 3 caracteres.'
    ),
    check(
      'DESCRIPTION',
      draft.description.length >= 5,
      draft.kind === 'short'
        ? 'Informe uma caption para o Short.'
        : 'Informe uma descrição para o conteúdo.'
    ),
    check(
      'SCHEDULED_START',
      validScheduledStart(draft.scheduledStartTime),
      'Agende o conteúdo para uma data futura.'
    ),
    check(
      'VISIBILITY',
      MEDIA_VISIBILITIES.includes(draft.visibility),
      'A visibilidade deve ser private, unlisted ou public.'
    ),
    check(
      'THUMBNAIL_URL',
      validHttps(draft.thumbnailUrl),
      'A thumbnail deve usar uma URL HTTPS válida.'
    )
  ];

  if (live) {
    checks.push(
      check(
        'YOUTUBE_CONFIGURATION',
        youtube.configurationStatus === 'READY',
        'Special Streams exigem OAuth do YouTube configurado.'
      ),
      check(
        'YOUTUBE_CHANNEL_IDENTITY',
        youtube.channelStatus === 'MATCH',
        'A identidade OAuth deve corresponder ao canal RQS.'
      )
    );
  }

  return {
    status: checks.every(item => item.status === 'PASS')
      ? 'PASS'
      : 'FAIL',
    checks
  };
}

export function buildMediaDryRunPlan(draft, youtube = {}) {
  if (draft.kind === 'special-stream') {
    const stream = youtube.reusableStream || null;

    return [
      {
        step: 'BROADCAST',
        status: 'WOULD_CREATE',
        detail:
          `${draft.visibility.toUpperCase()} · ` +
          `${draft.scheduledStartTime || 'NO DATE'}`
      },
      {
        step: 'STREAM',
        status: stream
          ? 'WOULD_REUSE'
          : 'WOULD_CREATE_REUSABLE',
        detail: stream
          ? stream.title || stream.id
          : 'RQS SPECIAL STREAM INGEST'
      },
      {
        step: 'BIND',
        status: 'WOULD_BIND',
        detail: 'Broadcast ↔ reusable liveStream'
      },
      {
        step: 'THUMBNAIL',
        status: draft.thumbnailUrl ? 'WOULD_SET' : 'SKIP',
        detail: draft.thumbnailUrl
          ? 'HTTPS asset configured'
          : 'No thumbnail URL'
      },
      {
        step: 'PLAYLIST',
        status: draft.playlistId
          ? 'WOULD_ATTACH_AFTER_COMPLETE'
          : 'SKIP',
        detail: draft.playlistId || 'No playlist configured'
      }
    ];
  }

  const isShort = draft.kind === 'short';

  return [
    {
      step: 'MEDIA',
      status: 'MANUAL_UPLOAD_REQUIRED',
      detail: isShort
        ? 'Short media remains outside the RQS backend.'
        : 'Video media remains outside the RQS backend.'
    },
    {
      step: 'METADATA',
      status: 'WOULD_PREPARE',
      detail: isShort
        ? 'Hook, caption, schedule and visibility.'
        : 'Title, description, schedule and visibility.'
    },
    {
      step: 'THUMBNAIL',
      status: draft.thumbnailUrl ? 'WOULD_PREPARE' : 'SKIP',
      detail: draft.thumbnailUrl
        ? 'HTTPS asset configured'
        : 'No thumbnail URL'
    },
    {
      step: 'PLAYLIST',
      status: draft.playlistId ? 'WOULD_PREPARE' : 'SKIP',
      detail: draft.playlistId || 'No playlist configured'
    }
  ];
}
