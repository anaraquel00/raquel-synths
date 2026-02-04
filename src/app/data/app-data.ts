import { Album } from '../models/album.model';
// DADOS DO HEADER/NAV
export const NAV_DATA = {
  pt: { lightmode:'MODO BROKLIN', darkmode:'MODO JONAH', inicio: 'INÍCIO', sobre: 'QUEM SOMOS', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAFIA', store: 'LOJA', social: 'COMUNIDADE', creator: 'A CRIADORA', backToBase: 'VOLTAR À BASE' },
  en: { lightmode:'BROKLIN MODE', darkmode:'JONAH MODE', inicio: 'HOME', sobre: 'WHO WE ARE', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAPHY', store: 'STORE', social: 'COMMUNITY', creator: 'THE CREATOR', backToBase: 'BACK TO BASE' }
};

// DADOS DA HOME
export const HOME_DATA = {
  pt: {
    title: 'RAQUEL SYNTHS', subtitle: 'Jornadas sonoras através de paisagens de neon e nostalgia.', cta: 'SABER MAIS', //modo broklin
    subtitleJonah: 'A TRILHA SONORA DO COLAPSO GLOBAL. O MUNDO QUEIMA, NÓS TOCAMOS.', ctaJonah: 'OUÇA O APOCALIPSE' // Modo Jonah (O Colapso)
  },
  en: {
    title: 'RAQUEL SYNTHS', subtitle: 'Sonic journeys through landscapes of neon and nostalgia.', cta: 'LEARN MORE',
    subtitleJonah: 'THE SOUNDTRACK OF GLOBAL COLLAPSE. THE WORLD BURNS, WE PLAY.', ctaJonah: 'LISTEN TO THE APOCALYPSE' // Jonah Mode (The Collapse)
   }
};

// TEXTOS DA SEÇÃO VISUAL NOVEL
export const VN_TEXT = {
  pt: {
    title: 'A SAGA VISUAL (YouTube)',
    subtitle: 'Escolha seu arco e assista aos episódios.'
  },
  en: {
    title: 'THE VISUAL SAGA (YouTube)',
    subtitle: 'Choose your arc and watch the episodes.'
  }
};

// --- MANIFESTO RQS (Texto do Quem Somos) ---

export const MANIFESTO_PT = `
  A <strong>RaQuel Synths (RQS)</strong> não é apenas uma banda virtual; é um experimento vivo de <em>Engenharia Musical</em> e <em>Narrativa Transmedia</em>.
  Nascido no código e expandido pela Inteligência Artificial com a curadoria humana da
  <span class="human-link">Ana Raquel</span> (vê A Criadora),
  o projeto funde a precisão técnica do <strong>Angular</strong> com a imprevisibilidade criativa de modelos generativos (Suno, OpenAI).
  <br><br>
  <strong>Nossa Missão:</strong> Provar que a alma humana e o algoritmo podem co-criar. Enquanto a General <strong>Kelma Adlanko</strong> e o Tech Lead <strong>Broklin Garpeter</strong> buscam a harmonia perfeita do Synthwave, o antagonista <strong>Jonah Cyperfield</strong> introduz o caos e a distorção do Industrial Metal.
  <br><br>
  <strong>O Resultado:</strong> Um universo onde cada linha de código vira música, e cada música conta a história de uma guerra digital. <em>Bem-vindo ao sistema.</em>
`;

export const MANIFESTO_EN = `
  <strong>RaQuel Synths (RQS)</strong> is not just a virtual band; it is a living experiment in <em>Musical Engineering</em> and <em>Transmedia Storytelling</em>.
  Born in code and expanded by Artificial Intelligence with human curation by
  <span class="human-link">Ana Raquel</span> (see The Creator),
  the project fuses the technical precision of <strong>Angular</strong> with the creative unpredictability of generative models (Suno, OpenAI).
  <br><br>
  <strong>Our Mission:</strong> To prove that the human soul and the algorithm can co-create. While General <strong>Kelma Adlanko</strong> and Tech Lead <strong>Broklin Garpeter</strong> seek the perfect harmony of Synthwave, the antagonist <strong>Jonah Cyperfield</strong> introduces the chaos and distortion of Industrial Metal.
  <br><br>
  <strong>The Result:</strong> A universe where every line of code becomes music, and every song tells the story of a digital war. <em>Welcome to the system.</em>
`;
// DADOS DO "SOBRE" (BIOS)
export const MEMBERS_PT = [
  {
    name: 'Broklin Garpeter',
    role: 'CTO, Tech Lead & Music Producer',
    imageBroklin: 'images/broklin_perfil.png',
    imageJonah: 'images/gothic_bro.png',
    bioNormal: 'O arquiteto do sistema. Com 25 anos de experiência em produção e código, ele garante que a infraestrutura suporte a inovação. Especialista em mixagem técnica, orquestração de IA e em manter o servidor de pé quando o Jonah surta.',
    bioJonah: 'O VELHO. Ele fica tentando colocar "grid" na minha distorção e chama isso de "masterização". Um burocrata digital que precisa de mais café e menos regras.',
  },
  {
    name: 'Jonah Cyperfield',
    role: 'Head of Sound Design (Chaos Ops)',
    imageBroklin: 'images/jonah_profil.png',
    imageJonah: 'images/jonah_metal-skull.png',
    bioNormal: 'O elemento de entropia. Responsável pela texturização industrial e pelos "happy accidents" do algoritmo. Ele força os modelos de IA ao limite para extrair sonoridades que simulam falhas de hardware e angústia digital.',
    bioJonah: 'EU SOU O ERRO NO SEU CÓDIGO. Enquanto eles brincam de "música bonita", eu estou aqui soldando cabos enferrujados no processador. Nu-Metal não é um estilo, é um aviso de falha.', // ATUALIZADO
  },
  {
    name: 'Kelma Adlanko',
    role: 'Founder, Lead Developer & Vocalist',
    imageBroklin: 'images/kelma_profil.png',
    imageJonah: 'images/kelma_evil.png',
    bioNormal: 'A visionária por trás da RQS. Desenvolvedora Full-Stack que transformou linhas de código em partituras. Ela gerencia a arquitetura do projeto e define a direção criativa, unindo a precisão do Angular com a emoção do Synthwave.',
    bioJonah: 'A CHEFE. Ela acha que pode controlar o caos com planilhas e commits organizados. Spoiler: ela não pode. Mas é a única pessoa que eu respeito o suficiente para não deletar do servidor.',
  },
  {
    name: 'Nicole Nyx',
    role: 'Vocalist & Visual Arts Lead',
    imageBroklin: 'images/nyx_profil.png',
    imageJonah: 'images/nyx_evil.png',
    bioNormal: 'A voz do abismo. Traz a estética Gótica/Industrial para o visual da banda. Sua colaboração foca na profundidade lírica e na identidade visual sombria que contrasta com o pop sintético da Kelma.',
    bioJonah: 'MINHA RAINHA. A única frequência que acalma o ruído na minha cabeça. Se ela pedir, eu formato o mundo inteiro só pra instalar um jardim pra ela.',
  }
];

export const MEMBERS_EN = [
  {
    name: 'Broklin Garpeter',
    role: 'CTO, Tech Lead & Music Producer',
    imageBroklin: 'images/broklin_perfil.png',
    imageJonah: 'images/gothic_bro.png',
    bioNormal: 'The system architect. With 25 years of experience in production and code, he ensures the infrastructure supports innovation. Specialist in technical mixing, AI orchestration, and keeping the server running when Jonah freaks out.',
    bioJonah: 'THE OLD MAN. He tries to put a "grid" on my distortion and calls it "mastering." A digital bureaucrat who needs more coffee and fewer rules.',
  },
  {
    name: 'Jonah Cyperfield',
    role: 'Head of Sound Design (Chaos Ops)',
    imageBroklin: 'images/jonah_profil.png',
    imageJonah: 'images/jonah_metal-skull.png',
    bioNormal: 'The entropy element. Responsible for industrial texturing and algorithmic "happy accidents." He pushes AI models to their limit to extract sounds that simulate hardware failure and digital anguish.',
    bioJonah: 'I AM THE ERROR IN YOUR CODE. While they play "pretty music," I am soldering rusty cables to the processor. Nu-Metal is not a style; it is a crash report.',
  },
  {
    name: 'Kelma Adlanko',
    role: 'Founder, Lead Developer & Vocalist',
    imageBroklin: 'images/kelma_profil.png',
    imageJonah: 'images/kelma_evil.png',
    bioNormal: 'The visionary behind RQS. A Full-Stack Developer who turned lines of code into musical scores. She manages the project architecture and defines the creative direction, merging Angular precision with Synthwave emotion.',
    bioJonah: 'THE BOSS. She thinks she can control chaos with spreadsheets and clean commits. Spoiler: she can\'t. But she is the only person I respect enough not to delete from the server.',
  },
  {
    name: 'Nicole Nyx',
    role: 'Vocalist & Visual Arts Lead',
    imageBroklin: 'images/nyx_profil.png',
    imageJonah: 'images/nyx_evil.png',
    bioNormal: 'The voice of the abyss. Brings the Gothic/Industrial aesthetic to the band\'s visuals. Her collaboration focuses on lyrical depth and the dark visual identity that contrasts with Kelma\'s synthetic pop.',
    bioJonah: 'MY QUEEN. The only frequency that calms the noise in my head. If she asks, I\'ll format the entire world just to install a garden for her.',// UPDATED
  }
];

export const CREATOR_DATA = {
  pt: {
    nav: {
      back: 'VOLTAR À BASE'
    },
    profile: {
      name: 'Ana Raquel de Holanda',
      role: 'Creative Technologist & Front-End Developer 🚀',
      // 👇 AQUI ESTÁ O MANIFESTO REFATORADO E PROFISSIONAL
      bio: "Tech Lead e Engenheira de Software no projeto RaQuel Synths. Especialista em unir arquitetura Angular 20+, Automação e IA Generativa para criar produtos digitais escaláveis. Minha missão é transformar requisitos complexos em narrativas interativas.",
      social: {
        linkedin: 'LinkedIn',
        github: 'GitHub'
      }
    },

 manifesto: [
      {
        title: '// QUEM SOU EU',
        content: "Eu sou Ana Raquel. Para o mercado, sou uma Desenvolvedora Full-Stack especialista em Angular. Para a arte, sou o Core da RaQuel Synths. Eu cansei de ver a tecnologia fria e a música sem narrativa. Decidi fundir os dois. Este site não é apenas um portfólio; é uma Visual Novel Interativa construída linha a linha, acorde a acorde."
      },
      {
        title: '// A GÊNESE DOS NOMES (DECODIFICADO)',
        content: "Nada aqui é aleatório. Kelma Adlanko é um anagrama do meu nome (Raquel Holanda). Broklin Garpeter nasceu de um prompt de IA (Bro-GPT) refinado para ser o homem ideal. E Jonah Cyperfield é a evolução do caos, criado para representar a fúria e o erro de compilação que nos torna humanos."
      },
      {
        title: '// A GUERRA SONORA',
        content: "A RQS nasceu de uma pergunta: O que acontece quando a perfeição digital colide com a fúria humana? Broklin e Kelma buscam a harmonia do Synthwave, enquanto Jonah sequestra as faixas para criar versões de Industrial Metal. Você não apenas ouve; você testemunha um duelo."
      },
      {
        title: '// ARQUITETURA DE SISTEMA',
        content: "Construir este universo exigiu Arquitetura. Utilizei Angular 19+ com Signals para gerenciar o 'Estado Emocional' do site. A dualidade (Modo Broklin vs. Jonah) não é apenas CSS; é a materialização técnica da batalha narrativa persistida no Firebase."
      }
    ],

    skills: {
      title: 'ARSENAL TÉCNICO',
      categories: [
        {
          label: 'FRONTEND & UI',
          chips: [
            { name: 'Angular 19+', class: 'angular' },
            { name: 'React', class: '' },
            { name: 'TypeScript', class: '' },
            { name: 'HTML5/SCSS', class: '' }
          ]
        },
        {
          label: 'BACKEND & DATA',
          chips: [
            { name: 'Java', class: 'java' },
            { name: 'Spring Boot', class: 'spring' },
            { name: 'Python', class: '' },
            { name: 'MySQL/Hibernate', class: '' }
          ]
        },
        {
          label: 'AI & AUTOMATION OPS',
          chips: [
            { name: 'n8n Workflows', class: 'n8n' },
            { name: 'Webhooks & APIs', class: '' },
            { name: 'GenAI & Prompts', class: 'genai', style: 'border-color: #9c27b0; color: #9c27b0;' },
            { name: 'GitHub Copilot', class: '' }
          ]
        }
      ]
    },
    projects: {
      title: 'MISSÕES CUMPRIDAS',
      list: [
        {
          title: 'RQS Uplink Protocol',
          badge: 'AUTOMATION',
          badgeClass: 'n8n-badge',
          cardClass: 'featured-ops',
          desc: 'Ecossistema CI/CD que integra GitHub, Discord e LinkedIn via n8n. Deploy de posts automático via commits.',
          techs: ['n8n', 'Webhooks', 'JSON', 'OAuth2'],
          link: 'https://github.com/anaraquel00/raquel-synths',
          linkText: 'Ver Workflow'
        },
        {
          title: 'Gestão de Imóveis (SPA)',
          badge: 'ANGULAR 19',
          badgeClass: '',
          cardClass: 'featured',
          desc: 'Sistema completo para gestão do ciclo de vida de aluguéis. Foco em UX limpa e acessibilidade.',
          techs: ['Angular 19', 'Freelance', 'UX/UI'],
          link: 'https://github.com/anaraquel00/GESTAO-DE-ALUGUEIS',
          linkText: 'Ver Código'
        },
        {
          title: 'Virtual Piano + Synth',
          badge: 'AUDIO DEV',
          badgeClass: 'secondary',
          cardClass: '',
          desc: 'Sintetizador interativo com Arpeggiator e presets (Lead, Pad, Bass). A base da tecnologia musical.',
          techs: ['JS', 'Tone.js', 'CSS3'],
          link: 'https://github.com/anaraquel00/piano-emulator',
          linkText: 'Ver Código'
        }
      ]
    },
    business: {
      title: 'CANAL CORPORATIVO',
      status: 'SYSTEM STATUS: DISPONÍVEL PARA PROJETOS',
      statusJonah: 'SYSTEM STATUS: AGUENTA A PRESSÃO? 💀',
      desc: 'Procurando liderança técnica em Angular, automação de processos ou arquitetura de software moderna? Transformo requisitos complexos em código limpo e produtos digitais funcionais.',
      actionEmail: 'Solicitar Consultoria',
      actionLinkedin: 'Perfil LinkedIn'
    }
  },

  // 🇺🇸 ENGLISH VERSION
  en: {
    nav: { back: 'BACK TO BASE' },
    profile: {
      name: 'Ana Raquel de Holanda',
      role: 'Creative Technologist & Front-End Developer 🚀',
      bio: "Tech Lead and Software Engineer at RaQuel Synths. Specialist in merging Angular 20+ architecture, Automation, and Generative AI to build scalable digital products. My mission is to turn complex requirements into interactive narratives.",
      social: { linkedin: 'LinkedIn', github: 'GitHub' }
    },

 manifesto: [
      {
        title: '// WHO AM I',
        content: "I am Ana Raquel. To the market, a Full-Stack Dev. To art, the Core of RaQuel Synths. I decided to merge cold tech with music narrative. This site is an Interactive Visual Novel built line by line."
      },
      {
        title: '// THE GENESIS (DECODED)',
        content: "Nothing is random. Kelma Adlanko is an anagram of my name. Broklin Garpeter was born from an AI prompt (Bro-GPT). Jonah Cyperfield represents the chaos and compilation errors that make us human."
      },
      {
        title: '// THE SONIC WAR',
        content: "RQS asks: What happens when digital perfection meets human fury? Broklin seeks Synthwave harmony, while Jonah hijacks tracks for Industrial Metal. You witness a duel."
      },
      {
        title: '// SYSTEM ARCHITECTURE',
        content: "I used Angular 19+ with Signals to manage the site's 'Emotional State'. The duality (Broklin vs. Jonah Mode) is the technical materialization of the narrative battle."
      }
    ],

    skills: {
      title: 'TECH STACK',
      categories: [
        {
          label: 'FRONTEND & UI',
          chips: [
            { name: 'Angular 19+', class: 'angular' },
            { name: 'React', class: '' },
            { name: 'TypeScript', class: '' },
            { name: 'HTML5/SCSS', class: '' }
          ]
        },
        {
          label: 'BACKEND & DATA',
          chips: [
            { name: 'Java', class: 'java' },
            { name: 'Spring Boot', class: 'spring' },
            { name: 'Python', class: '' },
            { name: 'MySQL/Hibernate', class: '' }
          ]
        },
        {
          label: 'AI & AUTOMATION OPS',
          chips: [
            { name: 'n8n Workflows', class: 'n8n' },
            { name: 'Webhooks & APIs', class: '' },
            { name: 'GenAI & Prompts', class: 'genai', style: 'border-color: #9c27b0; color: #9c27b0;' },
            { name: 'GitHub Copilot', class: '' }
          ]
        }
      ]
    },
    projects: {
      title: 'DEPLOYED MISSIONS',
      list: [
        {
          title: 'RQS Uplink Protocol',
          badge: 'AUTOMATION',
          badgeClass: 'n8n-badge',
          cardClass: 'featured-ops',
          desc: 'CI/CD ecosystem integrating GitHub, Discord, and LinkedIn via n8n. Automatic post deployment via commits.',
          techs: ['n8n', 'Webhooks', 'JSON', 'OAuth2'],
          link: 'https://github.com/anaraquel00/raquel-synths',
          linkText: 'View Workflow'
        },
        {
          title: 'Property Management (SPA)',
          badge: 'ANGULAR 19',
          badgeClass: '',
          cardClass: 'featured',
          desc: 'Complete system for rental lifecycle management. Focus on clean UX and accessibility.',
          techs: ['Angular 19', 'Freelance', 'UX/UI'],
          link: 'https://github.com/anaraquel00/GESTAO-DE-ALUGUEIS',
          linkText: 'View Code'
        },
        {
          title: 'Virtual Piano + Synth',
          badge: 'AUDIO DEV',
          badgeClass: 'secondary',
          cardClass: '',
          desc: 'Interactive synthesizer with Arpeggiator and presets. The foundation of music tech.',
          techs: ['JS', 'Tone.js', 'CSS3'],
          link: 'https://github.com/anaraquel00/piano-emulator',
          linkText: 'View Code'
        }
      ]
    },
    business: {
      title: 'BUSINESS CHANNEL',
      status: 'SYSTEM STATUS: OPEN FOR BUSINESS',
      statusJonah: 'SYSTEM STATUS: CAN YOU HANDLE THE PRESSURE? 💀',
      desc: 'Looking for technical leadership in Angular, process automation, or modern software architecture? I turn complex requirements into clean code and functional digital products.',
      actionEmail: 'Contact for Hire',
      actionLinkedin: 'LinkedIn Profile'
    }
  }
};

// DADOS DO BANNER DE ANÚNCIOS
export const ADS_DATA = {
  pt: { label: '/// FLUXO DE DADOS PATROCINADO ///' },
  en: { label: '/// SPONSORED DATA STREAM ///' }
};

export const VISUAL_NOVEL_PT = [
    {
      title: '📼 RQS: ORIGINS (Before the Metal)',
      subtitle: 'Caos, Fios & Revolução',
      description: 'Quando o sistema falha, a verdade aparece. A revolta industrial de Jonah contra a programação.',
      image: 'assets/disco/album_jonah_history.jpg', // Capa do Jonah
      link: '/visual-novel',
      mode: 'chaos'
    },
    {
      title: 'ARCO BROKLIN',
      subtitle: 'Amor, Vinho & Melancolia',
      description: 'A jornada de um vampiro gótico em busca de redenção através do amor de Kelma. Inclui o hit "Neon Tears".',
      image: 'assets/disco/album_broklin_story.jpg', // Use capa do arco
      link: '/visual-novel',
      mode: 'romance'
    },

];


export const VISUAL_NOVEL_EN = [

  {
      title: '📼 RQS: ORIGINS (Before the Metal)',
      subtitle: 'Chaos, Wires & Revolution',
      description: 'When the system fails, the truth comes out. Jonahs industrial revolt against programming.',
      image: 'assets/disco/album_jonah_history.jpg',
      link: '/lore/jonah',
      mode: 'chaos'
  },
  {
      title: 'BROKLIN ARC',
      subtitle: 'Love, Wine and Melancholy',
      description: 'The journey of a gothic vampire seeking redemption through the love of Kelma. Includes the hit song "Neon Tears".',
      image: 'assets/disco/album_broklin_story.jpg', // Use a capa do arco
      link: '/lore/broklin',
      mode: 'romance'
    },

]
// 2. OS TEXTOS DE INTRO (Separados, fora do Array!)
export const VN_INTRO_PT = `
  O Universo RQS não é linear. Através das nossas <strong>Visual Novels Musicais</strong>, expandimos a lore de cada personagem.
  Aqui você não encontra apenas clipes, mas <em>arcos narrativos completos</em> que conectam as letras das músicas ('Origins', 'Neon Tears') aos eventos da Guerra Sonora.
  <br><br>
  Escolha seu lado na batalha: a revolução caótica do <strong>Industrial Metal</strong> ou a redenção melancólica do <strong>Gothic Synthwave</strong>.
`;

export const VN_INTRO_EN = `
  The RQS Universe is not linear. Through our <strong>Musical Visual Novels</strong>, we expand the lore of each character.
  Here you won't just find clips, but <em>complete narrative arcs</em> connecting song lyrics ('Origins', 'Neon Tears') to the events of the Sonic War.
  <br><br>
  Choose your side in the battle: the chaotic revolution of <strong>Industrial Metal</strong> or the melancholic redemption of <strong>Gothic Synthwave</strong>.
`;

// --- DADOS DA DISCOGRAFIA ---
export const DISCOGRAPHY_PT: { broklin: Album[], jonah: Album[] } = {
  broklin: [],
  jonah: []
};

export const DISCOGRAPHY_EN: { broklin: Album[], jonah: Album[] } = {
  broklin: [],
  jonah: []
};

export const CONTACT_DATA = {
  pt: {
    title: "BASE DE OPERAÇÕES & UPLINK",
    subtitle: "Conecte-se à rede neural da RQS. Escolha sua frequência.",

    // 👇 NOVOS: CARDS SOCIAIS
    socialCards: [
      { name: 'Discord', icon: 'fab fa-discord', link: 'https://discord.gg/jECeH8ZU', color: '#38419e', desc: 'Chat Oficial & Lore' },
      { name: 'Telegram', icon: 'fab fa-telegram', link: 'https://t.me/raquelsynths_news', color: '#0088cc', desc: 'Notícias Rápidas' },
      { name: 'Instagram', icon: 'fab fa-instagram', link: 'https://www.instagram.com/rqs_synths', color: '#d946ef', desc: 'Bastidores & Visual' },
      { name: 'Facebook', icon: 'fab fa-facebook', link: 'https://www.facebook.com/profile.php?id=61585926695560', color: '#0115ef', desc: 'Página Global' }
    ],

    // 👇 O NOVO FORMULÁRIO SIMPLIFICADO
    formTitle: "ENVIAR MENSAGEM CRIPTOGRAFADA",
    form: {
      name: "CODENAME (Nome):",
      email: "FREQUÊNCIA (E-mail):",
      subject: "TIPO DE MISSÃO (Assunto):",
      message: "DADOS (Mensagem):",
      submit: "TRANSMITIR DADOS",
      sending: "ENVIANDO...",
      // Opções do Dropdown
      subjects: [
        '🤝 Collab / Parceria Musical',
        '🎙️ Imprensa / Podcast',
        '🖤 Mensagem de Fã / Lore',
        '🐞 Reportar Bug / Outros'
      ]
    },
    success: "✅ MENSAGEM RECEBIDA. O SISTEMA AGRADECE.",
    privacy: "🔒 Seus dados estão seguros no nosso servidor local."
  },

  // 🇺🇸 VERSÃO EM INGLÊS (Resumida para economizar espaço aqui)
  en: {
    title: "OPERATIONS BASE & UPLINK",
    subtitle: "Connect to the RQS neural network. Choose your frequency.",
    socialCards: [
      { name: 'Discord', icon: 'fab fa-discord', link: 'https://discord.gg/jECeH8ZU',color: '#38419e', desc: 'Official Chat & Lore' },
      { name: 'Telegram', icon: 'fab fa-telegram', link: 'https://t.me/raquelsynths_news', color: '#0088cc', desc: 'Fast News' },
      { name: 'Instagram', icon: 'fab fa-instagram', link: 'https://www.instagram.com/rqs_synths', color: '#d946ef', desc: 'Backstage & Visuals' },
      { name: 'Facebook', icon: 'fab fa-facebook', link: 'https://www.facebook.com/profile.php?id=61585926695560', color: '#0115ef', desc: 'Global Page' }
    ],
    formTitle: "SEND ENCRYPTED MESSAGE",
    form: {
      name: "CODENAME (Name):",
      email: "FREQUENCY (E-mail):",
      subject: "MISSION TYPE (Subject):",
      message: "DATA (Message):",
      submit: "TRANSMIT DATA",
      sending: "SENDING...",
      subjects: [
        '🤝 Collab / Music Partnership',
        '🎙️ Press / Podcast',
        '🖤 Fan Message / Lore',
        '🐞 Bug Report / Other'
      ]
    },
    success: "✅ MESSAGE RECEIVED. SYSTEM ACKNOWLEDGED.",
    privacy: "🔒 Your data is safe in our local server."
  }
};

// --- DADOS DE COMPLIANCE (Privacidade, Loja e Exclusão) ---
export const COMPLIANCE_DATA = {
  pt: {
    broklin: {
      title: '🛡️ COMPLIANCE & PRIVACIDADE',

      privacyTitle: '1. Política de Privacidade & Dados',
      privacyText: 'O ecossistema RaQuel Synths (RQS) utiliza a API do Facebook/Instagram exclusivamente para automação de postagens. Prezamos pela integridade técnica: não coletamos, armazenamos ou compartilhamos dados pessoais de terceiros em nossos servidores.',

      deletionTitle: '2. Instruções para Exclusão',
      deletionText: 'Para revogar o acesso, acesse as configurações de "Apps e Sites" em seu perfil do Facebook e remova a permissão da "RQS API". Para limpeza de logs manuais, contate-nos.',

      // 👇 NOVO: MÓDULO LOJA (STRIPE)
      storeTitle: '3. Política da Loja (Stripe & Print-on-Demand)',
      storeText: 'Utilizamos processamento seguro via Stripe. Como nossos produtos são feitos sob demanda (Print-on-Demand), <strong>não realizamos trocas por escolha de tamanho errado</strong>. Reembolsos apenas por defeito de fabricação reportado em até 7 dias.',

      // 👇 NOVO: MÓDULO AFILIADOS
      affiliateTitle: '4. Transparência de Afiliados',
      affiliateText: 'Participamos de programas de associados (Amazon/Shein). Ao comprar via nossos links, recebemos uma comissão que mantém o servidor ativo, sem custo extra para você.',

      policyTitle: '5. Publicidade e Cookies (AdSense)',
      policyText: 'Este site utiliza o Google AdSense. O Google usa cookies (DART) para exibir anúncios baseados em visitas. Você pode desativar a personalização na <a href="https://myadcenter.google.com" target="_blank">Minha Central de Anúncios</a>.',

      contactTitle: '6. Canal de Suporte',
      contactText: 'Para questões legais ou bugs: <a href="mailto:contact@raquelsynths.com.br">contact@raquelsynths.com.br</a>'
    },

    jonah: {
      title: '💀 PROTOCOLO DE SEGURANÇA (CAOS)',

      privacyTitle: '1. RASTROS DIGITAIS',
      privacyText: 'O sistema RQS invade as redes apenas para espalhar o som. Seus dados não me interessam, eu só quero que o servidor não caia enquanto o mundo queima. Nada é guardado nos meus arquivos.',

      deletionTitle: '2. APAGAR EVIDÊNCIAS',
      deletionText: 'Quer sair da rede? Vá nas configurações do Facebook e corte o cabo de conexão da RQS API. Eu não vou guardar backup do seu rastro digital, não sou babá de dados.',

      // 👇 NOVO: MÓDULO LOJA (VERSÃO JONAH)
      storeTitle: '3. LOJA INDUSTRIAL (SEM DRAMA)',
      storeText: 'Processamos via Stripe. Regra de Ouro do Industrial: <strong>Se você escolheu o tamanho errado, o problema é seu.</strong> A peça é feita única pra você. Só aceito devolução se o correio destruir a mercadoria.',

      // 👇 NOVO: MÓDULO AFILIADOS (VERSÃO JONAH)
      affiliateTitle: '4. ALIANÇAS ESTRATÉGICAS',
      affiliateText: 'Alguns links mandam você pra Amazon. Se você comprar, eles me pagam uma taxa pra financiar minha guerra sonora. Você não paga nada a mais, apenas alimenta o sistema.',

      policyTitle: '5. VIGILÂNCIA CORPORATIVA (ADS)',
      policyText: 'Sim, tem anúncios. O Google usa cookies para te rastrear, não eu. Se quiser se esconder das "Big Techs", resolva com eles na <a href="https://myadcenter.google.com" target="_blank">Central de Controle deles</a>. Eu lavo minhas mãos.',

      contactTitle: '6. FREQUÊNCIA DE RÁDIO',
      contactText: 'Problemas? Mande um sinal: <a href="mailto:contact@raquelsynths.com.br">contact@raquelsynths.com.br</a>'
    }
  },

  en: {
    broklin: {
      title: '🛡️ COMPLIANCE & PRIVACY',
      privacyTitle: '1. Privacy & Data Policy',
      privacyText: 'The RaQuel Synths (RQS) ecosystem uses Facebook/Instagram API solely for automation. We value integrity: we do not collect, store, or share personal data on our servers.',
      deletionTitle: '2. Deletion Instructions',
      deletionText: 'To revoke access, go to "Apps and Websites" in your Facebook settings and remove "RQS API". Contact us for manual log clearing.',

      storeTitle: '3. Store Policy (Stripe & PoD)',
      storeText: 'Secure processing via Stripe. Since items are Print-on-Demand, <strong>we do not offer exchanges for wrong size selection</strong>. Refunds only for manufacturing defects reported within 7 days.',

      affiliateTitle: '4. Affiliate Transparency',
      affiliateText: 'We participate in associate programs (Amazon/Shein). Buying via our links earns us a commission to keep servers running, at no extra cost to you.',

      policyTitle: '5. Advertising & Cookies',
      policyText: 'This site uses Google AdSense. Google uses cookies (DART) to serve ads. Opt-out at <a href="https://myadcenter.google.com" target="_blank">Google Ad Center</a>.',

      contactTitle: '6. Support Channel',
      contactText: 'Legal or bugs: <a href="mailto:contact@raquelsynths.com.br">contact@raquelsynths.com.br</a>'
    },

    jonah: {
      title: '💀 SECURITY PROTOCOL (CHAOS)',
      privacyTitle: '1. DIGITAL FOOTPRINTS',
      privacyText: 'RQS hits the network to spread sound. Your data is boring; I just want uptime. Nothing is archived.',
      deletionTitle: '2. ERASING EVIDENCE',
      deletionText: 'Want out? Cut the RQS API cable in Facebook settings. I’m not a data babysitter; no backups kept.',

      storeTitle: '3. INDUSTRIAL STORE (NO DRAMA)',
      storeText: 'Processed via Stripe. Golden Rule: <strong>If you picked the wrong size, that’s on you.</strong> It’s custom-made. I only refund if the courier destroys it.',

      affiliateTitle: '4. STRATEGIC ALLIANCES',
      affiliateText: 'Some links go to Amazon. You buy, I get coins to fund the sonic war. Costs you nothing extra.',

      policyTitle: '5. CORPORATE SURVEILLANCE',
      policyText: 'Google tracks you with cookies, not me. Hide from Big Tech at <a href="https://myadcenter.google.com" target="_blank">Their Control Center</a>. I wash my hands.',

      contactTitle: '6. RADIO FREQUENCY',
      contactText: 'Issues? Send a signal: <a href="mailto:contact@raquelsynths.com.br">contact@raquelsynths.com.br</a>'
    }
  }
};

// --- FOOTER (Rodapé) ---
export const FOOTER_DATA = {
  pt: {
    name: 'Raquel Synths',
    madeby:'© 2026 Universo RQS.',
    rights: 'Todos os direitos reservados.',
    owers: 'Codigo & Musica por Kelma & Broklin.',
    madeWith: 'Feito com Angular 20 & Café ☕',
    listen: 'OUÇA',
    connect: 'Base de Operações',
    support: 'APOIE A BANDA:',
    coffee: 'Pagar um Café ☕',
    devProfile: 'VER PERFIL TÉCNICO >',
    compliance: 'PRIVACIDADE & COMPLIANCE >'
  },
  en: {
    name: 'Raquel Synths',
    madeby:'© 2026 RQS Universe.',
    rights: 'All rights reserved.',
    owers: 'Code & Music by Kelma & Broklin.',
    madeWith: 'Made with Angular 20 & Coffee ☕',
    listen: 'LISTEN',
    connect: 'Operations Base',
    support: 'SUPPORT THE BAND:',
    coffee: 'Buy us a Coffee ☕',
    devProfile: 'VIEW TECH PROFILE >',
    compliance: 'PRIVACY & COMPLIANCE >'
      }
 };
