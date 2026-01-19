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
     // BLOCO 1: O PESO DA TRAIÇÃO
      {
        type: 'text',
        content: `
          <h2>O Beco do Silêncio</h2>
          <p>
            Broklin Garpeter checou o relógio holográfico pela terceira vez. Ele não deveria estar ali.
            Se <strong>Jonah Cyperfield</strong> soubesse onde seu melhor amigo e parceiro de estúdio estava naquela noite chuvosa, a banda RaQuel Synths acabaria antes mesmo de começar.
          </p>
          <p>
            O beco em Recife estava vazio, iluminado apenas pelo zumbido intermitente de um neon roxo que falhava, lançando sombras longas sobre o asfalto molhado.
            Broklin encostou-se na parede fria, sentindo o gosto amargo da deslealdade na boca. Ele veio para dizer "não".
            Ele precisava dizer "não". Por respeito ao código. Por respeito a Jonah.
          </p>
        `
      },

      // ANÚNCIO (Tensão aumentando...)
      { type: 'ad', content: '' },

      // BLOCO 2: A TENTAÇÃO CHEGA
      {
        type: 'text',
        content: `
          <h2>O Fogo da Paixão</h2>
          <p>
            Passos leves cortaram o silêncio. Kelma Adlanko surgiu da neblina não como a namorada do seu amigo, mas como uma tempestade inevitável.
            Ela caminhava devagar, os olhos fixos nos dele, brilhando com aquela mistura perigosa de mistério e promessa proibida.
          </p>
          <p>
            Broklin cruzou os braços, criando uma barreira física entre eles. Seu coração, traidor, batia descompassado contra as costelas.
            <em>"Eu não vim aqui pra isso,"</em> ele mentiu, a voz rouca tentando manter a postura de lealdade.
            <em>"O Jonah..."</em>
          </p>
          <p>
            Kelma o interrompeu com um sorriso lento, quase cruel. Ela parou a centímetros dele, invadindo seu espaço, ignorando o fantasma de Jonah entre eles.
            <em>"Eu sei,"</em> ela sussurrou, e o som era como veludo rasgando a consciência dele.
            <em>"Mas também sei o que você sente quando eu não estou olhando."</em>
          </p>
          <p>
            Naquele beco escuro, sob a luz púrpura, a primeira regra foi quebrada. O segredo estava selado.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e2',
    releaseDate: '2025-12-29',
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 2 — O Veneno Que Ele Recusa',
    coverImage: 'images/ep2_wine_chalice.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>A Oferenda Profana</h2>
          <p>
            O som da chuva lá fora parecia distante agora. O universo de Broklin havia se resumido àquele metro quadrado de tensão entre ele e Kelma.
            De algum lugar nas sombras de seu casaco, ou talvez do próprio ar rarefeito da noite, ela materializou uma taça.
            Não era um copo comum. Era um cálice, pesado e ornamentado, cheio de um vinho tão escuro que parecia absorver a luz do neon.
          </p>
          <p>
            <em>"Bebe comigo,"</em> ela ofereceu. Não foi um pedido. Foi um desafio.
            A voz dela tinha a textura de veludo molhado, suave e perigosa.
          </p>
        `
      },

      // ANÚNCIO (O momento de hesitação...)
      { type: 'ad', content: '' },

      {
        type: 'text',
        content: `
          <h2>A Muralha de Lealdade</h2>
          <p>
            Broklin olhou para o líquido. Ele sabia o que aquilo representava.
            Aquele vinho era o pacto. Aceitá-lo seria selar a traição contra Jonah. Seria admitir que a "irmandade do metal" valia menos que o fogo que queimava em suas veias agora.
          </p>
          <p>
            Ele sentiu a vontade. Deus, como ele sentiu. Sua garganta estava seca, sedenta não pelo álcool, mas pela cumplicidade que ela oferecia.
            Mas o código de honra ainda rodava em seu sistema, mesmo que com falhas críticas.
          </p>
          <p>
            <em>"Não,"</em> ele respondeu, seco, brutal. <em>"Isso aí é você tentando me puxar pra baixo. Pra lama."</em>
          </p>
          <p>
            <em>"E você tentando fugir,"</em> ela retrucou, rápida como um chicote.
          </p>
        `
      },

      {
        type: 'text',
        content: `
          <h2>A Gota da Perdição</h2>
          <p>
            Kelma não se abalou. Mantendo os olhos fixos nos dele, ela levou o cálice aos lábios.
            Ela bebeu devagar, deliberadamente. Uma única gota escura escapou pelo canto da boca, desenhando um caminho lento e pecaminoso pela pele pálida do queixo.
          </p>
          <p>
            Era provocação pura. Era uma arma de guerra.
            Broklin desviou o olhar — rápido demais para fingir indiferença. Ele cerrou os punhos, as unhas cravando na palma da mão, lutando contra a gravidade que o puxava para ela.
          </p>
          <p>
            Kelma sorriu, vitoriosa.
            <em>"Te incomoda, né?"</em>
          </p>
          <p>
            Broklin soltou o ar que nem percebeu que estava prendendo.
            <em>"Você sabe que incomoda."</em>
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e3',
    releaseDate: '2026-01-05', // Segunda-feira (Lançamento Semanal)
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 3 — O Toque Interrompido',
    coverImage: 'images/ep3_interrupted_touch.jpg', // Sugestão: Mão pálida quase tocando um peito vestido de preto
    blocks: [
      {
        type: 'text',
        content: `
          <h2>O Campo Magnético</h2>
          <p>
            O vinho havia deixado os lábios de Kelma avermelhados, um contraste violento com a palidez da luz neon.
            Ela deu mais um passo. Agora, não havia mais espaço para "lealdade" ou "código de honra". Havia apenas física.
            A gravidade entre os dois corpos era tão forte que Broklin podia sentir a estática eriçando os pelos do braço, mesmo através do sobretudo.
          </p>
          <p>
            Kelma ergueu a mão devagar, os dedos finos pairando a milímetros dos braços dele. Ela não o tocou, mas o calor da pele dela queimou o ar entre eles.
            Era um teste. Ela queria ver até onde o firewall dele aguentaria antes de colapsar.
          </p>
        `
      },

      // ANÚNCIO (O suspense do toque...)
      { type: 'ad', content: '' },

      {
        type: 'text',
        content: `
          <h2>A Retirada Estratégica</h2>
          <p>
            No último microssegundo, Broklin deu um passo para trás. O movimento foi brusco, quase violento, como se ele tivesse levado um choque de alta voltagem.
            Ele bateu as costas na parede úmida do beco, encurralado pelos próprios instintos.
          </p>
          <p>
            <em>"Não me provoca,"</em> ele avisou. A voz saiu falhada, um rosnado baixo que misturava raiva e desejo na mesma frequência.
            Ele estava perdendo o controle. A máscara do futuro "Tech Lead frio e calculista" estava rachando.
          </p>
          <p>
            Kelma não recuou. Ela inclinou a cabeça, estudando a reação dele como uma cientista analisando uma reação química volátil.
            O sorriso dela se alargou.
            <em>"Mas você gosta,"</em> ela afirmou, com a certeza absoluta de quem acabou de hackear o sistema central.
          </p>
          <p>
            E o pior pesadelo de Broklin era que... ela estava certa.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e4',
    releaseDate: '2026-01-12', // HOJE!
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 4 — O Fogo Que Não Queima (Ainda)',
    coverImage: 'images/ep4_breath_on_neck.jpg', // Nova sugestão: Kelma atrás dele
    blocks: [
      {
        type: 'text',
        content: `
          <h2>A Retaguarda Vulnerável</h2>
          <p>
            A tensão no beco não aumentou; ela se solidificou.
            Broklin sentiu a presença dela antes mesmo do toque. Kelma chegou por trás dele, silenciosa como uma sombra digital.
            Ele podia sentir o calor da respiração dela roçando a pele sensível do pescoço, arrepiando cada nervo de sua coluna vertebral.
          </p>
          <p>
            Broklin fechou os olhos com força, como se tentasse reiniciar o sistema para evitar um erro fatal.
            <em>"Não faz isso,"</em> ele sussurrou, a voz saindo como um pedido de clemência.
          </p>
          <p>
            <em>"Por quê?"</em> — o sussurro dela foi quente, úmido, direto no ouvido dele.
          </p>
          <p>
            <em>"Porque eu não vou conseguir parar."</em> A confissão saiu antes que ele pudesse criptografá-la.
          </p>
        `
      },

      // ANÚNCIO (O momento do toque...)
      { type: 'ad', content: '' },

      {
        type: 'text',
        content: `
          <h2>O Ponto de Ruptura</h2>
          <p>
            Kelma deslizou a mão lentamente pelo braço dele, sobre o couro da jaqueta, como se estivesse mapeando o território que pretendia conquistar.
            <em>"É isso que eu quero,"</em> ela disse, sem hesitação.
          </p>
          <p>
            A reação de Broklin foi instintiva. Ele se afastou rápido, quase tropeçando nos próprios pés, cambaleando para longe do toque dela como se tivesse se queimado.
            Ele se virou, a respiração pesada, os olhos arregalados de pânico.
          </p>
          <p>
            <em>"Não,"</em> ele disse, erguendo as mãos. <em>"Se eu começar... não vai ter volta."</em>
          </p>
        `
      },

      {
        type: 'text',
        content: `
          <h2>A Resistência Final</h2>
          <p>
            Kelma não se ofendeu com a rejeição física. Pelo contrário. Ela deu um sorriso pequeno, satisfeito, de quem sabe que a defesa inimiga está por um fio.
            <em>"Eu não quero volta, Broklin,"</em> ela declarou, a voz firme. <em>"Quero você."</em>
          </p>
          <p>
            O silêncio caiu sobre eles novamente. Broklin ficou ali, respirando fundo, lutando uma guerra civil contra o próprio corpo.
            Ele queria. Deus, como ele queria. Cada célula do seu ser gritava para ele ceder.
            Mas ele era teimoso. Orgulhoso. Emocionalmente blindado por camadas de culpa e lealdade.
          </p>
          <p>
            Ele engoliu em seco, recuando mais um passo para as sombras.
            <em>"Kelma..."</em> — ele disse, a voz rouca de desejo contido — <em>"...não hoje."</em>
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e5',
    releaseDate: '2026-01-19', // Uma semana depois (Domingo/Segunda)
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 5 — A Vitória Silenciosa de Kelma',
    coverImage: 'images/ep5_kelma_walking_away.jpg', // Sugestão: Silhueta dela saindo contra a luz
    blocks: [
      {
        type: 'text',
        content: `
          <h2>A Estratégia do Silêncio</h2>
          <p>
            Depois da tempestade emocional, veio a calmaria — que era ainda mais perigosa.
            Kelma não forçou. Não insistiu. Ela desarmou os escudos de Broklin fazendo o impensável: ela foi gentil.
          </p>
          <p>
            Ela se aproximou mais uma vez, mas agora sem a agressividade do desejo. Com um carinho inesperado, ela colocou a mão no rosto dele.
            O toque foi leve, mas teve o peso de uma sentença.
            <em>"Eu posso esperar,"</em> ela disse, quase num sussurro, como quem confia plenamente no tempo.
          </p>
        `
      },

      // ANÚNCIO (A pausa dramática...)
      { type: 'ad', content: '' },

      {
        type: 'text',
        content: `
          <h2>A Profecia</h2>
          <p>
            Broklin recuou meio passo, instintivamente buscando ar, precisando de distância física para processar a invasão emocional.
            <em>"Não sei se um dia..."</em> ele começou, a voz falhando, tentando manter a mentira viva.
          </p>
          <p>
            Kelma sorriu. Não um sorriso de escárnio, mas um sorriso sereno, onisciente. O sorriso de quem já leu os logs do futuro e sabe exatamente como o código termina.
            <em>"Vai saber,"</em> ela respondeu. <em>"Quando estiver pronto... eu estarei aqui."</em>
          </p>
        `
      },

      {
        type: 'text',
        content: `
          <h2>A Rendição Futura</h2>
          <p>
            Ela virou as costas. Sem olhar para trás, sem hesitar, começou a caminhar para fora do templo de neon e chuva.
            Broklin ficou sozinho. Ele fechou os olhos, mas a presença dela persistia.
            Ele sentia o perfume dela impregnado na roupa. O calor dela na pele. O toque ainda queimando como uma marca fantasma em seu rosto.
          </p>
          <p>
            Pela primeira vez, a lógica falhou completamente. Ele admitiu, apenas para si mesmo, no silêncio do seu sistema interno:
            <br>
            <em>"Eu estou perdido. E ela sabe."</em>
          </p>
          <p>
            Ele abriu os olhos e olhou para a porta vazia por onde ela saiu.
            A expressão em seu rosto não era mais de negação. Era de rendição futura.
            O check-mate havia sido dado. Faltava apenas o rei cair.
          </p>
        `
      }
    ]
  },
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
            <h2>The Alley of Silence</h2>
          <p>
            Broklin Garpeter checked the holographic watch for the third time. He shouldn't be there.
         If <strong>Jonah Cyperfield</strong> knew where his best friend and studio partner was on that rainy night, the band RaQuel Synths would have ended before it even began.
          </p>
          <p>
            The alley in Recife was empty, lit only by the intermittent hum of a flickering purple neon light, casting long shadows across the wet asphalt.
        Broklin leaned against the cold wall, tasting the bitter flavor of disloyalty in his mouth. He had come to say "no."
        He needed to say "no." Out of respect for the code. Out of respect for Jonah.
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
          <h2>The Fire of Passion</h2>
         <p>
            Light footsteps cut through the silence. Kelma Adlanko emerged from the fog not as his friend's girlfriend, but as an inevitable storm.
          She walked slowly, her eyes fixed on his, gleaming with that dangerous mixture of mystery and forbidden promise.
          </p>
          <p>
           Broklin crossed his arms, creating a physical barrier between them. His heart, a traitor, pounded erratically against his ribs.
          <em>"I didn't come here for that,"</em> he lied, his hoarse voice trying to maintain a posture of loyalty.
            <em>"O Jonah..."</em>
          </p>
          <p>
            Kelma interrupted him with a slow, almost cruel smile. She stopped inches from him, invading his space, ignoring the ghost of Jonah between them.
            <em>"I known,"</em> she whispered, and the sound was like velvet tearing at his consciousness.
            <em>"But I also know how you feel when I'm not looking."</em>
          </p>
          <p>
            In that dark alley, under the purple light, the first rule was broken. The secret was sealed.
          </p>
        `
      }
    ]
  },

  {
    id: 's1-e2',
    releaseDate: '2025-12-29',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 2 — The Poison He Refuses',
    coverImage: 'images/ep2_wine_chalice.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>The Profane Offering</h2>
          <p>
            The sound of rain outside seemed distant now. Broklin's universe had collapsed into that single square meter of tension between him and Kelma.
            From somewhere in the shadows, she produced a chalice.
            It wasn't a common glass. It was heavy, ornate, filled with a wine so dark it seemed to absorb the neon light.
          </p>
          <p>
            <em>"Drink with me,"</em> she offered. It wasn't a request. It was a dare.
            Her voice had the texture of wet velvet, soft and dangerous.
          </p>
        `
      },

      { type: 'ad', content: '' },

      {
        type: 'text',
        content: `
          <h2>The Wall of Loyalty</h2>
          <p>
            Broklin stared at the liquid. He knew what it represented.
            That wine was the pact. To accept it would be to seal the betrayal against Jonah. It would be admitting that their "metal brotherhood" was worth less than the fire burning in his veins right now.
          </p>
          <p>
            He felt the urge. God, how he felt it. His throat was dry, thirsty not for the alcohol, but for the complicity she was offering.
            But the code of honor was still running in his system, even if critically glitched.
          </p>
          <p>
            <em>"No,"</em> he replied, dry, brutal. <em>"That's you trying to pull me under. Into the mud."</em>
          </p>
          <p>
            <em>"And that's you trying to run,"</em> she shot back, quick as a whip.
          </p>
        `
      },

      {
        type: 'text',
        content: `
          <h2>The Drop of Doom</h2>
          <p>
            Kelma didn't flinch. Keeping her eyes locked on his, she raised the chalice to her lips.
            She drank slowly, deliberately. A single dark drop escaped the corner of her mouth, tracing a slow, sinful path down her pale skin.
          </p>
          <p>
            It was pure provocation. It was a weapon of war.
            Broklin looked away — too quickly to feign indifference. He clenched his fists, nails digging into his palms, fighting the gravity pulling him towards her.
          </p>
          <p>
            Kelma smiled, victorious.
            <em>"It bothers you, doesn't it?"</em>
          </p>
          <p>
            Broklin exhaled a breath he didn't realize he was holding.
            <em>"You know it does."</em>
          </p>
        `
      }
    ]
  },

  {
    id: 's1-e3',
    releaseDate: '2026-01-05',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 3 — The Interrupted Touch',
    coverImage: 'images/ep3_interrupted_touch.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>The Magnetic Field</h2>
          <p>
            The wine had left Kelma's lips stained red, a violent contrast against the pale neon light.
            She took another step. Now, there was no more room for "loyalty" or "honor codes." There was only physics.
            The gravity between their two bodies was so strong that Broklin could feel the static raising the hairs on his arm, even through his trench coat.
          </p>
          <p>
            Kelma raised her hand slowly, her slender fingers hovering millimeters from his arms. She didn't touch him, but the heat from her skin burned the air between them.
            It was a test. She wanted to see how long his firewall would hold before collapsing.
          </p>
        `
      },

      { type: 'ad', content: '' },

      {
        type: 'text',
        content: `
          <h2>The Strategic Retreat</h2>
          <p>
            At the very last microsecond, Broklin took a step back. The movement was sharp, almost violent, as if he had been struck by high voltage.
            His back hit the damp alley wall, cornered by his own instincts.
          </p>
          <p>
            <em>"Don't provoke me,"</em> he warned. His voice cracked, a low growl mixing anger and desire on the same frequency.
            He was losing control. The mask of the future "cold, calculating Tech Lead" was cracking.
          </p>
          <p>
            Kelma didn't retreat. She tilted her head, studying his reaction like a scientist analyzing a volatile chemical reaction.
            Her smile widened.
            <em>"But you like it,"</em> she stated, with the absolute certainty of someone who had just hacked the mainframe.
          </p>
          <p>
            And Broklin's worst nightmare was that... she was right.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e4',
    releaseDate: '2026-01-12',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 4 — The Fire That Doesn\'t Burn (Yet)',
    coverImage: 'images/ep4_breath_on_neck.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>The Vulnerable Rearguard</h2>
          <p>
            The tension in the alley didn't just rise; it solidified.
            Broklin felt her presence before the touch. Kelma approached from behind, silent as a digital shadow.
            He could feel the heat of her breath grazing the sensitive skin of his neck, sending shivers down every nerve of his spine.
          </p>
          <p>
            Broklin squeezed his eyes shut, as if trying to reboot his system to avoid a fatal error.
            <em>"Don't do this,"</em> he whispered, his voice sounding like a plea for mercy.
          </p>
          <p>
            <em>"Why?"</em> — her whisper was hot, humid, right in his ear.
          </p>
          <p>
            <em>"Because I won't be able to stop."</em> The confession slipped out before he could encrypt it.
          </p>
        `
      },

      { type: 'ad', content: '' },

      {
        type: 'text',
        content: `
          <h2>The Breaking Point</h2>
          <p>
            Kelma slid her hand slowly down his arm, over the leather of his jacket, as if mapping the territory she intended to conquer.
            <em>"That's what I want,"</em> she said, without hesitation.
          </p>
          <p>
            Broklin's reaction was instinctive. He pulled away fast, almost stumbling over his own feet, staggering away from her touch as if he had been burned.
            He turned around, breathing heavily, eyes wide with panic.
          </p>
          <p>
            <em>"No,"</em> he said, raising his hands. <em>"If I start... there's no turning back."</em>
          </p>
        `
      },

      {
        type: 'text',
        content: `
          <h2>The Final Resistance</h2>
          <p>
            Kelma wasn't offended by the physical rejection. On the contrary. She gave a small, satisfied smile, like someone who knows the enemy defense is hanging by a thread.
            <em>"I don't want to go back, Broklin,"</em> she declared, her voice firm. <em>"I want you."</em>
          </p>
          <p>
            Silence fell upon them again. Broklin stood there, breathing deeply, fighting a civil war against his own body.
            He wanted it. God, how he wanted it. Every cell of his being screamed for him to yield.
            But he was stubborn. Proud. Emotionally armored by layers of guilt and loyalty.
          </p>
          <p>
            He swallowed hard, retreating another step into the shadows.
            <em>"Kelma..."</em> — he said, his voice hoarse with contained desire — <em>"...not today."</em>
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e5',
    releaseDate: '2026-01-19',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 5 — Kelma\'s Silent Victory',
    coverImage: 'images/ep5_kelma_walking_away.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>The Strategy of Silence</h2>
          <p>
            After the emotional storm came the calm — which was even more dangerous.
            Kelma didn't force it. She didn't insist. She disarmed Broklin's shields by doing the unthinkable: she was gentle.
          </p>
          <p>
            She stepped closer once more, but now without the aggression of desire. With unexpected tenderness, she placed her hand on his face.
            The touch was light, yet it carried the weight of a sentence.
            <em>"I can wait,"</em> she said, almost in a whisper, like someone who fully trusts in time.
          </p>
        `
      },

      { type: 'ad', content: '' },

      {
        type: 'text',
        content: `
          <h2>The Prophecy</h2>
          <p>
            Broklin retreated half a step, instinctively gasping for air, needing physical distance to process the emotional invasion.
            <em>"I don't know if one day..."</em> he began, his voice failing, trying to keep the lie alive.
          </p>
          <p>
            Kelma smiled. Not a mocking smile, but a serene, omniscient one. The smile of someone who has already read the future logs and knows exactly how the code ends.
            <em>"You'll know,"</em> she replied. <em>"When you're ready... I'll be here."</em>
          </p>
        `
      },

      {
        type: 'text',
        content: `
          <h2>Future Surrender</h2>
          <p>
            She turned her back. Without looking back, without hesitation, she began to walk out of the temple of neon and rain.
            Broklin stood alone. He closed his eyes, but her presence persisted.
            He felt her perfume impregnated in his clothes. Her warmth on his skin. The touch still burning like a phantom brand on his face.
          </p>
          <p>
            For the first time, logic failed completely. He admitted, only to himself, in the silence of his internal system:
            <br>
            <em>"I am lost. And she knows it."</em>
          </p>
          <p>
            He opened his eyes and looked at the empty door through which she had left.
            The expression on his face was no longer one of denial. It was of future surrender.
            Checkmate had been delivered. The king just hadn't fallen yet.
          </p>
        `
      }
    ]
  },
]
