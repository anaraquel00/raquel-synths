import { google } from 'googleapis';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'raquel-synths-platform';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents`;

function credentials() {
  const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('FIRESTORE_CONFIGURATION_MISSING');
  const value = JSON.parse(raw);
  if (value.private_key) value.private_key = value.private_key.replace(/\\n/g, '\n');
  return value;
}

async function accessToken() {
  const value = credentials();
  const auth = new google.auth.GoogleAuth({
    credentials: value,
    projectId: value.project_id || PROJECT_ID,
    scopes: ['https://www.googleapis.com/auth/datastore']
  });
  const token = await (await auth.getClient()).getAccessToken();
  return typeof token === 'string' ? token : token.token;
}

export function decode(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue?.values || []).map(decode);
  if ('mapValue' in value) return Object.fromEntries(
    Object.entries(value.mapValue?.fields || {}).map(([key, item]) => [key, decode(item)])
  );
  return null;
}

export function documentData(document) {
  return {
    ...Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key, decode(value)])),
    id: document.name.split('/').pop(),
    updateTime: document.updateTime || ''
  };
}

function encode(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (typeof value === 'object') return { mapValue: { fields: toFields(value) } };
  return { stringValue: String(value) };
}

function toFields(value) {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)]));
}

function pathSegments(path, document = true) {
  const segments = String(path || '').split('/');
  const expectedParity = document ? 0 : 1;
  if (!segments.length || segments.length % 2 !== expectedParity ||
      segments.some(segment => !/^[a-zA-Z0-9_-]+$/.test(segment))) {
    throw new Error(document ? 'INVALID_DOCUMENT_PATH' : 'INVALID_COLLECTION_PATH');
  }
  return segments;
}

function encodedPath(segments) {
  return segments.map(segment => encodeURIComponent(segment)).join('/');
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {})
    }
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const error = new Error(`FIRESTORE_HTTP_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function getDocument(collection, id) {
  if (!/^[a-z-]+$/.test(collection) || !/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  return getDocumentPath(`${collection}/${id}`);
}

export async function getDocumentPath(path) {
  return request(`${BASE_URL}/${encodedPath(pathSegments(path))}`);
}

export async function listDocuments(collection) {
  if (!/^[a-z-]+$/.test(collection)) throw new Error('INVALID_COLLECTION');
  const documents = [];
  let pageToken = '';
  do {
    const url = new URL(`${BASE_URL}/${collection}`);
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const page = await request(url);
    documents.push(...(page?.documents || []));
    pageToken = page?.nextPageToken || '';
  } while (pageToken && documents.length < 1500);
  return documents;
}

export async function createDocument(collection, id, value) {
  return createDocumentPath(`${collection}/${id}`, value);
}

export async function createDocumentPath(path, value) {
  const segments = pathSegments(path);
  const id = segments.pop();
  const url = new URL(`${BASE_URL}/${encodedPath(segments)}`);
  url.searchParams.set('documentId', id);
  return request(url, { method: 'POST', body: JSON.stringify({ fields: toFields(value) }) });
}

export async function updateDocument(collection, id, value, updateTime) {
  return updateDocumentPath(`${collection}/${id}`, value, updateTime);
}

export async function updateDocumentPath(path, value, updateTime) {
  const url = new URL(`${BASE_URL}/${encodedPath(pathSegments(path))}`);
  url.searchParams.set('currentDocument.updateTime', updateTime);
  for (const key of Object.keys(value)) url.searchParams.append('updateMask.fieldPaths', key);
  return request(url, { method: 'PATCH', body: JSON.stringify({ fields: toFields(value) }) });
}
