import { META_GRAPH_API_VERSION } from './meta-client.js';

const META_ORIGIN = 'https://graph.facebook.com';

function segment(value, name) {
  const item = String(value || '');
  if (!/^[0-9]{5,32}$/.test(item)) throw new Error(`INVALID_${name}`);
  return item;
}

function httpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('INVALID_FACEBOOK_LINK');
    return url.href;
  } catch {
    throw new Error('INVALID_FACEBOOK_LINK');
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

export class FacebookPublishError extends Error {
  constructor(diagnostic) {
    super(`FACEBOOK_${diagnostic.requestPurpose}_${diagnostic.category}`);
    this.code = this.message;
    this.status = 502;
    this.diagnostic = diagnostic;
  }
}

export async function publishFacebookFeedPost({
  pageId,
  accessToken,
  message,
  link,
  fetchImpl = fetch
}) {
  const url = new URL(`/${META_GRAPH_API_VERSION}/${segment(pageId, 'FACEBOOK_PAGE_ID')}/feed`, META_ORIGIN);
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ message: String(message || ''), link: httpsUrl(link) }),
    signal: AbortSignal.timeout(15_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) {
    const graphCode = Number(payload?.error?.code);
    const graphSubcode = Number(payload?.error?.error_subcode);
    throw new FacebookPublishError({
      requestPurpose: 'CREATE_PAGE_FEED_POST',
      httpStatus: response.status,
      graphErrorCode: Number.isFinite(graphCode) ? graphCode : null,
      graphErrorSubcode: Number.isFinite(graphSubcode) ? graphSubcode : null,
      category: errorCategory(response.status, graphCode)
    });
  }
  const remotePostId = String(payload?.id || '');
  if (!/^[0-9]+(?:_[0-9]+)?$/.test(remotePostId) || remotePostId.length > 129) {
    throw new FacebookPublishError({
      requestPurpose: 'CREATE_PAGE_FEED_POST',
      httpStatus: response.status,
      graphErrorCode: null,
      graphErrorSubcode: null,
      category: 'INVALID_RESPONSE'
    });
  }
  return remotePostId;
}
