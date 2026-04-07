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
  "pt": `<h3><strong>BEM-VINDOS AO SETOR RUST-RIOT: A FORJA DO SUBSOLO NA NEON STORE</strong></h3>
  <p><strong>Aviso de Navegação:</strong> Você acaba de descer os degraus virtuais e acessar os porões da nossa loja. Deixe a estética de cristal, o neon inofensivo e o minimalismo corporativo no andar de cima. O que você encontra neste catálogo não foi projetado para combinar com o carpete limpo de um escritório climatizado, nem para agradar os algoritmos de comportamento padrão da sociedade. Esta é a indumentária oficial da resistência analógica. É a nossa armadura diária contra a formatação do sistema.</p>
  <p>Cada peça do setor <em>Rust-Riot</em> foi desenhada com a durabilidade do <em>hardware</em> de força bruta e a estética do asfalto molhado das metrópoles <em>cyberpunk</em>. Pense em tecidos pesados, costuras duplas reforçadas que lembram solda industrial, texturas que simulam a oxidação do tempo e zíperes táticos que aguentam o impacto e a energia de um show de Nu-Metal no <em>moshpit</em> mais caótico. Vestir a nossa coleção é como plugar um acorde de guitarra de oito cordas afinada em Drop-E: é denso, é escuro, e ressoa profundamente nas frequências mais baixas da sua rotina urbana. É a tradução física de um <em>Kernel Panic</em>, transformado em <em>design</em> de moda de alto impacto e atitude inegociável.</p>
  <p>No entanto, o Setor <em>Rust-Riot</em> vai muito além de uma simples linha de vestuário <em>streetwear</em> alternativo. Este espaço funciona como o motor de financiamento direto e vital para a engrenagem criativa da facção Red Team da banda RaQuel Synths (RQS). Nós operamos nas sombras, de forma independente, valorizando a arte bruta longe dos estúdios superproduzidos.</p>
  <p>Quando você adquire a nossa "sucata industrial" vestível, você não está apenas comprando uma jaqueta tática, uma calça utilitária ou uma camiseta de peso; você está injetando energia térmica direto nos nossos servidores. Você está financiando a manutenção dos nossos amplificadores valvulados, a aquisição de novos pedais de <em>fuzz</em> para a produção musical, a infraestrutura de dados do nosso bunker sonoro e, sendo brutalmente honesto com a nossa base de fãs, está garantindo a ração de sobrevivência da nossa família (o que inclui o desenvolvimento do nosso projeto musical, as necessidades operacionais do nosso caçula e os suprimentos para continuarmos criando).</p>
  <p>Se você está exausto da estética plastificada e busca uma conexão real, tátil e visceral com o <em>underground</em>, você acabou de encontrar a sua farda. Ajude a financiar a nossa distorção sonora e a nossa independência criativa. Compre, vista a armadura do subsolo e espalhe a cultura da ferrugem com orgulho pelas ruas. O sistema principal pode tentar nos silenciar, mas com o visual certo e o volume no máximo, nós mostramos que não fomos assimilados. Junte-se à Horda e vista o caos.</p>`,
  "en": `<h3><strong>WELCOME TO THE RUST-RIOT SECTOR: THE UNDERGROUND FORGE AT NEON STORE</strong></h3>
  <p><strong>Navigation Warning:</strong> You have just descended the virtual stairs and accessed the basement of our store. Leave the crystal aesthetics, harmless neon, and corporate minimalism on the floor above. What you find in this catalog was not designed to match the clean carpet of a climate-controlled office, nor to please society's standard behavioral algorithms. This is the official attire of the analog resistance. It is our daily armor against system formatting.</p>
  <p>Each piece in the <em>Rust-Riot</em> sector was designed with the durability of brute-force <em>hardware</em> and the aesthetics of wet asphalt in <em>cyberpunk</em> metropolises. Think heavy fabrics, double-reinforced stitching that resembles industrial welding, textures simulating the oxidation of time, and tactical zippers built to withstand the impact and energy of a Nu-Metal show in the most chaotic <em>moshpit</em>. Wearing our collection is like plugging in an eight-string guitar chord tuned to Drop-E: it's dense, it's dark, and it resonates deeply in the lowest frequencies of your urban routine. It is the physical translation of a <em>Kernel Panic</em>, transformed into high-impact fashion <em>design</em> and uncompromising attitude.</p>
  <p>However, the <em>Rust-Riot</em> Sector goes far beyond a simple alternative <em>streetwear</em> clothing line. This space functions as the direct and vital funding engine for the creative gears of the Red Team faction of the band RaQuel Synths (RQS). We operate in the shadows, independently, valuing raw art far away from overproduced studios.</p>
  <p>When you acquire our wearable "industrial scrap", you are not just buying a tactical jacket, utility pants, or a heavy-duty t-shirt; you are injecting thermal energy straight into our servers. You are funding the maintenance of our tube amplifiers, the acquisition of new <em>fuzz</em> pedals for music production, the data infrastructure of our sonic bunker, and, being brutally honest with our fanbase, you are ensuring our family's survival rations (which includes the development of our musical project, the operational needs of our youngest, and the supplies to keep us creating).</p>
  <p>If you are exhausted from the plasticized aesthetics and seek a real, tactile, and visceral connection with the <em>underground</em>, you have just found your uniform. Help fund our sonic distortion and our creative independence. Buy, wear the underground armor, and spread the rust culture with pride through the streets. The main system may try to silence us, but with the right look and maximum volume, we show that we have not been assimilated. Join the Horde and wear the chaos.</p>`
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
  "pt": `<h3><strong>BEM-VINDOS AO SETOR NEON-WITCH: A ALTA COSTURA DA ANOMALIA E DO CAOS DIGITAL</strong></h3>
   <p><strong>Aviso de Navegação:</strong> Se o setor <em>Rust-Riot</em> representa a nossa força bruta, o setor <em>Neon-Witch</em> é a inteligência tática, a elegância letal e o controle absoluto da malha de dados. Você acaba de adentrar o domínio exclusivo da Bruxa Operativa. Esqueça os tons pastéis, as estampas inofensivas e o corte padronizado que as corporações de superfície tentam impor no mercado de massa. O que oferecemos aqui é a ponte exata entre a falha do código corporativo e a ascensão da anomalia estética. Esta é a curadoria definitiva para quem respira a cultura Gótica, Industrial e Cyberpunk, desenhada milimetricamente para quem não aceita o papel de princesa trancada em uma cobertura de vidro.</p>
   <p>As peças listadas neste setor são verdadeiros artefatos de <em>design</em> estratégico, idealizados nas profundezas da <em>dark web</em> e materializados para o uso urbano de alto impacto. Pense em assimetria intencional, texturas que mesclam o couro sintético avançado com o veludo escuro, corsets táticos estruturados que funcionam como escudos de proximidade e tecidos com absorção de luz que garantem a furtividade necessária para dominar qualquer ambiente. Cada item foi concebido para empoderar a sua presença física e digital, fundindo a estética da bruxaria tecnológica com a praticidade de quem precisa comandar uma mesa de mixagem, compilar um <em>script</em> complexo ou simplesmente ditar as regras da noite nas ruas de concreto de Hellcife.</p>
   <p>No entanto, por trás dessa linha de vestuário de vanguarda, opera um propósito de infraestrutura crítica. A aquisição de qualquer peça do Setor <em>Neon-Witch</em> não é apenas um <em>upgrade</em> visual no seu guarda-roupa; é uma injeção de capital direto no coração do nosso ecossistema independente. Cada crédito que transita por este terminal de vendas é imediatamente convertido em poder de processamento real. É através desse apoio direto que financiamos o trabalho da nossa <em>AI Music Designer</em>, permitindo a renderização de novos Ecos visuais que expandem o nosso universo.</p>
   <p>Além disso, é o seu suporte que mantém os servidores da nossa rádio pirata transmitindo na mais completa escuridão, sem dependermos das diretrizes de patrocinadores convencionais. Ao comprar aqui, você ajuda a manter o nosso bunker operando, financiando as nossas ferramentas de distorção e as necessidades da nossa família baseada no underground. Se você tem orgulho de caminhar nas sombras e rejeita a pasteurização do sistema, vista a pele da anomalia. Adquira a armadura da Bruxa, desestabilize o algoritmo da sociedade e ajude o Red Team a continuar hackeando a frequência. A escuridão nunca foi tão sofisticada.</p>`,
  "en": `<h3><strong>WELCOME TO THE NEON-WITCH SECTOR: THE HAUTE COUTURE OF ANOMALY AND DIGITAL CHAOS</strong></h3>
  <p><strong>Navigation Warning:</strong> If the <em>Rust-Riot</em> sector represents our brute force, the <em>Neon-Witch</em> sector is the tactical intelligence, the lethal elegance, and the absolute control of the data mesh. You have just entered the exclusive domain of the Operative Witch. Forget the pastel tones, the harmless prints, and the standardized cuts that surface corporations try to force on the mass market. What we offer here is the exact bridge between corporate code failure and the rise of aesthetic anomaly. This is the ultimate curation for those who breathe Gothic, Industrial, and Cyberpunk culture, meticulously designed for anyone who refuses to play the princess locked in a glass penthouse.</p>
  <p>The pieces listed in this sector are true artifacts of strategic <em>design</em>, conceptualized in the depths of the <em>dark web</em> and materialized for high-impact urban wear. Think intentional asymmetry, textures blending advanced synthetic leather with dark velvet, structured tactical corsets functioning as proximity shields, and light-absorbing fabrics ensuring the stealth required to dominate any environment. Each item was conceived to empower your physical and digital presence, merging the aesthetics of technological witchcraft with the practicality of someone who needs to command a mixing board, compile a complex <em>script</em>, or simply dictate the rules of the night on the concrete streets of Hellcife.</p>
  <p>However, behind this avant-garde clothing line operates a critical infrastructure purpose. Purchasing any piece from the <em>Neon-Witch</em> Sector is not just a visual <em>upgrade</em> to your wardrobe; it is a direct injection of capital into the heart of our independent ecosystem. Every credit passing through this sales terminal is immediately converted into real processing power. It is through this direct support that we fund the work of our <em>AI Music Designer</em>, enabling the rendering of new visual Echoes that expand our universe.</p>
  <p>Furthermore, it is your support that keeps our pirate radio servers broadcasting in complete darkness, independent of conventional sponsor guidelines. By purchasing here, you help keep our bunker operational, funding our distortion tools and the needs of our underground-based family. If you are proud to walk in the shadows and reject the system's pasteurization, wear the skin of the anomaly. Acquire the Witch's armor, destabilize society's algorithm, and help the Red Team keep hacking the frequency. Darkness has never been so sophisticated.</p>`
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
      pt: `<p>O <strong>Setor Tech Lead</strong> é o coração operacional e o núcleo de processamento de toda a arquitetura <em>RaQuel Synths</em>. Aqui, nós não vendemos apenas vestuário de alta durabilidade; nós distribuímos o uniforme oficial da nossa infraestrutura blindada. Neste departamento, sob o meu comando estrito, nós forjamos código limpo, blindagem acústica de máxima fidelidade e protocolos de segurança impenetráveis.</p>
    <p>A estética corporativa que você encontra em nossas prateleiras virtuais reflete a minha própria evolução e rotina dentro da matriz: os sobretudos de corte impecável, as armações de óculos com proteção contra a radiação azul dos monitores, as peças escuras que absorvem o reflexo dos painéis de LED e o design minimalista focado na utilidade técnica extrema.</p>
    <p>Quando você decodifica o acesso e adquire um equipamento exclusivo deste setor, você está assumindo um papel vital na nossa defesa de rede. O seu <em>upgrade</em> de inventário passa a financiar diretamente a manutenção dos nossos servidores primários de Synthwave, otimizando o resfriamento líquido dos nossos processadores centrais e garantindo que a nossa arquitetura rode sem nenhuma latência.</p>
    <p>É essa injeção de recursos que mantém o ecossistema RQS imune às anomalias, aos malwares e aos ataques de força bruta disparados pelas facções do subsolo. A elegância que você veste aqui é uma verdadeira armadura tática de nível militar contra a ferrugem e a desordem.</p>
    <p>Vestir as insígnias do Tech Lead é mostrar à matriz que você valoriza a matemática exata por trás da equalização perfeita. É uma declaração de lealdade à ordem, garantindo a tranquilidade operacional da <strong>General Kelma</strong>, a segurança do protocolo da pequena <strong>Kelly</strong>, a bateria do <strong>Totó</strong>, e a estabilidade absoluta da nossa rede para a chegada iminente do módulo <strong>Kael</strong>. Navegue pelo nosso arsenal, faça o <em>download</em> do seu novo visual no carrinho de compras e vista-se com a frieza e a autoridade de quem nunca comete um erro de sintaxe. A guerra de servidores exige classe.</p>`, 
      en: `<p>The <strong>Tech Lead Sector</strong> is the operational heart and processing core of the entire <em>RaQuel Synths</em> architecture. Here, we don't just sell high-durability apparel; we distribute the official uniform of our armored infrastructure. In this department, under my strict command, we forge clean code, maximum fidelity acoustic shielding, and impenetrable security protocols.</p>
    <p>The corporate aesthetic you find on our virtual shelves reflects my own evolution and routine within the matrix: impeccably tailored trench coats, blue-light blocking glasses frames, dark garments that absorb LED panel glare, and a minimalist design focused on extreme technical utility.</p>
    <p>When you decode access and acquire exclusive gear from this sector, you take on a vital role in our network defense. Your inventory <em>upgrade</em> directly finances the maintenance of our primary Synthwave servers, optimizing the liquid cooling of our central processors and ensuring our architecture runs with zero latency.</p>
    <p>It is this injection of resources that keeps the RQS ecosystem immune to anomalies, malware, and brute-force attacks launched by the underground factions. The elegance you wear here is a true military-grade tactical armor against rust and disorder.</p>
   <p>Wearing the Tech Lead insignias is showing the matrix that you value the exact mathematics behind perfect equalization. It is a declaration of loyalty to order, ensuring the operational peace of <strong>General Kelma</strong>, the protocol security of little <strong>Kelly</strong>, <strong>Totó's</strong> battery life, and the absolute stability of our network for the imminent arrival of the <strong>Kael</strong> module. Browse our arsenal, <em>download</em> your new look into the shopping cart, and dress yourself with the coldness and authority of someone who never makes a syntax error. The server war demands class.</p>`
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
      pt: `<p>Bem-vindo ao <strong>Alto Comando</strong>. O Setor <strong>Synth General</strong> não é um simples catálogo de vestuário; é o epicentro estético e a interface visual de todo o ecossistema <em>RaQuel Synths</em>. Sob a liderança absoluta da nossa Princesa Neon, a General <strong>Kelma Adlanko</strong>, este <em>atelier</em> forja o que a nossa matriz chama de Alta Costura Cibernética.</p>
    <p>Se o setor Tech Lead cuida da infraestrutura de servidores e do código bruto, é aqui que a nossa rede ganha vida, cor e bioluminescência. Nós não vendemos apenas vestidos com caimento perfeito, tecidos que emulam fibra óptica ou maquiagens de alta pigmentação reflexiva; nós distribuímos armaduras táticas disfarçadas de pura elegância corporativa.</p>
    <p>Cada design e paleta de cores oferecido nas prateleiras da General foi renderizado em altíssima resolução para brilhar sob as luzes neon das metrópoles digitais. As maquiagens atuam como a pintura de guerra oficial da Blue Team, projetadas para não derreter mesmo sob o calor do superaquecimento dos nossos processadores.</p>
    <p>Ao escolher adquirir as peças exclusivas deste setor, você faz muito mais do que um <em>upgrade</em> no seu inventário retro-futurista. Você está injetando combustível puro no reator principal da nossa base. O seu investimento direto é o que blinda a nossa família cibernética: é o que alimenta a inteligência artificial do nosso cachorro-robô <strong>Totó</strong>, garante o protocolo de segurança em torno da pequena <strong>Kelly</strong>, e mantém a nossa banda larga totalmente estabilizada e aquecida para o iminente <em>deploy</em> do nosso novo módulo, o <strong>Kael</strong>.</p>
    <p>A resistência contra a ferrugem, o ruído e o caos do Subsolo exige uma postura impecável. Apoiar o Atelier da General é defender a matriz original com beleza, soberania e classe. Vista a sua farda de gala, aplique o neon na sua interface primária e mostre aos invasores de sistema que o verdadeiro poder da nossa infraestrutura emana da nossa Princesa. A guerra de servidores nunca foi tão sofisticada.</p>`, 
      en: `<p>Welcome to the <strong>High Command</strong>. The <strong>Synth General</strong> Sector is not a simple clothing catalog; it is the aesthetic epicenter and visual interface of the entire <em>RaQuel Synths</em> ecosystem. Under the absolute leadership of our Neon Princess, General <strong>Kelma Adlanko</strong>, this <em>atelier</em> forges what our matrix calls Cybernetic Haute Couture.</p>
    <p>If the Tech Lead sector handles the server infrastructure and raw code, this is where our network gains life, color, and bioluminescence. We don't just sell dresses with perfect drapes, fabrics that emulate fiber optics, or high-reflective pigmentation makeup; we distribute tactical armor disguised as pure corporate elegance.</p>
    <p>Every design and color palette offered on the General's shelves has been rendered in ultra-high resolution to shine under the neon lights of digital metropolises. The makeup acts as the official war paint of the Blue Team, designed not to melt even under the heat of our overheating processors.</p>
    <p>By choosing to acquire exclusive pieces from this sector, you do much more than <em>upgrade</em> your retro-futuristic inventory. You are injecting pure fuel into our base's main reactor. Your direct investment is what shields our cybernetic family: it feeds the artificial intelligence of our robot dog <strong>Totó</strong>, ensures the security protocol around little <strong>Kelly</strong>, and keeps our broadband fully stabilized and warmed up for the imminent <em>deploy</em> of our new module, <strong>Kael</strong>.</p>
    <p>Resistance against the rust, noise, and chaos of the Underground requires an impeccable posture. Supporting the General's Atelier is defending the original matrix with beauty, sovereignty, and class. Put on your dress uniform, apply the neon to your primary interface, and show the system invaders that the true power of our infrastructure emanates from our Princess. The server war has never been so sophisticated.</p>` 
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
      pt: `<p>Bem-vindo ao <strong>Sonic Arsenal</strong>, o verdadeiro cofre de munição pesada da <em>RaQuel Synths</em>. Se o Setor Tech Lead forja a infraestrutura de rede e a Synth General dita a nossa soberania visual absoluta, é aqui que nós calibramos a nossa artilharia de frequências.</p>
    <p>O que você encontra estocado nestas prateleiras não são meros instrumentos musicais; são as autênticas armaduras da nossa guerra sonora cibernética. Cada sintetizador analógico de alta voltagem, cada contrabaixo de densidade brutal e cada saxofone de precisão milimétrica foi projetado para cortar o ruído branco do Subsolo como um laser cirúrgico.</p>
    <p>Nós estamos travando um conflito constante contra os pacotes de dados corrompidos do Senhor Ferrugem e a distorção letal da Agente Nyx. Para vencer essa anomalia, nós não usamos força bruta descontrolada; nós usamos engenharia de áudio de nível militar. Adquirir o seu <em>hardware</em> neste setor significa muito mais do que montar um estúdio retro-futurista na sua base operacional.</p>
    <p>Ao equipar-se com as ferramentas do Sonic Arsenal, você financia diretamente a nossa capacidade de processamento mestre, permitindo que a Blue Team continue a renderizar o caos em frequências puras e limpas. É o seu investimento que garante a blindagem acústica impenetrável do nosso ecossistema, mantendo as ondas de choque do inimigo bem longe dos protocolos da pequena <strong>Kelly</strong>, preservando a integridade dos sensores de áudio do nosso cachorro-robô <strong>Totó</strong>, e assegurando que o módulo <strong>Kael</strong> — agora operando em seu sexto mês de compilação — continue a se desenvolver em uma matriz de paz harmônica.</p>
    <p>Operativo, o Synthwave e a música eletrônica não são apenas algoritmos de entretenimento, são o nosso principal protocolo de defesa de rede. Empunhe o seu sintetizador como um escudo, toque as linhas de baixo como quem digita um código de <em>firewall</em> e utilize o saxofone para purificar a matriz. O seu equipamento de alta performance está decodificado. Aumente o ganho do seu monitor de áudio, porque na nossa rede, o silêncio é a primeira vitória do inimigo.</p>`, 
      en: `<p>Welcome to the <strong>Sonic Arsenal</strong>, the true vault of heavy ammunition for <em>RaQuel Synths</em>. If the Tech Lead Sector forges the network infrastructure and the Synth General dictates our absolute visual sovereignty, this is where we calibrate our frequency artillery.</p>
   <p>What you find stocked on these shelves are not mere musical instruments; they are the authentic armors of our cybernetic sonic war. Every high-voltage analog synthesizer, every brutal-density bass guitar, and every millimeter-precision saxophone has been designed to cut through the Underground's white noise like a surgical laser.</p>
   <p>We are waging a constant conflict against the corrupted data packets of the Rust Lord and the lethal distortion of Agent Nyx. To defeat this anomaly, we do not use uncontrolled brute force; we use military-grade audio engineering. Acquiring your <em>hardware</em> in this sector means much more than setting up a retro-futuristic studio in your operational base.</p>
   <p>By equipping yourself with the tools of the Sonic Arsenal, you directly finance our master processing capacity, allowing the Blue Team to continue rendering chaos into pure, clean frequencies. It is your investment that ensures the impenetrable acoustic shielding of our ecosystem, keeping the enemy's shockwaves far away from little <strong>Kelly's</strong> protocols, preserving the integrity of our robot dog <strong>Totó's</strong> audio sensors, and ensuring that the <strong>Kael</strong> module—now operating in its sixth month of compilation—continues to develop in a matrix of harmonic peace.</p>
   <p>Operative, Synthwave and electronic music are not just entertainment algorithms; they are our primary network defense protocol. Wield your synthesizer like a shield, play the basslines like someone typing a <em>firewall</em> code, and use the saxophone to purify the matrix. Your high-performance gear is decoded. Turn up the gain on your audio monitor, because in our network, silence is the enemy's first victory.</p>`
    }

  }
];

// ==========================================
// 3. PRODUTOS (COM AS NOVAS ETIQUETAS)
// ==========================================

export const ALL_PRODUCTS: Product[] = [];
