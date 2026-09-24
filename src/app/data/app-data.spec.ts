import { COMPLIANCE_DATA } from './app-data';

describe('COMPLIANCE_DATA Portuguese legal copy', () => {
  const legalBodyFields = [
    'privacyText',
    'deletionText',
    'policyText',
    'lgpdText'
  ] as const;

  const requiredPortugueseReferences = [
    'RaQuel Synths é a operadora deste site',
    'formulários de contato',
    'newsletter/e-mail',
    'armazenamento essencial e cookies',
    'Google AdSense',
    'Google Tag Manager/Analytics',
    'Meta Pixel',
    'Ahrefs Analytics',
    'Vercel Speed Insights',
    'Firebase/Firestore',
    'Stripe',
    'parceiros afiliados',
    'ACEITAR ou RECUSAR',
    'rqs_consent_v2',
    'LGPD',
    'setembro de 2026'
  ];

  const englishLegalResiduals = [
    'is the site operator',
    'We may receive information',
    'With ACCEPTED consent',
    'may process data',
    'affiliate partners',
    'ACCEPT or REJECT',
    'Exercise your LGPD rights',
    'Last updated: September 2026'
  ];

  for (const mode of ['broklin', 'jonah'] as const) {
    it(`keeps every ${mode} legal body in Brazilian Portuguese`, () => {
      for (const field of legalBodyFields) {
        const value = COMPLIANCE_DATA.pt[mode][field];

        for (const reference of requiredPortugueseReferences) {
          expect(value).withContext(`${mode}.${field}: ${reference}`).toContain(reference);
        }

        for (const residual of englishLegalResiduals) {
          expect(value).withContext(`${mode}.${field}: ${residual}`).not.toContain(residual);
        }
      }
    });
  }

  it('preserves the English compliance source', () => {
    const expectedEnglishOpening = 'RaQuel Synths is the site operator.';

    for (const mode of ['broklin', 'jonah'] as const) {
      for (const field of legalBodyFields) {
        expect(COMPLIANCE_DATA.en[mode][field].startsWith(expectedEnglishOpening)).toBeTrue();
        expect(COMPLIANCE_DATA.en[mode][field]).toContain('Last updated: September 2026.');
      }
    }
  });
});
