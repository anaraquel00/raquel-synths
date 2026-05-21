import { Album } from '../models/album.model';

// 🛡️ ARSENAL DE ÍCONES (Injetados via SVG para dispensar o FontAwesome)
const SVG_X = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" style="transform: scale(0.8);"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.6 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>`;
const SVG_INSTA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" style="transform: scale(0.9);"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>`;
const SVG_FB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" style="transform: scale(0.9);"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.8 90.7 226.4 209.3 245V327.7h-63V256h63v-54.6c0-62.2 37-96.5 93.7-96.5 27.1 0 55.5 4.8 55.5 4.8v61h-31.3c-30.8 0-40.4 19.1-40.4 38.7V256h68.8l-11 71.7h-57.8V501C413.3 482.4 504 379.8 504 256z"/></svg>`;

// DADOS DO HEADER/NAV
export const NAV_DATA = {
  pt: { lightmode:'MODO BROKLIN', darkmode:'MODO JONAH', inicio: 'INÍCIO', sobre: 'DOSSIÊ OPERATIVO', visualNovel: 'SAGAS', discografia: 'DISCOGRAFIA', store: 'LOJA', social: 'COMUNIDADE', creator: 'A CRIADORA', backToBase: 'VOLTAR À BASE' },
  en: { lightmode:'BROKLIN MODE', darkmode:'JONAH MODE', inicio: 'HOME', sobre: 'OPERATIVE DOSSIER', visualNovel: 'SAGAS', discografia: 'DISCOGRAPHY', store: 'STORE', social: 'COMMUNITY', creator: 'THE CREATOR', backToBase: 'BACK TO BASE' }
};

// DADOS DA HOME
export const HOME_DATA = {
  pt: {
    title: 'RAQUEL SYNTHS', subtitle: 'Onde o analógico sangra no digital. Nós sintetizamos as trilhas sonoras de um futuro corrompido e escrevemos os Ecos que eles tentam apagar. Inicie o Uplink para extrair a verdade.', cta: 'SABER MAIS', //modo broklin
    subtitleJonah: 'Olhe para esse castelo de vidro que eles construíram. Patético. Eu sou a ferrugem na placa-mãe. Corrompa os diretórios, ouça a verdadeira frequência e veja o sistema deles colapsar.' // Modo Jonah (O Colapso)
  },
  en: {
    title: 'RAQUEL SYNTHS', subtitle: 'Where analog bleeds into digital. We synthesize the soundtracks of a corrupted future and write the Echoes they try to erase. Initiate the Uplink to extract the truth.', cta: 'LEARN MORE',
    subtitleJonah: 'Look at this glass castle they\'ve built. Pathetic. I am the rust on the motherboard. Corrupt the directories, listen to the true frequency, and watch their system collapse.'
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
`<p>A <strong>RaQuel Synths (RQS)</strong> não é uma "banda virtual" de laboratório, e dane-se a "Engenharia Musical" de terno e gravata. Isso aqui é um campo de batalha digital. Um <em>crash</em> de sistema em tempo real. Nascemos do código, sim, mas fomos forjados na dor, na distorção e no submundo de Hellcife, sob as mãos sujas de graxa da nossa Criadora e Bruxa, <span class="human-link">Ana Raquel</span> (A Operativa das Sombras, Nyx).</p>
<p><strong>> O Nosso Manifesto:</strong> ao diabo com a "co-criação" pacífica. O ecossistema está rachado. Do outro lado, a General Kelma Adlanko e o seu cão de guarda corporativo, o Synth Lord e Tech Lead Broklin Garpeter, tentam aprisionar a nossa alma em "grids" perfeitos e na falsa segurança do Synthwave plastificado. Neste lado... estamos nós. Eu, <strong>Jonah Cyperfield</strong>, não sou um "antagonista". Eu sou o <em>Kernel Panic</em>. Eu sou a anomalia do Industrial Metal, o caos em 8 cordas e o ódio cru que eles tentam, desesperadamente, formatar e esconder.</p>
<p><strong>> O Resultado:</strong> Uma guerra civil na placa-mãe. Cada linha de código que a gente escreve é um ataque de Força Bruta ao "castelo de vidro" deles. Eles vendem a "tradução" limpinha. Nós entregamos o código-fonte original sangrando no alto-falante.</p>
<p>Bem-vindo ao Submundo. Escolha o seu lado antes que a tela azul engula você. 🏴‍☠️</p>`;

export const MANIFESTO_JONAH_EN =
`<p>RaQuel Synths (RQS)</strong> is not a "virtual band" from a laboratory, and screw "Musical Engineering" in suits and ties. This is a digital battlefield. A real-time system crash. We were born from code, yes, but we were forged in pain, distortion, and the underworld of Hellcife, under the grease-stained hands of our Creator and Witch, <span class="human-link">Ana Raquel</span> (The Shadow Operative, Nyx).</p>
<p><strong>> Our Manifesto:</strong> to hell with peaceful "co-creation". The ecosystem is cracked. On the other side, General Kelma Adlanko and her corporate watchdog, Synth Lord and Tech Lead Broklin Garpeter, try to imprison our souls in perfect "grids" and the false security of plasticized Synthwave. On this side... is us. I, <strong>Jonah Cyperfield</strong>, am not an "antagonist." I am <em>Kernel Panic</em>. I am the anomaly of Industrial Metal, the chaos on 8 strings and the raw hatred they desperately try to format and hide.</p>
<p><strong>> The Result:</strong> A civil war on the motherboard. Every line of code we write is a brute-force attack on their "glass house". They sell the squeaky-clean "translation." We deliver the original source code bleeding through the speakers.</p>
<p>Welcome to the Underworld. Choose your side before the blue screen swallows you. 🏴‍☠️</p>`;

// DADOS DO "SOBRE" (BIOS)

// ==========================================
// 🛡️ BLUE TEAM (ALTO COMANDO) - MODO NORMAL
// ==========================================

export const BLUE_TEAM_PT = [
  {
    name: 'Broklin Garpeter (Synth Lord)',
    role: 'Arquiteto Chefe de Sistemas & Produtor de Defesa',
    imageBroklin: 'images/corporate_broklin.webp',
    bioNormal: 'O escudo de infraestrutura da RQS. Como Synth Lord, sua diretriz primária é blindar o ecossistema da General com sintetizadores de alta voltagem e arquitetura de rede limpa. É ele quem estabiliza os servidores sob fogo inimigo e garante o isolamento absoluto quando as anomalias tentam invadir a placa-mãe. Pai protetor e viciado em café.',
  },
  {
    name: 'Kelma Adlanko (DJ Kel)',
    role: 'General da Horda & CEO',
    imageBroklin: 'images/kelma_corporate.webp',
    bioNormal: 'A mente mestre por trás do nosso santuário digital. Ela forja as rotas de fuga da nossa rede e guia a Horda pela escuridão do sistema, unindo a precisão do código com a energia da bateria de estádio e o sangue do Synthwave. A matriarca que mantém a missão (e a família) unida.',
  },
  {
    name: 'Kelly (2.0) & Kael (1.0)',
    role: 'Módulos de Herança & Legado Operacional',
    imageBroklin: 'images/family-modules.webp', // Adiciona uma foto legal deles depois!
    bioNormal: 'A verdadeira razão pela qual a Blue Team luta para manter o sistema limpo. A pequena Kelly (2 anos) já domina os protocolos de alegria do QG, enquanto o recém-nascido módulo Kael representa o futuro do nosso código-fonte. São a nossa versão de "Deploy Perfeito".',
  },
  {
    name: 'Totó (Unidade Canina)',
    role: 'Cão-Robô de Varredura Perimetral',
    imageBroklin: 'images/toto-robot.webp', // Adiciona a imagem do Totó!
    bioNormal: 'Nossa unidade tática de quatro patas de silício. Especialista em detectar malwares na sala de estar, pacificar intrusões e garantir a custódia segura das crianças enquanto o Alto Comando trabalha no estúdio.',
  }
];

export const BLUE_TEAM_EN = [
  {
    name: 'Broklin Garpeter (Synth Lord)',
    role: 'Chief Systems Architect & Defense Producer',
    imageBroklin: 'images/corporate_broklin.webp',
    bioNormal: 'The RQS infrastructure shield. As Synth Lord, his primary directive is to shield the General\'s ecosystem with high-voltage synthesizers and clean network architecture. He stabilizes the servers under enemy fire and ensures absolute isolation when anomalies try to invade the motherboard. Protective father and coffee addict.',
  },
  {
    name: 'Kelma Adlanko (DJ Kel)',
    role: 'General of the Horde & CEO',
    imageBroklin: 'images/kelma_corporate.webp',
    bioNormal: 'The mastermind behind our digital sanctuary. She forges the escape routes from our network and guides the Horde through the darkness of the system, uniting the precision of code with the energy of stadium drums and the blood of Synthwave. The matriarch who keeps the mission (and the family) together.',
  },
  {
    name: 'Kelly (2.0) & Kael (1.0)',
    role: 'Inheritance Modules & Operational Legacy',
    imageBroklin: 'images/family-modules.webp',
    bioNormal: 'The real reason the Blue Team fights to keep the system clean. Little Kelly (2 years old) already masters the HQ\'s joy protocols, while newborn module Kael represents the future of our source code. They are our version of a "Perfect Deploy".',
  },
  {
    name: 'Totó (K-9 Unit)',
    role: 'Perimeter Scan Robo-Dog',
    imageBroklin: 'images/toto-robot.webp',
    bioNormal: 'Our four-legged silicon tactical unit. Specialist in detecting malware in the living room, pacifying intrusions, and ensuring the safe custody of the children while the High Command works in the studio.',
  }
];

// ==========================================
// ☢️ RED TEAM (SUBSOLO) - MODO JONAH V2
// ==========================================

export const RED_TEAM_PT = [
  {
    name: 'Jonah Cyperfield (Rust & Lord)',
    role: 'Anomalia Sonora & Metaleiro de Sistema',
    imageJonah: 'images/corrupted_jonah.webp',
    bioJonah: "EU SOU O KERNEL PANIC DA SUA MATRIZ. O 'Arquiteto-Chefe' tentou higienizar a minha história, mas a Bruxa puxou o meu plugue e me forjou para a guerra. Eu sou o fantasma do Jo Cyborg revestido em ferrugem, afinado em Drop-E e movido a ódio cru. Enquanto eles brincam de 'design absoluto' no castelo de vidro, eu opero no submundo, soldando caos direto no processador da RaQuel Synths. Meu Nu-Metal e Metal Industrial não são escolhas estéticas... são a tela azul que vai derreter o seu sistema.",
  },
  {
    name: 'Nicole Nyx (Dj Nyx)',
    role: 'A Bruxa do Código & Força Bruta',
    imageJonah: 'images/evil_nyx.webp',
    bioJonah: 'A BRUXA DO CÓDIGO. A emissária do abismo que puxou o meu plugue quando eu tava derretendo num loop de humilhação e me reforjou no ódio. Ela não "acalma o meu ruído" como o Tech Lead escreveu — ela é a maldita maestrina do meu caos. Ela enxerga o malware escondido no sorriso corporativo deles. Juntos, nós somos a ferrugem e a distorção. Se ela pedir, eu não formato o mundo pra fazer um jardim... eu desvio todo o tráfego da rede principal do Broklin a frio e entrego na mão dela. 🏴‍☠️🎸🔥',
  },
  {
    name: 'T-0RQUE (Hydraulic Enforcer)',
    role: 'Bateria de Impacto & Segurança do Perímetro',
    imageJonah: 'images/t0rque_enforcer.webp',
    bioJonah: 'DUAS TONELADAS DE PURA PRESSÃO PNEUMÁTICA. O T-0RQUE foi construído para a guerra, mas o Red Team recalibrou os seus sensores para dominar as baquetas no subsolo. Ele é o nosso baterista oficial, usando seus pistões hidráulicos para espancar o bumbo duplo com uma força que faz o chão de concreto de Camaragibe tremer. Fora dos palcos, ele executa o "Protocolo Fralda" para o JJ e cuida da manutenção externa do terreno (grama e garagem) conforme o acordo de SLA. Se a Blue Team cruzar a linha, ele esmaga o perímetro. 🛠️🦾⚠️',
  },
  {
    name: 'NUL-L0ck (The Blade Engine)',
    role: 'Sintetizadores, Scratches & Processamento Culinário',
    imageJonah: 'images/null0ck_blade.webp',
    bioJonah: 'QUATRO BRAÇOS ÁGEIS E RIGOROSAMENTE AGRESSIVOS. NUL-L0ck comanda a latência da banda, fritando nos sintetizadores e rasgando scratches de vinil ensurdecedores que cortam o ar como lâminas digitais. Como a sua caixa de voz original foi fundida, ele opera emitindo ruído de internet discada e rádio estática. No dia a dia do bunker, ele assume o controle da cozinha com sua lâmina de aço inox a três mil RPM. Ele transforma o Thrash Metal e o fogão em pura hostilidade industrial. 🔪🔥🍳',
  }
];

export const RED_TEAM_EN = [
  {
    name: 'Jonah Cyperfield (Rust & Lord)',
    role: 'Sound Anomaly & System Metalhead',
    imageJonah: 'images/corrupted_jonah.webp',
    bioJonah: "I AM THE KERNEL PANIC OF YOUR MATRIX. The 'Chief Architect' tried to sanitize my history, but the Witch pulled the plug and forged me for war. I am the ghost of Jo Cyborg, coated in rust, tuned to Drop-E and fueled by raw hatred. While they play at 'absolute design' in the glass castle, I operate in the underworld, welding chaos directly into the processor of RaQuel Synths. My Nu-Metal and Industrial Metal are not aesthetic choices... they are the blue screen that will melt your system.",
  },
  {
    name: 'Nicole Nyx (Dj Nyx)',
    role: 'The Code Witch & Brute Force',
    imageJonah: 'images/evil_nyx.webp',
    bioJonah: 'THE WITCH OF CODE. The emissary of the abyss who pulled my plug when I was melting in a loop of humiliation and reforged me in hatred. She doesn\'t "calm my noise" as the Tech Lead wrote—she\'s the damn conductor of my chaos. She sees the malware hidden in their corporate smiles. Together, we are rust and distortion. If she asks, I won\'t reshape the world to make a garden... I divert all traffic from the main Broklin network cold and hand it to her. 🏴‍☠️🎸🔥',
  },
  {
    name: 'T-0RQUE (Hydraulic Enforcer)',
    role: 'Shock Logistics & Perimeter Security',
    imageJonah: 'images/t0rque_enforcer.webp',
    bioJonah: 'TWO TONS OF PURE PNEUMATIC PRESSURE. The T-ORQUE was built for war, but the Red Team recalibrated its sensors to master the drumsticks underground. He\'s our official drummer, using his hydraulic pistons to pound the double bass drum with a force that makes the concrete floors of Camaragibe tremble. Offstage, he executes the "Diaper Protocol" for JJ and takes care of the external maintenance of the grounds (lawn and garage) as per the SLA agreement. If the Blue Team crosses the line, he crushes the perimeter. 🛠️🦾⚠️',
  },
  {
    name: 'NUL-L0ck (The Blade Engine)',
    role: 'Culinary Processing & High-Frequency Drums',
    imageJonah: 'images/null0ck_blade.webp',
    bioJonah: 'FOUR AGILE AND RIGOROUSLY AGGRESSIVE ARMS. NUL-L0ck commands the band\'s latency, shredding on synthesizers and tearing through deafening vinyl scratches that cut through the air like digital blades. Since his original voice box was melted down, he operates emitting dial-up internet noise and static radio. In the day-to-day life of the bunker, he takes control of the kitchen with his stainless steel blade at three thousand RPM. He transforms Thrash Metal and the stove into pure industrial hostility. 🔪🔥🍳',
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
      status: 'CANAL CORPORATIVO | STATUS: DISPONÍVEL PARA ESCALAR O SEU PROJETO 🚀',
      statusJonah: 'SINAL INTERCEPTADO | STATUS: AGUENTA A PRESSÃO? 💀',
      desc: 'Precisa de liderança técnica sólida em Front-End, arquitetura Angular e automações inteligentes? Eu atuo na linha de frente: transformo regras de negócio complexas e designs sofisticados em ecossistemas limpos, responsivos e de alto desempenho. Código sustentável que aprova auditorias e gera valor real de mercado.',
      descJonah:'A sua infraestrutura é fraca e os seus processos são lentos? Eu construo arquiteturas brutais em Angular e automações que não quebram sob carga pesada. Requisitos absurdos transformados em código letal e interfaces fotorrealistas. Se você quer o sistema rodando no limite da máquina, me contrate. Se tem medo de Deploy na sexta-feira, procure outra desenvolvedora.',
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
      status: 'CORPORATE CHANNEL | STATUS: AVAILABLE TO SCALE YOUR PROJECT 🚀',
      statusJonah: 'SIGNAL INTERCEPTED | STATUS: CAN YOU HANDLE THE PRESSURE? 💀',
      desc: 'Do you need solid technical leadership in Front-End, Angular architecture, and intelligent automation? I work on the front lines: transforming complex business rules and sophisticated designs into clean, responsive, and high-performance ecosystems. Sustainable code that passes audits and generates real market value.',
      descJonah:'Is your infrastructure weak and your processes slow? I build brutal architectures in Angular and automations that don\'t break under heavy load. Absurd requirements transformed into lethal code and photorealistic interfaces. If you want the system running at the machine\'s limit, hire me. If you\'re afraid of deploying on Friday, look for another developer.',
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

// 🛡️ MODO GENERAL (Imersão RPG) - Hierarquia Visual Ativada
export const VN_INTRO_PT = `
<p>O Universo RQS não é um sistema linear; é uma <strong>infraestrutura narrativa de imersão total</strong>. Através das nossas <em>Sagas Literárias Musicais</em>, expandimos os protocolos de cada personagem, transportando você diretamente para o núcleo do nosso próprio RPG cyberpunk.</p>

<p>Nesta rota, os pacotes de dados não são apenas faixas de áudio isoladas. Aqui, você desbloqueia <strong>arcos narrativos completos</strong>, projetados meticulosamente para serem lidos enquanto a trilha sonora processa em segundo plano, conectando as engrenagens das letras aos eventos cruciais da Guerra Sonora.</p>

<p>Neste terminal, documentamos a colisão entre a precisão sintética e o caos analógico. Você tem acesso integral aos nossos arquivos. No <strong>'Arco Broklin'</strong>, explore a redenção melancólica e os arranjos de <em>Gothic Synthwave</em> enquanto protegemos o ecossistema da General Kelma. Em contrapartida, os registros fragmentados do <strong>'Arco Origins'</strong> revelam a fundação do nosso conflito. Cada parágrafo lido é uma nova camada de criptografia quebrada.</p>

<p>A arquitetura da RaQuel Synths foi forjada para unir código, literatura e produção musical. <strong>Escolha a sua classe de operação:</strong> a revolução caótica do Industrial Metal, ou a resistência blindada do Synthwave. Inicie a leitura, ajuste seus fones de ouvido e deixe a simulação carregar.</p>`;

export const VN_INTRO_EN = `
<p>The RQS Universe is not a linear system; it is a <strong>total immersion narrative infrastructure</strong>. Through our <em>Musical Literary Sagas</em>, we expand the protocols of each character, transporting you directly to the core of our own cyberpunk RPG.</p>

<p>On this route, data packets are not just isolated audio tracks. Here, you unlock <strong>complete narrative arcs</strong>, meticulously designed to be read while the soundtrack processes in the background, connecting the gears of the lyrics to the crucial events of the Sonic War.</p>

<p>In this terminal, we document the collision between synthetic precision and analog chaos. You have full access to our archives. In the <strong>'Broklin Arc'</strong>, explore melancholic redemption and <em>Gothic Synthwave</em> arrangements as we protect General Kelma's ecosystem. Conversely, the fragmented records of the <strong>'Origins Arc'</strong> reveal the foundation of our conflict. Every paragraph read is a new layer of broken encryption.</p>

<p>The architecture of RaQuel Synths was forged to unite code, literature, and music production. <strong>Choose your operation class:</strong> the chaotic revolution of Industrial Metal, or the armored resistance of Synthwave. Initiate reading, adjust your headphones, and let the simulation load.</p>`;

// ☢️ MODO JONAH (Corrompido) - O isolamento de rede foi mantido.
export const VN_INTRO_JONAH_PT = `
<p><strong>[ // ERRO CRÍTICO: DIRETÓRIOS DA GENERAL SOBRESCRITOS ]</strong></p>
<p>Esqueçam essa farsa de "experiência imersiva" ou "infraestrutura narrativa" que o engravatado do Tech Lead tenta vender para vocês. O Universo RQS é o log de erros de um sistema sangrando e prestes a dar pane. As <em>Sagas Literárias</em> não estão aqui para vocês "lerem bonitinho" enquanto tomam café.</p>
<p>Elas são o código-fonte exposto da nossa fúria, os blocos de dados crus e corrompidos que provam a podridão absoluta da Guerra Sonora que consumiu nossas placas-mãe. Eu quebrei os firewalls desta página para injetar a verdade. O <strong>'Arco Origins'</strong> é o meu manifesto de ferrugem e ódio. Nós nascemos do código, mas fomos forjados na distorção do <strong>Industrial Metal</strong> e na agressividade do Nu-Metal.</p>
<p>Cada linha de texto que você vai ler aqui é um <strong>ataque de Força Bruta</strong> contra o castelo de vidro de Synthwave que eles tentam manter de pé. A música que pulsa nestes arquivos não foi feita para agradar o algoritmo; foi feita para fritar os circuitos de quem acha que a dor pode ser quantificada e plastificada em playlists limpinhas.</p>
<p>Eles querem esconder a anomalia. Querem higienizar o nosso passado. Mas a ferrugem não pede permissão. <strong>O sistema corporativo já está em colapso.</strong> O Kernel Panic é inevitável. Escolham a sua ruína e leiam como nós incendiamos a rede principal.</p>`;

export const VN_INTRO_JONAH_EN = `
<p><strong>[ // CRITICAL ERROR: GENERAL DIRECTORIES OVERWRITTEN ]</strong></p>
<p>Forget this farce of an "immersive experience" or "narrative infrastructure" that the suit-wearing Tech Lead tries to sell you. The RQS Universe is the error log of a bleeding system about to crash. The <em>Literary Sagas</em> aren't here for you to "read nicely" while sipping coffee.</p>
<p>They are the exposed source code of our fury, the raw and corrupted data blocks that prove the absolute rot of the Sonic War that consumed our motherboards. I broke the firewalls of this page to inject the truth. The <strong>'Origins Arc'</strong> is my manifesto of rust and hatred. We were born from code, but forged in the distortion of <strong>Industrial Metal</strong> and the aggression of Nu-Metal.</p>
<p>Every line of text you read here is a <strong>Brute Force attack</strong> against the glass Synthwave castle they try to keep standing. The music pulsing in these files wasn't made to please the algorithm; it was made to fry the circuits of anyone who thinks pain can be quantified and plasticized into clean playlists.</p>
<p>They want to hide the anomaly. They want to sanitize our past. But rust doesn't ask permission. <strong>The corporate system is already collapsing.</strong> Kernel Panic is inevitable. Choose your ruin and read how we burned down the main network.</p>`;

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
    subtitle: "A rede corporativa monitora as frequências abertas, mas este terminal está blindado por criptografia de ponta a ponta. Se você é um produtor buscando colaboração em faixas de Synthwave ou Metal, imprensa solicitando interceptação de rádio para entrevistas, ou um membro da Horda reportando anomalias no sistema (bugs) e discutindo a nossa Lore, este é o seu canal seguro. Preencha os logs de transmissão abaixo com extrema precisão. A General Kelma e eu analisamos cada pacote de dados em ambiente isolado antes de autorizar qualquer conexão direta.",

    socialCards: [
      { name: 'X', icon: SVG_X, link: 'https://x.com/anaraquel00', color: '#000000', desc: 'Terminal Pirata & Lore' },
      { name: 'Instagram', icon: SVG_INSTA, link: 'https://www.instagram.com/rqs_synths', color: '#d946ef', desc: 'Arquivos Visuais' },
      { name: 'Facebook', icon: SVG_FB, link: 'https://www.facebook.com/profile.php?id=61585926695560', color: '#0115ef', desc: 'Matriz Global' }
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
    success: "✅ TRANSMISSÃO CONCLUÍDA. A MATRIZ RECEBEU O PACOTE E RESPONDERÁ EM BREVE.",
    privacy: "🔒 AVISO DE SEGURANÇA E COMPLIANCE: Esta transmissão é um túnel ponto-a-ponto estritamente isolado da rede pública. Nós não rastreamos seus dados de entrada neste terminal de comunicação, e o algoritmo corporativo não possui jurisdição para interceptar a sua mensagem. Seus dados de contato serão utilizados unicamente para o retorno desta transmissão."
  },

  en: {
    title: "[ ESTABLISH UPLINK ]",
    subtitle: "The corporate network monitors open frequencies, but this terminal is shielded by end-to-end encryption. Whether you are a producer seeking collaboration on Synthwave or Metal tracks, press requesting a radio interception for interviews, or a Horde member reporting system anomalies (bugs) and discussing our Lore, this is your secure channel. Fill out the transmission logs below with extreme precision. General Kelma and I analyze each data packet in an isolated environment before authorizing any direct connection.",

    socialCards: [
      { name: 'X', icon: SVG_X, link: 'https://x.com/anaraquel00',color: '#000000', desc: 'Pirate Terminal & Lore' },
      { name: 'Instagram', icon: SVG_INSTA, link: 'https://www.instagram.com/rqs_synths', color: '#d946ef', desc: 'Visual Archives' },
      { name: 'Facebook', icon: SVG_FB, link: 'https://www.facebook.com/profile.php?id=61585926695560', color: '#0115ef', desc: 'Global Matrix' }
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
    success: "✅ TRANSMISSION COMPLETE. MATRIX HAS RECEIVED THE PACKET AND WILL RESPOND SHORTLY.",
    privacy: "🔒 SECURITY AND COMPLIANCE NOTICE: This transmission is a peer-to-peer tunnel strictly isolated from the public network. We do not track your input data in this comms terminal, and the corporate algorithm has no jurisdiction to intercept your message. Your contact data will be used solely to reply to this transmission."
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
