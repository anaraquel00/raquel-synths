import { createHmac } from 'node:crypto';

export const META_GRAPH_API_VERSION = 'v26.0';

const META_ORIGIN = 'https://graph.facebook.com';
const FACEBOOK_PERMISSIONS = [
  'pages_show_list', 'pages_manage_engagement', 'pages_manage_posts',
  'pages_read_engagement', 'pages_read_user_engagement', 'publish_video'
];
const INSTAGRAM_PERMISSIONS = ['pages_show_list', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish'];
const CONFIG_KEYS = ['META_APP_ID', 'META_APP_SECRET', 'META_FACEBOOK_PAGE_ID', 'META_FACEBOOK_PAGE_ACCESS_TOKEN', 'META_IG_USER_ID'];

function value(env, key) {
  return typeof env[key] === 'string' ? env[key].trim() : '';
}

function configuration(env) {
  return Object.fromEntries(CONFIG_KEYS.map(key => [key, value(env, key)]));
}

function missing(config, keys) {
  return keys.filter(key => !config[key]);
}

function check(code, pass, message) {
  return { code, status: pass ? 'PASS' : 'FAIL', message };
}

function capability(feed, reels) {
  return { feed, reels, stories: false };
}

function notConfigured(platform, missingConfiguration, permissions) {
  return {
    platform,
    status: 'NOT_CONFIGURED',
    missingConfiguration,
    requiredPermissions: permissions,
    missingPermissions: permissions,
    capabilities: capability(false, false),
    checks: []
  };
}

function safeExpiry(value) {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000).toISOString() : null;
}

function permissionSet(tokenData) {
  const values = [
    ...(Array.isArray(tokenData?.scopes) ? tokenData.scopes : []),
    ...(Array.isArray(tokenData?.granular_scopes) ? tokenData.granular_scopes.map(item => item?.scope) : [])
  ];
  return new Set(values.filter(item => typeof item === 'string'));
}

function appSecretProof(token, appSecret) {
  return createHmac('sha256', appSecret).update(token).digest('hex');
}

class MetaDiagnosticError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

async function graphGet(path, accessToken, params, fetchImpl) {
  const url = new URL(`/${META_GRAPH_API_VERSION}/${encodeURIComponent(path)}`, META_ORIGIN);
  for (const [key, item] of Object.entries(params || {})) if (item !== undefined && item !== null) url.searchParams.set(key, String(item));
  const response = await fetchImpl(url, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) {
    const code = Number(payload?.error?.code);
    throw new MetaDiagnosticError(Number.isFinite(code) ? `META_GRAPH_${code}` : `META_HTTP_${response.status}`);
  }
  return payload;
}

function errorPlatform(platform, permissions, errorCode, checks = []) {
  return {
    platform,
    status: 'ERROR',
    missingConfiguration: [],
    requiredPermissions: permissions,
    missingPermissions: [],
    capabilities: capability(false, false),
    checks: [...checks, check('META_REQUEST', false, errorCode)]
  };
}

export async function diagnoseMetaConnection({ env = process.env, fetchImpl = fetch } = {}) {
  const config = configuration(env);
  const facebookConfig = missing(config, ['META_APP_ID', 'META_APP_SECRET', 'META_FACEBOOK_PAGE_ID', 'META_FACEBOOK_PAGE_ACCESS_TOKEN']);
  const instagramConfig = missing(config, CONFIG_KEYS);
  const result = {
    graphApiVersion: META_GRAPH_API_VERSION,
    checkedAt: new Date().toISOString(),
    publishingEnabled: false,
    facebook: facebookConfig.length ? notConfigured('facebook', facebookConfig, FACEBOOK_PERMISSIONS) : null,
    instagram: instagramConfig.length ? notConfigured('instagram', instagramConfig, INSTAGRAM_PERMISSIONS) : null,
    relationship: { status: 'NOT_CHECKED' },
    token: { valid: false, appIdMatches: false, expiresAt: null, dataAccessExpiresAt: null }
  };

  if (facebookConfig.length) return result;

  try {
    const appAccessToken = `${config.META_APP_ID}|${config.META_APP_SECRET}`;
    const tokenResult = await graphGet('debug_token', appAccessToken, {
      input_token: config.META_FACEBOOK_PAGE_ACCESS_TOKEN
    }, fetchImpl);
    const tokenData = tokenResult.data || {};
    const scopes = permissionSet(tokenData);
    const tokenValid = tokenData.is_valid === true;
    const appIdMatches = String(tokenData.app_id || '') === config.META_APP_ID;
    result.token = {
      valid: tokenValid,
      appIdMatches,
      expiresAt: safeExpiry(tokenData.expires_at),
      dataAccessExpiresAt: safeExpiry(tokenData.data_access_expires_at)
    };

    const proof = appSecretProof(config.META_FACEBOOK_PAGE_ACCESS_TOKEN, config.META_APP_SECRET);
    const page = await graphGet(config.META_FACEBOOK_PAGE_ID, config.META_FACEBOOK_PAGE_ACCESS_TOKEN, {
      fields: 'id,name,tasks,instagram_business_account{id,username}',
      appsecret_proof: proof
    }, fetchImpl);
    const pageIdMatches = String(page.id || '') === config.META_FACEBOOK_PAGE_ID;
    const pageTasks = Array.isArray(page.tasks) ? page.tasks : [];
    const hasTask = (...names) => pageTasks.some(task => names.includes(task));
    const contentTask = hasTask('CREATE_CONTENT', 'PROFILE_PLUS_CREATE_CONTENT', 'PROFILE_PLUS_FULL_CONTROL') &&
      hasTask('MANAGE', 'PROFILE_PLUS_MANAGE', 'PROFILE_PLUS_FULL_CONTROL') &&
      hasTask('MODERATE', 'PROFILE_PLUS_MODERATE', 'PROFILE_PLUS_FULL_CONTROL');
    const missingFacebookPermissions = FACEBOOK_PERMISSIONS.filter(permission => !scopes.has(permission));
    const facebookChecks = [
      check('TOKEN_VALID', tokenValid, 'O Page Access Token deve estar válido.'),
      check('APP_MATCH', appIdMatches, 'O token deve pertencer ao Meta App configurado.'),
      check('PAGE_IDENTITY', pageIdMatches, 'A identidade retornada deve corresponder à Facebook Page configurada.'),
      check('PAGE_CONTENT_TASKS', contentTask, 'A pessoa/token deve possuir as tarefas CREATE_CONTENT, MANAGE e MODERATE ou controle total equivalente.'),
      check('FACEBOOK_PERMISSIONS', missingFacebookPermissions.length === 0, 'As permissões de publicação da Page devem estar presentes.')
    ];
    const facebookReady = facebookChecks.every(item => item.status === 'PASS');
    result.facebook = {
      platform: 'facebook',
      status: facebookReady ? 'READY' : 'ERROR',
      missingConfiguration: [],
      requiredPermissions: FACEBOOK_PERMISSIONS,
      missingPermissions: missingFacebookPermissions,
      identity: pageIdMatches ? { name: String(page.name || '') } : undefined,
      capabilities: capability(facebookReady, facebookReady),
      checks: facebookChecks
    };

    const linkedInstagramId = String(page.instagram_business_account?.id || '');
    result.relationship = {
      status: !config.META_IG_USER_ID ? 'NOT_CHECKED' :
        linkedInstagramId ? (linkedInstagramId === config.META_IG_USER_ID ? 'MATCH' : 'MISMATCH') : 'MISSING'
    };

    if (instagramConfig.length) return result;
    const instagram = await graphGet(config.META_IG_USER_ID, config.META_FACEBOOK_PAGE_ACCESS_TOKEN, {
      fields: 'id,username,account_type', appsecret_proof: proof
    }, fetchImpl);
    const instagramIdMatches = String(instagram.id || '') === config.META_IG_USER_ID;
    const professionalAccount = Boolean(instagram.account_type) && instagram.account_type !== 'PERSONAL';
    const relationshipMatches = result.relationship.status === 'MATCH';
    const missingInstagramPermissions = INSTAGRAM_PERMISSIONS.filter(permission => !scopes.has(permission));
    const instagramChecks = [
      check('TOKEN_VALID', tokenValid, 'O Page Access Token deve estar válido.'),
      check('APP_MATCH', appIdMatches, 'O token deve pertencer ao Meta App configurado.'),
      check('IG_IDENTITY', instagramIdMatches, 'A identidade retornada deve corresponder ao Instagram configurado.'),
      check('PROFESSIONAL_ACCOUNT', professionalAccount, 'A conta deve ser Instagram Professional, Business ou Creator.'),
      check('PAGE_LINKAGE', relationshipMatches, 'A conta Instagram deve estar vinculada à Facebook Page configurada.'),
      check('INSTAGRAM_PERMISSIONS', missingInstagramPermissions.length === 0, 'As permissões de publicação do Instagram devem estar presentes.')
    ];
    const instagramReady = instagramChecks.every(item => item.status === 'PASS');
    result.instagram = {
      platform: 'instagram',
      status: instagramReady ? 'READY' : 'ERROR',
      missingConfiguration: [],
      requiredPermissions: INSTAGRAM_PERMISSIONS,
      missingPermissions: missingInstagramPermissions,
      identity: instagramIdMatches ? {
        username: String(instagram.username || ''), accountType: String(instagram.account_type || '')
      } : undefined,
      capabilities: capability(instagramReady, instagramReady),
      checks: instagramChecks
    };
    return result;
  } catch (error) {
    const code = error instanceof MetaDiagnosticError ? error.code : 'META_DIAGNOSTIC_FAILED';
    if (!result.facebook) result.facebook = errorPlatform('facebook', FACEBOOK_PERMISSIONS, code);
    else if (result.facebook.status !== 'NOT_CONFIGURED') result.facebook = errorPlatform('facebook', FACEBOOK_PERMISSIONS, code, result.facebook.checks);
    if (!result.instagram) result.instagram = errorPlatform('instagram', INSTAGRAM_PERMISSIONS, code);
    else if (result.instagram.status !== 'NOT_CONFIGURED') result.instagram = errorPlatform('instagram', INSTAGRAM_PERMISSIONS, code, result.instagram.checks);
    return result;
  }
}
