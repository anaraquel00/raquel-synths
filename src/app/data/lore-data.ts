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
      <p>O vento cortante do Setor 4 não trazia apenas o frio da noite industrial; trazia uma poeira púrpura, fina e brilhante, resquício de algum vazamento químico nas fábricas superiores. Ela dançava no ar como cinzas radioativas, cobrindo as ruínas do antigo templo techno em um manto de silêncio.</p>

      <p>Broklin conhecia aquele lugar. Era onde o silêncio deveria reinar. Era onde ele ia para recalibrar a lógica quando o barulho do mundo ficava alto demais. Mas naquela noite, o silêncio tinha peso. Tinha cheiro.</p>
        `
      },
      { type: 'ad' },
      {
        type: 'text',
        content: `
      <p>Ele parou antes de subir os degraus de concreto rachado. Seus sensores — ou talvez apenas seu instinto de homem que viveu tempo demais nas sombras — dispararam um alerta.</p>

      <p><em>"Ela está aqui."</em></p>

      <p>Não foi preciso vê-la para saber. A atmosfera mudou. A estática no ar ficou mais densa, carregada, como se uma tempestade elétrica estivesse comprimida em um único ponto.</p>

      <p>Quando Kelma saiu das sombras das colunas, não foi um movimento; foi uma aparição. A luz fraca dos neons quebrados refletia em sua pele, dando-lhe uma aura quase metálica. Seus olhos, normalmente de uma cor humana, pareciam refletir uma luminescência sanguínea, predatória.</p>
        `
      },
      { type: 'ad' }, // <--- MAIS UM ANÚNCIO!
      {
        type: 'text',
        content: `
      <p>Broklin sentiu o músculo do maxilar travar. Ele cruzou os braços sobre o peito, uma barreira física inútil contra o que estava por vir.</p>

      <p>— <strong>Eu não vim aqui pra isso</strong> — ele disse. Sua voz saiu grave, arranhada, tentando impor uma autoridade que ele não sentia por dentro.</p>

      <p>Kelma não parou. Ela deu um passo à frente, e o som do salto dela no concreto ecoou como um tiro seco na vastidão do santuário. Um sorriso lento, quase preguiçoso, curvou os lábios dela.</p>

      <p>— <strong>Eu sei</strong> — ela respondeu. A voz dela não era alta, mas preenchia todo o espaço, vibrando nos ossos dele. — <strong>Você veio buscar paz. Veio buscar lógica.</strong></p>

      <p>Ela parou a apenas um metro dele. Perto o suficiente para que Broklin sentisse o calor que emanava dela, contrastando com o gelo da noite.</p>

      <p>— <strong>Mas eu também sei o que você sente quando a lógica falha, Broklin</strong> — ela sussurrou, e a poeira púrpura parecia girar em torno dela, atraída por sua gravidade. — <strong>Eu sei o que você esconde debaixo dessa armadura de arquiteto.</strong></p>

      <p>Ele apertou a mandíbula com tanta força que doeu. A irritação subiu pelo pescoço — não porque ela estava provocando, mas porque ela estava certa.</p>
        `
      }
    ],
  },
  {
    id: 's1-e2',
    releaseDate: '2026-01-02',
    published: false, // BLOQUEADO
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
      <p>The cutting wind of Sector 4 carried a fine, glowing purple dust—the remnant of a chemical leak from the upper factories—blanketing the ruins of the ancient techno-temple like a silent shroud. Broklin came to the place to recalibrate his logic when the world grew loud, but that night the silence had weight and even a smell.</p>

      <p>Before climbing the cracked concrete steps, he stopped: his sensors—or the instinct of a man who had spent too much time in the shadows—flared an alert. It wasn't necessary to see to know someone was there; the atmosphere shifted, and the static in the air became dense and compressed, like a storm ready to discharge.</p>
        `
      },
      { type: 'ad' },
      {
        type: 'text',
        content: `
      <p>Kelma stepped out of the columns' shadows like an apparition. The broken neon reflected on her skin, giving her a metallic halo, and her eyes glowed with a bloodlike, predatory luminescence. Broklin felt his jaw lock and crossed his arms, a symbolic defense against what approached.</p>

      <p>He tries to impose authority: “— I'm not here for this,” he says, his voice low and rough. Kelma doesn't stop; she smiles slowly and takes a step forward—the sound of her heel on concrete snapping sharp through the sanctuary. Her voice, low and full, fills the space and resonates in his bones: “I know. You came for peace. You came for logic.”</p>
        `
      },
      { type: 'ad' },
      {
        type: 'text',
        content: `
      <p>She halts a meter from him and whispers that she knows what happens when logic fails; the purple dust seems to swirl around her. When he realizes she reads his source code without a password, Broklin clamps his jaw—the irritation isn't only from the provocation but from the truth—and the blow is at once terrifying and strangely thrilling.</p>

      <p>He clenched his jaw so hard it hurt. Irritation rose up his neck—not because she was teasing, but because she was right.</p>
        `
      }
    ],
  },
  {
    id: 's1-e2',
    releaseDate: '2026-01-02',
    published: false,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 2 — The Poison He Refuses',
    content: `<p>Coming soon...</p>`
  }
];
