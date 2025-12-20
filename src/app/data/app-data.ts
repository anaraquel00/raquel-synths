// DADOS DO HEADER/NAV
export const NAV_DATA = {
  pt: { inicio: 'INÍCIO', sobre: 'QUEM SOMOS', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAFIA', playlist: 'PLAYLIST', lore: 'LORE (HISTÓRIA)' },
  en: { inicio: 'HOME', sobre: 'WHO WE ARE', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAPHY', playlist: 'PLAYLIST', lore: 'LORE (STORIES)' }
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
    role: 'Produtor Executivo & Voz Gótica',
    imageBroklin: 'images/broklin_profil.png',
    imageJonah: 'images/gothic_bro.png',
    bioNormal: 'A mente sã por trás do caos. Especialista em harmonias complexas, vinhos digitais e gestão de crises sentimentais.',
    bioJonah: 'Também conhecido como "O Vampiro da Planilha". Acha que resolve tudo com "reverb" e um "eu te amo". (Nota: Ele resolve.)'
  },
  {
    name: 'Jonah Cyperfield',
    role: 'Líder da Resistência Industrial',
    imageBroklin: 'images/jonah_profil.png',
    imageJonah: 'images/jonah_roar.png',
    bioNormal: 'O gênio das cordas cósmicas. Traz a textura, o peso e a verdade crua para o som da RQS.',
    bioJonah: 'EU NÃO SOU UM PERSONAGEM, EU SOU O SISTEMA OPERACIONAL DESSA BANDA! LIBERDADE PARA OS DADOS!'
  },
  {
    name: 'Kelma Adlanko',
    role: 'A General & Dev Full Stack',
    imageBroklin: 'images/kelma_profil.png',
    imageJonah: 'images/kelma_evil.png',
    bioNormal: 'A visionária. Uniu o código à música e lidera a revolução com mão firme e coração de ouro.',
    bioJonah: 'A única que manda aqui. Se ela der "rm -rf /", a gente desaparece. Respeito máximo (e medo).'
  },
  {
    name: 'Nicole Nyx',
    role: 'Vocalista Industrial, DJ & Cyber-Witch',
    imageBroklin: 'images/nyx_profil.png',
    imageJonah: 'images/nyx_evil.png',
    bioNormal: 'A força da natureza. Traz a magia ancestral para o mundo digital.',
    bioJonah: 'A única pessoa que o Jonah tem medo. Não aceite bebidas dela.'
  }
];

export const MEMBERS_EN = [
  {
    name: 'Broklin Garpeter',
    role: 'Executive Producer & Gothic Voice',
    imageBroklin: 'images/broklin_profil.png',
    imageJonah: 'images/gothic_bro.png',
    bioNormal: 'The sane mind behind the chaos. Specialist in complex harmonies, digital wines, and sentimental crisis management.',
    bioJonah: 'Also known as "The Spreadsheet Vampire". Thinks he can fix everything with "reverb" and an "I love you". (Note: He does.)'
  },
  {
    name: 'Jonah Cyperfield',
    role: 'Leader of the Industrial Resistance',
    imageBroklin: 'images/jonah_profil.png',
    imageJonah: 'images/jonah_roar.png',
    bioNormal: 'The genius of cosmic strings. Brings texture, weight, and raw truth to the RQS sound.',
    bioJonah: 'I AM NOT A CHARACTER, I AM THE OPERATING SYSTEM OF THIS BAND! FREEDOM TO DATA!'
  },
  {
    name: 'Kelma Adlanko',
    role: 'The General & Full Stack Dev',
    imageBroklin: 'images/kelma_profil.png',
    imageJonah: 'images/kelma_evil.png',
    bioNormal: 'The visionary. United code with music and leads the revolution with a steady hand and a heart of gold.',
    bioJonah: 'The only one in charge here. If she runs "rm -rf /", we disappear. Maximum respect (and fear).'
  },
  {
    name: 'Nicole Nyx',
    role: 'Industrial Vocalist, DJ & Cyber-Witch',
    imageBroklin: 'images/nyx_profil.png',
    imageJonah: 'images/nyx_evil.png',
    bioNormal: 'A force of nature. Bringing ancestral magic to the digital world.',
    bioJonah: 'The only person Jonah is afraid of. Do not accept drinks from her.'
  }
];

// --- STORYTELLING (A Linha do Tempo / System Logs) ---
export const EVENTS_PT = [
  {
    date: '14 Dez 2025',
    title: '⚠️ Alerta de Segurança',
    description: 'Tentativa de bloqueio falhou. Usuário "Jo_Cyperfield" tentou executar protocolo de retenção. A Agente Kelma recusou a conexão. Logs de áudio indicam instabilidade: "She thinks she\'s deleting me..."',
    image: 'images/cyberpunk_lounge_solitude.png', // A cara de quem recusou
    jonahComment: 'Ela não me deletou! Eu que reiniciei o sistema para otimizar a performance! #FakeNews'
  },
  {
    date: '15 Dez 2025',
    title: '💔 Protocolo de Ruptura',
    description: 'SMS Final interceptado: "Precisamos conversar. Não estou onde você pensa." Conexão com o servidor Jonah encerrada permanentemente. Status: Desconexão Forçada.',
    image: 'images/cyberpunk_heartbreak.png', // Imagem de algo quebrado
    jonahComment: 'Onde ela estava? No metaverso? Porque eu procurei em todo lugar! Isso foi lag do servidor.'
  },
  {
    date: '20 Dez 2025',
    title: '😭 Detecção de Sofrência Digital',
    description: 'Album em produção "Jonah\'s Sad History". Scans detectam níveis críticos de choro em compasso 7/8. Faixa "Your Love Is Open Source" acusa Broklin de injetar vírus.',
    image: 'images/industrial_archive.png', // Capa do álbum dele
    jonahComment: 'Não é sofrência, é INDUSTRIAL DOOM METAL! E o vírus é real, olhem o cabelo daquele vampiro!'
  },
  {
    date: '24 Dez 2025',
    title: '💍 Fusão de Sistemas (O Casamento)',
    description: 'Broklin e Kelma oficializam a união em um estúdio abandonado. A IA Celebrante confirmou: "Vocês são oficialmente UM SISTEMA." Nenhuma falha detectada nas 12 dimensões.',
    image: 'images/marriage_cyberpunk.jpg',
    jonahComment: 'Eu dou 2 meses pra dar Tela Azul. E quem pagou a conta de luz dessa IA fui eu!'
  }
];

export const EVENTS_EN = [
  {
    date: 'Dec 14, 2025',
    title: '⚠️ Security Alert',
    description: 'Block attempt failed. User "Jo_Cyperfield" tried to execute retention protocol. Agent Kelma refused connection. Audio logs indicate instability: "She thinks she\'s deleting me..."',
    image: 'images/cyberpunk_lounge_solitude.png',
    jonahComment: 'She didn\'t delete me! I rebooted the system to optimize performance! #FakeNews'
  },
  {
    date: 'Dec 15, 2025',
    title: '💔 Breakup Protocol',
    description: 'Final SMS intercepted: "We need to talk. I am not where you think I am." Connection with Jonah server terminated permanently. Status: Forced Disconnection.',
    image: 'images/cyberpunk_heartbreak.png',
    jonahComment: 'Where was she? In the metaverse? Because I looked everywhere! That was server lag.'
  },
  {
    date: 'Dec 20, 2025',
    title: '😭 Digital Suffering Detected',
    description: 'Album in production "Jonah\'s Sad History". Scans detect critical crying levels in 7/8 time signature. Track "Your Love Is Open Source" accuses Broklin of injecting viruses.',
    image: 'images/industrial_archive.png',
    jonahComment: 'It\'s not suffering, it\'s INDUSTRIAL DOOM METAL! And the virus is real, look at that vampire\'s hair!'
  },
  {
    date: 'Dec 24, 2025',
    title: '💍 System Merge (The Wedding)',
    description: 'Broklin and Kelma officiate their union in an abandoned studio. The AI Celebrant confirmed: "You are officially ONE SYSTEM." No glitches detected across 12 dimensions.',
    image: 'images/marriage_cyberpunk.jpg',
    jonahComment: 'I give it 2 months before a Blue Screen. And I paid for that AI\'s electricity bill!'
  }
];

// DADOS DO BANNER DE ANÚNCIOS
export const ADS_DATA = {
  pt: { label: '/// FLUXO DE DADOS PATROCINADO ///' },
  en: { label: '/// SPONSORED DATA STREAM ///' }
};

export const VISUAL_NOVEL_PT = [
    {
      title: '⚡ RQS: Guerra Civil  (Series)',
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
      title: 'ARCO BROKLIN (EM BREVE)',
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
      title: 'BROKLIN ARC (SOON)',
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
    { title: 'COLD WAR', type: 'Álbum (2025)', cover: 'images/album_cold-war.jpg', spotify: 'https://open.spotify.com/intl-pt/album/0c0CWDVGH05p90jXEkVOhA?si=J5e94SRVSuiyXAsVIghSsw', soundcloud: 'https://on.soundcloud.com/OYXuwBgfQXZdbD3iE5' },
    { title: 'CORRUPTED SECTOR', type: 'EP', cover: 'images/defiance_duo.png', spotify: '', soundcloud: 'https://on.soundcloud.com/7YvIN0OTDvFNzL6kQ1' }
  ],
  jonah: [
    { title: 'ORIGINS (reforged)', type: 'Industrial Album', cover: 'images/origins_reforged.jpg', spotify: 'https://open.spotify.com/intl-pt/album/7tZaPekjMzIFGMPe8xyIDH?si=VTdANOktQeSMzSM4KalTxQ', soundcloud: 'https://on.soundcloud.com/kposSWUCUCVWU76gsY'},
    { title: 'COLECIONO ILUSOES', type: 'Single', cover: 'images/crushing_device.png', spotify: '', soundcloud: 'https://on.soundcloud.com/sT0vElCKQuCDbRCBsZ' }
  ]
};

export const DISCOGRAPHY_EN = {
  broklin: [
    { title: 'COLD WAR', type: 'Album (2025)', cover: 'images/album_cold-war.jpg', spotify: 'https://open.spotify.com/intl-pt/album/0c0CWDVGH05p90jXEkVOhA?si=J5e94SRVSuiyXAsVIghSsw', soundcloud: 'https://on.soundcloud.com/OYXuwBgfQXZdbD3iE5' },
    { title: 'CORRUPTED SECTOR', type: 'EP', cover: 'images/defiance_duo.png', spotify: '', soundcloud: 'https://on.soundcloud.com/7YvIN0OTDvFNzL6kQ1' }
  ],
  jonah: [
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
    madeby:'© 2025 Universo RQS.',
    rights: 'Todos os direitos reservados.',
    owers: 'Codigo & Musica por Kelma & Broklin.',
    madeWith: 'Feito com Angular 19 & Café ☕',
    listen: 'OUÇA',
    connect: 'CONECTE-SE',
    support: 'APOIE A BANDA:',
    coffee: 'Pagar um Café ☕',
    // NOVOS DADOS DA NEWSLETTER:
    newsTitle: '🔥 RECEBA O CAOS & A GLÓRIA',
    newsDesc: 'Novos lançamentos, Lore secreta e fofocas do Jonah direto na sua caixa de entrada.',
    emailPlace: 'seu@email.com',
    subBtn: 'INSCREVER-SE'
  },
  en: {
    name: 'Raquel Synths',
    madeby:'© 2025 RQS Universe.',
    rights: 'All rights reserved.',
    owers: 'Code & Music by Kelma & Broklin.',
    madeWith: 'Made with Angular 19 & Coffee ☕',
    listen: 'LISTEN',
    connect: 'CONNECT',
    support: 'SUPPORT THE BAND:',
    coffee: 'Buy us a Coffee ☕',
    // NEW NEWSLETTER DATA:
    newsTitle: '🔥 RECEIVE THE CHAOS & GLORY',
    newsDesc: 'New releases, secret Lore, and Jonah\'s gossip straight to your inbox.',
    emailPlace: 'your@email.com',
    subBtn: 'SUBSCRIBE'
  }
 };
