import {
  adaptStoreProduct,
  getStoreMerchantCta,
  getStoreMerchantLabel,
  getStoreOriginCta,
  getStoreOriginHref,
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

  it('normalizes bilingual universal RQS origin references', () => {
    const origin =
      normalizeStoreProductOrigin({
        type:
          'broklin-saga',

        sourceCollection:
          'lore',

        sourceId:
          's1-e10',

        content: {
          pt: {
            title:
              'Episódio 10 — Pó de Mim',

            featuredIn: ''
          },

          en: {
            title:
              'Episode 10 — Ashes of Me',

            featuredIn: ''
          }
        }
      });

    expect(
      origin?.content.pt.title
    ).toBe(
      'Episódio 10 — Pó de Mim'
    );

    expect(
      origin?.content.en.title
    ).toBe(
      'Episode 10 — Ashes of Me'
    );

    expect(
      getStoreOriginHref(
        origin!
      )
    ).toBe(
      '/lore/broklin/s1-e10'
    );
  });

  it('localizes origin labels and CTAs', () => {
    expect(
      getStoreOriginTypeLabel(
        'broklin-saga',
        'pt'
      )
    ).toBe(
      'SAGA BROKLIN'
    );

    expect(
      getStoreOriginTypeLabel(
        'broklin-saga',
        'en'
      )
    ).toBe(
      'BROKLIN SAGA'
    );

    expect(
      getStoreOriginTypeLabel(
        'discography',
        'pt'
      )
    ).toBe(
      'DISCOGRAFIA'
    );

    expect(
      getStoreOriginCta(
        'broklin-saga',
        'pt'
      )
    ).toBe(
      'ACESSAR HISTÓRIA →'
    );

    expect(
      getStoreOriginCta(
        'broklin-saga',
        'en'
      )
    ).toBe(
      'ACCESS STORY →'
    );

    expect(
      getStoreOriginCta(
        'discography',
        'pt'
      )
    ).toBe(
      'ACESSAR LANÇAMENTO →'
    );
  });

  it('generates canonical routes independently from language', () => {
    const cases = [
      {
        type:
          'broklin-saga' as const,
        id:
          's1-e10',
        href:
          '/lore/broklin/s1-e10'
      },
      {
        type:
          'jonah-saga' as const,
        id:
          's1-e6',
        href:
          '/lore/jonah/s1-e6'
      },
      {
        type:
          'global-saga' as const,
        id:
          's1-e10',
        href:
          '/hybrid-reader/s1-e10'
      },
      {
        type:
          'system-log' as const,
        id:
          '2025-12-08-log',
        href:
          '/log-reader/2025-12-08-log'
      },
      {
        type:
          'discography' as const,
        id:
          'ep-saudade-sintetica',
        href:
          '/musical-archives?release=ep-saudade-sintetica'
      }
    ];

    for (const item of cases) {
      const origin =
        normalizeStoreProductOrigin({
          type:
            item.type,

          sourceId:
            item.id,

          content: {
            pt: {
              title:
                'Título',
              featuredIn: ''
            },

            en: {
              title:
                'Title',
              featuredIn: ''
            }
          }
        });

      expect(
        getStoreOriginHref(
          origin!
        )
      ).toBe(item.href);
    }
  });

  it('reads legacy single-language origin records safely', () => {
    const legacy =
      normalizeStoreProductOrigin({
        type:
          'saga',

        title:
          'ASHES OF ME',

        route:
          '/lore/broklin/s1-e10'
      });

    expect(
      legacy?.type
    ).toBe(
      'broklin-saga'
    );

    expect(
      legacy?.content.pt.title
    ).toBe(
      'ASHES OF ME'
    );

    expect(
      legacy?.content.en.title
    ).toBe(
      'ASHES OF ME'
    );

    const legacyDiscography =
      normalizeStoreProductOrigin({
        type:
          'discography',

        title:
          'Saudade Sintética',

        featuredIn:
          'Fitas Desbotadas',

        releaseId:
          'ep-saudade-sintetica',

        route:
          '/musical-archives'
      });

    expect(
      legacyDiscography
        ?.content.pt.featuredIn
    ).toBe(
      'Fitas Desbotadas'
    );

    expect(
      legacyDiscography
        ?.sourceId
    ).toBe(
      'ep-saudade-sintetica'
    );
  });

  it('rejects origins without a canonical source id', () => {
    expect(
      normalizeStoreProductOrigin({
        type:
          'broklin-saga',

        sourceId: '',

        content: {
          pt: {
            title:
              'Título',
            featuredIn: ''
          },

          en: {
            title:
              'Title',
            featuredIn: ''
          }
        }
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
