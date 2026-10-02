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
  | 'none'
  | 'saga'
  | 'system-log'
  | 'discography';

export interface StoreProductOrigin {
  type: StoreProductOriginType;
  title: string;
  featuredIn: string;
  releaseId: string;
  route: string;
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

function validStoreOriginRoute(
  type: StoreProductOriginType,
  route: string
): boolean {
  if (type === 'none') {
    return true;
  }

  if (
    !route.startsWith('/') ||
    route.startsWith('//') ||
    route.includes('\\') ||
    /\s/u.test(route)
  ) {
    return false;
  }

  const pathname =
    route.split(/[?#]/u)[0];

  if (type === 'discography') {
    return (
      pathname === '/discografia' ||
      pathname.startsWith('/discografia/') ||
      pathname === '/musical-archives' ||
      pathname.startsWith('/musical-archives/')
    );
  }

  if (type === 'system-log') {
    return (
      pathname === '/logs-archive' ||
      pathname.startsWith('/log-reader/')
    );
  }

  return (
    pathname === '/hybrid-saga' ||
    pathname.startsWith('/hybrid-reader/') ||
    pathname.startsWith('/lore/') ||
    pathname.startsWith('/visual-novel/')
  );
}

export function normalizeStoreProductOrigin(
  value: any
): StoreProductOrigin | null {
  const type =
    String(value?.type || '')
      .trim()
      .toLowerCase() as StoreProductOriginType;

  if (
    ![
      'saga',
      'system-log',
      'discography'
    ].includes(type)
  ) {
    return null;
  }

  const title =
    String(value?.title || '')
      .trim();

  const featuredIn =
    String(value?.featuredIn || '')
      .trim();

  const releaseId =
    String(value?.releaseId || '')
      .trim();

  const rawRoute =
    String(value?.route || '')
      .trim();

  if (!title) {
    return null;
  }

  // New canonical discography contract.
  if (
    type === 'discography' &&
    releaseId
  ) {
    return {
      type,
      title,
      featuredIn,
      releaseId,
      route:
        '/musical-archives'
    };
  }

  // Compatibility while legacy origin documents are upgraded.
  if (
    !validStoreOriginRoute(
      type,
      rawRoute
    )
  ) {
    return null;
  }

  return {
    type,
    title,
    featuredIn,
    releaseId: '',
    route:
      rawRoute
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

  if (type === 'saga') {
    return 'SAGA';
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

  if (type === 'saga') {
    return 'ACCESS STORY →';
  }

  return '';
}

export function getStoreOriginHref(
  origin: StoreProductOrigin
): string {
  if (
    origin.type === 'discography' &&
    origin.releaseId
  ) {
    return (
      '/musical-archives?release=' +
      encodeURIComponent(
        origin.releaseId
      )
    );
  }

  return origin.route;
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
