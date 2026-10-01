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
    status: normalizeStoreProductStatus(product?.['status'])
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
