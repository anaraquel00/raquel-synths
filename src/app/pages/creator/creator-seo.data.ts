export type CreatorLanguage = 'pt' | 'en';

export const CREATOR_CANONICAL =
  'https://raquelsynths.com/creator';

export const CREATOR_NAME =
  'Ana Raquel de Holanda Barros';

export const CREATOR_PROFILE_ID =
  `${CREATOR_CANONICAL}#profile`;

export const CREATOR_PERSON_ID =
  `${CREATOR_CANONICAL}#person`;

export const CREATOR_PROFILE_IMAGE =
  'https://raquelsynths.com/images/foto_perfil.webp';

export const CREATOR_OG_IMAGE =
  'https://raquelsynths.com/images/creator-creative-technology-og.webp';

const TITLE =
  'Ana Raquel — AI Evaluation & Software QA';

export const CREATOR_SEO_DATA = {
  pt: {
    language: 'pt-BR',
    title: TITLE,

    description:
      'Portfólio de Ana Raquel: avaliação de IA, qualidade de software, desenvolvimento assistido por IA e engenharia de produtos digitais. Fundadora do RQS Studio.',

    jobTitle:
      'Desenvolvedora de Software e Fundadora do RQS Studio',

    personDescription:
      'Desenvolvedora de software e fundadora do RQS Studio, com atuação prática em desenvolvimento assistido por IA, avaliação de código, qualidade de software e tecnologia musical.',

    imageAlt:
      'Portfólio profissional de Ana Raquel de Holanda Barros',

    occupation:
      'Desenvolvedora de Software'
  },

  en: {
    language: 'en-US',
    title: TITLE,

    description:
      "Ana Raquel's portfolio: AI evaluation, software quality assurance, AI-assisted development and digital product engineering. Founder of RQS Studio.",

    jobTitle:
      'Software Developer and Founder of RQS Studio',

    personDescription:
      'Software developer and founder of RQS Studio, with hands-on experience in AI-assisted development, code evaluation, software quality assurance and music technology.',

    imageAlt:
      'Professional portfolio of Ana Raquel de Holanda Barros',

    occupation:
      'Software Developer'
  }
} as const;

const KNOWLEDGE_AREAS = [
  'AI Evaluation',
  'AI-Assisted Software Development',
  'Prompt Engineering',
  'Code Review',
  'Software Quality Assurance',
  'Functional Testing',
  'Regression Testing',
  'Root Cause Analysis',
  'Angular',
  'TypeScript',
  'RxJS',
  'Angular Signals',
  'Python',
  'Node.js',
  'REST APIs',
  'Supabase',
  'PostgreSQL',
  'Firebase',
  'AWS Lambda',
  'AWS S3',
  'AWS ECR',
  'Docker',
  'Git',
  'GitHub Actions',
  'Continuous Integration',
  'Server-Side Rendering',
  'Prerendering',
  'Technical SEO',
  'Web Audio API',
  'Digital Signal Processing',
  'FFmpeg',
  'Music Technology'
] as const;

export function createCreatorJsonLd(
  lang: CreatorLanguage
): Record<string, unknown> {
  const seo = CREATOR_SEO_DATA[lang];

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': CREATOR_PROFILE_ID,

    name: seo.title,
    description: seo.description,
    url: CREATOR_CANONICAL,
    inLanguage: seo.language,
    image: CREATOR_OG_IMAGE,

    mainEntity: {
      '@type': 'Person',
      '@id': CREATOR_PERSON_ID,

      name: CREATOR_NAME,
      jobTitle: seo.jobTitle,
      description: seo.personDescription,
      url: CREATOR_CANONICAL,
      image: CREATOR_PROFILE_IMAGE,

      hasOccupation: {
        '@type': 'Occupation',
        name: seo.occupation
      },

      knowsAbout: KNOWLEDGE_AREAS,

      knowsLanguage: [
        'pt-BR',
        'en',
        'fr'
      ],

      sameAs: [
        'https://www.linkedin.com/in/ana-raquel-de-holanda',
        'https://github.com/anaraquel00'
      ]
    }
  };
}
