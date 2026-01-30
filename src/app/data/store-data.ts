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

export const ALL_PRODUCTS: Product[] = [
  // --- ITENS DO BROKLIN ---
  {
    id: 'blazer-01',
    faction: 'tech-lead', // Agora sim!
    image: 'assets/store/bro_coat.png',
    stripeUrl: 'https://onelink.shein.com/25/5cux0sdjmfq7',
    status: "available",
    content: {
      pt: { name: "Blazer Executivo RQS", description: "Corte italiano para líderes de tech.", price: "" },
      en: { name: "RQS Executive Blazer", description: "Italian cut for tech leaders.", price: "" }
    }
  },
  {
    id: 'mug-01',
    faction: 'tech-lead', // Minha caneca fica no meu laboratório
    image: 'assets/store/tech_lead-mug.png',
    stripeUrl: 'https://buy.stripe.com/eVqaEP7by3Qmfp5bKZdjO04',
    status: "sold_out",
    content: {
      pt: { name: "Caneca O Arquiteto", description: "Design fosco. Café quente, bug frio.", price: "" },
      en: { name: "The Architect's Mug", description: "Matte design. Hot coffee, cold bugs.", price: "" }
    }
  },

  // --- ITENS DA KELMA ---
  {
    id: 'dress-01',
    faction: 'synth-general', // Sua categoria exclusiva
    image: 'assets/store/kel_dress.png',
    stripeUrl: 'https://onelink.shein.com/25/5cuwdrok9zk3',
    status: "available",
    content: {
      pt: { name: "Trama Mística Blue", description: "Conforto e elegância para o palco.", price: "" },
      en: { name: "Mystic Blue Knit", description: "Comfort and elegance for the stage.", price: "" }
    }
  },

  // --- ITENS DO JONAH ---
  {
    id: 'jacket-jonah',
    faction: 'rust-riot',
    image: 'assets/store/jonah_jacket.png',
    stripeUrl: 'https://s.click.aliexpress.com/e/_c3y0z1aL',
    status: "available",
    content: {
      pt: { name: "Jaqueta Riot", description: "Blindagem contra críticas.", price: "" },
      en: { name: "Riot Jacket", description: "Armor against critics.", price: "" }
    }
  },
{
    id: 'mug-jonah',
    faction: 'rust-riot',
    image: 'assets/store/jonah-mug.jpg',
    stripeUrl: 'https://buy.stripe.com/aFa8wH9jG4Uq0ub8yNdjO08',
    status: "available",
    content: {
      pt: { name: "A CANECA 'ÓDIO E COMBUSTÍVEL'", description: "Não serve para chá. Não serve para água. Este recipiente foi projetado para cafeína de alta octanagem ou óleo de motor. Características: Acabamento preto sólido para esconder a escuridão da sua alma (e manchas de café). Impressão em estêncil 'ÓDIO E POTÊNCIA' reforçada com ferrugem digital. Alça ergonômica o suficiente para uma briga de socos. Aviso: Pode causar aumento de produtividade e desejos repentinos de desmantelar o capitalismo.", price: "" },
      en: { name: "THE 'HATE & FUEL' MUG", description: "Not for tea. Not for water. This vessel is designed for high-octane caffeine or motor oil.Features:Solid Black finish to hide the darkness of your soul (and coffee stains).'HATE & HORSEPOWER' stencil print reinforced with digital rust.Handle ergonomic enough for a fist fight.Warning: May cause increased productivity and sudden urges to dismantle capitalism.", price: "" }
    }
  },
  {
    id: 't-shirt-jonah',
    faction: 'rust-riot',
    image: 'assets/store/the-legacy-t-shirt-band.jpg',
    stripeUrl: 'https://buy.stripe.com/dRm7sDbrOev03Gn16ldjO06',
    status: "available",
    content: {
      pt: { name: "'THE LEGACY' CAMISA", description: "Uniforme oficial da Legacy & Chaos Division. Características: Logotipo 'JONAH CYPERFIELD' em estilo industrial metal, com aparência de soldado ao tecido. Estética desgastada: Parece que você o usa desde a turnê dos anos 90. Durabilidade testada em mosh pits. Caimento: Relaxado (para disfarçar a barriguinha ou permitir movimentos para tocar bateria).", price: "" },
      en: { name: "'THE LEGACY' T-SHIRT", description: "The official uniform of the Legacy & Chaos Division.Features:Industrial Metal 'JONAH CYPERFIELD' logo that looks welded onto the fabric.Distressed aesthetic: Looks like you've been wearing it since the 90s tour.Mosh-pit tested durability.Fit: Relaxed (to hide the burger belly or to allow movement for drumming).", price: "" }
    }
  },
  {
    id: 't-shirt-2-jonah',
    faction: 'rust-riot',
    image: 'assets/store/jonah-cyperfield-logo.jpg',
    stripeUrl: 'https://buy.stripe.com/6oU3cndzWaeKgt97uJdjO05',
    status: "available",
    content: {
      pt: { name: "Camiseta com o logotipo de Jonah Cyberfield", description: "Logotipo industrial em metal 'JONAH CYPERFIELD' que parece soldado ao tecido. Estética desgastada: Parece que você usa essa peça desde a turnê dos anos 90. Durabilidade testada em mosh pits. Caimento: Relaxado (para disfarçar a barriguinha ou permitir movimentos para tocar bateria).", price: "" },
      en: { name: "Jonah Cyperfield Logo T-Shirt", description: "Industrial Metal 'JONAH CYPERFIELD' logo that looks welded onto the fabric.Distressed aesthetic: Looks like you've been wearing it since the 90s tour.Mosh-pit tested durability.Fit: Relaxed (to hide the burger belly or to allow movement for drumming).", price: "" }
    }
  },
  {
    id: 'hoodie-jonah',
    faction: 'rust-riot',
    image: 'assets/store/riot-armor-hoodie.jpg',
    stripeUrl: 'https://buy.stripe.com/eVq8wHcvSbiO2Cjg1fdjO07',
    status: "available",
    content: {
      pt: { name: "Jaqueta Riot", description: "A estampa 'HATE & HORSEPOWER' no peito dá a entender que você é uma verdadeira máquina ambulante. Interior em fleece macio (porque até os metaleiros gostam de conforto). O bolso frontal comporta: 2 pedais, uma garrafa de uísque ou uma pequena chave inglesa. Ideal para: Programar às 3 da manhã, sobreviver a um inverno nuclear ou se esconder de interações sociais.", price: "" },
      en: { name: "'RIOT ARMOR' HOODIE", description: "'HATE & HORSEPOWER' chest print implies you are a walking engine.Soft interior fleece (because even metalheads like comfort).Front pocket fits: 2 pedals, a bottle of whiskey, or a small wrench.Usage: Coding at 3 AM, surviving nuclear winter, or hiding from social interactions.", price: "" }
    }
  },




  // --- ITENS DA NYX ---
  {
    id: 'boots-nyx',
    faction: 'neon-witch',
    image: 'assets/store/nyx-boots.jpg', // ⚠️ Precisa dessa imagem!
    stripeUrl: 'https://onelink.shein.com/26/5drlt0v2vskd',
    status: "available",
    content: {
      pt: { name: "Nyx's Stompers", description: "Coturnos de plataforma alta. Perfeitos para esmagar bugs no sistema e dominar o palco.", price: "" },
      en: { name: "Nyx's Stompers", description: "High platform combat boots. Perfect for crushing system bugs and dominating the stage.", price: "" }
    }
  },
  {
    id: 'pink-top-nyx',
    faction: 'neon-witch',
    image: 'assets/store/nyx-top.jpg',
    stripeUrl: 'https://onelink.shein.com/27/5e2l3fhpsdip',
    status: "available",
    content: {
      pt: { name: "O CORSET ROSA ENGANOSO", description: "A cor Rosa-Choque é uma armadilha. Este corset de polímero ajustado foi desenhado para desarmar as defesas do oponente com uma falsa sensação de doçura 'Barbiecore', antes de você injetar o vírus fatal. A estrutura rígida modela o corpo como uma escultura cibernética letal. Use quando quiser que eles subestimem você... até ser tarde demais.", price: "" },
      en: { name: "THE DECEPTIVE PINK CORSET", description: "The color Shocking Pink is a trap. This fitted polymer corset is designed to disarm your opponent's defenses with a false sense of 'Barbiecore' sweetness, before you inject the deadly virus. The rigid structure molds the body like a lethal cybernetic sculpture. Use it when you want them to underestimate you... until it's too late.", price: "" }
    }
  },
  {
    id: 'jacket-blue-nyx',
    faction: 'neon-witch',
    image: 'assets/store/nyx-blue-jacket.jpg', // ⚠️ Precisa dessa imagem!
    stripeUrl: 'https://onelink.shein.com/27/5e2m56y0e6h6',
    status: "available",
    content: {
      pt: { name: "JAQUETA CIRCUITO DA MEIA-NOITE", description: "Jaqueta de couro Midnight Blue com gola alta estruturada para isolamento social completo. O design integra a estética de 'veias de dados' brilhantes, sugerindo que você está plugada diretamente na Matrix e não tem tempo para conversas analógicas. O olhar frio da modelo não está incluso, mas a jaqueta ajuda a replicar. Perfeita para hackear sistemas corporativos ou terminar relacionamentos sem dizer uma palavra.", price: "" },
      en: { name: "MIDNIGHT CIRCUIT SHELL JACKET", description: "Midnight Blue leather jacket with a structured high collar for complete social isolation. The design incorporates the aesthetic of glowing 'data veins,' suggesting you're plugged directly into the Matrix and have no time for analog conversations. The model's cool stare isn't included, but the jacket helps replicate it. Perfect for hacking corporate systems or ending relationships without saying a word.", price: "" }
    }
  },
  {
    id: 'skirt-nyx',
    faction: 'neon-witch',
    image: 'assets/store/nyx-skirt.jpg', // ⚠️ Precisa dessa imagem!
    stripeUrl: 'https://onelink.shein.com/27/5e2mh33pu332',
    status: "available",
    content: {
      pt: { name: "Saia de combate", description: "Saia de combate tático. Projetado para máxima mobilidade durante solos de guitarra e chutes em amplificadores. A saia permite ventilação enquanto você incendeia a plateia. Não é roupa de groupie. É roupa de Frontwoman.", price: "" },
      en: { name: "Tactical combat skirt", description: "Tactical combat skirt. Designed for maximum mobility during guitar solos and amp kicks. The skirt allows ventilation while you ignite the crowd. It's not groupie clothing. It's frontwoman clothing.", price: "" }
    }
  },
  {
    id: 'black-jacket-nyx',
    faction: 'neon-witch',
    image: 'assets/store/nyx-jacket-2.png', // ⚠️ Precisa dessa imagem!
    stripeUrl: 'https://onelink.shein.com/27/5e2mtqvuw5yx',
    status: "available",
    content: {
      pt: { name: "A JAQUETA DO DERRETIMENTO VISCERAL", description: "Couro sintético tratado para simular o momento exato de uma fusão de reator. O acabamento em 'Sludge Vermelho' não é estampa, é textura de bio-horror. Parece que você acabou de emergir de um banho de óleo fervente ou do sangue dos seus inimigos. Ideal para: Festas no fim do mundo, intimidar segurança de boate e causar desconforto visual em gente 'good vibes'.", price: "" },
      en: { name: " THE VISCERAL MELTDOWN JACKET", description: "Synthetic leather treated to simulate the exact moment of a reactor meltdown. The 'Red Sludge' finish isn't a print, it's a bio-horror texture. It looks like you just emerged from a bath of boiling oil or the blood of your enemies. Ideal for: End-of-the-world parties, intimidating nightclub bouncers, and causing visual discomfort to 'good vibes' people.", price: "" }
    }
  },
   {
    id: 'corset-nyx',
    faction: 'neon-witch',
    image: 'assets/store/gothic-corset.jpg', // ⚠️ Precisa dessa imagem!
    stripeUrl: 'https://onelink.shein.com/27/5e2pfoqty7m4',
    status: "available",
    content: {
      pt: { name: "O CORSETE DA TERRA ARRASADA", description: "Esqueça a Era Vitoriana. Este corset foi forjado para a Era da Ferrugem. O acabamento em couro sintético 'estressado' (Distressed PU) simula o efeito de corrosão por chuva ácida ou desgaste de batalha. A estrutura rígida oferece suporte lombar para carregar o peso de carregar a banda nas costas, enquanto o zíper frontal de nível industrial garante contenção rápida. Não é uma peça de roupa íntima; é uma fuselagem externa para proteger seu núcleo de energia.", price: "" },
      en: { name: "THE SCORCHED EARTH CORSET", description: "Forget the Victorian Era. This corset was forged for the Rust Age. The 'stressed' synthetic leather (Distressed PU) finish simulates the effect of corrosion from acid rain or battle wear. The rigid structure offers lumbar support to bear the weight of carrying the band on your back, while the industrial-grade front zipper ensures quick containment. It's not an undergarment; it's an outer shell to protect your energy core.", price: "" }
    }
  }
];
