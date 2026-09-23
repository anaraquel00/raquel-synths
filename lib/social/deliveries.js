import { createHash } from 'node:crypto';
import { createDocumentPath, documentData, getDocumentPath, updateDocumentPath } from './firestore.js';

const DESTINATIONS = new Set(['instagram', 'facebook']);

function segment(value, name) {
  const item = String(value || '');
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(item)) throw new Error(`INVALID_${name}`);
  return item;
}

export function deliveryDocumentPath(packageId, destination) {
  const id = segment(packageId, 'PACKAGE_ID');
  const platform = segment(destination, 'DESTINATION');
  if (!DESTINATIONS.has(platform)) throw new Error('INVALID_DESTINATION');
  return `social-packages/${id}/deliveries/${platform}`;
}

export function deliveryIdempotencyKey(packageId, destination) {
  return createHash('sha256')
    .update(`rqs-social-delivery:v1:${deliveryDocumentPath(packageId, destination)}`)
    .digest('hex');
}

export function createDeliveryFoundation(packageId, destination) {
  return {
    status: 'NOT_STARTED',
    idempotencyKey: deliveryIdempotencyKey(packageId, destination),
    remoteContainerId: null,
    remotePostId: null,
    attemptCount: 0,
    lastError: null,
    publishedAt: null
  };
}

export function deliveryDecision(delivery) {
  if (!delivery) return 'READY';
  if (delivery?.remotePostId) return 'ALREADY_PUBLISHED';
  if (delivery?.remoteContainerId || delivery?.status === 'PUBLISHING') return 'RECONCILE_REQUIRED';
  if (delivery?.status === 'FAILED' || Number(delivery?.attemptCount) > 0) return 'MANUAL_REVIEW_REQUIRED';
  return delivery?.status === 'NOT_STARTED' ? 'READY' : 'BLOCKED';
}

export function assertDeliveryCanStart(delivery) {
  const decision = deliveryDecision(delivery);
  if (decision !== 'READY') throw Object.assign(new Error(`DELIVERY_${decision}`), { status: 409 });
  return true;
}

function storedDelivery(value) {
  const { id, updateTime, packageId, destination, ...stored } = value;
  return stored;
}

export async function getDelivery(packageId, destination) {
  const document = await getDocumentPath(deliveryDocumentPath(packageId, destination));
  return document ? { ...documentData(document), packageId, destination } : null;
}

export async function claimDelivery(packageId, destination) {
  const value = {
    ...createDeliveryFoundation(packageId, destination),
    status: 'PENDING',
    attemptCount: 1
  };
  const document = await createDocumentPath(deliveryDocumentPath(packageId, destination), value);
  return { ...documentData(document), packageId, destination };
}

export async function updateDelivery(delivery, patch) {
  if (!delivery?.updateTime) throw new Error('DELIVERY_UPDATE_TIME_REQUIRED');
  const packageId = delivery.packageId || patch.packageId;
  const destination = delivery.destination || patch.destination;
  const value = storedDelivery({ ...delivery, ...patch });
  const document = await updateDocumentPath(
    deliveryDocumentPath(packageId, destination),
    value,
    delivery.updateTime
  );
  return { ...documentData(document), packageId, destination };
}
