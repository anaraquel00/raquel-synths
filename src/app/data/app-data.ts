// DADOS DO HEADER/NAV
export const NAV_DATA = {
  pt: { inicio: 'INÍCIO', sobre: 'QUEM SOMOS', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAFIA', store: 'LOJA', lore: 'LORE (HISTÓRIA)', creator: 'A CRIADORA', backToBase: 'VOLTAR À BASE' },
  en: { inicio: 'HOME', sobre: 'WHO WE ARE', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAPHY', store: 'STORE', lore: 'LORE (STORIES)', creator: 'THE CREATOR', backToBase: 'BACK TO BASE' }
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

// DADOS DO BANNER DE ANÚNCIOS
export const ADS_DATA = {
  pt: { label: '/// FLUXO DE DADOS PATROCINADO ///' },
  en: { label: '/// SPONSORED DATA STREAM ///' }
};

export const VISUAL_NOVEL_PT = [
    {
      title: '⚡ RQS: Guerra Civil (Series)',
      subtitle: '⚠️ SYSTEM STATUS: FRATURADO.',
      description: 'Bem-vindo(a) à visual novel musical de RaQuel Synths. Esta não é apenas uma coleção de vídeos; é um registro cronológico da Guerra Fria entre duas filosofias sonoras.',
      image: 'images/civil-war.png', // Use a capa do arco
      link: 'https://www.youtube.com/watch?v=1BP6n0XwG2A&list=PLfPBk0UpnLMnjcSASrdyJ3Pss_rTe3tHh',
      mode: 'war'
    },
    {
      title: '📼 RQS: ORIGINS (Before the Metal)',
      subtitle: 'Caos, Fios & Revolução',
      description: 'Quando o sistema falha, a verdade aparece. A revolta industrial de Jonah contra a programação.',
      image: 'assets/disco/album_jonas-history.png', // Capa do Jonah
      link: 'https://www.youtube.com/watch?v=tLMMifMMnPQ&list=PLfPBk0UpnLMnm5HhKHKGwHs6FO0Z9TOMg',
      mode: 'chaos'
    },
    {
      title: 'ARCO BROKLIN',
      subtitle: 'Amor, Vinho & Melancolia',
      description: 'A jornada de um vampiro gótico em busca de redenção através do amor de Kelma. Inclui o hit "Neon Tears".',
      image: 'assets/disco/album_the-broklins-story.png', // Use capa do arco
      link: '/lore/broklin',
      mode: 'romance'
    }
];

export const VISUAL_NOVEL_EN = [
  {
      title: '⚡ RQS: Civil War (The Series)',
      subtitle: '⚠️ SYSTEM STATUS: FRACTURED.',
      description: 'Welcome to RaQuel Synths Musical Visual Novel. This is not just a collection of videos; it is a chronological record of the Cold War between two sonic philosophies.',
      image: 'images/civil-war.png', // Use a capa do arco
      link: 'https://www.youtube.com/watch?v=1BP6n0XwG2A&list=PLfPBk0UpnLMnjcSASrdyJ3Pss_rTe3tHh',
      mode: 'war'
  },
  {
      title: '📼 RQS: ORIGINS (Before the Metal)',
      subtitle: 'Chaos, Wires & Revolution',
      description: 'When the system fails, the truth comes out. Jonahs industrial revolt against programming.',
      image: 'assets/disco/album_jonas-history.png',
      link: 'https://www.youtube.com/watch?v=tLMMifMMnPQ&list=PLfPBk0UpnLMnm5HhKHKGwHs6FO0Z9TOMg',
      mode: 'chaos'
  },
  {
      title: 'BROKLIN ARC',
      subtitle: 'Love, Wine and Melancholy',
      description: 'The journey of a gothic vampire seeking redemption through the love of Kelma. Includes the hit song "Neon Tears".',
      image: 'assets/disco/album_the-broklins-story.png', // Use a capa do arco
      link: '/lore/broklin',
      mode: 'romance'
    }

]

// --- DADOS DA DISCOGRAFIA ---
export const DISCOGRAPHY_PT = {
  broklin: [
    { title: 'System Reboot', type: 'EP', cover: 'assets/disco/ep_system-reboot.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/gAYTejXu6Cjvzcsr7R'    },
    { title: 'Digital Ghosts (Vol. 1)', type: 'EP', cover: 'assets/disco/ep_digital-ghost.png', spotify: '', soundcloud: 'https://on.soundcloud.com/gQCMW5CsTPRG9Qn7Ih'    },
    { title: 'Broklin\'s History (The Intergalactic Saga)', type: 'Album', cover: 'assets/disco/album_the-broklins-story.png', spotify: '', soundcloud: 'https://on.soundcloud.com/Rs8W9wMM100vf7S6Lx'   },
    { title: 'Noctural Protocol', type: 'Single', cover: 'assets/disco/noctural_protocol.png', spotify: '', soundcloud: 'https://soundcloud.com/rqs_official/sets/noctural-protocol?si=ebfdd0255cae4ccbbd71b9cf56eef437&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing'    },
    { title: 'THE BLUEPRINT SESSION Vol. 001', type: 'EP (2025)', cover: 'assets/disco/the_blueprint_session_v.001.png', spotify: 'https://open.spotify.com/intl-pt/album/255NEv7qHyrFqn19OVQr4c?si=1BOwoc5IQGKo4gcACdsbCw', soundcloud: 'https://on.soundcloud.com/G7Pk9L8eGVNMAvFzKC'     },
    { title: 'SYNTH THE FLOOR', type: 'EP (2025)', cover: 'assets/disco/ep-synth_the_floor.png', spotify: 'https://open.spotify.com/intl-pt/album/1ZVlu9g43zK3Yw0LcpfY0L?si=Nyc35a0CSRyTKloX6s0Mpw', soundcloud: 'https://on.soundcloud.com/Sme1X25wkaoQq7Zcje'     },
    { title: 'COLD WAR', type: 'Álbum (2025)', cover: 'assets/disco/album_cold-war.jpg', spotify: 'https://open.spotify.com/intl-pt/album/0c0CWDVGH05p90jXEkVOhA?si=J5e94SRVSuiyXAsVIghSsw', soundcloud: 'https://on.soundcloud.com/OYXuwBgfQXZdbD3iE5' },
    { title: 'CORRUPTED SECTOR', type: 'EP', cover: 'assets/disco/defiance_duo.png', spotify: '', soundcloud: 'https://on.soundcloud.com/7YvIN0OTDvFNzL6kQ1' }
  ],
  jonah: [
    { title: 'THE BLOODPRINT SESSIONS', type: 'EP', cover: 'assets/disco/ep_the-bloodprint-sessions.png', spotify: '', soundcloud: 'https://on.soundcloud.com/mrU9kmKBlubb5r635E'    },
    { title: 'GLITCH IN THE MIRROR', type: 'EP', cover: 'assets/disco/ep_glitch-in-the-mirror.png', spotify: '', soundcloud: 'https://on.soundcloud.com/yseFxxMy3FZ6ggLgjh'    },
    { title: 'RUST & HUNGER (Jonah\'s Fury)', type: 'EP', cover: 'assets/disco/ep_rust-and-hunger.png', spotify: '', soundcloud: 'https://on.soundcloud.com/dGeczcCz7ZfTL2e7ci'    },
    { title: 'MECHANICAL FRICTION', type: 'EP (Explicit)', cover: 'assets/disco/mechanical_friction.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/WcQ2kvkhFZ1F0szIuG'},
    { title: 'JONAH\'S HISTORY', type: 'The Industrial Revolt', cover: 'assets/disco/album_jonas-history.png', spotify: '#', soundcloud: 'https://on.soundcloud.com/iFnjMREQUtgI3wPkqR' }, // NOVO ÁLBUM
    { title: 'SYSTEM MERGE: THE LEGACY', type: 'Family EP (feat. Nyx)', cover: 'assets/disco/ep_system_merge.png', spotify: '#', soundcloud: '#' }, // NOVO EP */
    { title: 'ORIGINS (reforged)', type: 'Industrial Album', cover: 'assets/disco/origins_reforged.jpg', spotify: 'https://open.spotify.com/intl-pt/album/7tZaPekjMzIFGMPe8xyIDH?si=VTdANOktQeSMzSM4KalTxQ', soundcloud: 'https://on.soundcloud.com/kposSWUCUCVWU76gsY'},
    { title: 'COLECIONO ILUSOES', type: 'Single', cover: 'assets/disco/crushing_device.png', spotify: '', soundcloud: 'https://on.soundcloud.com/sT0vElCKQuCDbRCBsZ' }
  ]
};

export const DISCOGRAPHY_EN = {
  broklin: [
    { title: 'System Reboot', type: 'EP', cover: 'assets/disco/ep_system-reboot.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/gAYTejXu6Cjvzcsr7R'    },
    { title: 'Digital Ghosts (Vol. 1)', type: 'EP', cover: 'assets/disco/ep_digital-ghost.png', spotify: '', soundcloud: 'https://on.soundcloud.com/gQCMW5CsTPRG9Qn7Ih'    },
    { title: 'Broklin\'s History (The Intergalactic Saga)', type: 'Album', cover: 'assets/disco/album_the-broklins-story.png', spotify: '', soundcloud: 'https://on.soundcloud.com/Rs8W9wMM100vf7S6Lx'   },
    { title: 'Noctural Protocol', type: 'Single', cover: 'assets/disco/noctural_protocol.png', spotify: '', soundcloud: 'https://soundcloud.com/rqs_official/sets/noctural-protocol?si=ebfdd0255cae4ccbbd71b9cf56eef437&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing'    },
    { title: 'THE BLUEPRINT SESSION Vol. 001', type: 'EP (2025)', cover: 'assets/disco/the_blueprint_session_v.001.png', spotify: 'https://open.spotify.com/intl-pt/album/255NEv7qHyrFqn19OVQr4c?si=1BOwoc5IQGKo4gcACdsbCw', soundcloud: 'https://on.soundcloud.com/G7Pk9L8eGVNMAvFzKC'     },
    { title: 'SYNTH THE FLOOR', type: 'EP (2025)', cover: 'assets/disco/ep-synth_the_floor.png', spotify: 'https://open.spotify.com/intl-pt/album/1ZVlu9g43zK3Yw0LcpfY0L?si=Nyc35a0CSRyTKloX6s0Mpw', soundcloud: 'https://on.soundcloud.com/Sme1X25wkaoQq7Zcje'     },
    { title: 'COLD WAR', type: 'Álbum (2025)', cover: 'assets/disco/album_cold-war.jpg', spotify: 'https://open.spotify.com/intl-pt/album/0c0CWDVGH05p90jXEkVOhA?si=J5e94SRVSuiyXAsVIghSsw', soundcloud: 'https://on.soundcloud.com/OYXuwBgfQXZdbD3iE5' },
    { title: 'CORRUPTED SECTOR', type: 'EP', cover: 'assets/disco/defiance_duo.png', spotify: '', soundcloud: 'https://on.soundcloud.com/7YvIN0OTDvFNzL6kQ1' }
  ],
  jonah: [
   { title: 'THE BLOODPRINT SESSIONS', type: 'EP', cover: 'assets/disco/ep_the-bloodprint-sessions.png', spotify: '', soundcloud: 'https://on.soundcloud.com/mrU9kmKBlubb5r635E'    },
    { title: 'GLITCH IN THE MIRROR', type: 'EP', cover: 'assets/disco/ep_glitch-in-the-mirror.png', spotify: '', soundcloud: 'https://on.soundcloud.com/yseFxxMy3FZ6ggLgjh'    },
    { title: 'RUST & HUNGER (Jonah\'s Fury)', type: 'EP', cover: 'assets/disco/ep_rust-and-hunger.png', spotify: '', soundcloud: 'https://on.soundcloud.com/dGeczcCz7ZfTL2e7ci'    },
    { title: 'MECHANICAL FRICTION', type: 'EP (Explicit)', cover: 'assets/disco/mechanical_friction.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/WcQ2kvkhFZ1F0szIuG'},
    { title: 'JONAH\'S HISTORY', type: 'The Industrial Revolt', cover: 'assets/disco/industrial_archive.png', spotify: '#', soundcloud: 'https://on.soundcloud.com/iFnjMREQUtgI3wPkqR' },
    { title: 'SYSTEM MERGE: THE LEGACY', type: 'Family EP (feat. Nyx)', cover: 'assets/disco/ep_system_merge.png', spotify: '#', soundcloud: '#' },
    { title: 'ORIGINS (reforged)', type: 'Industrial Album', cover: 'assets/disco/origins_reforged.jpg', spotify: 'https://open.spotify.com/intl-pt/album/7tZaPekjMzIFGMPe8xyIDH?si=VTdANOktQeSMzSM4KalTxQ', soundcloud: 'https://on.soundcloud.com/kposSWUCUCVWU76gsY'},
    { title: 'COLECIONO ILUSOES', type: 'Single', cover: 'assets/disco/crushing_device.png', spotify: '', soundcloud: 'https://on.soundcloud.com/sT0vElCKQuCDbRCBsZ' },
  ]
};

export const CONTACT_DATA = {
  pt: {
    heroButton: "📡 INICIAR UPLINK", // O botão do Home
    title: "📡 UPLINK // PROTOCOLO DE COLABORAÇÃO",
    subtitle: "Envie seu sinal. Buscamos frequências compatíveis.",
    success: "✅ SINAL RECEBIDO. CÂMBIO E DESLIGO.",
    form: {
      name: "CODENAME (Nome):",
      namePlaceholder: "Ex: Max Cavalera",
      email: "FREQUÊNCIA (E-mail):",
      emailPlaceholder: "contato@metal.com",
      daw: "ARMA DE ESCOLHA (DAW):",
      link: "PROVA DE ÁUDIO (Link):",
      message: "MISSÃO (Mensagem):",
      submit: "ENVIAR DADOS",
      sending: "TRANSMITINDO..."
    },
    errors: {
      required: "Dado obrigatório, Agente."
    }
  },
  en: {
    heroButton: "📡 INITIATE UPLINK", // Botão Home
    title: "📡 UPLINK // COLLABORATION PROTOCOL",
    subtitle: "Send your signal. We search for compatible frequencies.",
    success: "✅ SIGNAL RECEIVED. OVER AND OUT.",
    form: {
      name: "CODENAME (Name):",
      namePlaceholder: "Ex: Trent Reznor",
      email: "FREQUENCY (E-mail):",
      emailPlaceholder: "contact@industrial.com",
      daw: "WEAPON OF CHOICE (DAW):",
      link: "AUDIO PROOF (Link):",
      message: "MISSION BRIEF (Message):",
      submit: "SEND DATA",
      sending: "TRANSMITTING..."
    },
    errors: {
      required: "Required data, Agent."
    }
  }
};

// --- DADOS DE COMPLIANCE (Privacidade e Exclusão) ---
export const COMPLIANCE_DATA = {
  pt: {
    broklin: {
      title: '🛡️ COMPLIANCE & PRIVACIDADE',
      privacyTitle: '1. Política de Privacidade',
      privacyText: 'O aplicativo RaQuel Synths (RQS) utiliza a API do Facebook/Instagram exclusivamente para automação de postagens e interação artística. Prezamos pela integridade técnica: não coletamos, armazenamos ou compartilhamos dados pessoais de terceiros.',
      deletionTitle: '2. Instruções para Exclusão de Dados',
      deletionText: 'Para revogar o acesso ao sistema, acesse as configurações de "Apps e Sites" em seu perfil do Facebook e remova a permissão da "RQS API". Caso deseje limpeza de logs manuais, entre em contato via uplink.',
      categoryTitle: '3. Categoria',
      categoryText: 'Artes e Entretenimento: Banda Musical / Tech-Art.',
      policyTitle:'4. Publicidade e Cookies',
      policyText: 'Este site utiliza o Google AdSense para exibir anúncios. O Google e seus parceiros utilizam cookies (como o cookie DART) para veicular anúncios com base em suas visitas a este e outros sites na internet. Os usuários podem optar por desativar o uso de cookies para publicidade personalizada acessando a <a href="https://myadcenter.google.com" target="_blank" rel="noopener noreferrer">Minha Central de Anúncios do Google</a>.',    },
    jonah: {
      title: '💀 PROTOCOLO DE SEGURANÇA (CAOS)',
      privacyTitle: '1. RASTROS DIGITAIS',
      privacyText: 'O sistema RQS invade as redes apenas para espalhar o som. Seus dados não me interessam, eu só quero que o servidor não caia enquanto o mundo queima. Nada é guardado nos meus arquivos.',
      deletionTitle: '2. APAGAR EVIDÊNCIAS',
      deletionText: 'Quer sair da rede? Vá nas configurações do Facebook e corte o cabo de conexão da RQS API. Eu não vou guardar backup do seu rastro digital, não sou babá de dados.',
      categoryTitle: '3. SETOR',
      categoryText: 'Divisão Industrial: Revolta contra a Programação.',
      policyTitle: '4. VIGILÂNCIA CORPORATIVA (ADS)',
      policyText: 'Sim, tem anúncios aqui. O Google usa cookies para te rastrear, não eu. Se você quiser se esconder das "Big Techs" e desativar essa perseguição, clique aqui: <a href="https://myadcenter.google.com" target="_blank" rel="noopener noreferrer">Central de Controle deles</a>. Eu lavo minhas mãos.',

    }
  },
  en: {
    broklin: {
      title: '🛡️ COMPLIANCE & PRIVACY',
      privacyTitle: '1. Privacy Policy',
      privacyText: 'The RaQuel Synths (RQS) app uses the Facebook/Instagram API exclusively for post automation and artistic interaction. We value technical integrity: we do not collect, store, or share third-party personal data.',
      deletionTitle: '2. Data Deletion Instructions',
      deletionText: 'To revoke system access, go to the "Apps and Websites" settings in your Facebook profile and remove the "RQS API" permission. For manual log clearing, contact us via uplink.',
      categoryTitle: '3. Category',
      categoryText: 'Arts & Entertainment: Musical Band / Tech-Art.',
      policyTitle: '4. Advertising and Cookies',
      policyText: 'This site uses Google AdSense to display ads. Google and its partners use cookies (such as the DART cookie) to serve ads based on your visits to this and other sites on the internet. Users can opt out of the use of cookies for personalized advertising by visiting my <a href="https://myadcenter.google.com" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.',    },
    jonah: {
      title: '💀 SECURITY PROTOCOL (CHAOS)',
      privacyTitle: '1. DIGITAL FOOTPRINTS',
      privacyText: 'The RQS system hits the networks only to spread the sound. Your data does not interest me; I just want the server to stay up while the world burns. Nothing is stored in my archives.',
      deletionTitle: '2. ERASING EVIDENCE',
      deletionText: 'Want out of the grid? Go to your Facebook settings and cut the RQS API connection cable. I won’t keep a backup of your digital footprint; I’m not a data babysitter.',
      categoryTitle: '3. SECTOR',
      categoryText: 'Industrial Division: Revolt against Programming.',
      policyTitle: '4. CORPORATE SURVEILLANCE (ADS)',
      policyText: 'Yeah, there are ads. Google uses cookies to track you, not me. If you want to hide from "Big Tech" and disable this stalking, click here: <a href="https://myadcenter.google.com" target="_blank" rel="noopener noreferrer">Their Control Center</a>. I wash my hands.',
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
    connect: 'CONECTE-SE',
    support: 'APOIE A BANDA:',
    coffee: 'Pagar um Café ☕',
    devProfile: 'VER PERFIL TÉCNICO >',
    compliance: 'PRIVACIDADE & COMPLIANCE >',
    // NOVOS DADOS DA NEWSLETTER:
    newsTitle: '🔥 RECEBA O CAOS & A GLÓRIA',
    newsDesc: 'Novos lançamentos, Lore secreta e fofocas do Jonah direto na sua caixa de entrada.',
    emailPlace: 'seu@email.com',
    subBtn: 'INSCREVER-SE'
  },
  en: {
    name: 'Raquel Synths',
    madeby:'© 2026 RQS Universe.',
    rights: 'All rights reserved.',
    owers: 'Code & Music by Kelma & Broklin.',
    madeWith: 'Made with Angular 20 & Coffee ☕',
    listen: 'LISTEN',
    connect: 'CONNECT',
    support: 'SUPPORT THE BAND:',
    coffee: 'Buy us a Coffee ☕',
    devProfile: 'VIEW TECH PROFILE >',
    compliance: 'PRIVACY & COMPLIANCE >',
    // NEW NEWSLETTER DATA:
    newsTitle: '🔥 RECEIVE THE CHAOS & GLORY',
    newsDesc: 'New releases, secret Lore, and Jonah\'s gossip straight to your inbox.',
    emailPlace: 'your@email.com',
    subBtn: 'SUBSCRIBE'
  }
 };
