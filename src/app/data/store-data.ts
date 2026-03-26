// ==========================================
// 1. INTERFACES
// ==========================================

export interface Department {
  id: string; // O ID que conecta com a facção do produto
  owners: ('broklin' | 'jonah')[];
  image: string;
  title: string;
  description: { pt: string; en: string };
  buttonText: { pt: string; en: string };
  loreDescription?: { pt: string; en: string };
}

export interface Product {
  id: string | number;
  // AQUI ESTÁ A MUDANÇA! A União das Facções:
  faction: 'rust-riot' | 'neon-witch' | 'sonic-arsenal' |
      'tech-lead' | 'synth-general' | 'backstage-vip';
  image: string;
  stripeUrl: string;
  status: "sold_out" | "available";
  content: {
    pt: { name: string; description: string; price: string };
    en: { name: string; description: string; price: string };
  };
}

// ==========================================
// 2. DEPARTAMENTOS (O LOBBY EXPANDIDO)
// ==========================================
// Agora temos 4 opções na tela principal (ou mais se quiser)

export const DEPARTMENTS_DATA: Department[] = [
  // --- LADO DO CAOS (JONAH & NYX) ---
  {
    id: 'rust-riot',
    owners: ['jonah'],
    image: 'assets/store/rust-riot-bg.webp',
    title: 'RUST & RIOT', // O Setor do Jonah

    description: { pt: 'Industrial / Caos / Metal', en: 'Industrial / Chaos / Metal' },
    buttonText: { pt: 'ENTRAR NO MOSHPIT', en: 'ENTER MOSHPIT' },

    loreDescription: {
  "pt": "Aviso de Risco: Vestuário de Submundo. Isso aqui não é pra ficar bonito no escritório do Tech Lead, é a armadura do Kernel Panic. Comprar essa sucata industrial injeta fundos diretos no nosso moedor de carne analógico. Quer financiar a distorção das guitarras e o colapso do sistema? Compre e espalhe a ferrugem.",
  "en": "Risk Warning: Underworld Apparel. This isn't meant to look pretty in the Tech Lead's office, it's the armor of the Kernel Panic. Buying this industrial scrap injects direct funds into our analog meat grinder. Want to fund the guitar distortion and the system collapse? Buy it and spread the rust."
}
  },
  {
    id: 'neon-witch',
    owners: ['jonah'],
    image: 'assets/store/neon-witch-bg.webp',
    title: 'NEON WITCH', // O Setor da Nyx
    description: { pt: 'Cyber / Goth / Feitiçaria', en: 'Cyber / Goth / Sorcery' },
    buttonText: { pt: 'CONJURAR LOOK', en: 'CONJURE LOOK' },

    loreDescription: {
  "pt": "A ponte entre o código corporativo e a anomalia. As peças deste setor são contrabandeadas da dark web para os fãs da estética Gótica/Industrial. Cada crédito transferido aqui nos ajuda a renderizar novos Ecos visuais e a manter a nossa rádio pirata transmitindo na escuridão.",
  "en": "The bridge between corporate code and the anomaly. Pieces in this sector are smuggled from the dark web for fans of the Gothic/Industrial aesthetic. Every credit transferred here helps us render new visual Echoes and keeps our pirate radio broadcasting in the dark."
}
  },

  // --- LADO DA ORDEM (BROKLIN & KELMA) ---
  {
    id: 'tech-lead', // <--- NOVO DEPARTAMENTO!
    owners: ['broklin'],
    image: 'assets/store/tech-lead-bg.webp', // Uma foto clean do escritório
    title: 'TECH LEAD LABS',
    description: { pt: 'Minimalismo / Dev / Clean', en: 'Minimalism / Dev / Clean' },
    buttonText: { pt: 'COMPILAR ESTILO', en: 'COMPILE STYLE' },

    // 🎯 INJETAMOS A LORE DE VENDAS PARA A TELA INTERNA:
    loreDescription: { 
      pt: 'O uniforme oficial da infraestrutura RQS. Forjamos código limpo e blindagem acústica. Adquirir equipamento deste setor significa financiar diretamente os nossos servidores de Synthwave, mantendo a matriz estável contra as anomalias. Vista-se com a elegância corporativa.', 
      en: 'The official uniform of the RQS infrastructure. Acquiring gear from this sector means directly funding our Synthwave servers, keeping the matrix stable against anomalies. Dress in corporate elegance.' 
    }
  },
  {
    id: 'synth-general', // <--- NOVO DEPARTAMENTO!
    owners: ['broklin'],
    image: 'assets/store/kelma-atelier.webp', // Uma foto elegante
    title: "RAQUEL'S ECHO",
    description: {
      pt: 'O Eco da Criadora // Dream Pop & Soul',
      en: "The Creator's Echo // Dream Pop & Soul"
    },
    buttonText: { pt: 'SINTONIZAR', en: 'TUNE IN' },

    loreDescription: { 
      pt: 'O Alto Comando. Este é o coração do nosso ecossistema e a fonte da nossa luz Neon. Ao vestir as peças do Atelier da General, você não está apenas comprando moda, você está financiando o combustível que mantém o universo RaQuel Synths em expansão. Apoie a matriz original e vista as cores da resistência.', 
      en: 'High Command. This is the heart of our ecosystem and the source of our Neon light. By wearing pieces from the General\'s Atelier, you are not just buying fashion, you are funding the fuel that keeps the RaQuel Synths universe expanding. Support the original matrix and wear the colors of the resistance.' 
    },
  },

  // --- ACESSÓRIOS GERAIS ---
  {
    id: 'sonic-arsenal',
    owners: ['broklin', 'jonah'],
    image: 'assets/store/sonic-gear.webp',
    title: 'SONIC ARSENAL',
    description: { pt: 'Equipamentos & Gear', en: 'Equipment & Gear' },
    buttonText: { pt: 'EQUIPAR', en: 'EQUIP' },
    loreDescription: { 
      pt: 'O Arsenal Sonico. Equipamentos e acessórios para os fãs de música eletrônica e synthwave. Cada peça é projetada para combinar com o estilo futurista da nossa linha.', 
      en: 'The Sonic Arsenal. Equipment and accessories for fans of electronic and synthwave music. Each piece is designed to complement the futuristic style of our line.' 
    }

  }
];

// ==========================================
// 3. PRODUTOS (COM AS NOVAS ETIQUETAS)
// ==========================================

export const ALL_PRODUCTS: Product[] = [];
