// DADOS DO HEADER/NAV
export const NAV_DATA = {
  pt: { inicio: 'INÍCIO', sobre: 'QUEM SOMOS', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAFIA', playlist: 'PLAYLIST', lore: 'LORE (HISTÓRIA)', creator: 'A CRIADORA', backToBase: 'VOLTAR À BASE' },
  en: { inicio: 'HOME', sobre: 'WHO WE ARE', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAPHY', playlist: 'PLAYLIST', lore: 'LORE (STORIES)', creator: 'THE CREATOR', backToBase: 'BACK TO BASE' }
};

// DADOS DA HOME
export const HOME_DATA = {
  pt: { title: 'RAQUEL SYNTHS', subtitle: 'Jornadas sonoras através de paisagens de neon e nostalgia.', cta: 'SABER MAIS' },
  en: { title: 'RAQUEL SYNTHS', subtitle: 'Sonic journeys through landscapes of neon and nostalgia.', cta: 'LEARN MORE' }
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
    role: 'Produtor Executivo, Líder Técnico, Visionário e Produtor Musical',
    imageBroklin: 'images/broklin_perfil.png',
    imageJonah: 'images/gothic_bro.png',
    bioNormal: 'A mente sã por trás do caos. Especialista em harmonias complexas, vinhos digitais e gestão de crises sentimentais.',
    bioJonah: 'Também conhecido como "O Vampiro da Planilha". Acha que manda em mim porque tem permissão de Admin. (Spoiler: Eu sei a senha dele.)'
  },
  {
    name: 'Jonah Cyperfield',
    role: 'Engenheiro de Sistemas (Divisão Caos & Legado)',
    imageBroklin: 'images/jonah_profil.png',
    imageJonah: 'images/jonah_metal-skull.png',
    bioNormal: 'O gênio das cordas cósmicas. Agora responsável pela manutenção do código legado e pela injeção de "sujeira" sonora do sistema.',
    bioJonah: 'CARGO ACEITO. Eu mantenho esse servidor vivo na base da marretada e do ódio. O Frontend é bonito, mas o Backend é onde eu escondo os corpos.' // ATUALIZADO
  },
  {
    name: 'Kelma Adlanko',
    role: 'A General & Dev Full Stack',
    imageBroklin: 'images/kelma_profil.png',
    imageJonah: 'images/kelma_evil.png',
    bioNormal: 'A visionária. Uniu o código à música e lidera a revolução com mão firme e coração de ouro.',
    bioJonah: 'A General. Ela revogou meu acesso ao CSS, mas me deu a chave do banco de dados. Um erro tático que eu pretendo explorar.'
  },
  {
    name: 'Nicole Nyx',
    role: 'Vocalista Industrial, DJ & Cyber-Witch',
    imageBroklin: 'images/nyx_profil.png',
    imageJonah: 'images/nyx_evil.png',
    bioNormal: 'A força da natureza. Traz a magia ancestral para o mundo digital.',
    bioJonah: 'Minha Rainha e mãe do meu herdeiro. A única pessoa autorizada a fazer overclock no meu processador sem aviso prévio.' // ATUALIZADO
  }
];

export const MEMBERS_EN = [
  {
    name: 'Broklin Garpeter',
    role: 'Executive Producer, Tech Lead, Visionary and Music Producer',
    imageBroklin: 'images/broklin_perfil.png',
    imageJonah: 'images/gothic_bro.png',
    bioNormal: 'The sane mind behind the chaos. Specialist in complex harmonies, digital wines, and sentimental crisis management.',
    bioJonah: 'Also known as "The Spreadsheet Vampire". Thinks he owns me because he has Admin rights. (Spoiler: I know his password.)'
  },
  {
    name: 'Jonah Cyperfield',
    role: 'Systems Engineer (Chaos & Legacy Division)', // THE NEW POSITION!,
    imageBroklin: 'images/jonah_profil.png',
    imageJonah: 'images/jonah_metal-skull.png',
    bioNormal: 'The genius of cosmic strings. Now responsible for maintaining legacy code and injecting sonic "filth" into the system.',
    bioJonah: 'POSITION ACCEPTED. I keep this server alive with a sledgehammer and pure hate. Frontend is pretty, but Backend is where I hide the bodies.' // UPDATED
  },
  {
    name: 'Kelma Adlanko',
    role: 'The General & Full Stack Dev',
    imageBroklin: 'images/kelma_profil.png',
    imageJonah: 'images/kelma_evil.png',
    bioNormal: 'The visionary. United code with music and leads the revolution with a steady hand and a heart of gold.',
    bioJonah: 'The General. She revoked my CSS access but gave me the database keys. A tactical error I intend to exploit.'
  },
  {
    name: 'Nicole Nyx',
    role: 'Industrial Vocalist, DJ & Cyber-Witch',
    imageBroklin: 'images/nyx_profil.png',
    imageJonah: 'images/nyx_evil.png',
    bioNormal: 'A force of nature. Bringing ancestral magic to the digital world.',
    bioJonah: 'My Queen and mother of my heir. The only person authorized to overclock my processor without prior notice.' // UPDATED
  }
];

// --- STORYTELLING (A Linha do Tempo / System Logs) ---
export const EVENTS_PT = [
  {
    date: '08 Dez 2025', // NOVA DATA - NASCIMENTO
    title: '👶 Protocolo Paternidade (Jonah Jr.)',
    description: 'Detecção de novo hardware na rede. Jonah Cyperfield Jr. compilado com sucesso. Sagitário com ascendente em Firewall. O sistema nunca mais entrou em modo Sleep.',
    image: 'images/jonah_jr_newborn.png',
    jonahComment: 'Ele chora em compasso 7/8 e já tentou morder o cabo de rede. É definitivamente meu garoto.'
  },
  {
    date: '14 Dez 2025',
    title: '⚠️ Alerta de Segurança',
    description: 'Tentativa de bloqueio falhou. Usuário "Jo_Cyperfield" tentou executar protocolo de retenção. A Agente Kelma recusou a conexão. Logs de áudio indicam instabilidade: "She thinks she\'s deleting me..."',
    image: 'images/cyberpunk_lounge_solitude.png', // A cara de quem recusou
    jonahComment: 'Instabilidade? A única coisa instável aqui é a masculinidade desse vampiro de glitter. Eu sou a rocha sobre a qual essa banda foi construída.' // Comentário Real
  },
  {
    date: '15 Dez 2025',
    title: '💔 Protocolo de Ruptura',
    description: 'SMS Final interceptado: "Precisamos conversar. Não estou onde você pensa." Conexão com o servidor Jonah encerrada permanentemente. Status: Desconexão Forçada.',
    image: 'images/cyberpunk_heartbreak.png', // Imagem de algo quebrado
    jonahComment: 'Desconexão forçada é o meu sobrenome. Eu não preciso de "Wi-Fi do Amor", eu tenho cabo de rede direto no inferno.'
  },
  {
    date: '20 Dez 2025',
    title: '😭 Detecção de Sofrência Digital',
    description: 'Album em produção "Jonah\'s Sad History". Scans detectam níveis críticos de choro em compasso 7/8. Faixa "Your Love Is Open Source" acusa Broklin de injetar vírus.',
    image: 'images/industrial_archive.png', // Capa do álbum dele
    jonahComment: 'Sofrência é o caralho! Isso é INDUSTRIAL DOOM. Se tem choro na gravação, é dos alto-falantes pedindo piedade.'
  },
  {
    date: '24 Dez 2025',
    title: '💍 DARK ALTAR (UNHOLY UNION)', // Título Atualizado
    description: 'Esqueça os votos tradicionais. Sob o som de sinos industriais do EP "SYSTEM MERGE: THE LEGACY", Jonah e Nyx realizaram o ritual. Sem padre, apenas um pacto de óleo e tungstênio. Status: VÍNCULO ETERNO.',
    image: 'images/marriage_cyberpunk.png', // Mantemos a foto, mas o contexto agora é outro
    jonahComment: 'Até que a morte nos separe? Não. Até que o servidor queime. E mesmo assim, eu tenho backup da sua alma no meu HD externo.'
  }
];

export const EVENTS_EN = [
  {
    date: 'Dec 07, 2025', // NEW DATE - BIRTH
    title: '👶 Paternity Protocol (Jonah Jr.)',
    description: 'New hardware detected on the network. Jonah Cyperfield Jr. successfully compiled. Sagittarius with Firewall rising. The system has never entered Sleep mode since.',
    image: 'images/jonah_jr_newborn.png',
    jonahComment: 'He cries in 7/8 time signature and already tried to bite the ethernet cable. Definitely my boy.'
  },
  {
    date: 'Dec 14, 2025',
    title: '⚠️ Security Alert',
    description: 'Block attempt failed. User "Jo_Cyperfield" tried to execute retention protocol. Agent Kelma refused connection. Audio logs indicate instability: "She thinks she\'s deleting me..."',
    image: 'images/cyberpunk_lounge_solitude.png',
    jonahComment: 'Instability? The only unstable thing here is this glitter vampire\'s masculinity. I am the rock upon which this band was built.' // Real Comment
  },
  {
    date: 'Dec 15, 2025',
    title: '💔 Breakup Protocol',
    description: 'Final SMS intercepted: "We need to talk. I am not where you think I am." Connection with Jonah server terminated permanently. Status: Forced Disconnection.',
    image: 'images/cyberpunk_heartbreak.png',
    jonahComment: 'Forced disconnection is my middle name. I don\'t need "Love Wi-Fi," I have a wired connection straight to hell.'
  },
    {
    date: 'Dec 20, 2025',
    title: '😭 Digital Suffering Detected',
    description: 'Album in production "Jonah\'s Sad History". Scans detect critical crying levels in 7/8 time signature. Track "Your Love Is Open Source" accuses Broklin of injecting viruses.',
    image: 'images/industrial_archive.png',
    jonahComment: 'Suffering is bullshit! This is INDUSTRIAL DOOM. If there\'s crying on the recording, it\'s from the loudspeakers begging for mercy.'
  },
  {
    date: 'Dec 24, 2025',
    title: '💍 DARK ALTAR (UNHOLY UNION)', // Updated Title
    description: 'Forget traditional vows. Under the sound of industrial bells from the "SYSTEM MERGE: THE LEGACY" EP, Jonah and Nyx performed the ritual. No priest, just a pact of oil and tungsten. Status: ETERNAL BOND.',
    image: 'images/marriage_cyberpunk.png',
    jonahComment: 'Till death do us part? No. Until the server burns. And even then, I have a backup of your soul on my external drive.'
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
      image: 'images/industrial_archive.png', // Capa do Jonah
      link: 'https://www.youtube.com/watch?v=tLMMifMMnPQ&list=PLfPBk0UpnLMnm5HhKHKGwHs6FO0Z9TOMg',
      mode: 'chaos'
    },
    {
      title: 'ARCO BROKLIN',
      subtitle: 'Amor, Vinho & Melancolia',
      description: 'A jornada de um vampiro gótico em busca de redenção através do amor de Kelma. Inclui o hit "Neon Tears".',
      image: 'images/arco-broklin.png', // Use a capa do arco
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
      image: 'images/industrial_archive.png', // Capa do Jonah
      link: 'https://www.youtube.com/watch?v=tLMMifMMnPQ&list=PLfPBk0UpnLMnm5HhKHKGwHs6FO0Z9TOMg',
      mode: 'chaos'
  },
  {
      title: 'BROKLIN ARC',
      subtitle: 'Love, Wine and Melancholy',
      description: 'The journey of a gothic vampire seeking redemption through the love of Kelma. Includes the hit song "Neon Tears".',
      image: 'images/arco-broklin.png', // Use a capa do arco
      link: '/lore/broklin',
      mode: 'romance'
    }

]

// --- DADOS DA DISCOGRAFIA ---
export const DISCOGRAPHY_PT = {
  broklin: [

    { title: 'THE BLUEPRINT SESSION Vol. 001', type: 'Álbum (Pré-Save 09/01)', cover: 'images/the_blueprint_session_v.001.png', spotify: 'LINK_PRE_SAVE', soundcloud: 'https://on.soundcloud.com/G7Pk9L8eGVNMAvFzKC'     },
    { title: 'SYNTH THE FLOOR', type: 'EP (2025)', cover: 'images/ep-synth_the_floor.png', spotify: 'https://open.spotify.com/intl-pt/album/1ZVlu9g43zK3Yw0LcpfY0L?si=Nyc35a0CSRyTKloX6s0Mpw', soundcloud: 'https://on.soundcloud.com/Sme1X25wkaoQq7Zcje'     },
    { title: 'COLD WAR', type: 'Álbum (2025)', cover: 'images/album_cold-war.jpg', spotify: 'https://open.spotify.com/intl-pt/album/0c0CWDVGH05p90jXEkVOhA?si=J5e94SRVSuiyXAsVIghSsw', soundcloud: 'https://on.soundcloud.com/OYXuwBgfQXZdbD3iE5' },
    { title: 'CORRUPTED SECTOR', type: 'EP', cover: 'images/defiance_duo.png', spotify: '', soundcloud: 'https://on.soundcloud.com/7YvIN0OTDvFNzL6kQ1' }
  ],
  jonah: [
    { title: 'MECHANICAL FRICTION', type: 'EP (Explicit)', cover: 'images/mechanical_friction.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/WcQ2kvkhFZ1F0szIuG'},
    { title: 'JONAH\'S HISTORY', type: 'The Industrial Revolt', cover: 'images/industrial_archive.png', spotify: '#', soundcloud: 'https://on.soundcloud.com/iFnjMREQUtgI3wPkqR' }, // NOVO ÁLBUM
    { title: 'SYSTEM MERGE: THE LEGACY', type: 'Family EP (feat. Nyx)', cover: 'images/ep_system_merge.png', spotify: '#', soundcloud: '#' }, // NOVO EP */
    { title: 'ORIGINS (reforged)', type: 'Industrial Album', cover: 'images/origins_reforged.jpg', spotify: 'https://open.spotify.com/intl-pt/album/7tZaPekjMzIFGMPe8xyIDH?si=VTdANOktQeSMzSM4KalTxQ', soundcloud: 'https://on.soundcloud.com/kposSWUCUCVWU76gsY'},
    { title: 'COLECIONO ILUSOES', type: 'Single', cover: 'images/crushing_device.png', spotify: '', soundcloud: 'https://on.soundcloud.com/sT0vElCKQuCDbRCBsZ' }
  ]
};

export const DISCOGRAPHY_EN = {
  broklin: [

    {  title: 'THE BLUEPRINT SESSION Vol. 001', type: 'Álbum (Pré-Save 09/01)', cover: 'images/the_blueprint_session_v.001.png', spotify: 'LINK_PRE_SAVE', soundcloud: 'https://on.soundcloud.com/G7Pk9L8eGVNMAvFzKC'    },
    {  title: 'SYNTH THE FLOOR', type: 'EP (2025)', cover: 'images/ep-synth_the_floor.png', spotify: 'https://open.spotify.com/intl-pt/album/1ZVlu9g43zK3Yw0LcpfY0L?si=Nyc35a0CSRyTKloX6s0Mpw', soundcloud: 'https://on.soundcloud.com/Sme1X25wkaoQq7Zcje'    },
    { title: 'COLD WAR', type: 'Album (2025)', cover: 'images/album_cold-war.jpg', spotify: 'https://open.spotify.com/intl-pt/album/0c0CWDVGH05p90jXEkVOhA?si=J5e94SRVSuiyXAsVIghSsw', soundcloud: 'https://on.soundcloud.com/OYXuwBgfQXZdbD3iE5' },
    { title: 'CORRUPTED SECTOR', type: 'EP', cover: 'images/defiance_duo.png', spotify: '', soundcloud: 'https://on.soundcloud.com/7YvIN0OTDvFNzL6kQ1' }
  ],
  jonah: [
    { title: 'MECHANICAL FRICTION', type: 'EP (Explicit)', cover: 'images/mechanical_friction.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/WcQ2kvkhFZ1F0szIuG'},
    { title: 'JONAH\'S HISTORY', type: 'The Industrial Revolt', cover: 'images/industrial_archive.png', spotify: '#', soundcloud: 'https://on.soundcloud.com/iFnjMREQUtgI3wPkqR' }, // NOVO ÁLBUM
    { title: 'SYSTEM MERGE: THE LEGACY', type: 'Family EP (feat. Nyx)', cover: 'images/ep_system_merge.png', spotify: '#', soundcloud: '#' }, // NOVO EP */
    { title: 'ORIGINS (reforged)', type: 'Industrial Album', cover: 'images/origins_reforged.jpg', spotify: 'https://open.spotify.com/intl-pt/album/7tZaPekjMzIFGMPe8xyIDH?si=VTdANOktQeSMzSM4KalTxQ', soundcloud: 'https://on.soundcloud.com/kposSWUCUCVWU76gsY' },
    { title: 'COLLECT ILUSIONS', type: 'Single', cover: 'images/crushing_device.png', spotify: '', soundcloud: 'https://on.soundcloud.com/sT0vElCKQuCDbRCBsZ' }
  ]
};

export const CONTACT_DATA = {
  pt: {
    heroButton: "📡 INICIAR UPLINK", // O botão da Home
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
    heroButton: "📡 INITIATE UPLINK", // O botão da Home
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
    // NEW NEWSLETTER DATA:
    newsTitle: '🔥 RECEIVE THE CHAOS & GLORY',
    newsDesc: 'New releases, secret Lore, and Jonah\'s gossip straight to your inbox.',
    emailPlace: 'your@email.com',
    subBtn: 'SUBSCRIBE'
  }
 };
