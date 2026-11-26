const WORKFLOW = [
  'Requirements',
  'AI-Assisted Implementation',
  'Independent Review',
  'Validation & Security',
  'Human Approval',
  'Controlled Release'
] as const;

const WORKFLOW_ICONS = [
  'list_alt',
  'smart_toy',
  'fact_check',
  'verified_user',
  'how_to_reg',
  'rocket_launch'
] as const;

const CASE_TITLES = [
  'Cloud Persistence & Data Integrity',
  'Authentication Flow Recovery',
  'Repository Security & Governance',
  'SSR & Search Indexation',
  'From Prototypes to RQS UPLINK'
] as const;

const CASE_STACKS = [
  'AWS S3 · Data Integrity · QA',
  'Angular · Authentication · UX',
  'GitHub · Security · Risk Management',
  'Angular SSR · Technical SEO',
  'Product Engineering · Deep Links'
] as const;

const CREATIVE_TITLES = [
  'AI Music Production & Prompt Design',
  'Generative Voice Experiment',
  'Literature & Digital Publishing'
] as const;

const CREATIVE_ICONS = [
  'music_note',
  'mic',
  'menu_book'
] as const;

export const CREATOR_EXPERIENCE_DATA = {
  pt: {
    methodology: {
      eyebrow: 'ENGINEERING WORKFLOW // HUMAN OVERSIGHT',
      title: 'Human-led. AI-assisted. Evidence-based.',
      description: 'A inteligência artificial acelera a implementação. Os requisitos, critérios de qualidade e decisões de publicação permanecem sob controle humano.',
      steps: [
        'Definição de escopo, requisitos e critérios de aceitação.',
        'Implementação isolada e orientada por requisitos.',
        'Revisão crítica de código, riscos e evidências.',
        'Testes funcionais, regressão e verificações de segurança.',
        'Decisão humana: PASS, HOLD ou REJECT.',
        'Integração controlada e validação operacional.'
      ].map((description, i) => ({
        title: WORKFLOW[i],
        icon: WORKFLOW_ICONS[i],
        description
      }))
    },

    cases: {
      title: 'Estudos de Caso de Engenharia',
      description: 'Experiências práticas de investigação, validação e evolução de produtos digitais.',
      note: 'Resumos técnicos. Estudos detalhados e evidências sanitizadas serão publicados no repositório de estudos de caso.',
      items: [
        'Investigação de falhas de recuperação de projetos associadas ao ciclo de vida de objetos no armazenamento cloud.',
        'Correção da jornada de autenticação que interrompia o upload de áudio e exigia o reenvio do arquivo.',
        'Privatização controlada de repositórios comerciais com verificações de continuidade operacional.',
        'Consolidação da indexação das páginas editoriais e validação das rotas públicas.',
        'Evolução dos protótipos RQS Mainframe e Smart Deep Links para o módulo UPLINK do RQS Studio.'
      ].map((description, i) => ({
        title: CASE_TITLES[i],
        stack: CASE_STACKS[i],
        description
      }))
    },

    creative: {
      title: 'Tecnologia Criativa & IA Multimodal',
      items: [
        'Criação de faixas musicais a partir de ideias criativas autorais, utilizando prompts de estilo, tags específicas, exploração de gêneros e avaliação dos resultados sonoros, com o auxílio de Broklin e Jonah — personas de IA que atuam como produtores musicais e engenheiros de áudio no universo RaQuel Synths.',
        'Clonagem experimental da própria voz com HeyGen e combinação com vocais sintéticos em algumas faixas produzidas no Suno 6.0.',
        'Três e-books publicados na Amazon Kindle, cujas narrativas são inspiradas em faixas musicais produzidas com Suno 6.0, integrando literatura, música e publicação digital.'
      ].map((description, i) => ({
        title: CREATIVE_TITLES[i],
        icon: CREATIVE_ICONS[i],
        description
      }))
    },

    education: {
      title: 'Formação acadêmica e técnica',
      items: [
        {
          title: 'Relações Internacionais',
          description: 'Bacharelado · 2009'
        },
        {
          title: 'DUEF — Língua Francesa',
          description: "Université d'Orléans · França · 2021"
        },
        {
          title: 'Fuctura Tecnologia',
          description: 'Java · Spring Boot · Desenvolvimento Web'
        },
        {
          title: 'DIO',
          description: 'Formação DevOps'
        }
      ]
    },

    languages: {
      title: 'Idiomas',
      items: [
        { name: 'Português brasileiro', level: 'Nativo' },
        { name: 'Francês', level: 'B2' },
        { name: 'Inglês', level: 'B2' }
      ]
    }
  },

  en: {
    methodology: {
      eyebrow: 'ENGINEERING WORKFLOW // HUMAN OVERSIGHT',
      title: 'Human-led. AI-assisted. Evidence-based.',
      description: 'Artificial intelligence accelerates implementation. Requirements, quality criteria and release decisions remain under human control.',
      steps: [
        'Define scope, requirements and acceptance criteria.',
        'Implement changes in an isolated, requirements-driven workflow.',
        'Critically review code, risks and supporting evidence.',
        'Perform functional, regression and security checks.',
        'Human decision: PASS, HOLD or REJECT.',
        'Controlled integration and operational validation.'
      ].map((description, i) => ({
        title: WORKFLOW[i],
        icon: WORKFLOW_ICONS[i],
        description
      }))
    },

    cases: {
      title: 'Engineering Case Studies',
      description: 'Practical experience investigating, validating and evolving digital products.',
      note: 'Technical summaries. Detailed case studies and sanitized evidence are planned for publication in the case studies repository.',
      items: [
        'Investigation of project recovery failures associated with cloud storage object lifecycle management.',
        'Correction of an authentication flow that interrupted audio uploads and required users to upload their files again.',
        'Controlled privatization of commercial repositories with operational continuity checks.',
        'Consolidation of editorial page indexation and validation of public routes.',
        'Evolution of the RQS Mainframe and Smart Deep Link prototypes into the RQS Studio UPLINK module.'
      ].map((description, i) => ({
        title: CASE_TITLES[i],
        stack: CASE_STACKS[i],
        description
      }))
    },

    creative: {
      title: 'Creative Technology & Multimodal AI',
      items: [
        'Creation of music tracks based on original creative ideas, using style prompts, specific tags, genre exploration and audio evaluation, with assistance from Broklin and Jonah — AI personas acting as music producers and audio engineers within the RaQuel Synths universe.',
        'Experimental cloning of my own voice using HeyGen and blending it with synthetic vocals in selected tracks produced with Suno 6.0.',
        'Three e-books published on Amazon Kindle, featuring narratives inspired by music tracks produced with Suno 6.0, integrating literature, music and digital publishing.'
      ].map((description, i) => ({
        title: CREATIVE_TITLES[i],
        icon: CREATIVE_ICONS[i],
        description
      }))
    },

    education: {
      title: 'Education & Technical Training',
      items: [
        {
          title: 'International Relations',
          description: "Bachelor's degree · 2009"
        },
        {
          title: 'DUEF — French Language Studies',
          description: "Université d'Orléans · France · 2021"
        },
        {
          title: 'Fuctura Tecnologia',
          description: 'Java · Spring Boot · Web Development'
        },
        {
          title: 'DIO',
          description: 'DevOps training'
        }
      ]
    },

    languages: {
      title: 'Languages',
      items: [
        { name: 'Brazilian Portuguese', level: 'Native' },
        { name: 'French', level: 'B2' },
        { name: 'English', level: 'B2' }
      ]
    }
  }
} as const;
