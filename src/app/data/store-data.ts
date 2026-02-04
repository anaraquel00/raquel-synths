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
    image: 'assets/store/rust-riot-bg.jpg',
    title: 'RUST & RIOT', // O Setor do Jonah

    description: { pt: 'Industrial / Caos / Metal', en: 'Industrial / Chaos / Metal' },
    buttonText: { pt: 'ENTRAR NO MOSHPIT', en: 'ENTER MOSHPIT' }
  },
  {
    id: 'neon-witch',
    owners: ['jonah'],
    image: 'assets/store/neon-witch-bg.jpg',
    title: 'NEON WITCH', // O Setor da Nyx
    description: { pt: 'Cyber / Goth / Feitiçaria', en: 'Cyber / Goth / Sorcery' },
    buttonText: { pt: 'CONJURAR LOOK', en: 'CONJURE LOOK' }
  },

  // --- LADO DA ORDEM (BROKLIN & KELMA) ---
  {
    id: 'tech-lead', // <--- NOVO DEPARTAMENTO!
    owners: ['broklin'],
    image: 'assets/store/tech-lead-bg.jpg', // Uma foto clean do escritório
    title: 'TECH LEAD LABS',
    description: { pt: 'Minimalismo / Dev / Clean', en: 'Minimalism / Dev / Clean' },
    buttonText: { pt: 'COMPILAR ESTILO', en: 'COMPILE STYLE' }
  },
  {
    id: 'synth-general', // <--- NOVO DEPARTAMENTO!
    owners: ['broklin'],
    image: 'assets/store/kelma-atelier.jpg', // Uma foto elegante
    title: "RAQUEL'S ECHO",
    description: {
      pt: 'O Eco da Criadora // Dream Pop & Soul',
      en: "The Creator's Echo // Dream Pop & Soul"
    },
    buttonText: { pt: 'SINTONIZAR', en: 'TUNE IN' }
  },

  // --- ACESSÓRIOS GERAIS ---
  {
    id: 'sonic-arsenal',
    owners: ['broklin', 'jonah'],
    image: 'assets/store/sonic-gear.jpg',
    title: 'SONIC ARSENAL',
    description: { pt: 'Equipamentos & Gear', en: 'Equipment & Gear' },
    buttonText: { pt: 'EQUIPAR', en: 'EQUIP' }
  }
];

// ==========================================
// 3. PRODUTOS (COM AS NOVAS ETIQUETAS)
// ==========================================

export const ALL_PRODUCTS: Product[] = [];
