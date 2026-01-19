export const STORE_DATA = [
  // --- 🔵 FACTION: BROKLIN & KELMA (Light/Tech Side) ---
  {
    id: 'mug-01',
    faction: 'broklin', // <--- NOVA TAG
    image: 'assets/store/tech_lead-mug.png',
    stripeUrl: 'https://buy.stripe.com/eVqaEP7by3Qmfp5bKZdjO04',
    content: {
      pt: { name: "Caneca O Arquiteto", description: "Cerâmica preta fosca. Combustível para longas noites de código.", price: "" },
      en: { name: "The Architect's Mug", description: "Matte black ceramic. Fuel for long coding nights.", price: "" }
    }
  },
  {
    id: 'blazer-broklin',
    faction: 'broklin',
    image: 'assets/store/bro_coat.png',
    stripeUrl: 'https://onelink.shein.com/25/5cux0sdjmfq7',
    content: {
      pt: { name: "Broklin's Executive Shell", description: "A elegância do Código Limpo. Blazer estruturado Navy Blue para liderar equipes.", price: "" },
      en: { name: "Broklin's Executive Shell", description: "Clean Code elegance. Structured Navy Blue blazer to lead teams.", price: "" }
    }
  },
  {
    id: 'dress-kelma',
    faction: 'broklin',
    image: 'assets/store/kel_dress.png',
    stripeUrl: 'https://onelink.shein.com/25/5cuwdrok9zk3',
    content: {
      pt: { name: "Kelma's Mystic Knit", description: "A textura orgânica do Blue Team. Trama aberta para ventilação máxima.", price: "" },
      en: { name: "Kelma's Mystic Knit", description: "Blue Team's organic texture. Open weave for maximum ventilation.", price: "" }
    }
  },

  // --- 🔴 FACTION: JONAH & NYX (Chaos/Metal Side) ---
  {
    id: 'jacket-jonah',
    faction: 'jonah', // <--- APARECE SÓ NO MODO JONAH
    image: 'assets/store/jonah_jacket.png',
    stripeUrl: 'https://s.click.aliexpress.com/e/_c3GN8zEX',
    content: {
      pt: { name: "Jonah's Riot Armor", description: "Couro sintético reforçado. Proteção contra feedback de guitarra e opiniões não solicitadas.", price: "" },
      en: { name: "Jonah's Riot Armor", description: "Reinforced faux leather. Protection against guitar feedback and unsolicited opinions.", price: "" }
    }
  },
  {
    id: 'boots-nyx',
    faction: 'jonah',
    image: 'assets/store/nyx_boots.png', // ⚠️ Precisa dessa imagem!
    stripeUrl: 'https://onelink.shein.com/26/5drlt0v2vskd',
    content: {
      pt: { name: "Nyx's Stompers", description: "Coturnos de plataforma alta. Perfeitos para esmagar bugs no sistema e dominar o palco.", price: "" },
      en: { name: "Nyx's Stompers", description: "High platform combat boots. Perfect for crushing system bugs and dominating the stage.", price: "" }
    }
  }
];
