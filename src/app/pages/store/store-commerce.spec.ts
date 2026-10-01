import {
  adaptStoreProduct,
  getStoreMerchantCta,
  getStoreMerchantLabel,
  isVisibleAffiliateProduct,
  normalizeStoreProductStatus,
  resolveStoreDestination,
  resolveStoreMerchant
} from './store-commerce';

describe('Store commerce adapter', () => {
  it('resolves legacy stripeUrl without mutating it', () => {
    const product = {
      stripeUrl: 'https://www.shein.com/example'
    };

    expect(resolveStoreDestination(product))
      .toBe('https://www.shein.com/example');
  });

  it('detects current affiliate merchants', () => {
    expect(resolveStoreMerchant('https://onelink.shein.com/example'))
      .toBe('shein');

    expect(resolveStoreMerchant('https://meli.la/example'))
      .toBe('mercado-livre');

    expect(resolveStoreMerchant('https://www.mercadolivre.com/example'))
      .toBe('mercado-livre');

    expect(resolveStoreMerchant('https://amzn.to/example'))
      .toBe('amazon');

    expect(resolveStoreMerchant('https://s.click.aliexpress.com/example'))
      .toBe('aliexpress');
  });

  it('classifies Stripe as official and not visible in affiliate Phase 1', () => {
    const product = adaptStoreProduct({
      id: 'legacy-pod',
      stripeUrl: 'https://buy.stripe.com/example',
      status: 'available'
    });

    expect(product.merchant).toBe('stripe');
    expect(product.productType).toBe('official');
    expect(isVisibleAffiliateProduct(product)).toBeFalse();
  });

  it('normalizes legacy status values without writing Firestore', () => {
    expect(normalizeStoreProductStatus('available')).toBe('available');
    expect(normalizeStoreProductStatus('avaliable')).toBe('available');
    expect(normalizeStoreProductStatus(undefined)).toBe('available');
    expect(normalizeStoreProductStatus('sold_out')).toBe('sold_out');
    expect(normalizeStoreProductStatus('inactive')).toBe('inactive');
  });

  it('keeps supported affiliate products visible', () => {
    const product = adaptStoreProduct({
      id: 'affiliate-example',
      stripeUrl: 'https://meli.la/example',
      status: 'avaliable'
    });

    expect(product.merchant).toBe('mercado-livre');
    expect(product.productType).toBe('affiliate');
    expect(product.status).toBe('available');
    expect(isVisibleAffiliateProduct(product)).toBeTrue();
  });

  it('does not expose unsupported destinations as Phase 1 affiliate products', () => {
    const product = adaptStoreProduct({
      id: 'unknown-store',
      stripeUrl: 'https://example.com/product',
      status: 'available'
    });

    expect(product.productType).toBe('unknown');
    expect(isVisibleAffiliateProduct(product)).toBeFalse();
  });

  it('provides merchant labels and bilingual CTAs', () => {
    expect(getStoreMerchantLabel('mercado-livre'))
      .toBe('Mercado Livre');

    expect(getStoreMerchantCta('shein', 'pt'))
      .toBe('VER NA SHEIN ↗');

    expect(getStoreMerchantCta('amazon', 'en'))
      .toBe('VIEW ON AMAZON ↗');
  });
});
