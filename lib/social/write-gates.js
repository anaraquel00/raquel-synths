export const INSTAGRAM_PILOT_BRANCH = 'feat/social-publishing-phase-1d-instagram-pilot';
export const INSTAGRAM_PILOT_SOURCE_ID = 'discography/ep-the-blueprint-sessions-v022';

export function instagramPilotWriteGateDiagnostics(env = process.env) {
  const flagEnabled = env.SOCIAL_PUBLISHING_WRITES_ENABLED === 'true';
  const previewEnvironment = env.VERCEL_ENV === 'preview';
  const branchMatch = env.VERCEL_GIT_COMMIT_REF === INSTAGRAM_PILOT_BRANCH;
  return {
    flagEnabled,
    previewEnvironment,
    branchMatch,
    enabled: flagEnabled && previewEnvironment && branchMatch
  };
}

export function instagramPilotWriteGate(env = process.env) {
  return instagramPilotWriteGateDiagnostics(env).enabled;
}
