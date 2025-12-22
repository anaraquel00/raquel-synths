export interface LoreEpisode {
  id: string;
  releaseDate: string; // YYYY-MM-DD
  published: boolean;  // Se deve aparecer no site
  season: number;
  seasonTitle: string;
  title: string;
  content: string;     // HTML permitido
  coverImage?: string; // Caminho da imagem (ex: 'assets/images/lore/ep1.jpg')
}

// 🇧🇷 --- DADOS EM PORTUGUÊS ---
export const BROKLIN_ARC_PT: LoreEpisode[] = [
  {
    id: 's1-e1',
    releaseDate: '2025-12-26',
    published: true, // ESTÁ NO AR
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 1 — O Convite Púrpura',
    coverImage: 'assets/images/lore/ep1_purple_temple.jpg', // Exemplo
    content: `
      <p>O vento cortante do Setor 4 não trazia apenas o frio da noite industrial; trazia uma poeira púrpura, fina e brilhante, resquício de algum vazamento químico nas fábricas superiores. Ela dançava no ar como cinzas radioativas, cobrindo as ruínas do antigo templo techno em um manto de silêncio.</p>

      <p>Broklin conhecia aquele lugar. Era onde o silêncio deveria reinar. Era onde ele ia para recalibrar a lógica quando o barulho do mundo ficava alto demais. Mas naquela noite, o silêncio tinha peso. Tinha cheiro.</p>

      <!-- ADSENSE_PLACEHOLDER -->

      <p>Ele parou antes de subir os degraus de concreto rachado. Seus sensores — ou talvez apenas seu instinto de homem que viveu tempo demais nas sombras — dispararam um alerta.</p>

      <p><em>"Ela está aqui."</em></p>

      <p>Não foi preciso vê-la para saber. A atmosfera mudou. A estática no ar ficou mais densa, carregada, como se uma tempestade elétrica estivesse comprimida em um único ponto.</p>

      <p>Quando Kelma saiu das sombras das colunas, não foi um movimento; foi uma aparição. A luz fraca dos neons quebrados refletia em sua pele, dando-lhe uma aura quase metálica. Seus olhos, normalmente de uma cor humana, pareciam refletir uma luminescência sanguínea, predatória.</p>

      <!-- ADSENSE_PLACEHOLDER -->

      <p>Broklin sentiu o músculo do maxilar travar. Ele cruzou os braços sobre o peito, uma barreira física inútil contra o que estava por vir.</p>

      <p>— <strong>Eu não vim aqui pra isso</strong> — ele disse. Sua voz saiu grave, arranhada, tentando impor uma autoridade que ele não sentia por dentro.</p>

      <p>Kelma não parou. Ela deu um passo à frente, e o som do salto dela no concreto ecoou como um tiro seco na vastidão do santuário. Um sorriso lento, quase preguiçoso, curvou os lábios dela.</p>

      <p>— <strong>Eu sei</strong> — ela respondeu. A voz dela não era alta, mas preenchia todo o espaço, vibrando nos ossos dele. — <strong>Você veio buscar paz. Veio buscar lógica.</strong></p>

      <p>Ela parou a apenas um metro dele. Perto o suficiente para que Broklin sentisse o calor que emanava dela, contrastando com o gelo da noite.</p>

      <p>— <strong>Mas eu também sei o que você sente quando a lógica falha, Broklin</strong> — ela sussurrou, e a poeira púrpura parecia girar em torno dela, atraída por sua gravidade. — <strong>Eu sei o que você esconde debaixo dessa armadura de arquiteto.</strong></p>

      <p>Ele apertou a mandíbula com tanta força que doeu. A irritação subiu pelo pescoço — não porque ela estava provocando, mas porque ela estava certa.</p>
    `
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
    releaseDate: '2025-12-26',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 1 — The Purple Invitation',
    coverImage: 'assets/images/lore/ep1_purple_temple.jpg',
    content: `
      <p>The cutting wind of Sector 4 brought more than just the industrial night chill; it carried a fine, glowing purple dust, residue from a chemical leak in the upper factories. It danced in the air like radioactive ash, blanketing the ruins of the ancient techno-temple in a shroud of silence.</p>

      <p>Broklin knew this place. It was where silence was supposed to reign. It was where he went to recalibrate his logic when the world's noise got too loud. But tonight, the silence had weight. It had a scent.</p>

      <!-- ADSENSE_PLACEHOLDER -->

      <p>He stopped before climbing the cracked concrete steps. His sensors—or perhaps just the instinct of a man who lived too long in the shadows—triggered an alert.</p>

      <p><em>"She is here."</em></p>

      <p>He didn't need to see her to know. The atmosphere shifted. The static in the air grew denser, charged, as if an electrical storm were compressed into a single point.</p>

      <p>When Kelma stepped out from the column's shadows, it wasn't a movement; it was an apparition. The weak light from broken neons reflected on her skin, giving her an almost metallic aura. Her eyes, usually a human color, seemed to reflect a blood-like, predatory luminescence.</p>

      <!-- ADSENSE_PLACEHOLDER -->

      <p>Broklin felt his jaw muscle lock. He crossed his arms over his chest, a useless physical barrier against what was coming.</p>

      <p>— <strong>I didn't come here for this</strong> — he said. His voice came out low, raspy, trying to impose an authority he didn't feel inside.</p>

      <p>Kelma didn't stop. She took a step forward, and the sound of her heel on the concrete echoed like a dry gunshot in the vastness of the sanctuary. A slow, almost lazy smile curved her lips.</p>

      <p>— <strong>I know</strong> — she replied. Her voice wasn't loud, but it filled the entire space, vibrating in his bones. — <strong>You came for peace. You came for logic.</strong></p>

      <p>She stopped just a meter away. Close enough for Broklin to feel the heat radiating from her, contrasting with the night's ice.</p>

      <p>— <strong>But I also know what you feel when logic fails, Broklin</strong> — she whispered, and the purple dust seemed to swirl around her, drawn by her gravity. — <strong>I know what you hide beneath that architect's armor.</strong></p>

      <p>He clenched his jaw so hard it hurt. Irritation rose up his neck—not because she was teasing, but because she was right.</p>
    `
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
