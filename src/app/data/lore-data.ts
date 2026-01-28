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
  mode?: 'broklin' | 'jonah'; // 👈 O FILTRO DA REALIDADE
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
    mode: 'broklin',
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
    mode: 'broklin',
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
    mode: 'broklin',
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
    mode: 'broklin',
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
    mode: 'broklin',
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
  {
    id: 's1-e6',
    releaseDate: '2026-01-26', // Segunda-feira seguinte
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 6 — A Rendição (Give Me One More Chance)',
    mode: 'broklin',
    coverImage: 'images/ep6_surrender_dark.jpg', // Sugestão de nome de arquivo
    blocks: [
      {
        type: 'text',
        content: `
          <h2>LOG: 19:47 PM // O Silêncio Ensurdecedor</h2>
          <p>
            O silêncio no 14º andar é ensurdecedor. Faz 48 horas que Broklin tenta reescrever o próprio código. Dois dias lutando contra a memória de um perfume que hackeou seu sistema. Ele tentou focar na mixagem, na lógica, na ordem. <strong>Falhou.</strong>
          </p>
          <p>
            O celular vibra na mão dele — ou será o tremor dos seus próprios dedos? Ele digita, apaga, digita de novo. A lógica grita para parar, mas a necessidade aperta o botão 'Enviar'.
          </p>
          <p class="chat-log">
            Broklin: <em>"Você pode passar aqui essa noite?"</em><br>
            A resposta demora três segundos eternos.<br>
            Kelma: <em>"Claro. 💜"</em>
          </p>
          <p>Broklin solta o ar. O firewall caiu.</p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>A Chegada</h2>
          <p>
            Quando ela entra, o ar muda. A temperatura sobe e desce ao mesmo tempo. Ela não se arrumou para uma visita; <strong>ela se arrumou para uma execução.</strong> O olhar dela é predatório, mas há um sorriso suave nos lábios.
          </p>
          <p>
            <em>"Você parece cansado, Tech Lead,"</em> ela observa.<br>
            <em>"Não consegui entrar em modo sleep desde... você sabe,"</em> ele admite.<br>
            <em>"Eu sei."</em>
          </p>
          <p>Ela entra devagar. Ele fecha a porta, trancando o perigo do lado de dentro.</p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>O Interrogatório</h2>
          <p>
            Ela para no centro da sala. Ele mantém a distância, preso por uma linha invisível de autodefesa.
            <em>"Fala, Broklin. Por que me chamou?"</em>
          </p>
          <p>
            Ele passa a mão pelo cabelo, a postura perfeita desmoronando.
            <em>"Porque eu tentei te tirar da cabeça. E não consegui. Porque você me desmonta."</em>
          </p>
          <p>
            <em>"E por que você queria me tirar?"</em><br>
            <em>"Porque quando você dança... eu queimo."</em>
          </p>
          <p>
            Kelma toca o queixo dele. O toque é frio, mas queima como ferro em brasa.
            Ela sussurra: <em>"Então queima."</em>
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>A Fusão do Sistema</h2>
          <p>
            A música começa a tocar na mente dele. A letra se torna diálogo real.
          </p>
          <p>
            <em>"Your data lingers in my cache..."</em> (Seus dados persistem no meu cache). <em>"Você ainda está aqui dentro. Toda noite."</em><br>
            <em>"Eu sei."</em><br>
            <em>"I delete you every midnight..."</em> (Eu tento te deletar toda meia-noite). <em>"Mas de manhã você volta e reescreve tudo."</em>
          </p>
          <p>
            Kelma sorri, aquele sorriso de quem venceu o algoritmo.
            <em>"Então para de deletar. Aceita o erro."</em>
          </p>
          <p>
            <em>"Sua corrupção tem gosto de verdade,"</em> ele confessa. <em>"Eu não sei se consigo ficar longe."</em><br>
            <em>"Não precisa."</em>
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>SYSTEM OVERRIDE: A Entrega</h2>
          <p>
            Broklin puxa a mão dela para o peito. O coração bate descompassado, uma batida de Trip-Hop quebrada e intensa.
          </p>
          <p>
            <em>"Se eu te der mais uma chance... Give me one more chance... você não vai me destruir?"</em><br>
            <em>"Não se eu puder te ter. Inteiro."</em>
          </p>
          <p>
            Ele desiste de lutar. Ele encosta a boca na dela. Um beijo lento, pesado, carregado de 48 horas de fome.
            Rouco, ele sussurra: <em>"Então... tá. Eu me rendo. Me dá uma chance também."</em>
          </p>
          <p>
            Kelma sorri contra os lábios dele.
            <em>"Eu te dou todas."</em>
          </p>
          <hr class="log-divider">
          <p class="log-footer">
            🔴 <strong>[FIM DO LOG]</strong> Ouvir "Give Me One More Chance" agora no Spotify.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e7',
    releaseDate: '2026-02-02',
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 7 — A Noite em que Ele Quebrou',
    mode: 'broklin',
    coverImage: 'images/ep7_night_break.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>A Queda das Defesas</h2>
          <p>
            O quarto de Broklin era iluminado apenas pela luz da cidade entrando pelas persianas — faixas de azul e púrpura atravessando o lençol, o colchão, a pele deles.
          </p>
          <p>
            Kelma estava deitada ao lado dele, os cabelos espalhados no travesseiro como se fossem parte da noite. Ela se sentia realizada por dentro, pois achava que ele ia tentar fraquejar. Ele olhou para ela e mordeu os lábios. Ela havia tocado no ponto fraco dele: <strong>o orgulho.</strong>
          </p>
          <p>
            Broklin apoiou o antebraço sobre ela, respirando fundo. Não havia mais máscaras. Não havia mais resistência. Só os dois, finalmente sem defesas.
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>O Primeiro Toque</h2>
          <p>
            Broklin deslizou os dedos pela cintura dela, devagar, como se tivesse esquecido como era tocar alguém assim… ou como se tivesse esperado tempo demais.
            Kelma sorriu, fechando os olhos e já imaginando um futuro com ele pela frente... sonhos, ideias, parcerias.
          </p>
          <p>
            <em>“Você tá tremendo, Broklin...”</em> ela sussurrou, provocante. <em>“Não se preocupe comigo... você está ao lado de uma grande mulher.”</em>
          </p>
          <p>
            Ele aproximou a boca da orelha dela.
            <em>“É culpa sua,”</em> a voz dele saiu rouca. <em>“Você me deixou… seco. Sem paz. Sem sono. Eu tô com abstinência de você, sua provocadora.”</em>
          </p>
          <p>
            Kelma abriu um sorriso lento, quase cruel de tão sensual.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>O Ritmo Acelera</h2>
          <p>
            Ela virou o rosto e encontrou os lábios dele — um beijo profundo, urgente, cheio de tudo que ambos seguraram por tempo demais.
            Broklin a puxou pela cintura, o corpo colando no dela. Kelma entrelaçou as pernas na dele, guiando o ritmo com pequenos toques, suspiros e sorrisos que o deixavam completamente desarmado.
          </p>
          <p>
            <em>“Então me toma,”</em> ela disse entre beijos. <em>“Eu vim pra isso.”</em>
          </p>
          <p>
            Broklin apertou a cintura dela mais forte, a respiração pesada.
            <em>“Não fala assim… Eu perco o controle.”</em>
          </p>
          <p>
            Kelma mordeu levemente o lábio dele.
            <em>“É pra perder mesmo.”</em>
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>Sussurros no Escuro</h2>
          <p>
            O lençol deslizou até o chão. Kelma o segurou pelo rosto, puxando-o para mais um beijo lento, marcado pela tensão acumulada.
            Ela sussurrou no ouvido dele, com voz macia e quente:
            <em>“Você sabe há quanto tempo eu queria isso?”</em>
          </p>
          <p>
            Broklin deslizou as mãos pelas costas dela, puxando-a mais para perto, como se tentasse eliminá-la do ar para dentro dele.
            <em>“Kelma… Eu tô com saudade do que nem aconteceu.. é uma saudade sintética.. Eu precisava sentir você.”</em>
          </p>
          <p>
            Ela riu baixinho — um riso curto, íntimo, feito só pra ele.
            <em>“Então sente, apesar que... sou de outro... Eu sou sua essa noite.”</em>
          </p>
          <p>
            Broklin fechou os olhos, respirando fundo como se fosse explodir.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>A Fusão dos Sistemas</h2>
          <p>
            Não houve mais espaço para o silêncio. O quarto, antes preenchido apenas pelo zumbido dos equipamentos em standby, agora vibrava com o som de duas respirações que tentavam encontrar o mesmo compasso.
          </p>
          <p>
            Broklin, que sempre calculava cada movimento com precisão milimétrica, esqueceu qualquer alarme. Suas mãos percorreram as costas de Kelma não como quem explora, mas como quem está conhecendo um território que nunca foi seu nesse momento. A pele dela queimava sob o toque dele, uma resposta física imediata que desarmava qualquer tentativa de lógica que ainda restasse na mente dele.
          </p>
          <p>
            <em>"Kelma.. não conta pra ninguém o que a gente tá fazendo agora! Principalmente ao Jonah!"</em> contou ele, sabendo que o que estava fazendo era algo... proibido. E como tudo que é proibido é mais gostoso, ele se entregou ao prazer.
          </p>
          <p>
            Os beijos não eram delicados. Eram urgentes, famintos, com o gosto de semanas de negação acumulada. Era o choque de duas forças opostas — a ordem dele tentando conter o caos dela, e o caos dela engolindo a ordem dele — até que não sobrasse nenhuma divisão.
          </p>
          <p>
            Eles se moviam juntos na penumbra, envoltos nas faixas de luz neon que entravam pela persiana, transformando a cama em um cenário quase cinematográfico. Cada toque era uma reivindicação. Cada arrepio compartilhado era um código sendo reescrito. Ali, na bagunça dos lençóis e na honestidade da entrega, Broklin entendeu que nunca houve barreira capaz de protegê-lo daquilo que, segundo ele, era secreto.
          </p>
          <p>
            Ele segurou a nuca dela, firmando-a contra o travesseiro, e encostou a testa na dela, ambos ofegantes, os corações batendo tão forte que pareciam um único kick de arpegiador.
          </p>
          <p>
            <em>"Kelma… você acabou comigo..."</em>
          </p>
          <p>
            Kelma segurou o rosto dele nas duas mãos, os olhos brilhando naquela escuridão elétrica, perigosos e triunfantes.
            <em>"Eu só comecei.. não se preocupe com ele.. eu sei de quem estas pensando preocupado, mas.. relaxa."</em>
          </p>
          <hr class="log-divider">
          <p class="log-footer">
            A noite engole a cena. As sombras dançam pelas paredes. E nada — absolutamente nada — entre eles continuou como antes.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e8',
    releaseDate: '2026-02-09', // Uma semana depois
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 8 — Silêncios e Verdades (The Aftermath)',
    mode: 'broklin',
    coverImage: 'images/ep8_aftermath.jpg', // Sugestão de nome de arquivo
    blocks: [
      {
        type: 'text',
        content: `
          <h2>A Calmaria (O Abraço)</h2>
          <p>
            A tempestade de neon lá fora parecia ter dado uma trégua. Dentro do apartamento, o ar ainda vibrava com a eletricidade estática do que tinha acabado de acontecer. Kelma estava aninhada nos braços de Broklin, os olhos fechados, um sorriso leve nos lábios. Pela primeira vez em anos, o Tech Lead não pensava em código ou prazos. Ele sentia a respiração dela contra o peito e pensava: <em>"Eu poderia viver nesse loop para sempre."</em>
          </p>
          <p>
            Broklin (sussurrando): <em>"Volto já… só um minuto. Vou no banheiro."</em> Ele saiu da cama com relutância, deixando o calor dela para trás.
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>O Espelho (A Realidade)</h2>
          <p>
            No banheiro, a luz fria do LED trouxe a realidade de volta. Broklin apoiou as mãos na pia, encarando seu reflexo. Ele viu um homem mudado. Marcado. Ele ligou a torneira. A água corria, mas não lavava a culpa — nem a euforia.
          </p>
          <p>
            Broklin (pensamento): <em>"Caramba… o que foi isso? Isso não estava no script. Eu acabei de hackear o relacionamento do meu sócio... e não consigo me arrepender."</em> Ele secou o rosto, respirou fundo para reiniciar o sistema e voltou para o quarto, pronto para abraçá-la de novo.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>O Vazio (O Fantasma)</h2>
          <p>
            Quando abriu a porta, o silêncio o atingiu como um soco físico. A cama estava vazia. O vestido preto não estava mais no chão. Os sapatos sumiram. Kelma havia executado o comando <code>EXIT</code> sem deixar rastros. Sem bilhete. Sem adeus. Apenas o perfume dela pairando no ar como um fantasma (Phantom Nostalgia).
          </p>
          <p>
            Broklin ficou parado na penumbra, sentindo o quarto ficar gelado. Ela tinha ido embora. Ela tinha voltado para a "vida real". Para Jonah.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>A Ligação (A Mentira)</h2>
          <p>
            [BZZT. BZZT.] O celular vibrou na mesa, o brilho azul iluminando a solidão dele. O nome na tela fez o estômago de Broklin revirar: <strong>JONAH</strong>.
          </p>
          <p class="chat-log">
            Jonah (Voz preocupada): <em>"Fala, mano… você sabe onde a Kelma tá? Ela tá demorando pra chegar…"</em><br>
            Broklin fechou os olhos. A mentira tinha gosto de cinzas na boca.<br>
            Broklin: <em>"Não... Ela saiu faz um tempo. Deve estar inspirada em algum canto, compondo. Você sabe como ela é."</em>
          </p>
          <p>Desligou. O silêncio voltou, agora mais pesado.</p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>A Dupla Vida (O Retorno)</h2>
          <p>
            Do outro lado da cidade, a porta se abriu. Kelma entrou, trazendo o frio da rua e o segredo na pele. Jonah estava lá, esperando, com aquele sorriso inocente e caótico dele.
          </p>
          <p class="chat-log">
            Kelma: <em>"Cheguei, amor ❤️. Peguei um trânsito danado..."</em><br>
            Jonah: <em>"Tava te esperando! Esquece o trânsito. Vem pra cama... eu quero você."</em>
          </p>
          <p>
            Ela sorriu, mas o sorriso não chegou aos olhos. Ela foi para a cama com Jonah. O corpo dele estava ali, quente e disponível. Mas quando ela fechou os olhos... ...era o toque calculado e intenso de Broklin que ela sentia.
          </p>
          <p>
            A mente dela estava no apartamento 14. O corpo estava no apartamento 01. E Kelma percebeu, com terror, que agora ela era um arquivo corrompido, fragmentado em dois servidores diferentes.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e9',
    releaseDate: '2026-02-16', // Uma semana depois
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 9 — Let the Mind Sigh (O Suspiro da Mente)',
    mode: 'broklin',
    coverImage: 'images/ep9_mind_sigh.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>A Cena</h2>
          <p>
            A madrugada avançava lá fora, mas dentro do apartamento 14, o tempo estava congelado. Broklin estava de pé no centro da sala, imóvel. A quietude do ambiente era agressiva. Não havia o som da respiração dela. Não havia o calor do corpo dela. A única prova de que Kelma estivera ali era a ausência brutal que ela deixou para trás.
          </p>
          <p>
            Ele levou as mãos à nuca, os dedos se entrelaçando nos cabelos em um gesto de frustração contida. Sua mente, treinada para resolver equações complexas e masterizar frequências de áudio, agora rodava em um loop infinito que ele não conseguia fechar.
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>O Fluxo Mental</h2>
          <p>
            A letra da música começou a tocar dentro de sua cabeça, não como melodia, mas como diagnóstico: <em>"There’s a current of love in the air… That moves my blood… That moves my mind…"</em>
          </p>
          <p>
            Ele sentia. Era físico. Uma corrente elétrica que não vinha da tomada, mas da memória da pele dela contra a dele. Ele queria gritar. Um grito mudo, travado na garganta: <strong>AH-AH-AH-AH!</strong> Mas o Tech Lead não grita. Ele processa.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>A Luta Contra o Desejo</h2>
          <p>
            Ele caminhou até a janela, olhando para a cidade de néon que parecia indiferente à sua dor. <em>"Oh-oh-oh I don’t want pain… I want love…"</em> Ele mordeu o lábio, sentindo o gosto metálico da verdade. Ele não queria ser o "outro". Ele não queria a clandestinidade. Ele queria ela. Simples assim. Complexo assim.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>A Alucinação Lógica</h2>
          <p>
            Ele encostou a testa no vidro frio. <em>"This mind is so crazy… It imagines things, perceives what it doesn’t see…"</em> Por um milésimo de segundo, o reflexo no vidro parecia o dela. A mente dele estava projetando hologramas de esperança onde só existia solidão.
          </p>
          <p>
            <em>"Será que ela se arrependeu?"</em> a dúvida sussurrou. <em>"Será que eu fui apenas um erro de compilação na noite dela?"</em>
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>A Aceitação da Falha</h2>
          <p>
            Mas então, veio a resignação. A aceitação de que a lógica tinha perdido a guerra. <em>"Crazy thoughts full of evil… But that gives me freedom to have you…"</em> Pensamentos perigosos. Pensamentos egoístas. O desejo de que ela largasse tudo — largasse Jonah, largasse a segurança — e viesse para o caos silencioso dele.
          </p>
          <p>
            Broklin se afastou da janela e se jogou no sofá, o corpo pesado, o processador superaquecido de tanto pensar. Ele olhou para o teto escuro, rendido. Não havia código para consertar isso.
          </p>
          <p>
            Broklin (sussurrando para o vazio): <em>"…let the mind sigh."</em>
          </p>
          <hr class="log-divider">
          <p class="log-footer">
            A mente suspirou. E doeu.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e10',
    releaseDate: '2026-02-23', // Uma semana depois
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A QUEDA',
    title: 'Episódio 10 — Ashes on Me (A Queda)',
    mode: 'broklin',
    coverImage: 'images/ep10_ashes_fall.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>O Homem de Cinzas</h2>
          <p>
            Broklin estava sentado no sofá, paralisado. O suor frio da noite anterior já havia secado, mas o perfume dela continuava impregnado no ar — e pior, na sua consciência. Ele olhava para as próprias mãos e sentia que elas não lhe pertenciam mais. Ele era um sistema corrompido, rodando em modo de segurança, prestes a colapsar.
          </p>
          <p>
            Foi nesse silêncio ensurdecedor, quebrado apenas pelo som da chuva distópica lá fora, que a memória voltou para mordê-lo. Não a memória da noite passada... mas a memória de duas semanas atrás. A primeira linha de código desse desastre.
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>FLASHBACK: O Aviso no Estúdio</h2>
          <p>
            O estúdio cheirava a café e cabos aquecidos. Broklin estava afinando a guitarra, focado nas frequências, quando Jonah entrou. Ele estava elétrico, sorrindo, com aquela energia caótica que iluminava o lugar.
          </p>
          <p>
            <em>"Brooo! Adivinha?"</em> Jonah gritou, girando a cadeira. <em>"A Kelma quer você pra gravar 'If I Were You'. Ela disse que só você tem a vibe shoegaze certa."</em>
          </p>
          <p>
            Broklin sentiu uma pontada de orgulho. Ser escolhido pela "Musa" era um elogio técnico. Mas então, a atmosfera mudou. O sorriso de Jonah travou. Ele se aproximou, invadindo o espaço pessoal de Broklin com uma seriedade rara.
          </p>
          <p>
            <em>"Mas deixa eu te avisar uma coisa, mano..."</em> Jonah baixou o tom de voz. <em>"Vê se fica longe da minha namorada, ok? E se ela se insinuar... <strong>não ceda.</strong>"</em>
          </p>
          <p>
            O ar ficou pesado. <em>"Você corre o risco de se apaixonar por ela,"</em> Jonah continuou, os olhos fixos nos de Broklin. <em>"A Kelma tem uma beleza ímpar. E você sabe disso."</em>
          </p>
          <p>
            Naquele dia, Broklin riu. Ele vestiu sua armadura de "homem honrado". <em>"Calma, rapaz. Sou um homem de respeito,"</em> ele mentiu, sem saber que estava mentindo. <em>"Não costumo pegar a namorada dos outros. Vamos só gravar a música."</em>
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>DE VOLTA AO PRESENTE: A Mente em Cinzas</h2>
          <p>
            Agora, sentado no escuro, aquela risada de duas semanas atrás ecoava como um escárnio. A letra da música <em>Ashes on Me</em> começou a tocar na sua mente, descrevendo exatamente o que ele tinha se tornado.
          </p>
          <p>
            <em>"I wake in shards, My name won't respond to me..."</em> (Acordo em cacos, meu nome não me responde...) Sim. Ele estava fragmentado. O "Broklin Honrado" morreu na noite passada. O que sobrou foi esse estranho no espelho.
          </p>
          <p>
            <em>"The mirror throws a stranger, With my eyes but not my core."</em> (O espelho devolve um estranho, com meus olhos, mas sem meu núcleo.) Ele passou a mão pelo rosto cansado. Onde estava o núcleo dele? Onde estava a lealdade ao sócio? Queimada. Virou cinza.
          </p>
          <p>
            <em>"Clocks chew up my time, Each hour's a sharpened tooth."</em> (Relógios mastigam meu tempo, cada hora é um dente afiado.) O relógio digital piscava 09:46. Cada minuto que passava era uma prova do crime. Ele tinha prometido não ceder. Ele tinha dado sua palavra.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>O Fim da Temporada</h2>
          <p>
            Broklin se levantou e foi até a janela. A cidade lá fora parecia cinza e hostil, exatamente como ele se sentia por dentro. A pergunta final da música martelava sua cabeça:
          </p>
          <p>
            <em>"How many me's fit in this hole? How many lives until it's whole?"</em> (Quantos 'eus' cabem nesse buraco? Quantas vidas até ficar inteiro?)
          </p>
          <p>
            Ele sabia a resposta. Ele teria que matar sua versão antiga para viver esse erro. A lembrança de Jonah dizendo "Não ceda" queimava mais forte que qualquer beijo de Kelma. Mas já era tarde demais para backups ou restaurações de sistema.
          </p>
          <p>
            Broklin fechou os olhos, soltou o ar dos pulmões e sussurrou para o vazio, admitindo a derrota final:
          </p>
          <p>
            Broklin: <em>"Eu já cedi."</em>
          </p>
          <hr class="log-divider">
          <p class="log-footer">
            ⬛ <strong>[FIM DA TEMPORADA 1]</strong> System Shutdown.
          </p>
        `
      }
    ]
  },
];

// ☢️ --- ARCO JONAH (PT) ---
export const JONAH_ARC_PT: LoreEpisode[] = [
  {
    id: 'j1-e1',
    releaseDate: '2025-12-22',
    published: true,
    season: 1,
    seasonTitle: 'TEMPORADA 1 — A REVOLTA',
    title: 'Episódio 1 — O Ruído no Sistema',
    mode: 'jonah',
    coverImage: 'assets/disco/industrial_archive.png',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>A Descoberta do Glitch</h2>
          <p>
            Enquanto Broklin brincava de poeta gótico no beco, Jonah estava no estúdio, cercado por cabos desencapados e monitores piscando em vermelho.
            Ele não precisava de vinho ou poesia. Ele precisava de <strong>distorção</strong>.
          </p>
          <p>
            <em>"Eles acham que o código é limpo,"</em> Jonah murmurou para o amplificador valvulado que zumbia como um animal ferido.
            <em>"Mas eu ouço o erro. Eu sou o erro."</em>
          </p>
          <p>
            Naquela noite, ele não compôs uma música. Ele declarou guerra à perfeição.
          </p>
        `
      }
    ]
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
    mode: 'broklin',
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
    mode: 'broklin',
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
    mode: 'broklin',
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
    mode: 'broklin',
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
    mode: 'broklin',
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
  {
    id: 's1-e6',
    releaseDate: '2026-01-26',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 6 — The Surrender (Give Me One More Chance)',
    mode: 'broklin',
    coverImage: 'images/ep6_surrender_dark.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>LOG: 19:47 PM // Deafening Silence</h2>
          <p>
            The silence on the 14th floor is deafening. It's been 48 hours since Broklin tried to rewrite his own code. Two days fighting the memory of a perfume that hacked his system. He tried to focus on mixing, logic, order. <strong>He failed.</strong>
          </p>
          <p>
            The phone vibrates in his hand—or is it the tremor in his own fingers? He types, deletes, types again. Logic screams to stop, but need presses 'Send'.
          </p>
          <p class="chat-log">
            Broklin: <em>"Can you come over tonight?"</em><br>
            The answer takes three eternal seconds.<br>
            Kelma: <em>"Sure. 💜"</em>
          </p>
          <p>Broklin exhales. The firewall is down.</p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>The Arrival</h2>
          <p>
            When she enters, the air changes. The temperature rises and falls at the same time. She didn't dress for a visit; <strong>she dressed for an execution.</strong> Her gaze is predatory, but there is a soft smile on her lips.
          </p>
          <p>
            <em>"You look tired, Tech Lead,"</em> she notes.<br>
            <em>"Haven't been able to enter sleep mode since... you know,"</em> he admits.<br>
            <em>"I know."</em>
          </p>
          <p>She walks in slowly. He closes the door, locking the danger inside.</p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>The Interrogation</h2>
          <p>
            She stops in the center of the room. He keeps his distance, held back by an invisible line of self-defense.
            <em>"Speak, Broklin. Why did you call me?"</em>
          </p>
          <p>
            He runs a hand through his hair, his perfect posture crumbling.
            <em>"Because I tried to get you out of my head. And I couldn't. Because you dismantle me."</em>
          </p>
          <p>
            <em>"And why did you want to get me out?"</em><br>
            <em>"Because when you dance... I burn."</em>
          </p>
          <p>
            Kelma touches his chin. The touch is cold, but burns like a branding iron.
            She whispers: <em>"Then burn."</em>
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>System Fusion</h2>
          <p>
            The music starts playing in his mind. The lyrics become real dialogue.
          </p>
          <p>
            <em>"Your data lingers in my cache..."</em> <em>"You are still in here. Every night."</em><br>
            <em>"I know."</em><br>
            <em>"I delete you every midnight..."</em> <em>"But in the morning you come back and rewrite everything."</em>
          </p>
          <p>
            Kelma smiles, that smile of someone who beat the algorithm.
            <em>"Then stop deleting. Accept the error."</em>
          </p>
          <p>
            <em>"Your corruption tastes like truth,"</em> he confesses. <em>"I don't know if I can stay away."</em><br>
            <em>"You don't have to."</em>
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>SYSTEM OVERRIDE: The Surrender</h2>
          <p>
            Broklin pulls her hand to his chest. His heart beats erratically, a broken and intense Trip-Hop beat.
          </p>
          <p>
            <em>"If I give you one more chance... Give me one more chance... you won't destroy me?"</em><br>
            <em>"Not if I can have you. Whole."</em>
          </p>
          <p>
            He gives up fighting. He leans his mouth against hers. A slow, heavy kiss, loaded with 48 hours of hunger.
            Hoarsely, he whispers: <em>"So... okay. I surrender. Give me a chance too."</em>
          </p>
          <p>
            Kelma smiles against his lips.
            <em>"I give you all of them."</em>
          </p>
          <hr class="log-divider">
          <p class="log-footer">
            🔴 <strong>[END OF LOG]</strong> Listen to "Give Me One More Chance" now on Spotify.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e7',
    releaseDate: '2026-02-02',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 7 — The Night He Broke',
    mode: 'broklin',
    coverImage: 'images/ep7_night_break.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>Defenses Down</h2>
          <p>
            Broklin's room was lit only by the city light filtering through the blinds—stripes of blue and purple crossing the sheet, the mattress, their skin.
          </p>
          <p>
            Kelma lay beside him, her hair spread on the pillow as if it were part of the night. She felt fulfilled inside; she thought he would try to waver. He looked at her and bit his lip. She had touched his weak point: <strong>his pride.</strong>
          </p>
          <p>
            Broklin rested his forearm on her, breathing deeply. No more masks. No more resistance. Just the two of them, finally defenseless.
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>The First Touch</h2>
          <p>
            Broklin slid his fingers along her waist, slowly, as if he had forgotten what it was like to touch someone like this... or as if he had waited too long.
            Kelma smiled, closing her eyes, already imagining a future with him ahead... dreams, ideas, partnerships.
          </p>
          <p>
            <em>“You're trembling, Broklin...”</em> she whispered, teasingly. <em>“Don't worry about me... you are next to a great woman.”</em>
          </p>
          <p>
            He brought his mouth close to her ear.
            <em>“It's your fault,”</em> his voice came out hoarse. <em>“You left me... dry. No peace. No sleep. I'm in withdrawal from you, you tease.”</em>
          </p>
          <p>
            Kelma opened a slow smile, almost cruel in its sensuality.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>The Rhythm Accelerates</h2>
          <p>
            She turned her face and met his lips—a deep, urgent kiss, full of everything both had held back for too long.
            Broklin pulled her by the waist, body gluing to hers. Kelma intertwined her legs with his, guiding the rhythm with small touches, sighs, and smiles that left him completely disarmed.
          </p>
          <p>
            <em>“Then take me,”</em> she said between kisses. <em>“That's what I came for.”</em>
          </p>
          <p>
            Broklin tightened his grip on her waist, breathing heavily.
            <em>“Don't talk like that... I lose control.”</em>
          </p>
          <p>
            Kelma lightly bit his lip.
            <em>“You're supposed to lose it.”</em>
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>Whispers in the Dark</h2>
          <p>
            The sheet slid to the floor. Kelma held his face, pulling him into another slow kiss, marked by accumulated tension.
            She whispered in his ear, her voice soft and hot:
            <em>“Do you know how long I've wanted this?”</em>
          </p>
          <p>
            Broklin slid his hands down her back, pulling her closer, as if trying to eliminate her from the air and absorb her into him.
            <em>“Kelma… I miss what hasn't even happened... it's a synthetic longing... I needed to feel you.”</em>
          </p>
          <p>
            She laughed softly—a short, intimate laugh, made just for him.
            <em>“Then feel, even though... I belong to another... I am yours tonight.”</em>
          </p>
          <p>
            Broklin closed his eyes, breathing deeply as if he were about to explode.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>System Fusion</h2>
          <p>
            There was no more room for silence. The room, previously filled only by the hum of equipment on standby, now vibrated with the sound of two breaths trying to find the same rhythm.
          </p>
          <p>
            Broklin, who always calculated every move with millimeter precision, forgot any alarm. His hands roamed Kelma's back not as someone exploring, but as someone discovering a territory that was never his in this moment. Her skin burned under his touch, an immediate physical response that disarmed any attempt at logic remaining in his mind.
          </p>
          <p>
            <em>"Kelma.. don't tell anyone what we're doing right now! Especially Jonah!"</em> he said, knowing that what he was doing was something... forbidden. And since everything forbidden tastes better, he surrendered to the pleasure.
          </p>
          <p>
            The kisses weren't delicate. They were urgent, hungry, with the taste of weeks of accumulated denial. It was the clash of two opposing forces—his order trying to contain her chaos, and her chaos swallowing his order—until no division remained.
          </p>
          <p>
            They moved together in the gloom, wrapped in the bands of neon light entering through the blinds, transforming the bed into an almost cinematic setting. Every touch was a claim. Every shared shiver was code being rewritten. There, in the mess of the sheets and the honesty of surrender, Broklin understood that there was never a barrier capable of protecting him from that which, according to him, was secret.
          </p>
          <p>
            He held the nape of her neck, steadying her against the pillow, and rested his forehead against hers, both panting, hearts beating so hard they sounded like a single arpeggiator kick.
          </p>
          <p>
            <em>"Kelma… you wrecked me..."</em>
          </p>
          <p>
            Kelma held his face in both hands, eyes shining in that electric darkness, dangerous and triumphant.
            <em>"I've only just begun... don't worry about him... I know who you're worried thinking about, but... relax."</em>
          </p>
          <hr class="log-divider">
          <p class="log-footer">
            The night swallows the scene. Shadows dance along the walls. And nothing—absolutely nothing—between them remained the same.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e8',
    releaseDate: '2026-02-09',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 8 — Silences and Truths (The Aftermath)',
    mode: 'broklin',
    coverImage: 'images/ep8_aftermath.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>The Calm (The Embrace)</h2>
          <p>
            The neon storm outside seemed to have paused. Inside the apartment, the air still vibrated with the static electricity of what had just happened. Kelma was nestled in Broklin's arms, eyes closed, a slight smile on her lips. For the first time in years, the Tech Lead wasn't thinking about code or deadlines. He felt her breath against his chest and thought: <em>"I could live in this loop forever."</em>
          </p>
          <p>
            Broklin (whispering): <em>"Be right back... just a minute. Going to the bathroom."</em> He reluctantly left the bed, leaving her warmth behind.
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>The Mirror (The Reality)</h2>
          <p>
            In the bathroom, the cold LED light brought reality back. Broklin leaned his hands on the sink, staring at his reflection. He saw a changed man. Marked. He turned on the faucet. The water ran, but it didn't wash away the guilt — nor the euphoria.
          </p>
          <p>
            Broklin (thought): <em>"Damn... what was that? This wasn't in the script. I just hacked my partner's relationship... and I can't regret it."</em> He dried his face, took a deep breath to reboot the system, and returned to the room, ready to embrace her again.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>The Void (The Ghost)</h2>
          <p>
            When he opened the door, silence hit him like a physical punch. The bed was empty. The black dress was no longer on the floor. Her shoes were gone. Kelma had executed the <code>EXIT</code> command without a trace. No note. No goodbye. Only her perfume lingering in the air like a ghost (Phantom Nostalgia).
          </p>
          <p>
            Broklin stood in the dim light, feeling the room grow cold. She was gone. She had returned to "real life." To Jonah.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>The Call (The Lie)</h2>
          <p>
            [BZZT. BZZT.] His phone vibrated on the table, its blue glow illuminating his solitude. The name on the screen made Broklin's stomach churn: <strong>JONAH</strong>.
          </p>
          <p class="chat-log">
            Jonah (Worried voice): <em>"Hey, man... do you know where Kelma is? She's taking a while to get here..."</em><br>
            Broklin closed his eyes. The lie tasted like ashes in his mouth.<br>
            Broklin: <em>"No... She left a while ago. She must be inspired somewhere, composing. You know how she is."</em>
          </p>
          <p>He hung up. The silence returned, now heavier.</p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>The Double Life (The Return)</h2>
          <p>
            On the other side of the city, the door opened. Kelma entered, bringing the cold of the street and the secret on her skin. Jonah was there, waiting, with his innocent and chaotic smile.
          </p>
          <p class="chat-log">
            Kelma: <em>"I'm here, love ❤️. Got stuck in terrible traffic..."</em><br>
            Jonah: <em>"I was waiting for you! Forget the traffic. Come to bed... I want you."</em>
          </p>
          <p>
            She smiled, but the smile didn't reach her eyes. She went to bed with Jonah. His body was there, warm and available. But when she closed her eyes... ...it was Broklin's calculated and intense touch she felt.
          </p>
          <p>
            Her mind was in apartment 14. Her body was in apartment 01. And Kelma realized, with terror, that she was now a corrupted file, fragmented across two different servers.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e9',
    releaseDate: '2026-02-16',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 9 — Let the Mind Sigh',
    mode: 'broklin',
    coverImage: 'images/ep9_mind_sigh.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>The Scene</h2>
          <p>
            Dawn was advancing outside, but inside apartment 14, time was frozen. Broklin stood in the center of the room, motionless. The stillness of the environment was aggressive. There was no sound of her breathing. There was no warmth from her body. The only proof that Kelma had been there was the brutal absence she left behind.
          </p>
          <p>
            He brought his hands to the nape of his neck, fingers interlacing in his hair in a gesture of contained frustration. His mind, trained to solve complex equations and master audio frequencies, was now running in an infinite loop he couldn't close.
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>Mental Flow</h2>
          <p>
            The song lyrics began to play inside his head, not as a melody, but as a diagnosis: <em>"There’s a current of love in the air… That moves my blood… That moves my mind…"</em>
          </p>
          <p>
            He felt it. It was physical. An electric current that didn't come from the outlet, but from the memory of her skin against his. He wanted to scream. A silent scream, stuck in his throat: <strong>AH-AH-AH-AH!</strong> But the Tech Lead doesn't scream. He processes.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>The Fight Against Desire</h2>
          <p>
            He walked to the window, looking at the neon city that seemed indifferent to his pain. <em>"Oh-oh-oh I don’t want pain… I want love…"</em> He bit his lip, tasting the metallic flavor of truth. He didn't want to be the "other." He didn't want clandestinity. He wanted her. Simple as that. Complex as that.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>Logical Hallucination</h2>
          <p>
            He rested his forehead against the cold glass. <em>"This mind is so crazy… It imagines things, perceives what it doesn’t see…"</em> For a millisecond, the reflection in the glass looked like hers. His mind was projecting holograms of hope where only loneliness existed.
          </p>
          <p>
            <em>"Did she regret it?"</em> doubt whispered. <em>"Was I just a compilation error in her night?"</em>
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>Acceptance of Failure</h2>
          <p>
            But then came resignation. The acceptance that logic had lost the war. <em>"Crazy thoughts full of evil… But that gives me freedom to have you…"</em> Dangerous thoughts. Selfish thoughts. The desire for her to drop everything—drop Jonah, drop safety—and come to his silent chaos.
          </p>
          <p>
            Broklin moved away from the window and threw himself onto the sofa, his body heavy, processor overheated from thinking so much. He looked at the dark ceiling, surrendered. There was no code to fix this.
          </p>
          <p>
            Broklin (whispering to the void): <em>"…let the mind sigh."</em>
          </p>
          <hr class="log-divider">
          <p class="log-footer">
            The mind sighed. And it hurt.
          </p>
        `
      }
    ]
  },
  {
    id: 's1-e10',
    releaseDate: '2026-02-23',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE FALL',
    title: 'Episode 10 — Ashes on Me (The Fall)',
    mode: 'broklin',
    coverImage: 'images/ep10_ashes_fall.jpg',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>The Man of Ashes</h2>
          <p>
            Broklin sat on the sofa, paralyzed. The cold sweat from the night before had dried, but her perfume still lingered in the air—and worse, in his conscience. He looked at his own hands and felt they no longer belonged to him. He was a corrupted system, running in safe mode, about to collapse.
          </p>
          <p>
            It was in this deafening silence, broken only by the sound of dystopian rain outside, that the memory came back to bite him. Not the memory of last night... but the memory of two weeks ago. The first line of code of this disaster.
          </p>
        `
      },
      { type: 'ad', content: '' },
      {
        type: 'text',
        content: `
          <h2>FLASHBACK: The Warning in the Studio</h2>
          <p>
            The studio smelled of coffee and heated cables. Broklin was tuning his guitar, focused on frequencies, when Jonah walked in. He was electric, smiling, with that chaotic energy that lit up the place.
          </p>
          <p>
            <em>"Brooo! Guess what?"</em> Jonah shouted, spinning the chair. <em>"Kelma wants you to record 'If I Were You'. She said only you have the right shoegaze vibe."</em>
          </p>
          <p>
            Broklin felt a pang of pride. Being chosen by the "Muse" was a technical compliment. But then, the atmosphere changed. Jonah's smile froze. He stepped closer, invading Broklin's personal space with rare seriousness.
          </p>
          <p>
            <em>"But let me tell you one thing, bro..."</em> Jonah lowered his voice. <em>"Make sure you stay away from my girlfriend, okay? And if she makes a move... <strong>don't give in.</strong>"</em>
          </p>
          <p>
            The air grew heavy. <em>"You run the risk of falling in love with her,"</em> Jonah continued, eyes fixed on Broklin's. <em>"Kelma has a unique beauty. And you know it."</em>
          </p>
          <p>
            That day, Broklin laughed. He put on his "honorable man" armor. <em>"Relax, man. I'm a respectful guy,"</em> he lied, without knowing he was lying. <em>"I don't usually go after other people's girlfriends. Let's just record the song."</em>
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>BACK TO THE PRESENT: Mind in Ashes</h2>
          <p>
            Now, sitting in the dark, that laugh from two weeks ago echoed like mockery. The lyrics of the song <em>Ashes on Me</em> began to play in his mind, describing exactly what he had become.
          </p>
          <p>
            <em>"I wake in shards, My name won't respond to me..."</em> Yes. He was fragmented. The "Honorable Broklin" died last night. What was left was this stranger in the mirror.
          </p>
          <p>
            <em>"The mirror throws a stranger, With my eyes but not my core."</em> He ran a hand over his tired face. Where was his core? Where was the loyalty to his partner? Burned. Turned to ash.
          </p>
          <p>
            <em>"Clocks chew up my time, Each hour's a sharpened tooth."</em> The digital clock blinked 09:46. Every passing minute was proof of the crime. He had promised not to give in. He had given his word.
          </p>
        `
      },
      {
        type: 'text',
        content: `
          <h2>The Season Finale</h2>
          <p>
            Broklin stood up and went to the window. The city outside looked gray and hostile, exactly how he felt inside. The final question of the song hammered in his head:
          </p>
          <p>
            <em>"How many me's fit in this hole? How many lives until it's whole?"</em>
          </p>
          <p>
            He knew the answer. He would have to kill his old version to live this mistake. The memory of Jonah saying "Don't give in" burned stronger than any kiss from Kelma. But it was already too late for backups or system restores.
          </p>
          <p>
            Broklin closed his eyes, exhaled the air from his lungs, and whispered to the void, admitting final defeat:
          </p>
          <p>
            Broklin: <em>"I already gave in."</em>
          </p>
          <hr class="log-divider">
          <p class="log-footer">
            ⬛ <strong>[END OF SEASON 1]</strong> System Shutdown.
          </p>
        `
      }
    ]
  },
];

// ☢️ --- JONAH ARC (EN) ---
export const JONAH_ARC_EN: LoreEpisode[] = [
  {
    id: 'j1-e1',
    releaseDate: '2025-12-22',
    published: true,
    season: 1,
    seasonTitle: 'SEASON 1 — THE UPRISING',
    title: 'Episode 1 — The Noise in the System',
    mode: 'jonah',
    coverImage: 'assets/disco/industrial_archive.png',
    blocks: [
      {
        type: 'text',
        content: `
          <h2>The Glitch Discovery</h2>
          <p>
            While Broklin played gothic poet in the alley, Jonah was in the studio, surrounded by exposed wires and monitors blinking red.
            He didn't need wine or poetry. He needed <strong>distortion</strong>.
          </p>
          <p>
            <em>"They think the code is clean,"</em> Jonah muttered to the tube amp that buzzed like a wounded animal.
            <em>"But I hear the error. I am the error."</em>
          </p>
          <p>
            That night, he didn't compose a song. He declared war on perfection.
          </p>
        `
      }
    ]
  }
];
