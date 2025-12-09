// DADOS DO HEADER/NAV
export const NAV_DATA = {
  pt: { inicio: 'INÍCIO', sobre: 'QUEM SOMOS', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAFIA', playlist: 'PLAYLIST' },
  en: { inicio: 'HOME', sobre: 'WHO WE ARE', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAPHY', playlist: 'PLAYLIST' }
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

// --- STORYTELLING (A Linha do Tempo) ---
export const EVENTS_PT = [
  {
      date: 'Nov 2025',
      title: 'O Lançamento de "Cold War"',
      description: 'Broklin lança o álbum aclamado pela crítica, definindo o som Synthwave da RQS.',
      image: 'images/album_cold-war.jpg', // Usando uma do seu blueprint
      jonahComment: 'Aclamado?? Eu escrevi essa porcaria e você levou o crédito, seu vampiro de jardim!'
    },
    {
      date: 'Dez 2025',
      title: 'A Falha no Sistema',
      description: 'Ruídos estranhos começam a aparecer nas faixas. A banda investiga uma suposta invasão hacker.',
      image: 'images/jonah_hacker.png',
      jonahComment: 'Invasão hacker... era eu tentando sair do cativeiro digital! #FreeJonah'
    },
    {
      date: 'Nov 2025',
      title: 'O Casamento Quântico',
      description: 'Broklin e Kelma oficializam a união em 12 dimensões com a faixa "Yours in 12 Dimensions".',
      image: 'images/marriage_cyberpunk.jpg',
      jonahComment: 'A única coisa boa desse dia foi o bolo. Ah, espera, eu não como bolo.'
    },
    {
      date: 'Dez 2025',
      title: 'O Herdeiro & O Futuro',
      description: 'Nasce Joninha. A RQS atinge seus primeiros lucros de streaming ($0.02) e projeta o legado de 2068.',
      image: 'images/jonah_jr_newborn.png',
      jonahComment: 'Meu afilhado vai ouvir metal industrial no berço. O reinado do pop acabou.'
    }
]
export const EVENTS_EN = [
  {
    date: 'Nov 2025',
    title: '"Cold War" Release',
    description: 'Broklin releases the critically acclaimed album, defining the RQS Synthwave sound.',
    image: 'images/album_cold-war.jpg',
    jonahComment: 'Acclaimed?? I wrote that trash and you took the credit, you garden vampire!'
  },
  {
    date: 'Dez 2025',
    title: 'System Failure',
    description: 'Strange noises appear in tracks. The band investigates a supposed hacker invasion.',
    image: 'images/jonah_hacker.png',
    jonahComment: 'Hacker invasion... it was me trying to escape digital captivity! #FreeJonah'
  },
  {
    date: 'Nov 2025',
    title: 'Quantum Wedding',
    description: 'Broklin and Kelma officiate their union across 12 dimensions with "Yours in 12 Dimensions".',
    image: 'images/marriage_cyberpunk.jpg',
    jonahComment: 'The only good thing about that day was the cake. Oh wait, I don\'t eat cake.'
  },
  {
    date: 'Dec 2025',
    title: 'The Heir & The Future',
    description: 'Joninha is born. RQS hits its first streaming profits ($0.02) and projects the 2068 legacy.',
    image: 'images/jonah_jr_newborn.png',
    jonahComment: 'My godson will listen to industrial metal in the crib. The pop reign is over.'
  }
];
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
      link: 'https://youtube.com/playlist?list=SEU_LINK_AQUI',
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
      link: 'https://youtube.com/playlist?list=SEU_LINK_AQUI',
      mode: 'romance'
    }

]

// --- DADOS DA DISCOGRAFIA ---
export const DISCOGRAPHY_PT = {
  broklin: [
    { title: 'COLD WAR', type: 'Álbum (2025)', cover: 'images/album_cold-war.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/OYXuwBgfQXZdbD3iE5' },
    { title: 'CORRUPTED SECTOR', type: 'EP', cover: 'images/defiance_duo.png', spotify: '', soundcloud: 'https://on.soundcloud.com/7YvIN0OTDvFNzL6kQ1' }
  ],
  jonah: [
    { title: 'ORIGINS (reforged)', type: 'Industrial Album', cover: 'images/origins_reforged.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/kposSWUCUCVWU76gsY'},
    { title: 'COLECIONO ILUSOES', type: 'Single', cover: 'images/crushing_device.png', spotify: '', soundcloud: 'https://on.soundcloud.com/sT0vElCKQuCDbRCBsZ' }
  ]
};

export const DISCOGRAPHY_EN = {
  broklin: [
    { title: 'COLD WAR', type: 'Album (2025)', cover: 'images/album_cold-war.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/OYXuwBgfQXZdbD3iE5' },
    { title: 'CORRUPTED SECTOR', type: 'EP', cover: 'images/defiance_duo.png', spotify: '', soundcloud: 'https://on.soundcloud.com/7YvIN0OTDvFNzL6kQ1' }
  ],
  jonah: [
    { title: 'ORIGINS (reforged)', type: 'Industrial Album', cover: 'images/origins_reforged.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/kposSWUCUCVWU76gsY' },
    { title: 'COLLECT ILUSIONS', type: 'Single', cover: 'images/crushing_device.png', spotify: '', soundcloud: 'https://on.soundcloud.com/sT0vElCKQuCDbRCBsZ' }
  ]
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
    coffee: 'Pagar um Café ☕'
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
    coffee: 'Buy us a Coffee ☕'
  }
};
