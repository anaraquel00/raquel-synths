import { randomUUID } from 'node:crypto';

export const RADIO_COLLECTION = 'radio-transmissions';

export function newRadioTransmission(draft, now = new Date()) {
  const timestamp = now.toISOString();

  return {
    id: randomUUID(),
    revision: 1,
    title: draft.title,
    description: draft.description,
    scheduledStartTime: draft.scheduledStartTime,
    actualStartTime: null,
    actualEndTime: null,
    visibility: draft.visibility,
    operationalStatus: 'DRAFT',
    provisioningStage: 'NONE',
    youtubeChannelId: null,
    youtubeBroadcastId: null,
    youtubeStreamId: null,
    youtubeUrl: null,
    youtubeBroadcastStatus: null,
    youtubeStreamStatus: null,
    youtubeHealthStatus: null,
    thumbnailUrl: draft.thumbnailUrl || null,
    thumbnailStatus: draft.thumbnailUrl ? 'PENDING' : 'NOT_CONFIGURED',
    setlist: draft.setlist,
    playlistId: draft.playlistId || null,
    playlistStatus: draft.playlistId ? 'PENDING' : 'NOT_CONFIGURED',
    autoStart: draft.autoStart,
    autoStop: draft.autoStop,
    idempotencyKey: randomUUID(),
    lastSyncedAt: null,
    lastError: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
