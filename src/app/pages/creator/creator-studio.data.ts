type StudioModuleId =
  'master' | 'pitch' | 'build' | 'uplink';

interface StudioModule {
  readonly id: StudioModuleId;
  readonly name: string;
  readonly icon: string;
  readonly subtitle: string;
  readonly description: string;
}

interface StudioShowcase {
  readonly eyebrow: string;
  readonly status: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly modules: readonly StudioModule[];
  readonly stackLabel: string;
  readonly stack: readonly string[];
  readonly action: string;
  readonly url: string;
  readonly ownership: string;
}

const STACK = [
  'Angular',
  'TypeScript',
  'Python',
  'AWS',
  'Supabase',
  'Web Audio API'
] as const;

const STUDIO_URL =
  'https://studio.raquelsynths.com/app';

export const CREATOR_STUDIO_DATA = {
  pt: {
    eyebrow: 'FLAGSHIP PROJECT // MUSICTECH SAAS',
    status: 'PUBLIC BETA',
    title: 'RQS STUDIO',
    subtitle: 'Audio Workstation',

    description:
      'Plataforma de engenharia de áudio baseada em navegador, integrando processamento sonoro, inteligência musical, edição, armazenamento cloud e ferramentas para lançamentos musicais.',

    modules: [
      {
        id: 'master',
        name: 'MASTER',
        icon: 'graphic_eq',
        subtitle: 'Audio Engineering',
        description:
          'Masterização e análise de áudio.'
      },
      {
        id: 'pitch',
        name: 'PITCH',
        icon: 'psychology',
        subtitle: 'AI Release Intelligence',
        description:
          'Transformar a análise musical em um pitch editorial, mantendo o artista no controle.'
      },
      {
        id: 'build',
        name: 'BUILD',
        icon: 'tune',
        subtitle: 'Creative Workspace',
        description:
          'Edição, criação de setlists e persistência de projetos na nuvem.'
      },
      {
        id: 'uplink',
        name: 'UPLINK',
        icon: 'link',
        subtitle: 'Music Connectivity',
        description:
          'Links musicais e direcionamento de audiência.'
      }
    ],

    stackLabel: 'TECHNOLOGY STACK',
    stack: STACK,
    action: 'Conhecer o RQS Studio',
    url: STUDIO_URL,
    ownership:
      'Produto acessível publicamente · Código-fonte proprietário'
  },

  en: {
    eyebrow: 'FLAGSHIP PROJECT // MUSICTECH SAAS',
    status: 'PUBLIC BETA',
    title: 'RQS STUDIO',
    subtitle: 'Audio Workstation',

    description:
      'Browser-based audio engineering platform integrating audio processing, music intelligence, editing, cloud storage and music release tools.',

    modules: [
      {
        id: 'master',
        name: 'MASTER',
        icon: 'graphic_eq',
        subtitle: 'Audio Engineering',
        description:
          'Audio mastering and analysis.'
      },
      {
        id: 'pitch',
        name: 'PITCH',
        icon: 'psychology',
        subtitle: 'AI Release Intelligence',
        description:
          'Turn music analysis into an editorial pitch while keeping the artist in control.'
      },
      {
        id: 'build',
        name: 'BUILD',
        icon: 'tune',
        subtitle: 'Creative Workspace',
        description:
          'Editing, setlist creation and cloud project persistence.'
      },
      {
        id: 'uplink',
        name: 'UPLINK',
        icon: 'link',
        subtitle: 'Music Connectivity',
        description:
          'Music links and audience routing.'
      }
    ],

    stackLabel: 'TECHNOLOGY STACK',
    stack: STACK,
    action: 'Explore RQS Studio',
    url: STUDIO_URL,
    ownership:
      'Publicly accessible product · Proprietary source code'
  }
} as const satisfies Record<
  'pt' | 'en',
  StudioShowcase
>;
