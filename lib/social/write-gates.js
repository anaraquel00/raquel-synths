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

function configuredFacebookProductionSource(env) {
  return typeof env.SOCIAL_FACEBOOK_PRODUCTION_SOURCE_ID === 'string'
    ? env.SOCIAL_FACEBOOK_PRODUCTION_SOURCE_ID.trim()
    : '';
}

function configuredInstagramProductionSource(env) {
  return typeof env.SOCIAL_INSTAGRAM_PRODUCTION_SOURCE_ID === 'string'
    ? env.SOCIAL_INSTAGRAM_PRODUCTION_SOURCE_ID.trim()
    : '';
}

function isProductionEnvironment(env) {
  return env.VERCEL_TARGET_ENV === 'production' ||
    (!env.VERCEL_TARGET_ENV && env.VERCEL_ENV === 'production');
}

export function instagramProductionWriteGateDiagnostics(env = process.env, context = {}) {
  const authorizedSourceId = configuredInstagramProductionSource(env);
  const flagEnabled = env.SOCIAL_PUBLISHING_WRITES_ENABLED === 'true';
  const featureEnabled = env.SOCIAL_INSTAGRAM_PRODUCTION_ENABLED === 'true';
  const productionEnvironment = isProductionEnvironment(env);
  const sourceConfigured = Boolean(authorizedSourceId);
  const sourceMatch = context.sourceId === undefined ? null : context.sourceId === authorizedSourceId;
  const destinationMatch = context.destination === undefined ? null : context.destination === 'instagram';
  const baseEnabled = flagEnabled && featureEnabled && productionEnvironment && sourceConfigured;

  return {
    flagEnabled,
    featureEnabled,
    productionEnvironment,
    sourceConfigured,
    sourceMatch,
    destinationMatch,
    authorizedSourceId: authorizedSourceId || null,
    configurationEnabled: baseEnabled,
    enabled: baseEnabled && sourceMatch === true && destinationMatch === true
  };
}

export function instagramProductionWriteGate(env = process.env, context = {}) {
  return instagramProductionWriteGateDiagnostics(env, context).enabled;
}

export function instagramWriteGateDiagnostics(env = process.env, context = {}) {
  if (isProductionEnvironment(env)) {
    const production = instagramProductionWriteGateDiagnostics(env, context);
    return {
      ...production,
      gateMode: 'PRODUCTION',
      previewEnvironment: false,
      branchMatch: null,
      pilotSourceId: null
    };
  }

  const preview = instagramPilotWriteGateDiagnostics(env);
  const sourceMatch = context.sourceId === undefined
    ? null
    : context.sourceId === INSTAGRAM_PILOT_SOURCE_ID;
  const destinationMatch = context.destination === undefined
    ? null
    : context.destination === 'instagram';

  return {
    ...preview,
    gateMode: preview.previewEnvironment ? 'PREVIEW_PILOT' : 'UNAVAILABLE',
    featureEnabled: true,
    productionEnvironment: false,
    sourceConfigured: true,
    sourceMatch,
    destinationMatch,
    pilotSourceId: INSTAGRAM_PILOT_SOURCE_ID,
    authorizedSourceId: INSTAGRAM_PILOT_SOURCE_ID,
    configurationEnabled: preview.enabled,
    enabled: preview.enabled && sourceMatch === true && destinationMatch === true
  };
}

export function instagramWriteGate(env = process.env, context = {}) {
  return instagramWriteGateDiagnostics(env, context).enabled;
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

export function facebookProductionWriteGateDiagnostics(env = process.env, context = {}) {
  const authorizedSourceId = configuredFacebookProductionSource(env);
  const flagEnabled = env.SOCIAL_PUBLISHING_WRITES_ENABLED === 'true';
  const featureEnabled = env.SOCIAL_FACEBOOK_PRODUCTION_ENABLED === 'true';
  const productionEnvironment = isProductionEnvironment(env);
  const sourceConfigured = Boolean(authorizedSourceId);
  const sourceMatch = context.sourceId === undefined ? null : context.sourceId === authorizedSourceId;
  const destinationMatch = context.destination === undefined ? null : context.destination === 'facebook';
  const baseEnabled = flagEnabled && featureEnabled && productionEnvironment && sourceConfigured;
  return {
    flagEnabled,
    featureEnabled,
    productionEnvironment,
    sourceConfigured,
    sourceMatch,
    destinationMatch,
    authorizedSourceId: authorizedSourceId || null,
    configurationEnabled: baseEnabled,
    enabled: baseEnabled && sourceMatch === true && destinationMatch === true
  };
}

export function facebookProductionWriteGate(env = process.env, context = {}) {
  return facebookProductionWriteGateDiagnostics(env, context).enabled;
}

export function facebookWriteGateDiagnostics(env = process.env, context = {}) {
  if (isProductionEnvironment(env)) {
    const production = facebookProductionWriteGateDiagnostics(env, context);
    return {
      ...production,
      gateMode: 'PRODUCTION',
      previewEnvironment: false,
      branchMatch: null,
      pilotSourceId: null
    };
  }

  const preview = facebookPilotWriteGateDiagnostics(env, context);
  return {
    ...preview,
    gateMode: preview.previewEnvironment ? 'PREVIEW_PILOT' : 'UNAVAILABLE',
    productionEnvironment: false,
    authorizedSourceId: preview.pilotSourceId
  };
}

export function facebookWriteGate(env = process.env, context = {}) {
  return facebookWriteGateDiagnostics(env, context).enabled;
}
