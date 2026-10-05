export const PUBLISHABLE_SOCIAL_SOURCE_TYPES = Object.freeze([
  'music_release',
  'system_log',
  'saga_episode'
]);

const publishableSourceTypes = new Set(PUBLISHABLE_SOCIAL_SOURCE_TYPES);

export function isPublishableSocialSourceType(sourceType) {
  return publishableSourceTypes.has(sourceType);
}
