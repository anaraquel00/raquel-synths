import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { createDocument, documentData, getDocument, listDocuments, updateDocument } from './firestore.js';
import { getDelivery } from './deliveries.js';
import { resolveSource } from './source-adapters.js';

const COLLECTION = 'social-packages';
const DESTINATIONS = new Set(['instagram', 'facebook']);
const ASSET_TYPES = new Set(['IMAGE', 'VIDEO', 'REEL', 'CAROUSEL', 'STORY']);
const DRY_RUN_TTL = 10 * 60 * 1000;

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, stable(value[key])])
  );
  return value;
}

function packageDigest(value) {
  const { updateTime, sourceStale, approvalValid, ...stored } = value;
  return createHash('sha256').update(JSON.stringify(stable(stored))).digest('hex');
}

export function makeDryRunToken(value) {
  const payload = Buffer.from(JSON.stringify({ id: value.id, digest: packageDigest(value), expiresAt: Date.now() + DRY_RUN_TTL })).toString('base64url');
  const signature = createHmac('sha256', process.env.RQS_ADMIN_TOKEN).update(`social-dry-run:${payload}`).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyDryRunToken(token, value) {
  const [payload, signature, extra] = String(token || '').split('.');
  if (!payload || !signature || extra) return false;
  const expected = createHmac('sha256', process.env.RQS_ADMIN_TOKEN).update(`social-dry-run:${payload}`).digest('base64url');
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.id === value.id && decoded.digest === packageDigest(value) && decoded.expiresAt > Date.now();
  } catch { return false; }
}

export function validHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password &&
      !['localhost', '127.0.0.1', 'go.raquelsynths.com'].includes(url.hostname);
  } catch { return false; }
}

function field(code, pass, message) { return { code, status: pass ? 'PASS' : 'FAIL', message }; }

export function isSourceCurrent(packageValue, source) {
  return Boolean(source && packageValue.sourceRevision === source.sourceRevision);
}

export function draftFromInput(input, source, existing = null) {
  const value = input && typeof input === 'object' ? input : {};
  return {
    id: existing?.id || randomUUID(),
    sourceType: source.sourceType,
    sourceId: source.sourceId,
    sourceUrl: source.sourceUrl,
    sourceRevision: String(value.sourceRevision || ''),
    language: source.language,
    socialAssetUrl: String(value.socialAssetUrl || '').trim(),
    socialAssetType: String(value.socialAssetType || 'IMAGE'),
    instagramCaption: String(value.instagramCaption || '').trim(),
    facebookCaption: String(value.facebookCaption || '').trim(),
    cta: String(value.cta || '').trim(),
    destinationUrl: String(value.destinationUrl || source.musicDeepLinkUrl || source.canonicalUrl).trim(),
    utmCampaign: String(value.utmCampaign || '').trim(),
    utmContent: String(value.utmContent || '').trim(),
    destinations: Array.isArray(value.destinations) ? [...new Set(value.destinations)] : [],
    createdAt: existing?.createdAt || new Date().toISOString(),
    approvedAt: null,
    status: 'DRAFT'
  };
}

export function diagnose(packageValue, source, forApproval = false) {
  const checks = [
    field('SOURCE_EXISTS', Boolean(source), 'A fonte deve existir e continuar elegível.'),
    field('SOURCE_REVISION', isSourceCurrent(packageValue, source), 'A revisão da fonte deve ser atual.'),
    field('DESTINATION_URL', validHttps(packageValue.destinationUrl), 'Use uma URL HTTPS válida.'),
    field('DESTINATIONS', Array.isArray(packageValue.destinations) && packageValue.destinations.length > 0 && packageValue.destinations.every(value => DESTINATIONS.has(value)), 'Selecione Instagram e/ou Facebook.'),
    field('INSTAGRAM_CAPTION', !packageValue.destinations.includes('instagram') || Boolean(packageValue.instagramCaption), 'Informe a legenda do Instagram.'),
    field('FACEBOOK_CAPTION', !packageValue.destinations.includes('facebook') || Boolean(packageValue.facebookCaption), 'Informe a legenda do Facebook.'),
    field('ASSET_URL', !packageValue.socialAssetUrl || validHttps(packageValue.socialAssetUrl), 'Use uma URL HTTPS válida para o asset.'),
    field('ASSET_TYPE', ASSET_TYPES.has(packageValue.socialAssetType), 'Selecione um tipo de asset válido.'),
    field('UTM_CAMPAIGN', !packageValue.utmCampaign || /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(packageValue.utmCampaign), 'Use letras, números, hífen ou underscore em utmCampaign.'),
    field('UTM_CONTENT', !packageValue.utmContent || /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(packageValue.utmContent), 'Use letras, números, hífen ou underscore em utmContent.'),
    field('FIELD_LENGTHS', packageValue.instagramCaption.length <= 2200 && packageValue.facebookCaption.length <= 63206 && packageValue.cta.length <= 200 && packageValue.destinationUrl.length <= 2048, 'Há campo acima do limite permitido.')
  ];
  if (forApproval && packageValue.destinations.includes('instagram')) {
    checks.push(field('INSTAGRAM_ASSET', Boolean(packageValue.socialAssetUrl), 'Instagram exige um asset antes da aprovação.'));
  }
  if (forApproval) {
    checks.push(field('ASSET_CAPABILITY', !['CAROUSEL', 'STORY'].includes(packageValue.socialAssetType), 'Carousel e Story podem ser rascunhados; a aprovação aguarda suporte específico de mídia.'));
  }
  return { status: checks.every(item => item.status === 'PASS') ? 'PASS' : 'FAIL', checks };
}

function editableDraft(existing) {
  if (existing && existing.status !== 'DRAFT') {
    const error = new Error('PACKAGE_NOT_DRAFT');
    error.status = 409;
    throw error;
  }
}

export function canCancel(status) {
  return status === 'DRAFT' || status === 'APPROVED';
}

export async function listPackages() {
  const documents = await listDocuments(COLLECTION);
  const packages = await Promise.all(documents.map(async document => {
    const value = documentData(document);
    const [source, instagramDelivery] = await Promise.all([
      resolveSource(value.sourceType, value.sourceId, value.language),
      Array.isArray(value.destinations) && value.destinations.includes('instagram')
        ? getDelivery(value.id, 'instagram')
        : null
    ]);
    const current = isSourceCurrent(value, source);
    return {
      ...value,
      sourceStale: !current,
      approvalValid: value.status === 'APPROVED' && current,
      instagramDelivery
    };
  }));
  return packages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPackage(id) {
  const document = await getDocument(COLLECTION, id);
  return document ? { ...documentData(document), updateTime: document.updateTime } : null;
}

export async function saveDraft(input) {
  const existing = input.id ? await getPackage(input.id) : null;
  if (input.id && !existing) throw Object.assign(new Error('PACKAGE_NOT_FOUND'), { status: 404 });
  editableDraft(existing);
  if (existing && (existing.sourceType !== input.sourceType || existing.sourceId !== input.sourceId)) {
    throw Object.assign(new Error('SOURCE_IMMUTABLE'), { status: 409 });
  }
  const source = await resolveSource(input.sourceType, input.sourceId, input.language || existing?.language || 'pt-BR');
  if (!source) throw Object.assign(new Error('SOURCE_NOT_ELIGIBLE'), { status: 409 });
  const value = draftFromInput(input, source, existing);
  if (value.sourceRevision !== source.sourceRevision) throw Object.assign(new Error('SOURCE_REVISION_STALE'), { status: 409 });
  // Drafts may be incomplete, but never persist invalid URLs or malformed fields.
  if ((value.socialAssetUrl && !validHttps(value.socialAssetUrl)) ||
      !validHttps(value.destinationUrl) || !ASSET_TYPES.has(value.socialAssetType) ||
      value.destinations.some(item => !DESTINATIONS.has(item)) ||
      value.instagramCaption.length > 2200 || value.facebookCaption.length > 63206 ||
      value.cta.length > 200 || value.destinationUrl.length > 2048 ||
      value.socialAssetUrl.length > 2048 ||
      (value.utmCampaign && !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(value.utmCampaign)) ||
      (value.utmContent && !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(value.utmContent))) {
    throw Object.assign(new Error('INVALID_DRAFT'), { status: 400 });
  }
  if (existing) await updateDocument(COLLECTION, value.id, value, existing.updateTime);
  else await createDocument(COLLECTION, value.id, value);
  return value;
}

export async function dryRun(input) {
  const source = await resolveSource(input.sourceType, input.sourceId, input.language || 'pt-BR');
  const existing = input.id ? await getPackage(input.id) : null;
  const value = source ? draftFromInput(input, source, existing) : draftFromInput(input, {
    sourceType: input.sourceType, sourceId: input.sourceId, sourceUrl: '',
    sourceRevision: '', language: input.language || 'pt-BR', canonicalUrl: ''
  });
  const diagnostics = diagnose(value, source, true);
  diagnostics.checks.push(field('DRAFT_SAVED', Boolean(existing && existing.status === 'DRAFT' && packageDigest(value) === packageDigest(existing)), 'Salve o draft atual antes de aprovar.'));
  diagnostics.status = diagnostics.checks.every(item => item.status === 'PASS') ? 'PASS' : 'FAIL';
  return { diagnostics, dryRunToken: diagnostics.status === 'PASS' ? makeDryRunToken(existing) : null };
}

export async function approvePackage(id, token) {
  const existing = await getPackage(id);
  if (!existing) throw Object.assign(new Error('PACKAGE_NOT_FOUND'), { status: 404 });
  editableDraft(existing);
  if (!verifyDryRunToken(token, existing)) throw Object.assign(new Error('DRY_RUN_REQUIRED'), { status: 409 });
  const source = await resolveSource(existing.sourceType, existing.sourceId, existing.language);
  const diagnostics = diagnose(existing, source, true);
  if (diagnostics.status === 'FAIL') return { diagnostics, package: null };
  const value = { ...existing, status: 'APPROVED', approvedAt: new Date().toISOString() };
  delete value.updateTime;
  await updateDocument(COLLECTION, id, value, existing.updateTime);
  return { diagnostics, package: value };
}

export async function cancelPackage(id) {
  const existing = await getPackage(id);
  if (!existing) throw Object.assign(new Error('PACKAGE_NOT_FOUND'), { status: 404 });
  if (!canCancel(existing.status)) throw Object.assign(new Error('PACKAGE_CANNOT_CANCEL'), { status: 409 });
  const value = { ...existing, status: 'CANCELED' };
  delete value.updateTime;
  await updateDocument(COLLECTION, id, value, existing.updateTime);
  return value;
}

const PUBLICATION_TRANSITIONS = {
  APPROVED: new Set(['PUBLISHING']),
  PUBLISHING: new Set(['PUBLISHED', 'FAILED'])
};

export async function transitionPackagePublication(existing, status, fields = {}) {
  if (!existing?.id || !existing.updateTime || !PUBLICATION_TRANSITIONS[existing.status]?.has(status)) {
    throw Object.assign(new Error('INVALID_PACKAGE_PUBLICATION_TRANSITION'), { status: 409 });
  }
  const {
    updateTime, sourceStale, approvalValid, instagramDelivery,
    ...stored
  } = existing;
  const value = { ...stored, ...fields, status };
  const document = await updateDocument(COLLECTION, existing.id, value, updateTime);
  return documentData(document);
}
