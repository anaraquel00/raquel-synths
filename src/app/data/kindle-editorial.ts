export interface KindleSagaEditorialConfig {
  status: 'AVAILABLE NOW' | 'NEXT TRANSMISSION';
  sampleRoute?: string;
  dossierRoute?: string;
  kindleUrl: string | null;
  kindleUrlEn: string | null;
  publicFullText: boolean;
}

export const KINDLE_EDITORIAL: Record<
  'broklin' | 'jonah' | 'glitch',
  KindleSagaEditorialConfig
> = {
  broklin: {
    status: 'AVAILABLE NOW',
    sampleRoute: '/visual-novel/broklin/s1',
    kindleUrl: 'https://www.amazon.com.br/dp/B0HPCNZLDX',
    kindleUrlEn: null,
    publicFullText: false
  },

  glitch: {
    status: 'NEXT TRANSMISSION',
    dossierRoute: '/hybrid-saga',
    kindleUrl: null,
    kindleUrlEn: null,
    publicFullText: false
  },

  jonah: {
    status: 'AVAILABLE NOW',
    sampleRoute: '/visual-novel/jonah/s1',
    kindleUrl: null,
    kindleUrlEn: null,
    publicFullText: false
  }
};
