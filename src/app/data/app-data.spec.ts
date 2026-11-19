import { COMPLIANCE_DATA, NAV_DATA } from './app-data';

describe('COMPLIANCE_DATA current public policy', () => {
  const forbiddenLegacyTerms = [
    'Stripe',
    'Print-on-Demand',
    'physical download',
    'download físico',
    'Amazon/Shein',
    'parceiros afiliados',
    'affiliate partners'
  ];

  it('keeps PT-BR compliance factual and free from obsolete store policy', () => {
    for (const mode of ['broklin', 'jonah'] as const) {
      const data = COMPLIANCE_DATA.pt[mode];
      const combined = Object.values(data).join(' ');

      expect(data.updatedText).toContain('novembro de 2026');
      expect(data.privacyText).toContain('RaQuel Synths');
      expect(data.deletionText).toContain('contact@raquelsynths.com');
      expect(data.deletionText).toContain('rqs_consent_v2');
      expect(data.policyText).toContain('Google AdSense');
      expect(data.policyText).toContain('Google Tag Manager/Analytics');
      expect(data.policyText).toContain('Meta Pixel');
      expect(data.policyText).toContain('Ahrefs Analytics');
      expect(data.policyText).toContain('Vercel Speed Insights');
      expect(data.lgpdText).toContain('LGPD');

      expect(data.privacyText).not.toBe(data.deletionText);
      expect(data.privacyText).not.toBe(data.policyText);
      expect(data.policyText).not.toBe(data.lgpdText);

      for (const term of forbiddenLegacyTerms) {
        expect(combined).withContext(`legacy term: ${term}`).not.toContain(term);
      }

      expect('storeTitle' in data).toBeFalse();
      expect('storeText' in data).toBeFalse();
      expect('affiliateTitle' in data).toBeFalse();
      expect('affiliateText' in data).toBeFalse();
    }
  });

  it('keeps EN-US compliance aligned with the current public site', () => {
    for (const mode of ['broklin', 'jonah'] as const) {
      const data = COMPLIANCE_DATA.en[mode];
      const combined = Object.values(data).join(' ');

      expect(data.updatedText).toContain('November 2026');
      expect(data.privacyText).toContain('RaQuel Synths');
      expect(data.deletionText).toContain('contact@raquelsynths.com');
      expect(data.policyText).toContain('Google AdSense');
      expect(data.lgpdText).toContain('LGPD');

      for (const term of forbiddenLegacyTerms) {
        expect(combined).withContext(`legacy term: ${term}`).not.toContain(term);
      }
    }
  });
});

describe('NAV_DATA public navigation containment', () => {
  it('does not expose legacy Store or Discography labels', () => {
    expect((NAV_DATA.pt as Record<string, string>)['store']).toBeUndefined();
    expect((NAV_DATA.pt as Record<string, string>)['discografia']).toBeUndefined();
    expect((NAV_DATA.en as Record<string, string>)['store']).toBeUndefined();
    expect((NAV_DATA.en as Record<string, string>)['discografia']).toBeUndefined();
  });
});
