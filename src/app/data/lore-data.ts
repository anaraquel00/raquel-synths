export interface LoreChapter {
  id: string;
  title: string;
  season: string;
  content: string[];
}

// --- VERSÃO PORTUGUÊS ---
export const BROKLIN_ARC_PT: LoreChapter = {
  id: 'broklin-resiste',
  title: 'O Fogo da Paixão: Broklin Resiste',
  season: 'Temporada 1',
  content: [
    "<strong>EPISÓDIO 1 — O Convite Púrpura</strong>",
    "Kelma aproxima-se dele, os olhos brilhando com aquela mistura de mistério e promessa...",
    "Broklin sente tudo — o cheiro dela, a proximidade — mas cruza os braços.",
    "<em>'Eu não vim aqui pra isso.'</em>",
    "",
    "<strong>EPISÓDIO 2 — O Veneno Que Ele Recusa</strong>",
    "Kelma oferece a taça escura. <em>'Bebe comigo.'</em>",
    "Ele responde seco: <em>'Não. Isso aí é você tentando me puxar.'</em>",
    "<em>'E você tentando fugir.'</em>",
    "(Continua...)"
  ]
};

// --- VERSÃO INGLÊS (NOVA!) ---
export const BROKLIN_ARC_EN: LoreChapter = {
  id: 'broklin-resists',
  title: 'Passion Fire: Broklin Resists',
  season: 'Season 1',
  content: [
    "<strong>EPISODE 1 — The Purple Invitation</strong>",
    "Kelma approaches him, her eyes shining with that mix of mystery and promise...",
    "Broklin feels it all — her scent, the heat — but he crosses his arms.",
    "<em>'I didn't come here for this.'</em>",
    "",
    "<strong>EPISODE 2 — The Poison He Refuses</strong>",
    "Kelma offers the dark goblet. <em>'Drink with me.'</em>",
    "He replies dryly: <em>'No. That's you trying to pull me in.'</em>",
    "<em>'And that's you trying to run away.'</em>",
    "(To be continued...)"
  ]
};
