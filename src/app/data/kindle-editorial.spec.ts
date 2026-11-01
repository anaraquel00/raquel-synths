import { KINDLE_EDITORIAL } from './kindle-editorial';

describe('KINDLE_EDITORIAL', () => {
  it('mantém os quatro livros publicados nos URLs canônicos', () => {
    expect(KINDLE_EDITORIAL.broklin.kindleUrl)
      .toBe('https://www.amazon.com.br/dp/B0HPCNZLDX');
    expect(KINDLE_EDITORIAL.broklin.kindleUrlEn)
      .toBe('https://www.amazon.com/dp/B0HPL5SPPS');
    expect(KINDLE_EDITORIAL.jonah.kindleUrl)
      .toBe('https://www.amazon.com/dp/B0HPPRWGCN');
    expect(KINDLE_EDITORIAL.jonah.kindleUrlEn)
      .toBe('https://www.amazon.com/dp/B0GX3517Y2');
  });

  it('não mantém nenhum estado Kindle indisponível em Broklin ou Jonah', () => {
    expect(KINDLE_EDITORIAL.broklin.status).toBe('AVAILABLE NOW');
    expect(KINDLE_EDITORIAL.jonah.status).toBe('AVAILABLE NOW');
    expect(KINDLE_EDITORIAL.broklin.kindleUrl).not.toBeNull();
    expect(KINDLE_EDITORIAL.broklin.kindleUrlEn).not.toBeNull();
    expect(KINDLE_EDITORIAL.jonah.kindleUrl).not.toBeNull();
    expect(KINDLE_EDITORIAL.jonah.kindleUrlEn).not.toBeNull();
  });
});
