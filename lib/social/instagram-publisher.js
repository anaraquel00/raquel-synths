import { META_GRAPH_API_VERSION } from './meta-client.js';

const META_ORIGIN = 'https://graph.facebook.com';

function segment(value, name) {
  const item = String(value || '');
  if (!/^[0-9]{5,32}$/.test(item)) throw new Error(`INVALID_${name}`);
  return item;
}

function errorCategory(httpStatus, graphCode) {
  if (httpStatus === 429 || [4, 17, 32, 613].includes(graphCode)) return 'RATE_LIMIT';
  if (httpStatus >= 500) return 'META_SERVICE';
  if (graphCode === 190) return 'AUTHENTICATION';
  if ([10, 200].includes(graphCode)) return 'PERMISSION';
  if (graphCode === 100 || httpStatus === 400) return 'INVALID_REQUEST';
  return 'GRAPH_API_ERROR';
}

export class InstagramPublishError extends Error {
  constructor(diagnostic) {
    super(`INSTAGRAM_${diagnostic.requestPurpose}_${diagnostic.category}`);
    this.code = this.message;
    this.status = 502;
    this.diagnostic = diagnostic;
  }
}

async function graphPost(purpose, path, accessToken, parameters, fetchImpl) {
  const url = new URL(`/${META_GRAPH_API_VERSION}/${path}`, META_ORIGIN);
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(parameters),
    signal: AbortSignal.timeout(15_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) {
    const graphCode = Number(payload?.error?.code);
    const graphSubcode = Number(payload?.error?.error_subcode);
    throw new InstagramPublishError({
      requestPurpose: purpose,
      httpStatus: response.status,
      graphErrorCode: Number.isFinite(graphCode) ? graphCode : null,
      graphErrorSubcode: Number.isFinite(graphSubcode) ? graphSubcode : null,
      category: errorCategory(response.status, graphCode)
    });
  }
  const id = String(payload?.id || '');
  if (!/^[0-9]{5,64}$/.test(id)) {
    throw new InstagramPublishError({
      requestPurpose: purpose,
      httpStatus: response.status,
      graphErrorCode: null,
      graphErrorSubcode: null,
      category: 'INVALID_RESPONSE'
    });
  }
  return id;
}

export function createInstagramImageContainer({ igUserId, accessToken, imageUrl, caption, fetchImpl = fetch }) {
  return graphPost('CREATE_IMAGE_CONTAINER', `${segment(igUserId, 'IG_USER_ID')}/media`, accessToken, {
    image_url: imageUrl,
    caption
  }, fetchImpl);
}

export function publishInstagramContainer({ igUserId, accessToken, creationId, fetchImpl = fetch }) {
  return graphPost('PUBLISH_IMAGE_CONTAINER', `${segment(igUserId, 'IG_USER_ID')}/media_publish`, accessToken, {
    creation_id: segment(creationId, 'CREATION_ID')
  }, fetchImpl);
}
