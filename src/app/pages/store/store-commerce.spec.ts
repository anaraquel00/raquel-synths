import {
  adaptStoreProduct,
  getStoreMerchantCta,
  getStoreMerchantLabel,
  getStoreOriginCta,
  getStoreOriginTypeLabel,
  getStoreProductTeaser,
  isVisibleAffiliateProduct,
  normalizeStoreProductOrigin,
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

  it('builds a legacy teaser from description when shortDescription is absent', () => {
    const product = {
      content: {
        pt: {
          description:
            '<p><strong>Dados analógicos nunca morrem.</strong> Uma armadura clássica para proteger memórias magnéticas em um mundo digital.</p><p>Segundo parágrafo completo.</p>'
        }
      }
    };

    const teaser =
      getStoreProductTeaser(
        product,
        'pt'
      );

    expect(teaser)
      .toContain(
        'Dados analógicos nunca morrem.'
      );

    expect(teaser)
      .not.toContain('<');
  });

  it('prefers editorial shortDescription for the public card', () => {
    const product = {
      content: {
        en: {
          shortDescription:
            '<p>Editorial card copy.</p>',

          description:
            '<p>Full product description that stays outside the public card.</p>'
        }
      }
    };

    expect(
      getStoreProductTeaser(
        product,
        'en'
      )
    ).toBe(
      'Editorial card copy.'
    );
  });

  it('normalizes RQS product origins and derives public labels', () => {
    const origin =
      normalizeStoreProductOrigin({
        type:
          'discography',

        title:
          'Saudade Sintética (Lado A/B)',

        featuredIn:
          'Fitas Desbotadas',

        route:
          '/discografia'
      });

    expect(origin?.type)
      .toBe('discography');

    expect(origin?.featuredIn)
      .toBe('Fitas Desbotadas');

    expect(
      getStoreOriginTypeLabel(
        'discography'
      )
    ).toBe('DISCOGRAPHY');

    expect(
      getStoreOriginCta(
        'discography'
      )
    ).toBe('ACCESS RELEASE →');

    expect(
      getStoreOriginCta(
        'saga'
      )
    ).toBe('ACCESS STORY →');

    expect(
      getStoreOriginCta(
        'system-log'
      )
    ).toBe('ACCESS LOG →');
  });

  it('rejects external or mismatched RQS origin routes', () => {
    expect(
      normalizeStoreProductOrigin({
        type: 'discography',
        title: 'Release',
        route:
          'https://example.com/release'
      })
    ).toBeNull();

    expect(
      normalizeStoreProductOrigin({
        type: 'system-log',
        title: 'Signal Recalibrated',
        route: '/discografia'
      })
    ).toBeNull();
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
