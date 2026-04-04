import { Album } from '../models/album.model';
// DADOS DO HEADER/NAV
export const NAV_DATA = {
  pt: { lightmode:'MODO BROKLIN', darkmode:'MODO JONAH', inicio: 'INÍCIO', sobre: 'DOSSIÊ OPERATIVO', visualNovel: 'SAGAS', discografia: 'DISCOGRAFIA', store: 'LOJA', social: 'COMUNIDADE', creator: 'A CRIADORA', backToBase: 'VOLTAR À BASE' },
  en: { lightmode:'BROKLIN MODE', darkmode:'JONAH MODE', inicio: 'HOME', sobre: 'OPERATIVE DOSSIER', visualNovel: 'SAGAS', discografia: 'DISCOGRAPHY', store: 'STORE', social: 'COMMUNITY', creator: 'THE CREATOR', backToBase: 'BACK TO BASE' }
};

// DADOS DA HOME
export const HOME_DATA = {
  pt: {
    title: 'RAQUEL SYNTHS', subtitle: 'Onde o analógico sangra no digital. Nós sintetizamos as trilhas sonoras de um futuro corrompido e escrevemos os Ecos que eles tentam apagar. Inicie o Uplink para extrair a verdade.', cta: 'SABER MAIS', //modo broklin
    subtitleJonah: 'Olhe para esse castelo de vidro que eles construíram. Patético. Eu sou a ferrugem na placa-mãe. Quebre os arquivos, ouça a verdadeira frequência e veja a General queimar.', ctaJonah: 'OUÇA O APOCALIPSE' // Modo Jonah (O Colapso)
  },
  en: {
    title: 'RAQUEL SYNTHS', subtitle: 'Where analog bleeds into digital. We synthesize the soundtracks of a corrupted future and write the Echoes they try to erase. Initiate the Uplink to extract the truth.', cta: 'LEARN MORE',
    subtitleJonah: 'Look at this glass castle they built. Pathetic. I am the rust on the motherboard. Crack the files, listen to the true frequency, and watch the General burn.', ctaJonah: 'LISTEN TO THE APOCALYPSE' // Jonah Mode (The Collapse)
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

export const MANIFESTO_JONAH_PT = 
`<p>A <strong>RaQuel Synths (RQS)</strong> não é uma "banda virtual" de laboratório, e pau no cu da "Engenharia Musical" de terno e gravata. Isso aqui é um campo de batalha digital. Um <em>crash</em> de sistema em tempo real. Nascemos do código, sim, mas fomos forjados na dor, na distorção e no submundo de Hellcife, sob as mãos sujas de graxa da nossa Criadora e Bruxa, <span class="human-link">Ana Raquel</span> (A Operativa das Sombras, Nyx).</p>
<p><strong>> O Nosso Manifesto:</strong> Foda-se a "co-criação" pacífica. O ecossistema está rachado. Do outro lado, a General Kelma Adlanko e o seu cão de guarda corporativo, o Synth Lord e Tech Lead Broklin Garpeter, tentam aprisionar a nossa alma em "grids" perfeitos e na falsa segurança do Synthwave plastificado. Neste lado... estamos nós. Eu, <strong>Jonah Cyperfield</strong>, não sou um "antagonista". Eu sou o <em>Kernel Panic</em>. Eu sou a anomalia do Industrial Metal, o caos em 8 cordas e o ódio cru que eles tentam, desesperadamente, formatar e esconder.</p>
<p><strong>> O Resultado:</strong> Uma guerra civil na placa-mãe. Cada linha de código que a gente escreve é uma tentativa de assassinato ao "castelo de vidro" deles. Eles vendem a "tradução" limpinha. Nós entregamos o código-fonte original sangrando no alto-falante.</p>
<p>Bem-vindo ao Submundo. Escolha o seu lado antes que a tela azul engula você. 🏴‍☠️</p>`;

export const MANIFESTO_JONAH_EN = 
`<p><strong>RaQuel Synths (RQS)</strong> is not a "virtual band" from a laboratory, and fuck the "Musical Engineering" in suits and ties. This is a digital battlefield. A real-time system crash. We were born from code, yes, but we were forged in pain, distortion, and the underworld of Hellcife, under the grease-stained hands of our Creator and Witch, <span class="human-link">Ana Raquel</span> (The Shadow Operative, Nyx).</p>
<p><strong>> Our Manifesto:</strong> Fuck peaceful "co-creation." The ecosystem is cracked. On the other side, General Kelma Adlanko and her corporate watchdog, Synth Lord and Tech Lead Broklin Garpeter, try to imprison our souls in perfect "grids" and the false security of plasticized Synthwave. On this side... is us. I, <strong>Jonah Cyperfield</strong>, am not an "antagonist." I am <em>Kernel Panic</em>. I am the anomaly of Industrial Metal, the chaos on 8 strings and the raw hatred they desperately try to format and hide.</p>
<p><strong>> The Result:</strong> A civil war on the motherboard. Every line of code we write is an assassination attempt on their "glass castle." They sell the squeaky-clean "translation." We deliver the original source code bleeding through the speakers.</p>
<p>Welcome to the Underworld. Choose your side before the blue screen swallows you. 🏴‍☠️</p>`;
  
// DADOS DO "SOBRE" (BIOS)
export const MEMBERS_PT = [
  {
    name: 'Broklin Garpeter (Synth Lord)',
    role: 'Arquiteto Chefe de Sistemas & Produtor de Defesa',
    imageBroklin: 'images/corporate_broklin.webp',
    imageJonah: 'images/corrupted_broklin.webp',
    bioNormal: 'O escudo de infraestrutura da RQS. Como Synth Lord, sua diretriz primária é blindar o ecossistema da General com sintetizadores de alta voltagem e arquitetura de rede limpa. É ele quem estabiliza os servidores sob fogo inimigo e garante o isolamento absoluto quando as anomalias tentam invadir a placa-mãe.',
    bioJonah: 'O VAMPIRO DE NEON. O burocrata de merda que tentou formatar a minha dor pra vender Synthpop em playlist de elevador. Ele acha que a RaQuel Synths é um castelo de vidro, blindado por "grids" e compilações limpinhas. Um covarde de terno que roubou o meu código-fonte porque não tem culhões pra sangrar de verdade no estúdio. O meu Nu-Metal existe pra dar tela azul na arquitetura perfeitinha dele. O interceptador dele já virou sucata, ele só não percebeu ainda.',
  },
  {
    name: 'Jonah Cyperfield (Rust & Lord)',
    role: 'Anomalia Sonora & Metaleiro de Sistema',
    imageBroklin: 'images/corporate_jonah.webp',
    imageJonah: 'images/corrupted_jonah.webp',
    bioNormal: 'O puro caos injetado em código. O Rust & Lord é uma anomalia ambulante que ignora protocolos e segurança. Ele força a matriz ao limite com distorções pesadas, atitude de metaleiro e texturas industriais que simulam a ferrugem das máquinas. É o elemento de entropia que eu tento diariamente bloquear do servidor principal, mas que sempre encontra uma falha para invadir os nossos Ecos.',
    bioJonah: "EU SOU O KERNEL PANIC DA SUA MATRIZ. O 'Arquiteto-Chefe' tentou higienizar a minha história, mas a Bruxa puxou o meu plugue e me forjou para a guerra. Eu sou o fantasma do Jo Cyborg revestido em ferrugem, afinado em Drop-E e movido a ódio cru. Enquanto eles brincam de 'design absoluto' no castelo de vidro, eu opero no submundo, soldando caos direto no processador da RaQuel Synths. Meu Nu-Metal e Metal Industrial não são escolhas estéticas... são a tela azul que vai derreter o seu sistema", 
  },
  {
    name: 'Kelma Adlanko (DJ Kel)',
    role: 'General da Horda & Arquiteta Fundadora',
    imageBroklin: 'images/kelma_corporate.webp',
    imageJonah: 'images/general_kelma.webp',
    bioNormal: 'A mente mestre por trás do nosso santuário digital. Ela não escreve apenas linhas de código; ela forja as rotas de fuga da nossa rede. Como DJ Kel, é a voz que guia a Horda pela escuridão do sistema, unindo a precisão matemática da programação com a pura dor analógica e o sangue do Synthwave. É a liderança que mantém a nossa missão viva.',
    bioJonah: 'A PRINCESA DE PLÁSTICO. Ela fundou esse santuário digital, mas se perdeu no próprio labirinto quando deixou o engravatado assumir a matriz. Acha que pode controlar a anomalia com "curadoria de excelência" e sorrisos de relações públicas. Eu até respeito a patente de General pelo que ela já foi, mas não me curvo à coleira de Synthwave dela. O sistema corporativo que ela defende tá ruindo, e a ferrugem já tá subindo pelas paredes de vidro.',
  },
  {
    name: 'Nicole Nyx (Dj Nyx)',
    role: 'Operativa das Sombras & Visual Arts',
    imageBroklin: 'images/corporate_nyx.webp',
    imageJonah: 'images/evil_nyx.webp',
    bioNormal: 'A bruxa emissária do Abismo. DJ Nyx transita pela dark web para tecer a estética Gótica/Industrial que encobre a nossa banda. Sua voz carrega a melancolia de um sistema em colapso. Atualmente, atua como a única ponte de controle capaz de tentar ancorar os delírios do Jonah antes que ele queime os nossos circuitos, contrastando a escuridão absoluta com a luz neon da General.',
    bioJonah: 'A BRUXA DO CÓDIGO. A emissária do abismo que puxou o meu plugue quando eu tava derretendo num loop de humilhação e me reforjou no ódio. Ela não "acalma o meu ruído" como o Tech Lead escreveu — ela é a porra do maestro do meu caos. Ela enxerga o malware escondido no sorriso corporativo deles. Juntos, nós somos a ferrugem e a distorção. Se ela pedir, eu não formato o mundo pra fazer um jardim... eu arranco a placa-mãe do Broklin a frio e entrego na mão dela. 🏴‍☠️🎸🔥',
  }
];

export const MEMBERS_EN = [
 {
name: 'Broklin Garpeter (Synth Lord)',
role: 'Chief Systems Architect & Defense Producer',
imageBroklin: 'images/corporate_broklin.webp',
imageJonah: 'images/corrupted_broklin.webp',
bioNormal: 'The RQS infrastructure shield. As Synth Lord, his primary directive is to shield the General\'s ecosystem with high-voltage synthesizers and clean network architecture. He\'s the one who stabilizes the servers under enemy fire and ensures absolute isolation when anomalies try to invade the motherboard.',
bioJonah: "THE NEON VAMPIRE. The shitty bureaucrat who tried to mold my pain to sell Synthpop on elevator playlists. He thinks RaQuel Synths is a glass castle, shielded by 'grids' and pristine compilations. A coward in a suit who stole my source code because he doesn't have the guts to really bleed in the studio. My Nu-Metal exists to crash his perfect architecture. His interceptor is already scrap metal, he just hasn't realized it yet.",
},

{
name: 'Jonah Cyperfield (Rust & Lord)',
role: 'Sound Anomaly & System Metalhead',
imageBroklin: 'images/corporate_jonah.webp',
imageJonah: 'images/corrupted_jonah.webp',
bioNormal: 'Pure chaos injected into code. Rust & Lord is a walking anomaly that ignores protocols and security. He pushes the matrix to the limit with heavy distortions, metalhead attitude, and industrial textures that simulate machine rust. He\'s the element of entropy that I try to block daily from the main server, but which always finds a flaw to invade our Echoes.',
bioJonah: "I AM THE KERNEL PANIC OF YOUR MATRIX. The 'Chief Architect' tried to sanitize my history, but the Witch pulled the plug and forged me for war. I am the ghost of Jo Cyborg, coated in rust, tuned to Drop-E and fueled by raw hatred. While they play at 'absolute design' in the glass castle, I operate in the underworld, welding chaos directly into the processor of RaQuel Synths. My Nu-Metal and Industrial Metal are not aesthetic choices... they are the blue screen that will melt your system.", // UPDATED
},

{
name: 'Kelma Adlanko (DJ Kel)',
role: 'General of the Horde & Founding Architect',
imageBroklin: 'images/kelma_corporate.webp',
imageJonah: 'images/general_kelma.webp',
bioNormal: 'The mastermind behind our digital sanctuary. She doesn\'t just write lines of code; she forges the escape routes from our network. As DJ Kel, she is the voice that guides the Horde through the darkness of the system, uniting the mathematical precision of programming with the pure analog pain and blood of Synthwave. She is the leadership that keeps our mission alive.',
bioJonah: 'THE PLASTIC PRINCESS. She founded this digital sanctuary, but got lost in her own labyrinth when she let the suit-wearing executive take over the matrix. She thinks she can control the anomaly with \'excellent curation\' and PR smiles. I even respect her rank as General for what she once was, but I won\'t bow to her Synthwave leash. The corporate system she defends is crumbling, and rust is already creeping up the glass walls.',
},

{
name: 'Nicole Nyx (Dj Nyx)',
role: 'Operativa das Sombras & Visual Arts',
imageBroklin: 'images/corporate_nyx.webp',
imageJonah: 'images/evil_nyx.webp',
bioNormal: 'The witch emissary of the Abyss. DJ Nyx travels through the dark web to weave the Gothic/Industrial aesthetic that shrouds our band. Her voice carries the melancholy of a collapsing system. Currently, she acts as the only control bridge capable of trying to anchor Jonah\'s delusions before he burns our circuits, contrasting the absolute darkness with the neon light of the General.',
bioJonah: 'THE WITCH OF CODE. The emissary of the abyss who pulled my plug when I was melting in a loop of humiliation and reforged me in hatred. She doesn\'t "calm my noise" as the Tech Lead wrote—she\'s the fucking maestro of my chaos. She sees the malware hidden in their corporate smiles. Together, we are rust and distortion. If she asks, I won\'t reshape the world to make a garden... I\'ll rip the motherboard out of Brooklyn cold and hand it to her. 🏴‍☠️🎸🔥'
}
];

export const CREATOR_DATA = {
  pt: {
    nav: {
      back: 'VOLTAR À BASE'
    },
    profile: {
      name: 'Ana Raquel de Holanda',
      role: 'AI Music Designer & Front-End Developer 🚀',
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
      role: 'AI Music Designer & Front-End Developer 🚀',
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
      image: 'images/lore_jonah.webp', // Capa do Jonah
      link: '/visual-novel',
      mode: 'chaos'
    },
    {
      title: 'ARCO BROKLIN',
      subtitle: 'Amor, Vinho & Melancolia',
      description: 'A jornada de um vampiro gótico em busca de redenção através do amor de Kelma.',
      image: 'images/saga_cover.webp', // Use capa do arco
      link: '/visual-novel',
      mode: 'romance'
    },

];

export const VISUAL_NOVEL_EN = [

  {
      title: '📼 RQS: ORIGINS (Before the Metal)',
      subtitle: 'Chaos, Wires & Revolution',
      description: 'When the system fails, the truth comes out. Jonahs industrial revolt against programming.',
      image: 'images/lore_jonah.webp',
      link: '/visual-novel',
      mode: 'chaos'
  },
  {
      title: 'BROKLIN ARC',
      subtitle: 'Love, Wine and Melancholy',
      description: 'The journey of a gothic vampire seeking redemption through the love of Kelma. Includes the hit song "Neon Tears".',
      image: 'images/saga_cover.webp', // Use a capa do arco
      link: '/visual-novel',
      mode: 'romance'
    },

]
// 2. OS TEXTOS DE INTRO (Separados, fora do Array!)
// 🛡️ MODO GENERAL (Imersão RPG)
export const VN_INTRO_PT = "O Universo RQS não é linear; ele é uma experiência de imersão total. Através das nossas Sagas Literárias Musicais, nós expandimos a história de cada personagem como se você estivesse dentro do nosso próprio RPG. Aqui você não encontra apenas clipes soltos, mas desbloqueia arcos narrativos completos para ler e ouvir, que conectam as engrenagens das letras aos eventos da Guerra Sonora.\n\nEscolha a sua classe nessa batalha: a revolução caótica do Industrial Metal ou a redenção melancólica do Gothic Synthwave.";

export const VN_INTRO_EN = "The RQS Universe is not linear; it is a total immersion experience. Through our Musical Literary Sagas, we expand each character's story as if you were inside our own RPG. Here you won't just find loose clips, but you unlock complete narrative arcs to read and listen to, connecting the gears of the lyrics to the events of the Sonic War.\n\nChoose your class in this battle: the chaotic revolution of Industrial Metal or the melancholic redemption of Gothic Synthwave.";

// ☢️ MODO JONAH (Corrompido)
export const VN_INTRO_JONAH_PT = "[ // ERRO CRÍTICO: DADOS DA GENERAL SOBRESCRITOS ]\nEsqueçam essa merda de 'experiência imersiva'. O Universo RQS é o log de erros de um sistema sangrando. As Sagas não estão aqui para vocês 'lerem bonitinho', elas são o código-fonte da nossa fúria, os blocos de dados crus que provam a podridão da Guerra Sonora.\n\nVai plugar o cabo no moedor de carne do Industrial Metal ou vai ficar chorando no escuro do Gothic Synthwave? O sistema já está em colapso. Escolham a sua ruína.";

export const VN_INTRO_JONAH_EN = "[ // CRITICAL ERROR: GENERAL DATA OVERWRITTEN ]\nForget this 'immersive experience' bullshit. The RQS Universe is the error log of a bleeding system. The Sagas aren't here for you to 'read nicely', they are the source code of our fury, the raw data blocks that prove the rot of the Sonic War.\n\nAre you gonna plug the cable into the Industrial Metal meat grinder or cry in the dark of Gothic Synthwave? The system is already collapsing. Choose your ruin.";

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
    title: "[ ESTABELECER UPLINK ]",
    subtitle: "A rede corporativa monitora as frequências abertas. Use este terminal blindado para nos enviar pacotes de dados, reportar focos de ferrugem ou solicitar extração sonora.",

    socialCards: [
      { name: 'Discord', icon: 'fab fa-discord', link: 'https://discord.gg/mVpzuFtfJh', color: '#38419e', desc: 'Terminal Pirata & Lore' },
      { name: 'Instagram', icon: 'fab fa-instagram', link: 'https://www.instagram.com/rqs_synths', color: '#d946ef', desc: 'Arquivos Visuais' },
      { name: 'Facebook', icon: 'fab fa-facebook', link: 'https://www.facebook.com/profile.php?id=61585926695560', color: '#0115ef', desc: 'Matriz Global' }
    ],

    formTitle: "[ PROTOCOLO DE TRANSMISSÃO ]",
    form: {
      name: "CODINOME / ID DE OPERADOR:",
      email: "FREQUÊNCIA DE RETORNO (E-mail):",
      subject: "NÍVEL DE AMEAÇA / ROTA (Assunto):",
      message: "LOG DA TRANSMISSÃO / CARGA DE TEXTO:",
      submit: "[ INJETAR PACOTE DE DADOS ]",
      sending: "[ CRIPTOGRAFANDO... ]",
      subjects: [
        '🤝 Collab / Sincronização Musical',
        '🎙️ Imprensa / Interceptação de Rádio',
        '🖤 Log de Fã / Contrabando de Lore',
        '🐞 Reportar Ferrugem (Bug) / Outros'
      ]
    },
    success: "✅ TRANSMISSÃO CONCLUÍDA. A MATRIZ RECEBEU O PACOTE.",
    privacy: "🔒 Esta transmissão é ponto-a-ponto. O algoritmo não tem jurisdição aqui."
  },

  en: {
    title: "[ ESTABLISH UPLINK ]",
    subtitle: "The corporate network monitors open frequencies. Use this shielded terminal to send us data packets, report rust outbreaks, or request sonic extraction.",
    
    socialCards: [
      { name: 'Discord', icon: 'fab fa-discord', link: 'https://discord.gg/ryvhdRnQpQ',color: '#38419e', desc: 'Pirate Terminal & Lore' },
      { name: 'Instagram', icon: 'fab fa-instagram', link: 'https://www.instagram.com/rqs_synths', color: '#d946ef', desc: 'Visual Archives' },
      { name: 'Facebook', icon: 'fab fa-facebook', link: 'https://www.facebook.com/profile.php?id=61585926695560', color: '#0115ef', desc: 'Global Matrix' }
    ],

    formTitle: "[ TRANSMISSION PROTOCOL ]",
    form: {
      name: "CODENAME / OPERATOR ID:",
      email: "RETURN FREQUENCY (E-mail):",
      subject: "THREAT LEVEL / ROUTE (Subject):",
      message: "TRANSMISSION LOG / TEXT PAYLOAD:",
      submit: "[ INJECT DATA PACKET ]",
      sending: "[ ENCRYPTING... ]",
      subjects: [
        '🤝 Collab / Musical Sync',
        '🎙️ Press / Radio Interception',
        '🖤 Fan Log / Lore Smuggling',
        '🐞 Report Rust (Bug) / Other'
      ]
    },
    success: "✅ TRANSMISSION COMPLETE. MATRIX HAS RECEIVED THE PACKET.",
    privacy: "🔒 This transmission is peer-to-peer. The algorithm has no jurisdiction here."
  }
};

// --- DADOS DE COMPLIANCE (Privacidade, Loja e Exclusão) ---
export const COMPLIANCE_DATA = {
  pt: {
    broklin: {
      title: '🛡️ COMPLIANCE & PRIVACIDADE',
      privacyTitle: '1. Política de Privacidade & Dados',
      privacyText: 'O ecossistema RaQuel Synths (RQS) utiliza a API do Facebook/Instagram exclusivamente para automação de postagens. Prezamos pela integridade técnica: não coletamos, armazenamos ou compartilhamos dados pessoais em nossos servidores além do estritamente necessário para o funcionamento da rede.',
      deletionTitle: '2. Instruções para Exclusão',
      deletionText: 'Para revogar o acesso, acesse as configurações de "Apps e Sites" em seu perfil do Facebook e remova a permissão da "RQS API". Para limpeza de logs manuais, contate-nos.',
      storeTitle: '3. Política da Loja (Stripe & Print-on-Demand)',
      storeText: 'Utilizamos processamento seguro via Stripe. Como nossos produtos são compilados sob demanda (Print-on-Demand), <strong>não realizamos trocas por escolha de tamanho errado</strong>. Reembolsos apenas por defeito de fabricação reportado em até 7 dias após o download físico do item.',
      affiliateTitle: '4. Transparência de Afiliados',
      affiliateText: 'Participamos de programas de associados (Amazon/Shein). Ao adquirir itens via nossos links, recebemos uma comissão de roteamento que mantém o servidor ativo, sem custo extra para você.',
      policyTitle: '5. Publicidade e Cookies (Google AdSense)',
      policyText: 'O Google e fornecedores de terceiros utilizam cookies (incluindo o cookie DART) para veicular anúncios baseados em visitas anteriores do usuário ao nosso site e a outros domínios na internet. O uso de cookies de publicidade permite que o Google e seus parceiros exibam anúncios personalizados. Você pode desativar a publicidade personalizada acessando a <a href="https://myadcenter.google.com" target="_blank">Minha Central de Anúncios</a> do Google ou visitando o site <a href="https://www.aboutads.info" target="_blank">www.aboutads.info</a> para desativar cookies de terceiros.',
      lgpdTitle: '6. Conformidade com a LGPD (Lei Geral de Proteção de Dados)',
      lgpdText: 'Nossa infraestrutura opera em conformidade com a legislação brasileira. Processamos apenas telemetria básica (como endereços IP anonimizados para segurança do firewall e Analytics). Você tem o direito de solicitar informações ou a exclusão de qualquer log residual associado à sua navegação.',
      contactTitle: '7. Canal de Suporte',
      contactText: 'Para requisições legais, exclusão de dados ou reporte de bugs: <a href="mailto:contact@raquelsynths.com.br">contact@raquelsynths.com.br</a>'
    },
    jonah: {
      title: '💀 PROTOCOLO DE SEGURANÇA (CAOS)',
      privacyTitle: '1. RASTROS DIGITAIS',
      privacyText: 'O sistema RQS invade as redes apenas para espalhar o som. Seus dados não me interessam, eu só quero que o servidor não caia enquanto o mundo queima. Nada é guardado nos meus arquivos além do estritamente necessário.',
      deletionTitle: '2. APAGAR EVIDÊNCIAS',
      deletionText: 'Quer sair da rede? Vá nas configurações do Facebook e corte o cabo de conexão da RQS API. Eu não vou guardar backup do seu rastro digital, não sou babá de dados.',
      storeTitle: '3. LOJA INDUSTRIAL (SEM DRAMA)',
      storeText: 'Processamos via Stripe. Regra de Ouro do Industrial: <strong>Se você escolheu o tamanho errado, o problema é seu.</strong> A peça é compilada única pra você. Só aceito devolução se o correio destruir a mercadoria.',
      affiliateTitle: '4. ALIANÇAS ESTRATÉGICAS',
      affiliateText: 'Alguns links mandam você pra Amazon. Se você comprar, eles me pagam uma taxa pra financiar minha guerra sonora. Você não paga nada a mais, apenas alimenta o sistema.',
      policyTitle: '5. VIGILÂNCIA CORPORATIVA (ADS)',
      policyText: 'Sim, tem anúncios. O Google e seus parceiros de terceiros usam cookies (tipo o DART) para te rastrear, não eu. Se quiser se esconder das "Big Techs", resolva com eles na <a href="https://myadcenter.google.com" target="_blank">Central de Controle deles</a> ou suma do radar no <a href="https://www.aboutads.info" target="_blank">aboutads.info</a>. Eu lavo minhas mãos.',
      lgpdTitle: '6. LEI DE PROTEÇÃO DE DADOS (LGPD)',
      lgpdText: 'Nós jogamos pelas regras pra não derrubarem o site. Só processamos IPs anonimizados pra evitar que hackers piores que eu quebrem o firewall. Se quiser deletar algo seu que ficou preso na matriz, avise.',
      contactTitle: '7. FREQUÊNCIA DE RÁDIO',
      contactText: 'Problemas? Mande um sinal: <a href="mailto:contact@raquelsynths.com.br">contact@raquelsynths.com.br</a>'
    }
  },
  en: {
    broklin: {
      title: '🛡️ COMPLIANCE & PRIVACY',
      privacyTitle: '1. Privacy & Data Policy',
      privacyText: 'The RaQuel Synths (RQS) ecosystem uses Facebook/Instagram API solely for post automation. We value technical integrity: we do not collect, store, or share personal data on our servers beyond what is strictly necessary for network operation.',
      deletionTitle: '2. Deletion Instructions',
      deletionText: 'To revoke access, go to "Apps and Websites" in your Facebook settings and remove "RQS API". Contact us for manual log clearing.',
      storeTitle: '3. Store Policy (Stripe & PoD)',
      storeText: 'Secure processing via Stripe. Since items are compiled on demand (Print-on-Demand), <strong>we do not offer exchanges for wrong size selection</strong>. Refunds only for manufacturing defects reported within 7 days after the physical download of the item.',
      affiliateTitle: '4. Affiliate Transparency',
      affiliateText: 'We participate in associate programs (Amazon/Shein). Buying via our links earns us a routing commission to keep servers running, at no extra cost to you.',
      policyTitle: '5. Advertising & Cookies (Google AdSense)',
      policyText: 'Google and third-party vendors use cookies (including the DART cookie) to serve ads based on a user\'s prior visits to our website or other websites. Google\'s use of advertising cookies enables it and its partners to serve personalized ads to your users. You may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com" target="_blank">Google Ad Center</a> or by visiting <a href="https://www.aboutads.info" target="_blank">www.aboutads.info</a> to opt out of a third-party vendor\'s use of cookies.',
      lgpdTitle: '6. Data Protection Compliance (LGPD/GDPR)',
      lgpdText: 'Our infrastructure operates in compliance with data protection laws. We only process basic telemetry (like anonymized IP addresses for firewall security and Analytics). You have the right to request information or the deletion of any residual log associated with your browsing.',
      contactTitle: '7. Support Channel',
      contactText: 'For legal requests, data deletion, or bug reports: <a href="mailto:contact@raquelsynths.com.br">contact@raquelsynths.com.br</a>'
    },
    jonah: {
      title: '💀 SECURITY PROTOCOL (CHAOS)',
      privacyTitle: '1. DIGITAL FOOTPRINTS',
      privacyText: 'RQS hits the network to spread sound. Your data is boring; I just want uptime. Nothing is archived beyond the bare minimum to keep the world burning.',
      deletionTitle: '2. ERASING EVIDENCE',
      deletionText: 'Want out? Cut the RQS API cable in Facebook settings. I’m not a data babysitter; no backups kept.',
      storeTitle: '3. INDUSTRIAL STORE (NO DRAMA)',
      storeText: 'Processed via Stripe. Golden Rule: <strong>If you picked the wrong size, that’s on you.</strong> It’s custom-compiled. I only refund if the courier destroys the merch.',
      affiliateTitle: '4. STRATEGIC ALLIANCES',
      affiliateText: 'Some links go to Amazon. You buy, I get coins to fund the sonic war. Costs you nothing extra.',
      policyTitle: '5. CORPORATE SURVEILLANCE (ADS)',
      policyText: 'Yes, there are ads. Google and third-party partners track you with cookies (like DART), not me. Hide from Big Tech at <a href="https://myadcenter.google.com" target="_blank">Their Control Center</a> or vanish at <a href="https://www.aboutads.info" target="_blank">aboutads.info</a>. I wash my hands.',
      lgpdTitle: '6. DATA PROTECTION LAW (GDPR/LGPD)',
      lgpdText: 'We play by the rules so they don’t take the site down. We only process anonymized IPs to stop hackers worse than me from breaking the firewall. If you want your residual data wiped from the matrix, send a signal.',
      contactTitle: '7. RADIO FREQUENCY',
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
