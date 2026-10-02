export type StoreMerchant =
  | 'shein'
  | 'mercado-livre'
  | 'amazon'
  | 'aliexpress'
  | 'stripe'
  | 'partner'
  | 'unknown';

export type StoreProductStatus = 'available' | 'sold_out' | 'inactive';

export type StoreProductType = 'affiliate' | 'official' | 'unknown';

export type StoreProductOriginType =
  | 'broklin-saga'
  | 'jonah-saga'
  | 'global-saga'
  | 'system-log'
  | 'discography';

export type StoreProductOriginCollection =
  | 'lore'
  | 'lore-jonah'
  | 'global-sagas'
  | 'logs'
  | 'discography';

export interface StoreProductOrigin {
  type: StoreProductOriginType;
  title: string;
  featuredIn: string;
  sourceCollection:
    StoreProductOriginCollection;
  sourceId: string;
}

const AFFILIATE_MERCHANTS: StoreMerchant[] = [
  'shein',
  'mercado-livre',
  'amazon',
  'aliexpress'
];

export function resolveStoreDestination(product: any): string {
  const raw = product?.destinationUrl
    || product?.stripeUrl
    || product?.link
    || product?.url
    || '';

  return typeof raw === 'string'
    ? raw.trim().replace(/['"]/g, '')
    : '';
}

export function resolveStoreMerchant(url: string): StoreMerchant {
  const lower = (url || '').toLowerCase();

  if (!lower) return 'unknown';

  if (
    lower.includes('buy.stripe.com')
    || lower.includes('stripe.com')
    || lower.includes('checkout.stripe')
  ) {
    return 'stripe';
  }

  if (lower.includes('shein.com')) return 'shein';

  if (
    lower.includes('mercadolivre.com')
    || lower.includes('mercadolibre.com')
    || lower.includes('meli.la')
  ) {
    return 'mercado-livre';
  }

  if (
    lower.includes('amazon.')
    || lower.includes('amzn.to')
  ) {
    return 'amazon';
  }

  if (
    lower.includes('aliexpress.com')
    || lower.includes('s.click.aliexpress')
  ) {
    return 'aliexpress';
  }

  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return 'partner';
  }

  return 'unknown';
}

export function getStoreMerchantLabel(merchant: StoreMerchant): string {
  switch (merchant) {
    case 'shein':
      return 'SHEIN';

    case 'mercado-livre':
      return 'Mercado Livre';

    case 'amazon':
      return 'Amazon';

    case 'aliexpress':
      return 'AliExpress';

    case 'stripe':
      return 'RQS / Stripe';

    case 'partner':
      return 'Partner Store';

    default:
      return 'External Store';
  }
}

export function normalizeStoreProductStatus(status: unknown): StoreProductStatus {
  if (status === 'sold_out') return 'sold_out';
  if (status === 'inactive') return 'inactive';

  if (
    status === 'available'
    || status === 'avaliable'
    || status === undefined
    || status === null
    || status === ''
  ) {
    return 'available';
  }

  return 'inactive';
}

const STORE_ORIGIN_COLLECTION_BY_TYPE: Record<
  StoreProductOriginType,
  StoreProductOriginCollection
> = {
  'broklin-saga': 'lore',
  'jonah-saga': 'lore-jonah',
  'global-saga': 'global-sagas',
  'system-log': 'logs',
  discography: 'discography'
};

function decodeStoreOriginId(
  value: string
): string {
  try {
    return decodeURIComponent(
      value
    );
  } catch {
    return value;
  }
}

function storeOriginPathId(
  route: string,
  prefix: string
): string {
  const pathname =
    route.split(/[?#]/u)[0];

  if (!pathname.startsWith(prefix)) {
    return '';
  }

  return decodeStoreOriginId(
    pathname
      .slice(prefix.length)
      .split('/')[0]
  ).trim();
}

function inferLegacyStoreSagaType(
  route: string
): StoreProductOriginType | null {
  const pathname =
    route.split(/[?#]/u)[0];

  if (
    pathname.startsWith(
      '/lore/broklin/'
    )
  ) {
    return 'broklin-saga';
  }

  if (
    pathname.startsWith(
      '/lore/jonah/'
    )
  ) {
    return 'jonah-saga';
  }

  if (
    pathname.startsWith(
      '/hybrid-reader/'
    )
  ) {
    return 'global-saga';
  }

  return null;
}

function legacyStoreDiscographyId(
  value: any,
  route: string
): string {
  const releaseId =
    String(
      value?.releaseId || ''
    ).trim();

  if (releaseId) {
    return releaseId;
  }

  try {
    const url =
      new URL(
        route,
        'https://raquelsynths.local'
      );

    return String(
      url.searchParams.get(
        'release'
      ) || ''
    ).trim();
  } catch {
    return '';
  }
}

function legacyStoreSourceId(
  type: StoreProductOriginType,
  value: any,
  route: string
): string {
  const explicit =
    String(
      value?.sourceId || ''
    ).trim();

  if (explicit) {
    return explicit;
  }

  if (type === 'discography') {
    return legacyStoreDiscographyId(
      value,
      route
    );
  }

  if (type === 'system-log') {
    return storeOriginPathId(
      route,
      '/log-reader/'
    );
  }

  if (type === 'broklin-saga') {
    return storeOriginPathId(
      route,
      '/lore/broklin/'
    );
  }

  if (type === 'jonah-saga') {
    return storeOriginPathId(
      route,
      '/lore/jonah/'
    );
  }

  return storeOriginPathId(
    route,
    '/hybrid-reader/'
  );
}

function validStoreSourceId(
  value: string
): boolean {
  return Boolean(
    value &&
    value.length <= 512 &&
    value !== '.' &&
    value !== '..' &&
    !/[\\/]/u.test(value)
  );
}

export function normalizeStoreProductOrigin(
  value: any
): StoreProductOrigin | null {
  const rawType =
    String(value?.type || '')
      .trim()
      .toLowerCase();

  const legacyRoute =
    String(value?.route || '')
      .trim();

  let type:
    StoreProductOriginType | null =
      null;

  if (
    rawType === 'broklin-saga' ||
    rawType === 'jonah-saga' ||
    rawType === 'global-saga' ||
    rawType === 'system-log' ||
    rawType === 'discography'
  ) {
    type = rawType;
  } else if (
    rawType === 'saga'
  ) {
    // Compatibility for origins written
    // before Universal Origin Reference.
    type =
      inferLegacyStoreSagaType(
        legacyRoute
      );
  }

  if (!type) {
    return null;
  }

  const title =
    String(value?.title || '')
      .trim();

  if (!title) {
    return null;
  }

  const sourceCollection =
    STORE_ORIGIN_COLLECTION_BY_TYPE[
      type
    ];

  const sourceId =
    legacyStoreSourceId(
      type,
      value,
      legacyRoute
    );

  if (
    !validStoreSourceId(
      sourceId
    )
  ) {
    return null;
  }

  return {
    type,
    title,

    featuredIn:
      String(
        value?.featuredIn || ''
      ).trim(),

    sourceCollection,
    sourceId
  };
}

export function getStoreOriginTypeLabel(
  type: StoreProductOriginType
): string {
  if (type === 'system-log') {
    return 'SYSTEM LOG';
  }

  if (type === 'discography') {
    return 'DISCOGRAPHY';
  }

  if (type === 'broklin-saga') {
    return 'BROKLIN SAGA';
  }

  if (type === 'jonah-saga') {
    return 'JONAH SAGA';
  }

  if (type === 'global-saga') {
    return 'GLOBAL SAGA';
  }

  return '';
}

export function getStoreOriginCta(
  type: StoreProductOriginType
): string {
  if (type === 'system-log') {
    return 'ACCESS LOG →';
  }

  if (type === 'discography') {
    return 'ACCESS RELEASE →';
  }

  if (
    type === 'broklin-saga' ||
    type === 'jonah-saga' ||
    type === 'global-saga'
  ) {
    return 'ACCESS STORY →';
  }

  return '';
}

export function getStoreOriginHref(
  origin: StoreProductOrigin
): string {
  const sourceId =
    encodeURIComponent(
      origin.sourceId
    );

  if (
    origin.type ===
    'broklin-saga'
  ) {
    return (
      `/lore/broklin/${sourceId}`
    );
  }

  if (
    origin.type ===
    'jonah-saga'
  ) {
    return (
      `/lore/jonah/${sourceId}`
    );
  }

  if (
    origin.type ===
    'global-saga'
  ) {
    return (
      `/hybrid-reader/${sourceId}`
    );
  }

  if (
    origin.type ===
    'system-log'
  ) {
    return (
      `/log-reader/${sourceId}`
    );
  }

  return (
    '/musical-archives?release=' +
    sourceId
  );
}

export function adaptStoreProduct<T extends Record<string, any>>(product: T) {
  const destinationUrl = resolveStoreDestination(product);
  const merchant = resolveStoreMerchant(destinationUrl);

  const productType: StoreProductType =
    AFFILIATE_MERCHANTS.includes(merchant)
      ? 'affiliate'
      : merchant === 'stripe'
        ? 'official'
        : 'unknown';

  return {
    ...product,
    destinationUrl,
    merchant,
    merchantLabel: getStoreMerchantLabel(merchant),
    productType,
    status: normalizeStoreProductStatus(product?.['status']),
    origin: normalizeStoreProductOrigin(product?.['origin'])
  };
}

export function isVisibleAffiliateProduct(product: any): boolean {
  return (
    product?.productType === 'affiliate'
    && AFFILIATE_MERCHANTS.includes(product?.merchant)
    && product?.status !== 'inactive'
  );
}

export function getStoreMerchantCta(
  merchant: StoreMerchant,
  lang: 'pt' | 'en'
): string {
  if (lang === 'en') {
    switch (merchant) {
      case 'shein':
        return 'VIEW ON SHEIN ↗';
      case 'mercado-livre':
        return 'VIEW ON MERCADO LIVRE ↗';
      case 'amazon':
        return 'VIEW ON AMAZON ↗';
      case 'aliexpress':
        return 'VIEW ON ALIEXPRESS ↗';
      default:
        return 'VIEW EXTERNAL STORE ↗';
    }
  }

  switch (merchant) {
    case 'shein':
      return 'VER NA SHEIN ↗';
    case 'mercado-livre':
      return 'VER NO MERCADO LIVRE ↗';
    case 'amazon':
      return 'VER NA AMAZON ↗';
    case 'aliexpress':
      return 'VER NO ALIEXPRESS ↗';
    default:
      return 'VER LOJA EXTERNA ↗';
  }
}
export function storeDescriptionPlainText(
  value: unknown,
  preserveParagraphs = false
): string {
  let text = String(value || '');

  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<\/li\s*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  if (preserveParagraphs) {
    return text
      .replace(/[ \t]+/g, ' ')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return text
    .replace(/\s+/g, ' ')
    .trim();
}

function createStoreDescriptionTeaser(
  value: string
): string {
  const text =
    storeDescriptionPlainText(value);

  if (!text) return '';

  const firstSentence =
    text
      .match(
        /^.*?[.!?](?:\s|$)/
      )?.[0]
      ?.trim();

  if (
    firstSentence &&
    firstSentence.length >= 35 &&
    firstSentence.length <= 120
  ) {
    return firstSentence;
  }

  if (text.length <= 115) {
    return text;
  }

  const teaser =
    text.slice(0, 112);

  const lastSpace =
    teaser.lastIndexOf(' ');

  return `${
    teaser
      .slice(
        0,
        lastSpace > 70
          ? lastSpace
          : 112
      )
      .trim()
  }…`;
}

export function getStoreProductTeaser(
  product: any,
  lang: 'pt' | 'en'
): string {
  const content =
    product?.content?.[lang];

  const editorialShort =
    storeDescriptionPlainText(
      content?.shortDescription
    );

  if (editorialShort) {
    return editorialShort;
  }

  return createStoreDescriptionTeaser(
    content?.description || ''
  );
}
