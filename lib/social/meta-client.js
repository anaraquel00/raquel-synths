import { createHmac } from 'node:crypto';

export const META_GRAPH_API_VERSION = 'v26.0';

const META_ORIGIN = 'https://graph.facebook.com';
const EXPECTED_INSTAGRAM_USERNAME = 'rqs_synths';
const FACEBOOK_PERMISSIONS = [
  'pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'publish_video'
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
  constructor(diagnostic) {
    super(diagnostic.category);
    this.diagnostic = diagnostic;
  }
}

function errorCategory(httpStatus, graphCode) {
  if (httpStatus === 429 || [4, 17, 32, 613].includes(graphCode)) return 'RATE_LIMIT';
  if (httpStatus >= 500) return 'META_SERVICE';
  if (graphCode === 190) return 'AUTHENTICATION';
  if ([10, 200].includes(graphCode)) return 'PERMISSION';
  if (graphCode === 100 || httpStatus === 400) return 'INVALID_REQUEST';
  return 'GRAPH_API_ERROR';
}

async function graphGet(purpose, path, accessToken, params, fetchImpl) {
  const safePath = String(path).split('/').map(segment => encodeURIComponent(segment)).join('/');
  const url = new URL(`/${META_GRAPH_API_VERSION}/${safePath}`, META_ORIGIN);
  for (const [key, item] of Object.entries(params || {})) if (item !== undefined && item !== null) url.searchParams.set(key, String(item));
  const response = await fetchImpl(url, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) {
    const graphCode = Number(payload?.error?.code);
    const graphSubcode = Number(payload?.error?.error_subcode);
    throw new MetaDiagnosticError({
      requestPurpose: purpose,
      httpStatus: response.status,
      graphErrorCode: Number.isFinite(graphCode) ? graphCode : null,
      graphErrorSubcode: Number.isFinite(graphSubcode) ? graphSubcode : null,
      category: errorCategory(response.status, graphCode)
    });
  }
  return payload;
}

function errorPlatform(platform, permissions, diagnostic, checks = []) {
  return {
    platform,
    status: 'ERROR',
    missingConfiguration: [],
    requiredPermissions: permissions,
    missingPermissions: [],
    capabilities: capability(false, false),
    checks: [
      ...checks,
      {
        ...check('META_REQUEST', false, `A leitura Meta falhou em ${diagnostic.requestPurpose}.`),
        diagnostic
      }
    ]
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
    const tokenResult = await graphGet('TOKEN_VALIDATION', 'debug_token', appAccessToken, {
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
    const page = await graphGet('PAGE_IDENTITY', config.META_FACEBOOK_PAGE_ID, config.META_FACEBOOK_PAGE_ACCESS_TOKEN, {
      fields: 'id,name,instagram_business_account',
      appsecret_proof: proof
    }, fetchImpl);
    const pageIdMatches = String(page.id || '') === config.META_FACEBOOK_PAGE_ID;
    const pageNamePresent = typeof page.name === 'string' && page.name.trim().length > 0;
    const linkedInstagramId = String(page.instagram_business_account?.id || '');
    const relationshipMatches = Boolean(config.META_IG_USER_ID) && linkedInstagramId === config.META_IG_USER_ID;
    result.relationship = {
      status: linkedInstagramId ? (relationshipMatches ? 'MATCH' : 'MISMATCH') : 'MISSING'
    };
    const missingFacebookPermissions = FACEBOOK_PERMISSIONS.filter(permission => !scopes.has(permission));
    const facebookChecks = [
      check('TOKEN_VALID', tokenValid, 'O Page Access Token deve estar válido.'),
      check('APP_MATCH', appIdMatches, 'O token deve pertencer ao Meta App configurado.'),
      check('PAGE_IDENTITY', pageIdMatches, 'A identidade retornada deve corresponder à Facebook Page configurada.'),
      check('PAGE_NAME', pageNamePresent, 'A Facebook Page configurada deve possuir nome.'),
      check('PAGE_IG_RELATIONSHIP', relationshipMatches, 'A Page deve retornar o Instagram Professional configurado em instagram_business_account.'),
      check('FACEBOOK_PERMISSIONS', missingFacebookPermissions.length === 0, 'As permissões de publicação da Page devem estar presentes.')
    ];
    const facebookReady = facebookChecks.every(item => item.status === 'PASS');
    result.facebook = {
      platform: 'facebook',
      status: facebookReady ? 'READY' : 'ERROR',
      missingConfiguration: [],
      requiredPermissions: FACEBOOK_PERMISSIONS,
      missingPermissions: missingFacebookPermissions,
      identity: pageIdMatches ? { id: String(page.id), name: String(page.name || '') } : undefined,
      capabilities: capability(facebookReady, facebookReady),
      checks: facebookChecks
    };

    if (instagramConfig.length) return result;
    const instagram = await graphGet('INSTAGRAM_IDENTITY', config.META_IG_USER_ID, config.META_FACEBOOK_PAGE_ACCESS_TOKEN, {
      fields: 'id,username', appsecret_proof: proof
    }, fetchImpl);
    const instagramIdMatches = String(instagram.id || '') === config.META_IG_USER_ID;
    const instagramUsernameMatches = String(instagram.username || '').trim().toLowerCase() === EXPECTED_INSTAGRAM_USERNAME;
    const missingInstagramPermissions = INSTAGRAM_PERMISSIONS.filter(permission => !scopes.has(permission));
    const instagramChecks = [
      check('TOKEN_VALID', tokenValid, 'O Page Access Token deve estar válido.'),
      check('APP_MATCH', appIdMatches, 'O token deve pertencer ao Meta App configurado.'),
      check('IG_IDENTITY', instagramIdMatches, 'A identidade retornada deve corresponder ao Instagram configurado.'),
      check('IG_USERNAME', instagramUsernameMatches, 'O username retornado deve corresponder ao Instagram RQS.'),
      check('PROFESSIONAL_ACCOUNT', relationshipMatches, 'A elegibilidade profissional deve ser confirmada pelo vínculo instagram_business_account da Page.'),
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
        id: String(instagram.id), username: String(instagram.username || '')
      } : undefined,
      capabilities: capability(instagramReady, instagramReady),
      checks: instagramChecks
    };
    return result;
  } catch (error) {
    const diagnostic = error instanceof MetaDiagnosticError ? error.diagnostic : {
      requestPurpose: 'UNKNOWN', httpStatus: null, graphErrorCode: null,
      graphErrorSubcode: null, category: 'DIAGNOSTIC_FAILURE'
    };
    if (diagnostic.requestPurpose !== 'INSTAGRAM_IDENTITY') {
      if (!result.facebook) result.facebook = errorPlatform('facebook', FACEBOOK_PERMISSIONS, diagnostic);
      else if (result.facebook.status !== 'NOT_CONFIGURED') result.facebook = errorPlatform('facebook', FACEBOOK_PERMISSIONS, diagnostic, result.facebook.checks);
    }
    if (!result.instagram) result.instagram = errorPlatform('instagram', INSTAGRAM_PERMISSIONS, diagnostic);
    else if (result.instagram.status !== 'NOT_CONFIGURED') result.instagram = errorPlatform('instagram', INSTAGRAM_PERMISSIONS, diagnostic, result.instagram.checks);
    return result;
  }
}
