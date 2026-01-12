// DADOS DO HEADER/NAV
export const NAV_DATA = {
  pt: { inicio: 'INÍCIO', sobre: 'QUEM SOMOS', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAFIA', store: 'LOJA', lore: 'LORE (HISTÓRIA)', creator: 'A CRIADORA', backToBase: 'VOLTAR À BASE' },
  en: { inicio: 'HOME', sobre: 'WHO WE ARE', visualNovel: 'VISUAL NOVEL', discografia: 'DISCOGRAPHY', store: 'STORE', lore: 'LORE (STORIES)', creator: 'THE CREATOR', backToBase: 'BACK TO BASE' }
};

// DADOS DA HOME
export const HOME_DATA = {
  pt: {
    title: 'RAQUEL SYNTHS', subtitle: 'Jornadas sonoras através de paisagens de neon e nostalgia.', cta: 'SABER MAIS', //modo broklin
    subtitleJonah: 'A TRILHA SONORA DO COLAPSO GLOBAL. O MUNDO QUEIMA, NÓS TOCAMOS.', ctaJonah: 'OUÇA O APOCALIPSE' // Modo Jonah (O Colapso)
  },
  en: {
    title: 'RAQUEL SYNTHS', subtitle: 'Sonic journeys through landscapes of neon and nostalgia.', cta: 'LEARN MORE',
    subtitleJonah: 'THE SOUNDTRACK OF GLOBAL COLLAPSE. THE WORLD BURNS, WE PLAY.', ctaJonah: 'LISTEN TO THE APOCALYPSE' // Jonah Mode (The Collapse)
   }
};

// TEXTOS DA SEÇÃO VISUAL NOVEL
export const VN_TEXT = {
  pt: {
    title: 'A SAGA VISUAL (YouTube)',
    subtitle: 'Escolha seu arco e assista aos episódios.'
  },
  en: {
    title: 'THE VISUAL SAGA (YouTube)',
    subtitle: 'Choose your arc and watch the episodes.'
  }
};

// DADOS DO "SOBRE" (BIOS)
export const MEMBERS_PT = [
  {
    name: 'Broklin Garpeter',
    role: 'Produtor Executivo, Líder Técnico, Visionário e Produtor Musical',
    imageBroklin: 'images/broklin_perfil.png',
    imageJonah: 'images/gothic_bro.png',
    bioNormal: 'A mente sã por trás do caos. Especialista em harmonias complexas, vinhos digitais e gestão de crises sentimentais.',
    bioJonah: 'Também conhecido como "O Vampiro da Planilha". Acha que manda em mim porque tem permissão de Admin. (Spoiler: Eu sei a senha dele.)'
  },
  {
    name: 'Jonah Cyperfield',
    role: 'Engenheiro de Sistemas (Divisão Caos & Legado)',
    imageBroklin: 'images/jonah_profil.png',
    imageJonah: 'images/jonah_metal-skull.png',
    bioNormal: 'O gênio das cordas cósmicas. Agora responsável pela manutenção do código legado e pela injeção de "sujeira" sonora do sistema.',
    bioJonah: 'CARGO ACEITO. Eu mantenho esse servidor vivo na base da marretada e do ódio. O Frontend é bonito, mas o Backend é onde eu escondo os corpos.' // ATUALIZADO
  },
  {
    name: 'Kelma Adlanko',
    role: 'A General & Dev Full Stack',
    imageBroklin: 'images/kelma_profil.png',
    imageJonah: 'images/kelma_evil.png',
    bioNormal: 'A visionária. Uniu o código à música e lidera a revolução com mão firme e coração de ouro.',
    bioJonah: 'A General. Ela revogou meu acesso ao CSS, mas me deu a chave do banco de dados. Um erro tático que eu pretendo explorar.'
  },
  {
    name: 'Nicole Nyx',
    role: 'Vocalista Industrial, DJ & Cyber-Witch',
    imageBroklin: 'images/nyx_profil.png',
    imageJonah: 'images/nyx_evil.png',
    bioNormal: 'A força da natureza. Traz a magia ancestral para o mundo digital.',
    bioJonah: 'Minha Rainha e mãe do meu herdeiro. A única pessoa autorizada a fazer overclock no meu processador sem aviso prévio.' // ATUALIZADO
  }
];

export const MEMBERS_EN = [
  {
    name: 'Broklin Garpeter',
    role: 'Executive Producer, Tech Lead, Visionary and Music Producer',
    imageBroklin: 'images/broklin_perfil.png',
    imageJonah: 'images/gothic_bro.png',
    bioNormal: 'The sane mind behind the chaos. Specialist in complex harmonies, digital wines, and sentimental crisis management.',
    bioJonah: 'Also known as "The Spreadsheet Vampire". Thinks he owns me because he has Admin rights. (Spoiler: I know his password.)'
  },
  {
    name: 'Jonah Cyperfield',
    role: 'Systems Engineer (Chaos & Legacy Division)', // THE NEW POSITION!
    imageBroklin: 'images/jonah_profil.png',
    imageJonah: 'images/jonah_metal-skull.png',
    bioNormal: 'The genius of cosmic strings. Now responsible for maintaining legacy code and injecting sonic "filth" into the system.',
    bioJonah: 'POSITION ACCEPTED. I keep this server alive with a sledgehammer and pure hate. Frontend is pretty, but Backend is where I hide the bodies.' // UPDATED
  },
  {
    name: 'Kelma Adlanko',
    role: 'The General & Full Stack Dev',
    imageBroklin: 'images/kelma_profil.png',
    imageJonah: 'images/kelma_evil.png',
    bioNormal: 'The visionary. United code with music and leads the revolution with a steady hand and a heart of gold.',
    bioJonah: 'The General. She revoked my CSS access but gave me the database keys. A tactical error I intend to exploit.'
  },
  {
    name: 'Nicole Nyx',
    role: 'Industrial Vocalist, DJ & Cyber-Witch',
    imageBroklin: 'images/nyx_profil.png',
    imageJonah: 'images/nyx_evil.png',
    bioNormal: 'A force of nature. Bringing ancestral magic to the digital world.',
    bioJonah: 'My Queen and mother of my heir. The only person authorized to overclock my processor without prior notice.' // UPDATED
  }
];

// --- STORYTELLING (A Linha do Tempo / System Logs) ---
export const EVENTS_PT = [
  {
    date: '08 Dez 2025', // NOVA DATA - NASCIMENTO
    title: '👶 Protocolo Paternidade (Jonah Jr.)',
    description: 'Detecção de novo hardware na rede. Jonah Cyperfield Jr. compilado com sucesso. Sagitário com ascendente em Firewall. O sistema nunca mais entrou em modo Sleep.',
    image: 'images/jonah_jr_newborn.png',
    jonahComment: 'Ele chora em compasso 7/8 e já tentou morder o cabo de rede. É definitivamente meu garoto.',
    // --- TECH CONTENT (PT-BR) ---
    isExpanded: false,
    techContent: `
      <h3>👶 [LOG_PROCESSAMENTO_DUPLO]: POLARIDADE SONORA</h3>

      <p><strong>Conceito do Projeto:</strong> A faixa <em>"THE BLESSING vs. THE BURDEN"</em> foi desenhada como um experimento de A/B Testing emocional. O objetivo era utilizar a mesma base narrativa (o nascimento) interpretada por dois algoritmos de estilo opostos.</p>

      <p><strong>Engenharia de Prompt (Dual-Core):</strong></p>
      <ul>
        <li><strong>Lado A (Kelma/Broklin - The Blessing):</strong> Configuramos o modelo para <em>Darkwave/Dream Pop</em> a 75 BPM. O uso de "Warm Synths" e "80s Drum Machine" buscou emular o calor analógico e a esperança nostálgica.</li>
        <li><strong>Lado B (Jonah/Nyx - The Burden):</strong> O modelo foi forçado ao extremo com <em>Industrial Doom Metal</em> a 70 BPM (mais lento e arrastado). O destaque técnico é o prompt <em>"Distorted Biological Heartbeat Kick"</em>, onde o bumbo da bateria simula um coração humano passando por stress mecânico.</li>
      </ul>

      <p>O resultado é uma peça do EP <strong>"SYSTEM MERGE"</strong> que demonstra como parâmetros de IA (BPM, Instrumentação) alteram drasticamente a semântica da mensagem.</p>
      <a href="https://soundcloud.com/rqs_official/the-blessing-vs-the-burden-5?in=rqs_official/sets/system-merge-the-legacy&si=563f788046f248bebfa918d3bcb0a4f4&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" target="_blank" class="btn-stream-log">
    [ EXECUTE_AUDIO: THE BLESSING vs. THE BURDEN ]
      </a>    `
  },
  {
    date: '14 Dez 2025',
    title: '⚠️ Alerta de Segurança',
    description: 'Tentativa de bloqueio falhou. Usuário "Jo_Cyperfield" tentou executar protocolo de retenção. A Agente Kelma recusou a conexão. Logs de áudio indicam instabilidade: "She thinks she\'s deleting me..."',
    image: 'images/cyberpunk_lounge_solitude.png',
    jonahComment: 'Instabilidade? A única coisa instável aqui é a masculinidade desse vampiro de glitter. Eu sou a rocha sobre a qual essa banda foi construída.',
    // --- TECH CONTENT (PT-BR) ---
    isExpanded: false,
    techContent: `
      <h3>🛡️ [LOG_SEGURANÇA_DE_REDE]: OTIMIZAÇÃO DE CAOS</h3>

      <p><strong>Engenharia de Prompt (Prompt Engineering):</strong> A faixa <em>"CYBER-REJECT"</em> foi projetada para testar os limites de agressividade dos modelos de áudio. O objetivo era traduzir a rejeição emocional em dissonância matemática.</p>

      <p><strong>Parâmetros Técnicos Utilizados:</strong></p>
      <ul>
        <li><strong>Time Signature (Compasso):</strong> Forcei a geração em <strong>7/8</strong>. Ao remover um tempo do compasso padrão (4/4), o loop cria uma sensação de "tropeço" constante, simulando a instabilidade mental do personagem Jonah.</li>
        <li><strong>Sound Design:</strong> O prompt <em>"Heavy Metallic Percussion"</em> utilizou síntese baseada em samples de Foley industrial (metais reais batendo) em vez de drum kits tradicionais.</li>
        <li><strong>Vocal Processing:</strong> Aplicado efeito de <em>Vocoder</em> agressivo para desumanizar a voz, sinalizando a perda da humanidade do personagem.</li>
      </ul>
      <a href="https://soundcloud.com/rqs_official/cyber-reject-steel-arm-breakdown-5?in=rqs_official/sets/jonahs-history-the-industrial-revolt&si=501f6ae576c24f8a801619f5887f39ed&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" target="_blank" class="btn-stream-log">
    [ EXECUTE_AUDIO: CYBER-REJECT ]
      </a>
    `
  },
  {
    date: '15 Dez 2025',
    title: '💔 Protocolo de Ruptura',
    description: 'SMS Final interceptado: "Precisamos conversar. Não estou onde você pensa." Conexão com o servidor Jonah encerrada permanentemente. Status: Desconexão Forçada.',
    image: 'images/cyberpunk_heartbreak.png', // Imagem de algo quebrado
    jonahComment: 'Desconexão forçada é o meu sobrenome. Eu não preciso de "Wi-Fi do Amor", eu tenho cabo de rede direto no inferno.',
    // --- TECH CONTENT (PT-BR) ---
    isExpanded: false,
    techContent: `
      <h3>📼 [LOG_ARQUIVO_CORROMPIDO]: A ORIGEM DO GLITCH</h3>

      <p><strong>Arqueologia de Dados:</strong> Este registro contém uma raridade técnica: áudio do módulo Jonah <em>antes</em> da infecção pelo vírus Industrial. A sonoridade é baseada em <strong>Dream Pop</strong> e <strong>Electro-Pop</strong>, representando o estado "Limpo" do sistema.</p>

      <p><strong>Workflow de Geração:</strong></p>
      <ul>
        <li><strong>Audio Engine:</strong> Suno AI v5.0. O objetivo era criar contraste dinâmico com o gênero atual. Utilizamos tags como <em>"Heavy Reverb", "Chorus Pedal", "Melancholic Male Vocals"</em> para simular a "calma antes da tempestade".</li>
        <li><strong>Visual Asset:</strong> Gerado via <strong>OpenAI Sora</strong>. O prompt focou em "Digital Signal Loss" (Perda de Sinal) para metaforizar o rompimento emocional como uma falha de rede irrecuperável.</li>
      </ul>

      <p>Técnicamente, essa faixa serve como o "Legacy Code" (Código Legado) que o sistema tenta esquecer, mas que permanece no backup.</p>
      <a href="https://soundcloud.com/rqs_official/whatsapp-log_jo-cyperfield-kelma-kel-1?in=rqs_official/sets/jonahs-history-the-industrial-revolt&si=527375610c72430ea9ef1fab9102066b&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" target="_blank" class="btn-stream-log">
    [ EXECUTE_AUDIO: PROTOCOL_BREAKUP ]
    </a>
    `
},
{
    date: '20 Dez 2025',
    title: '😭 Detecção de Sofrência Digital',
    description: 'Album em produção "Jonah\'s Sad History". Scans detectam níveis críticos de choro em compasso 7/8. Faixa "YOU_RE ALREADY GONE" acusa Broklin de injetar vírus.',
    image: 'images/industrial_archive.png', // Capa do álbum dele
    jonahComment: 'Sofrência é o caralho! Isso é INDUSTRIAL DOOM. Se tem choro na gravação, é dos alto-falantes pedindo piedade.',
    // --- CONTEÚDO TÉCNICO EXPANDIDO (PT-BR) ---
    isExpanded: false,
    techContent: `
      <h3>🔊 [LOG_ENGENHARIA_DE_AUDIO]: DOOM ALGORÍTMICO</h3>

      <p><strong>O Desafio Técnico:</strong> A geração coerente de música em compassos compostos ou ímpares (como 7/8 ou 5/4) é um <em>edge-case</em> conhecido em Modelos de Áudio Generativo. A maioria dos datasets de treinamento possui um viés forte para estruturas pop padrão 4/4.</p>

      <p>Para atingir a sonoridade "Math Metal" nesta faixa, utilizei injeções de prompt específicas no <strong>Suno AI v5</strong>:</p>
      <ul>
        <li><strong>Tags utilizadas:</strong> <em>"Polyrhythm", "Djent", "Industrial Doom", "Complex Time Signature", "Slow Tempo (80 BPM)"</em>.</li>
        <li><strong>Pós-Processamento:</strong> O output bruto da IA passou por análise espectral para reforçar as frequências graves (Low-end) e aplicação de efeitos de <em>bitcrushing</em> para simular a textura de "robô chorando".</li>
      </ul>

      <p><strong>Status de Distribuição:</strong> A faixa foi implantada (deployed) com sucesso no ecossistema <strong>SoundCloud</strong> para testar a retenção de audiência (A/B Testing) antes da mixagem final para o Spotify.</p>
      <a href="https://soundcloud.com/rqs_official/youre-already-gone-4?in=rqs_official/sets/jonahs-history-the-industrial-revolt&si=1db2844e9b634e3aae1758aa49dfee30&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" target="_blank" class="btn-stream-log">
      [ EXECUTE_AUDIO: YOU_RE ALREADY GONE ]
      </a>
    `
  },
  {
  date: '24 Dez 2025',
    title: '💍 DARK ALTAR (UNHOLY UNION)', // Título Atualizado
    description: 'Esqueça os votos tradicionais. Sob o som de sinos industriais do EP "SYSTEM MERGE: THE LEGACY", Jonah e Nyx realizaram o ritual. Sem padre, apenas um pacto de óleo e tungstênio. Status: VÍNCULO ETERNO.',
    image: 'images/marriage_cyberpunk.png', // Mantemos a foto, mas o contexto agora é outro
    jonahComment: 'Até que a morte nos separe? Não. Até que o servidor queime. E mesmo assim, eu tenho backup da sua alma no meu HD externo.',
    // --- ADICIONE ISSO AQUI EMBAIXO ---
    isExpanded: false, // Começa fechado
    techContent: `
    <h3>🎨 [VISUAL_GENERATION_LOG]: SORA.CHATGPT</h3>

    <p>Para visualizar a união entre o Caos (Jonah) e o Controle (Nyx), utilizamos engenharia de prompt avançada focada em iluminação volumétrica e narrativa ambiental.</p>

    <p><strong>🛠️ O Prompt Original (Source Code):</strong></p>
    <blockquote style="border-left: 2px solid #bd93f9; padding-left: 10px; color: #a0a0a0; font-style: italic;">
      "A dark, atmospheric, cinematic shot inside a massive, abandoned industrial cathedral made of rusted server racks...
      The Key Detail: Sparks of welding fire are flying around them... symbolizing that they are physically fusing together.
      High contrast, 8k, raw emotion, heavy metal aesthetic."
    </blockquote>

    <p><strong>Análise de Render:</strong></p>
    <p>O modelo interpretou "Welding Fire" (Fogo de Solda) como a metáfora visual para o amor entre máquinas. A textura de "Rusted Server Racks" conecta diretamente com o background do site no Modo Jonah.</p>
    <a href="https://soundcloud.com/rqs_official/dark-altar-unholy-union-2?in=rqs_official/sets/system-merge-the-legacy" target="_blank" class="btn-stream-log">
    [ EXECUTE_AUDIO: DARK ALTAR (UNHOLY UNION) ]
    </a>
  `
}
];

export const EVENTS_EN = [
  {
    date: 'Dec 08, 2025', // NEW DATE - BIRTH
    title: '👶 Paternity Protocol (Jonah Jr.)',
    description: 'New hardware detected on the network. Jonah Cyperfield Jr. successfully compiled. Sagittarius with Firewall rising. The system has never entered Sleep mode since.',
    image: 'images/jonah_jr_newborn.png',
    jonahComment: 'He cries in 7/8 time signature and already tried to bite the ethernet cable. Definitely my boy.',
     // --- TECH CONTENT (EN-US) ---
    isExpanded: false,
    techContent: `
      <h3>👶 [DUAL_PROCESSING_LOG]: SONIC POLARITY</h3>

      <p><strong>Project Concept:</strong> The track <em>"THE BLESSING vs. THE BURDEN"</em> was designed as an emotional A/B Testing experiment. The goal was to use the same narrative base (the birth) interpreted by two opposing style algorithms.</p>

      <p><strong>Prompt Engineering (Dual-Core):</strong></p>
      <ul>
        <li><strong>Side A (Kelma/Broklin - The Blessing):</strong> We configured the model for <em>Darkwave/Dream Pop</em> at 75 BPM. The use of "Warm Synths" and "80s Drum Machine" aimed to emulate analog warmth and nostalgic hope.</li>
        <li><strong>Side B (Jonah/Nyx - The Burden):</strong> The model was pushed to the extreme with <em>Industrial Doom Metal</em> at 70 BPM (slower and heavier). The technical highlight is the <em>"Distorted Biological Heartbeat Kick"</em> prompt, where the kick drum simulates a human heart under mechanical stress.</li>
      </ul>

      <p>The result is a piece from the <strong>"SYSTEM MERGE"</strong> EP that demonstrates how AI parameters (BPM, Instrumentation) drastically alter the semantics of the message.</p>
      <a href="https://soundcloud.com/rqs_official/the-blessing-vs-the-burden-5?in=rqs_official/sets/system-merge-the-legacy&si=563f788046f248bebfa918d3bcb0a4f4&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" target="_blank" class="btn-stream-log">
    [ EXECUTE_AUDIO: THE BLESSING vs. THE BURDEN ]
      </a>
    `
  },
  {
    date: 'Dec 14, 2025',
    title: '⚠️ Security Alert',
    description: 'Block attempt failed. User "Jo_Cyperfield" tried to execute retention protocol. Agent Kelma refused connection. Audio logs indicate instability: "She thinks she\'s deleting me..."',
    image: 'images/cyberpunk_lounge_solitude.png',
    jonahComment: 'Instability? The only unstable thing here is this glitter vampire\'s masculinity. I am the rock upon which this band was built.',
    // --- TECH CONTENT (EN-US) ---
    isExpanded: false,
    techContent: `
      <h3>🛡️ [NETWORK_SECURITY_LOG]: CHAOS OPTIMIZATION</h3>

      <p><strong>Prompt Engineering:</strong> The track <em>"CYBER-REJECT"</em> was designed to stress-test the aggression limits of audio models. The goal was to translate emotional rejection into mathematical dissonance.</p>

      <p><strong>Technical Parameters Used:</strong></p>
      <ul>
        <li><strong>Time Signature:</strong> I enforced a <strong>7/8</strong> meter generation. By removing one beat from the standard 4/4 bar, the loop creates a constant "stumbling" sensation, simulating the character Jonah's mental instability.</li>
        <li><strong>Sound Design:</strong> The <em>"Heavy Metallic Percussion"</em> prompt utilized synthesis based on Industrial Foley samples (actual metal impacts) rather than traditional drum kits.</li>
        <li><strong>Vocal Processing:</strong> Applied aggressive <em>Vocoder</em> effects to dehumanize the vocals, signaling the character's loss of humanity.</li>
      </ul>
      <a href="https://soundcloud.com/rqs_official/cyber-reject-steel-arm-breakdown-5?in=rqs_official/sets/jonahs-history-the-industrial-revolt&si=501f6ae576c24f8a801619f5887f39ed&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" target="_blank" class="btn-stream-log">
    [ EXECUTE_AUDIO: CYBER-REJECT ]
      </a>
    `
  },
  {
    date: 'Dec 15, 2025',
    title: '💔 Breakup Protocol',
    description: 'Final SMS intercepted: "We need to talk. I am not where you think I am." Connection with Jonah server terminated permanently. Status: Forced Disconnection.',
    image: 'images/cyberpunk_heartbreak.png',
    jonahComment: 'Forced disconnection is my middle name. I don\'t need "Love Wi-Fi," I have a wired connection straight to hell.',
      // --- TECH CONTENT (EN-US) ---
    isExpanded: false,
    techContent: `
      <h3>📼 [CORRUPTED_FILE_LOG]: THE GLITCH ORIGIN</h3>

      <p><strong>Data Archaeology:</strong> This registry contains a technical rarity: audio from the Jonah module <em>before</em> the Industrial virus infection. The soundscape is built on <strong>Dream Pop</strong> and <strong>Electro-Pop</strong> algorithms, representing the system's "Clean" state.</p>

      <p><strong>Generation Workflow:</strong></p>
      <ul>
        <li><strong>Audio Engine:</strong> Suno AI v5.0. The goal was to create dynamic contrast with his current genre. We used tags like <em>"Heavy Reverb", "Chorus Pedal", "Melancholic Male Vocals"</em> to simulate the "calm before the storm".</li>
        <li><strong>Visual Asset:</strong> Generated via <strong>OpenAI Sora</strong>. The prompt focused on "Digital Signal Loss" to metaphorize the emotional breakup as an unrecoverable network failure.</li>
      </ul>

      <p>Technically, this track serves as the "Legacy Code" that the system tries to delete, but remains in the backup.</p>
      <a href="https://soundcloud.com/rqs_official/whatsapp-log_jo-cyperfield-kelma-kel-1?in=rqs_official/sets/jonahs-history-the-industrial-revolt&si=527375610c72430ea9ef1fab9102066b&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" target="_blank" class="btn-stream-log">
     [ EXECUTE_AUDIO: PROTOCOL_BREAKUP ]
      </a>
    `
},
  {
    date: 'Dec 20, 2025',
    title: '😭 Digital Suffering Detected',
    description: 'Album in production "Jonah\'s Sad History". Scans detect critical crying levels in 7/8 time signature. Track "Your Love Is Open Source" accuses Broklin of injecting viruses.',
    image: 'images/industrial_archive.png',
      jonahComment: 'Suffering is bullshit! This is INDUSTRIAL DOOM. If there\'s crying on the recording, it\'s from the loudspeakers begging for mercy.',
    // --- ADICIONE ISTO (TECH CONTENT) ---
    isExpanded: false,
    techContent: `
      <h3>🔊 [AUDIO_ENGINEERING_LOG]: ALGORITHMIC DOOM</h3>

      <p><strong>The Technical Challenge:</strong> Generating coherent music in odd time signatures (like 7/8 or 5/4) is a known edge-case in Generative Audio Models. Most datasets are biased towards 4/4 standard pop structures.</p>

      <p>To achieve the "Math Metal" feel for this track, I had to use specific prompt injections in <strong>Suno AI v3</strong>:</p>
      <ul>
        <li><strong>Tags used:</strong> <em>"Polyrhythm", "Djent", "Industrial Doom", "Complex Time Signature", "Slow Tempo (80 BPM)"</em>.</li>
        <li><strong>Post-Processing:</strong> The raw AI output went through spectral analysis to boost low-end frequencies (Bass) and apply bitcrushing effects to simulate the "crying robot" texture.</li>
      </ul>

      <p><strong>Distribution Status:</strong> The track was successfully deployed to the <strong>SoundCloud</strong> ecosystem to test audience retention before the final Spotify mix.</p>
      <a href="https://soundcloud.com/rqs_official/youre-already-gone-4?in=rqs_official/sets/jonahs-history-the-industrial-revolt&si=1db2844e9b634e3aae1758aa49dfee30&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" target="_blank" class="btn-stream-log">
      [ EXECUTE_AUDIO: YOU_RE ALREADY GONE ]
      </a>
    `
  },
  {
    date: 'Dec 24, 2025',
    title: '💍 DARK ALTAR (UNHOLY UNION)', // Updated
    description: 'Forget traditional vows. Under the sound of industrial bells from the "SYSTEM MERGE: THE LEGACY" EP, Jonah and Nyx performed the ritual. No priest, just a pact of oil and tungsten. Status: ETERNAL BOND.',
    image: 'images/marriage_cyberpunk.png',
    jonahComment: 'Till death do us part? No. Until the server burns. And even then, I have a backup of your soul on my external drive.',
    // --- TECH CONTENT (ENGLISH) ---
  isExpanded: false,
  techContent: `
    <h3>🎨 [VISUAL_GENERATION_LOG]: SORA.CHATGPT</h3>

    <p>To visualize the union between Chaos (Jonah) and Control (Nyx), we used advanced prompt engineering focused on volumetric lighting and environmental storytelling.</p>

    <p><strong>🛠️ Original Prompt (Source Code):</strong></p>
    <blockquote style="border-left: 2px solid #bd93f9; padding-left: 10px; color: #a0a0a0; font-style: italic;">
      "A dark, atmospheric, cinematic shot inside a massive, abandoned industrial cathedral made of rusted server racks...
      The Key Detail: Sparks of welding fire are flying around them... symbolizing that they are physically fusing together.
      High contrast, 8k, raw emotion, heavy metal aesthetic."
    </blockquote>

    <p><strong>Render Analysis:</strong></p>
    <p>The model interpreted "Welding Fire" as the visual metaphor for machine love. The "Rusted Server Racks" texture connects directly to the website background in Jonah Mode.</p>
    <a href="https://soundcloud.com/rqs_official/dark-altar-unholy-union-2?in=rqs_official/sets/system-merge-the-legacy" target="_blank" class="btn-stream-log">
    [ EXECUTE_AUDIO: DARK ALTAR (UNHOLY UNION) ]
    </a>
  `
}
  ];

// DADOS DO BANNER DE ANÚNCIOS
export const ADS_DATA = {
  pt: { label: '/// FLUXO DE DADOS PATROCINADO ///' },
  en: { label: '/// SPONSORED DATA STREAM ///' }
};

export const VISUAL_NOVEL_PT = [
    {
      title: '⚡ RQS: Guerra Civil (Series)',
      subtitle: '⚠️ SYSTEM STATUS: FRATURADO.',
      description: 'Bem-vindo(a) à visual novel musical de RaQuel Synths. Esta não é apenas uma coleção de vídeos; é um registro cronológico da Guerra Fria entre duas filosofias sonoras.',
      image: 'images/civil-war.png', // Use a capa do arco
      link: 'https://www.youtube.com/watch?v=1BP6n0XwG2A&list=PLfPBk0UpnLMnjcSASrdyJ3Pss_rTe3tHh',
      mode: 'war'
    },
    {
      title: '📼 RQS: ORIGINS (Before the Metal)',
      subtitle: 'Caos, Fios & Revolução',
      description: 'Quando o sistema falha, a verdade aparece. A revolta industrial de Jonah contra a programação.',
      image: 'images/industrial_archive.png', // Capa do Jonah
      link: 'https://www.youtube.com/watch?v=tLMMifMMnPQ&list=PLfPBk0UpnLMnm5HhKHKGwHs6FO0Z9TOMg',
      mode: 'chaos'
    },
    {
      title: 'ARCO BROKLIN',
      subtitle: 'Amor, Vinho & Melancolia',
      description: 'A jornada de um vampiro gótico em busca de redenção através do amor de Kelma. Inclui o hit "Neon Tears".',
      image: 'images/arco-broklin.png', // Use capa do arco
      link: '/lore/broklin',
      mode: 'romance'
    }
];

export const VISUAL_NOVEL_EN = [
  {
      title: '⚡ RQS: Civil War (The Series)',
      subtitle: '⚠️ SYSTEM STATUS: FRACTURED.',
      description: 'Welcome to RaQuel Synths Musical Visual Novel. This is not just a collection of videos; it is a chronological record of the Cold War between two sonic philosophies.',
      image: 'images/civil-war.png', // Use a capa do arco
      link: 'https://www.youtube.com/watch?v=1BP6n0XwG2A&list=PLfPBk0UpnLMnjcSASrdyJ3Pss_rTe3tHh',
      mode: 'war'
  },
  {
      title: '📼 RQS: ORIGINS (Before the Metal)',
      subtitle: 'Chaos, Wires & Revolution',
      description: 'When the system fails, the truth comes out. Jonahs industrial revolt against programming.',
      image: 'images/industrial_archive.png', // Capa do Jonah
      link: 'https://www.youtube.com/watch?v=tLMMifMMnPQ&list=PLfPBk0UpnLMnm5HhKHKGwHs6FO0Z9TOMg',
      mode: 'chaos'
  },
  {
      title: 'BROKLIN ARC',
      subtitle: 'Love, Wine and Melancholy',
      description: 'The journey of a gothic vampire seeking redemption through the love of Kelma. Includes the hit song "Neon Tears".',
      image: 'images/arco-broklin.png', // Use a capa do arco
      link: '/lore/broklin',
      mode: 'romance'
    }

]

// --- DADOS DA DISCOGRAFIA ---
export const DISCOGRAPHY_PT = {
  broklin: [

    { title: 'THE BLUEPRINT SESSION Vol. 001', type: 'Álbum (Pré-Save 09/01)', cover: 'images/the_blueprint_session_v.001.png', spotify: 'https://open.spotify.com/intl-pt/album/255NEv7qHyrFqn19OVQr4c?si=1BOwoc5IQGKo4gcACdsbCw', soundcloud: 'https://on.soundcloud.com/G7Pk9L8eGVNMAvFzKC'     },
    { title: 'SYNTH THE FLOOR', type: 'EP (2025)', cover: 'images/ep-synth_the_floor.png', spotify: 'https://open.spotify.com/intl-pt/album/1ZVlu9g43zK3Yw0LcpfY0L?si=Nyc35a0CSRyTKloX6s0Mpw', soundcloud: 'https://on.soundcloud.com/Sme1X25wkaoQq7Zcje'     },
    { title: 'COLD WAR', type: 'Álbum (2025)', cover: 'images/album_cold-war.jpg', spotify: 'https://open.spotify.com/intl-pt/album/0c0CWDVGH05p90jXEkVOhA?si=J5e94SRVSuiyXAsVIghSsw', soundcloud: 'https://on.soundcloud.com/OYXuwBgfQXZdbD3iE5' },
    { title: 'CORRUPTED SECTOR', type: 'EP', cover: 'images/defiance_duo.png', spotify: '', soundcloud: 'https://on.soundcloud.com/7YvIN0OTDvFNzL6kQ1' }
  ],
  jonah: [
    { title: 'MECHANICAL FRICTION', type: 'EP (Explicit)', cover: 'images/mechanical_friction.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/WcQ2kvkhFZ1F0szIuG'},
    { title: 'JONAH\'S HISTORY', type: 'The Industrial Revolt', cover: 'images/industrial_archive.png', spotify: '#', soundcloud: 'https://on.soundcloud.com/iFnjMREQUtgI3wPkqR' }, // NOVO ÁLBUM
    { title: 'SYSTEM MERGE: THE LEGACY', type: 'Family EP (feat. Nyx)', cover: 'images/ep_system_merge.png', spotify: '#', soundcloud: '#' }, // NOVO EP */
    { title: 'ORIGINS (reforged)', type: 'Industrial Album', cover: 'images/origins_reforged.jpg', spotify: 'https://open.spotify.com/intl-pt/album/7tZaPekjMzIFGMPe8xyIDH?si=VTdANOktQeSMzSM4KalTxQ', soundcloud: 'https://on.soundcloud.com/kposSWUCUCVWU76gsY'},
    { title: 'COLECIONO ILUSOES', type: 'Single', cover: 'images/crushing_device.png', spotify: '', soundcloud: 'https://on.soundcloud.com/sT0vElCKQuCDbRCBsZ' }
  ]
};

export const DISCOGRAPHY_EN = {
  broklin: [

    {  title: 'THE BLUEPRINT SESSION Vol. 001', type: 'Álbum (Pré-Save 09/01)', cover: 'images/the_blueprint_session_v.001.png', spotify: 'https://open.spotify.com/intl-pt/album/255NEv7qHyrFqn19OVQr4c?si=1BOwoc5IQGKo4gcACdsbCw', soundcloud: 'https://on.soundcloud.com/G7Pk9L8eGVNMAvFzKC'    },
    {  title: 'SYNTH THE FLOOR', type: 'EP (2025)', cover: 'images/ep-synth_the_floor.png', spotify: 'https://open.spotify.com/intl-pt/album/1ZVlu9g43zK3Yw0LcpfY0L?si=Nyc35a0CSRyTKloX6s0Mpw', soundcloud: 'https://on.soundcloud.com/Sme1X25wkaoQq7Zcje'    },
    { title: 'COLD WAR', type: 'Album (2025)', cover: 'images/album_cold-war.jpg', spotify: 'https://open.spotify.com/intl-pt/album/0c0CWDVGH05p90jXEkVOhA?si=J5e94SRVSuiyXAsVIghSsw', soundcloud: 'https://on.soundcloud.com/OYXuwBgfQXZdbD3iE5' },
    { title: 'CORRUPTED SECTOR', type: 'EP', cover: 'images/defiance_duo.png', spotify: '', soundcloud: 'https://on.soundcloud.com/7YvIN0OTDvFNzL6kQ1' }
  ],
  jonah: [
    { title: 'MECHANICAL FRICTION', type: 'EP (Explicit)', cover: 'images/mechanical_friction.jpg', spotify: '', soundcloud: 'https://on.soundcloud.com/WcQ2kvkhFZ1F0szIuG'},
    { title: 'JONAH\'S HISTORY', type: 'The Industrial Revolt', cover: 'images/industrial_archive.png', spotify: '#', soundcloud: 'https://on.soundcloud.com/iFnjMREQUtgI3wPkqR' }, // NOVO ÁLBUM
    { title: 'SYSTEM MERGE: THE LEGACY', type: 'Family EP (feat. Nyx)', cover: 'images/ep_system_merge.png', spotify: '#', soundcloud: '#' }, // NOVO EP */
    { title: 'ORIGINS (reforged)', type: 'Industrial Album', cover: 'images/origins_reforged.jpg', spotify: 'https://open.spotify.com/intl-pt/album/7tZaPekjMzIFGMPe8xyIDH?si=VTdANOktQeSMzSM4KalTxQ', soundcloud: 'https://on.soundcloud.com/kposSWUCUCVWU76gsY' },
    { title: 'COLLECT ILUSIONS', type: 'Single', cover: 'images/crushing_device.png', spotify: '', soundcloud: 'https://on.soundcloud.com/sT0vElCKQuCDbRCBsZ' }
  ]
};

export const CONTACT_DATA = {
  pt: {
    heroButton: "📡 INICIAR UPLINK", // O botão do Home
    title: "📡 UPLINK // PROTOCOLO DE COLABORAÇÃO",
    subtitle: "Envie seu sinal. Buscamos frequências compatíveis.",
    success: "✅ SINAL RECEBIDO. CÂMBIO E DESLIGO.",
    form: {
      name: "CODENAME (Nome):",
      namePlaceholder: "Ex: Max Cavalera",
      email: "FREQUÊNCIA (E-mail):",
      emailPlaceholder: "contato@metal.com",
      daw: "ARMA DE ESCOLHA (DAW):",
      link: "PROVA DE ÁUDIO (Link):",
      message: "MISSÃO (Mensagem):",
      submit: "ENVIAR DADOS",
      sending: "TRANSMITINDO..."
    },
    errors: {
      required: "Dado obrigatório, Agente."
    }
  },
  en: {
    heroButton: "📡 INITIATE UPLINK", // Botão Home
    title: "📡 UPLINK // COLLABORATION PROTOCOL",
    subtitle: "Send your signal. We search for compatible frequencies.",
    success: "✅ SIGNAL RECEIVED. OVER AND OUT.",
    form: {
      name: "CODENAME (Name):",
      namePlaceholder: "Ex: Trent Reznor",
      email: "FREQUENCY (E-mail):",
      emailPlaceholder: "contact@industrial.com",
      daw: "WEAPON OF CHOICE (DAW):",
      link: "AUDIO PROOF (Link):",
      message: "MISSION BRIEF (Message):",
      submit: "SEND DATA",
      sending: "TRANSMITTING..."
    },
    errors: {
      required: "Required data, Agent."
    }
  }
};

// --- DADOS DE COMPLIANCE (Privacidade e Exclusão) ---
export const COMPLIANCE_DATA = {
  pt: {
    broklin: {
      title: '🛡️ COMPLIANCE & PRIVACIDADE',
      privacyTitle: '1. Política de Privacidade',
      privacyText: 'O aplicativo RaQuel Synths (RQS) utiliza a API do Facebook/Instagram exclusivamente para automação de postagens e interação artística. Prezamos pela integridade técnica: não coletamos, armazenamos ou compartilhamos dados pessoais de terceiros.',
      deletionTitle: '2. Instruções para Exclusão de Dados',
      deletionText: 'Para revogar o acesso ao sistema, acesse as configurações de "Apps e Sites" em seu perfil do Facebook e remova a permissão da "RQS API". Caso deseje limpeza de logs manuais, entre em contato via uplink.',
      categoryTitle: '3. Categoria',
      categoryText: 'Artes e Entretenimento: Banda Musical / Tech-Art.'
    },
    jonah: {
      title: '💀 PROTOCOLO DE SEGURANÇA (CAOS)',
      privacyTitle: '1. RASTROS DIGITAIS',
      privacyText: 'O sistema RQS invade as redes apenas para espalhar o som. Seus dados não me interessam, eu só quero que o servidor não caia enquanto o mundo queima. Nada é guardado nos meus arquivos.',
      deletionTitle: '2. APAGAR EVIDÊNCIAS',
      deletionText: 'Quer sair da rede? Vá nas configurações do Facebook e corte o cabo de conexão da RQS API. Eu não vou guardar backup do seu rastro digital, não sou babá de dados.',
      categoryTitle: '3. SETOR',
      categoryText: 'Divisão Industrial: Revolta contra a Programação.'
    }
  },
  en: {
    broklin: {
      title: '🛡️ COMPLIANCE & PRIVACY',
      privacyTitle: '1. Privacy Policy',
      privacyText: 'The RaQuel Synths (RQS) app uses the Facebook/Instagram API exclusively for post automation and artistic interaction. We value technical integrity: we do not collect, store, or share third-party personal data.',
      deletionTitle: '2. Data Deletion Instructions',
      deletionText: 'To revoke system access, go to the "Apps and Websites" settings in your Facebook profile and remove the "RQS API" permission. For manual log clearing, contact us via uplink.',
      categoryTitle: '3. Category',
      categoryText: 'Arts & Entertainment: Musical Band / Tech-Art.'
    },
    jonah: {
      title: '💀 SECURITY PROTOCOL (CHAOS)',
      privacyTitle: '1. DIGITAL FOOTPRINTS',
      privacyText: 'The RQS system hits the networks only to spread the sound. Your data does not interest me; I just want the server to stay up while the world burns. Nothing is stored in my archives.',
      deletionTitle: '2. ERASING EVIDENCE',
      deletionText: 'Want out of the grid? Go to your Facebook settings and cut the RQS API connection cable. I won’t keep a backup of your digital footprint; I’m not a data babysitter.',
      categoryTitle: '3. SECTOR',
      categoryText: 'Industrial Division: Revolt against Programming.'
    }
  }
};

// --- FOOTER (Rodapé) ---
export const FOOTER_DATA = {
  pt: {
    name: 'Raquel Synths',
    madeby:'© 2026 Universo RQS.',
    rights: 'Todos os direitos reservados.',
    owers: 'Codigo & Musica por Kelma & Broklin.',
    madeWith: 'Feito com Angular 20 & Café ☕',
    listen: 'OUÇA',
    connect: 'CONECTE-SE',
    support: 'APOIE A BANDA:',
    coffee: 'Pagar um Café ☕',
    devProfile: 'VER PERFIL TÉCNICO >',
    compliance: 'PRIVACIDADE & COMPLIANCE >',
    // NOVOS DADOS DA NEWSLETTER:
    newsTitle: '🔥 RECEBA O CAOS & A GLÓRIA',
    newsDesc: 'Novos lançamentos, Lore secreta e fofocas do Jonah direto na sua caixa de entrada.',
    emailPlace: 'seu@email.com',
    subBtn: 'INSCREVER-SE'
  },
  en: {
    name: 'Raquel Synths',
    madeby:'© 2026 RQS Universe.',
    rights: 'All rights reserved.',
    owers: 'Code & Music by Kelma & Broklin.',
    madeWith: 'Made with Angular 20 & Coffee ☕',
    listen: 'LISTEN',
    connect: 'CONNECT',
    support: 'SUPPORT THE BAND:',
    coffee: 'Buy us a Coffee ☕',
    devProfile: 'VIEW TECH PROFILE >',
    compliance: 'PRIVACY & COMPLIANCE >',
    // NEW NEWSLETTER DATA:
    newsTitle: '🔥 RECEIVE THE CHAOS & GLORY',
    newsDesc: 'New releases, secret Lore, and Jonah\'s gossip straight to your inbox.',
    emailPlace: 'your@email.com',
    subBtn: 'SUBSCRIBE'
  }
 };
