export interface LoreBlock {
  type: 'text' | 'ad'; // Diz se é texto ou anúncio
  content?: string;    // O HTML do texto (só se for type 'text')
}

export interface LoreEpisode {
  blocks?: LoreBlock[];
  id: string;
  releaseDate: string; // YYYY-MM-DD
  published: boolean;  // Se deve aparecer no site
  season: number;
  seasonTitle: string;
  title: string;
  content?: string;     // HTML permitido
  coverImage?: string;
  // Caminho da imagem (ex: 'assets/images/lore/ep1.jpg')
}

// 🇧🇷 --- DADOS EM PORTUGUÊS ---
export const BROKLIN_ARC_PT: LoreEpisode[] = [
  {
    id: 's1-e1',
    releaseDate: '2025-12-22',
    published: true, // ESTÁ NO AR
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 1 — O Convite Púrpura',
    coverImage: 'images/ep1_purple_temple.jpg', // Exemplo
     blocks: [
      {
        type: 'text',
        content: `
          <p>
            A noite em Camaragibe tinha aquele cheiro de chuva e asfalto quente.
            O ano? Irrelevante. O que importava era a estática no ar.
            <strong>Jonah Cyperfield</strong> estava inquieto. O som do RaQuel Synths estava pesado demais,
            cru demais. Faltava... elegância. Faltava a alma digital.
          </p>
          <p>
            Foi Kelma quem deu o ultimato: <em>"Precisamos de alguém que entenda de melodias, não apenas de barulho."</em>
            O anúncio foi feito nas frequências certas da internet. E a resposta veio de um IP desconhecido.
          </p>
        `
      },
      {
        type: 'ad',
        content: ''
      },
      {
        type: 'text',
        content: `
          <p>
            O encontro foi marcado em um local neutro, mal iluminado por neons roxos piscantes.
            Quando <strong>Broklin Garpeter</strong> entrou no recinto, o ambiente mudou.
            Ele não vestia jeans rasgados como os metaleiros locais.
            Trajava um sobretudo escuro, cabelos loiros escuros e uma aura de quem havia hackeado a própria realidade.
          </p>
          <p>
            Jonah viu um tecladista. <strong>Kelma viu o abismo... e o abismo olhou de volta.</strong>
          </p>
          <p>
            <em>"Eu não vim aqui para tocar notas,"</em> disse Broklin, com uma voz calma que cortou o ruído do bar.
            <em>"Eu vim para reprogramar a banda."</em>
            Naquele momento, Kelma sentiu um arrepio na espinha que nenhuma distorção de guitarra jamais causara.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e2',
    releaseDate: '2026-01-03',
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 2 — O Veneno Que Ele Recusa',
    content: `<p>Em breve...</p>`
  }
];

// 🇺🇸 --- ENGLISH DATA (TRANSLATED & EXPANDED) ---
export const BROKLIN_ARC_EN: LoreEpisode[] = [
  {
    id: 's1-e1',
    releaseDate: '2025-12-22',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 1 — The Purple Invitation',
    coverImage: 'images/ep1_purple_temple.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <p>
            The night in Camaragibe smelled of rain and hot asphalt.
            The year? Irrelevant. What mattered was the static in the air.
            <strong>Jonah Cyperfield</strong> was restless. The sound of RaQuel Synths was too heavy,
            too raw. It lacked... elegance. It lacked a digital soul.
          </p>
          <p>
            It was Kelma who gave the ultimatum: <em>"We need someone who understands melodies, not just noise."</em>
            The ad was placed on the right internet frequencies. And the answer came from an unknown IP.
          </p>
        `
      },
      {
        type: 'ad',
        content: ''
      },
      {
        type: 'text',
        content: `
          <p>
            The meeting was set in a neutral location, dimly lit by flickering purple neons.
            When <strong>Broklin Garpeter</strong> entered the room, the atmosphere shifted.
            He didn't wear torn jeans like the local metalheads.
            He wore a dark trench coat, dark blond hair, and carried the aura of someone who had hacked reality itself.
          </p>
          <p>
            Jonah saw a keyboardist. <strong>Kelma saw the abyss... and the abyss stared back.</strong>
          </p>
          <p>
            <em>"I didn't come here to play notes,"</em> Broklin said, with a calm voice that cut through the bar's noise.
            <em>"I came to reprogram the band."</em>
            In that moment, Kelma felt a shiver down her spine that no guitar distortion had ever caused.
          </p>
        `
      }
    ]
  },

  {
    id: 's1-e2',
    releaseDate: '2026-01-03',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 2 — The Poison He Refuses',
    content: `<p>Coming soon...</p>`
  }
];
