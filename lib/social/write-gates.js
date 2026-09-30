export const INSTAGRAM_PILOT_BRANCH = 'feat/social-publishing-phase-1d-instagram-pilot';
export const INSTAGRAM_PILOT_SOURCE_ID = 'discography/ep-the-blueprint-sessions-v022';
export const FACEBOOK_PILOT_BRANCH = 'feat/social-publishing-phase-1e-facebook-pilot';

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

function configuredFacebookPilotSource(env) {
  return typeof env.SOCIAL_FACEBOOK_PILOT_SOURCE_ID === 'string'
    ? env.SOCIAL_FACEBOOK_PILOT_SOURCE_ID.trim()
    : '';
}

export function facebookPilotWriteGateDiagnostics(env = process.env, context = {}) {
  const pilotSourceId = configuredFacebookPilotSource(env);
  const flagEnabled = env.SOCIAL_PUBLISHING_WRITES_ENABLED === 'true';
  const featureEnabled = env.SOCIAL_FACEBOOK_PILOT_ENABLED === 'true';
  const previewEnvironment = env.VERCEL_ENV === 'preview';
  const branchMatch = env.VERCEL_GIT_COMMIT_REF === FACEBOOK_PILOT_BRANCH;
  const sourceConfigured = Boolean(pilotSourceId);
  const sourceMatch = context.sourceId === undefined ? null : context.sourceId === pilotSourceId;
  const destinationMatch = context.destination === undefined ? null : context.destination === 'facebook';
  const baseEnabled = flagEnabled && featureEnabled && previewEnvironment && branchMatch && sourceConfigured;
  return {
    flagEnabled,
    featureEnabled,
    previewEnvironment,
    branchMatch,
    sourceConfigured,
    sourceMatch,
    destinationMatch,
    pilotSourceId: pilotSourceId || null,
    configurationEnabled: baseEnabled,
    enabled: baseEnabled && sourceMatch === true && destinationMatch === true
  };
}

export function facebookPilotWriteGate(env = process.env, context = {}) {
  return facebookPilotWriteGateDiagnostics(env, context).enabled;
}
