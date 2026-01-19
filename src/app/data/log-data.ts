// src/app/data/log-data.ts

export const SYSTEM_LOGS_DATA: any[] = [

  // ==========================================
  // 🔥 LOGS 2026 (FUTURO - APARECEM NA HOME)
  // ==========================================
 // --- 🔥 2026 (LOG CORRIGIDO - REALIDADE TÉCNICA) ---
  {
    date: 'JAN 17, 2026',
    image: 'assets/logs/ep_system-reboot.jpg',
    isExpanded: false,
    pt: {
      title: 'PROTOCOL: SYSTEM REBOOT // DEPLOY EM STAGING',
      description: 'O sistema foi reiniciado, mas operamos em ambiente de homologação. O EP "System Reboot" foi liberado exclusivamente no SoundCloud para testes de audiência (A/B Testing). Este projeto explora a capacidade do algoritmo Suno v5.0 em lidar com trocas complexas de ritmo e instrumentação orgânica, como saxofone, dentro de uma estrutura eletrônica.',
      jonahComment: 'LANDR? SÉRIO? AGORA UM ROBÔ DECIDE O QUÃO ALTO EU POSSO GRITAR? PELO MENOS VOCÊ ESCOLHEU O MODO "ABERTO". SE FOSSE O "QUENTE", EU IA ME SENTIR DENTRO DE UM MICROONDAS.',
      techContent: `
        <h3>🛠️ [DEV_WORKFLOW]: SÍNTESE & MASTERIZAÇÃO AI</h3>

        <p>A transparência é vital. Este EP não é uma produção manual tradicional, mas uma orquestração de ferramentas generativas avançadas.</p>

        <h4>1. Geração Iterativa (Suno v5.0)</h4>
        <p>O diferencial técnico aqui foi o uso agressivo da função <strong>Extend</strong>. Em vez de aceitar a geração padrão, utilizei o Extend para forçar a IA a mudar a assinatura rítmica no meio da faixa e focar em solos de instrumentos específicos (Saxofone), testando os limites de coerência do modelo v5.</p>

        <h4>2. Pipeline de Masterização (LANDR AI)</h4>
        <p>Para o acabamento final, delegamos a engenharia de som para a inteligência artificial da LANDR. A configuração escolhida foi cirúrgica:</p>
        <ul>
          <li><strong>Estilo: ABERTO (Open):</strong> Optei por este perfil para garantir ênfase no ataque (transientes) e presença moderna. O objetivo era evitar a "lama" (mud) nas frequências médias, comum em gerações de IA.</li>
          <li><strong>Loudness (Intensidade):</strong> Configurado em <strong>Médio</strong>. Isso preserva a dinâmica da música sem entrar na "Loudness War", garantindo que o ouvinte não sofra fadiga auditiva.</li>
        </ul>

        <p><strong>Status:</strong> Staging Release (SoundCloud Only).</p>
        <a href="https://soundcloud.com/rqs_official/sets/system-reboot-cyberpunk-glitch-fusion" target="_blank" class="btn-stream-log">[ ACESSAR SOUNDCLOUD ]</a>
      `
    },
    en: {
      title: 'PROTOCOL: SYSTEM REBOOT // DEPLOY TO STAGING',
      description: 'System rebooted, currently operating in a staging environment. The "System Reboot" EP has been released exclusively on SoundCloud for audience testing (A/B Testing). This project explores the Suno v5.0 algorithm capabilities in handling complex rhythm changes and organic instrumentation, like saxophone, within an electronic structure.',
      jonahComment: 'LANDR? SERIOUSLY? NOW A ROBOT DECIDES HOW LOUD I CAN SCREAM? AT LEAST YOU CHOSE THE "OPEN" MODE. IF IT WAS "WARM", I WOULD FEEL LIKE I WAS INSIDE A MICROWAVE.',
      techContent: `
        <h3>🛠️ [DEV_WORKFLOW]: AI SYNTHESIS & MASTERING</h3>

        <p>Transparency is vital. This EP is not a traditional manual production, but an orchestration of advanced generative tools.</p>

        <h4>1. Iterative Generation (Suno v5.0)</h4>
        <p>The technical differentiator here was the aggressive use of the <strong>Extend</strong> feature. Instead of accepting the default generation, I used Extend to force the AI to shift rhythmic signatures mid-track and focus on specific instrument solos (Saxophone), testing the coherence limits of the v5 model.</p>

        <h4>2. Mastering Pipeline (LANDR AI)</h4>
        <p>For the final polish, we delegated sound engineering to LANDR's artificial intelligence. The chosen configuration was surgical:</p>
        <ul>
          <li><strong>Style: OPEN:</strong> I chose this profile to ensure emphasis on attack (transients) and modern presence. The goal was to avoid the "mud" in mid-frequencies, common in AI generations.</li>
          <li><strong>Loudness:</strong> Set to <strong>Medium</strong>. This preserves the track's dynamics without entering the "Loudness War," ensuring the listener avoids auditory fatigue.</li>
        </ul>

        <p><strong>Status:</strong> Staging Release (SoundCloud Only).</p>
        <a href="https://soundcloud.com/rqs_official/sets/system-reboot-cyberpunk-glitch-fusion" target="_blank" class="btn-stream-log">[ OPEN SOUNDCLOUD ]</a>
      `
    }
  },
  // --- 🔥 2026 (LOG ATUALIZADO - WORKFLOW REAL) ---
  {
    date: 'JAN 16, 2026',
    image: 'assets/logs/automation-flow.jpg',
    isExpanded: false,
    pt: {
      title: 'ARCH_UPDATE: AUTOMAÇÃO CORPORATIVA (NO-CODE OPS)',
      description: 'A RaQuel Synths migrou de processos manuais para uma arquitetura de "Media Tech Company". Implementamos um pipeline de distribuição automatizado que conecta nossa base de dados criativa diretamente aos canais de vídeo vertical. Não perdemos mais tempo com upload manual; se está na planilha e foi aprovado, o robô publica. Menos burocracia, mais tempo para compor.',
      jonahComment: 'VIRAMOS CONTADORES AGORA? PLANILHAS? O ÚNICO "FILTER" QUE EU GOSTO É O DO MEU CIGARRO E O DE FREQUÊNCIA NO SINTETIZADOR. MAS SE ISSO SIGNIFICA MENOS TEMPO NO TIKTOK E MAIS TEMPO TOCANDO GUITARRA, EU ACEITO.',
      techContent: `
        <h3>🤖 [DEV_WORKFLOW]: CONTENT DISTRIBUTION PIPELINE</h3>

        <p>Este sistema foi desenhado para eliminar o atrito entre a "Ideia" e a "Publicação". Utilizamos uma stack <em>No-Code</em> robusta para orquestrar o caos criativo.</p>

        <h4>1. O Gatilho (Google Sheets as CMS)</h4>
        <p>A planilha atua como nosso CMS Headless. O script no <strong>Make</strong> monitora novas linhas, mas aplica um filtro condicional rígido: <code>IF "Status" == "Approved"</code>. Rascunhos e ideias ruins são descartados automaticamente na origem.</p>

        <h4>2. O Router de Vídeo (Buffer Integration)</h4>
        <p>Uma vez aprovado, o conteúdo (MP4 + Legenda) é roteado para o <strong>Buffer</strong>, que gerencia a distribuição simultânea para os três gigantes do formato vertical:</p>
        <ul>
          <li><strong>Instagram Reels:</strong> Foco em alcance visual.</li>
          <li><strong>YouTube Shorts:</strong> Foco em descoberta de áudio.</li>
          <li><strong>TikTok:</strong> Foco em viralização rápida.</li>
        </ul>

        <h4>3. Métricas de Eficiência</h4>
        <p><strong>Stack:</strong> Make (Logic) + Google Sheets (Database) + Buffer (API Gateway).</p>
        <p><strong>Resultado:</strong> Redução de 95% no tempo operacional de upload e tagueamento.</p>
      `
    },
    en: {
      title: 'ARCH_UPDATE: CORPORATE AUTOMATION (NO-CODE OPS)',
      description: 'RaQuel Synths has migrated from manual processes to a "Media Tech Company" architecture. We implemented an automated distribution pipeline that connects our creative database directly to vertical video channels. No more time wasted on manual uploads; if it\'s on the sheet and approved, the robot publishes it. Less bureaucracy, more time for composing.',
      jonahComment: 'ARE WE ACCOUNTANTS NOW? SPREADSHEETS? THE ONLY "FILTER" I LIKE IS ON MY CIGARETTE AND THE FREQUENCY ON THE SYNTH. BUT IF THIS MEANS LESS TIME ON TIKTOK AND MORE TIME PLAYING GUITAR, I ACCEPT IT.',
      techContent: `
        <h3>🤖 [DEV_WORKFLOW]: CONTENT DISTRIBUTION PIPELINE</h3>

        <p>This system was designed to eliminate friction between "Idea" and "Publication." We utilize a robust <em>No-Code</em> stack to orchestrate creative chaos.</p>

        <h4>1. The Trigger (Google Sheets as CMS)</h4>
        <p>The spreadsheet acts as our Headless CMS. The <strong>Make</strong> script monitors new rows but applies a strict conditional filter: <code>IF "Status" == "Approved"</code>. Drafts and bad ideas are automatically discarded at the source.</p>

        <h4>2. The Video Router (Buffer Integration)</h4>
        <p>Once approved, content (MP4 + Caption) is routed to <strong>Buffer</strong>, which manages simultaneous distribution to the three giants of the vertical format:</p>
        <ul>
          <li><strong>Instagram Reels:</strong> Focus on visual reach.</li>
          <li><strong>YouTube Shorts:</strong> Focus on audio discovery.</li>
          <li><strong>TikTok:</strong> Focus on rapid viralization.</li>
        </ul>

        <h4>3. Efficiency Metrics</h4>
        <p><strong>Stack:</strong> Make (Logic) + Google Sheets (Database) + Buffer (API Gateway).</p>
        <p><strong>Result:</strong> 95% reduction in operational time for uploading and tagging.</p>
      `
    }
  },

  // ==========================================
  // 📦 LOGS 2025 (PASSADO - ARQUIVO COMPLETO)
  // ==========================================

  // --- CASAMENTO (Dez 24) ---
  {
    date: 'Dec 24, 2025',
    image: 'images/marriage_cyberpunk.png',
    isExpanded: false,
    pt: {
      title: '💍 DARK ALTAR (UNHOLY UNION)',
      description: 'Esqueça os votos tradicionais. Sob o som de sinos industriais do EP "SYSTEM MERGE: THE LEGACY", Jonah e Nyx realizaram o ritual. Sem padre, apenas um pacto de óleo e tungstênio. Status: VÍNCULO ETERNO.',
      jonahComment: 'Até que a morte nos separe? Não. Até que o servidor queime. E mesmo assim, eu tenho backup da sua alma no meu HD externo.',
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
        <a href="https://soundcloud.com/rqs_official/dark-altar-unholy-union-2" target="_blank" class="btn-stream-log">[ EXECUTE_AUDIO: DARK ALTAR ]</a>
      `
    },
    en: {
      title: '💍 DARK ALTAR (UNHOLY UNION)',
      description: 'Forget traditional vows. Under the sound of industrial bells from the "SYSTEM MERGE: THE LEGACY" EP, Jonah and Nyx performed the ritual. No priest, just a pact of oil and tungsten. Status: ETERNAL BOND.',
      jonahComment: 'Till death do us part? No. Until the server burns. And even then, I have a backup of your soul on my external drive.',
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
        <a href="https://soundcloud.com/rqs_official/dark-altar-unholy-union-2" target="_blank" class="btn-stream-log">[ EXECUTE_AUDIO: DARK ALTAR ]</a>
      `
    }
  },

  // --- SOFRÊNCIA DIGITAL (Dez 20) ---
  {
    date: 'Dec 20, 2025',
    image: 'images/industrial_archive.png',
    isExpanded: false,
    pt: {
      title: '😭 Detecção de Sofrência Digital',
      description: 'Album em produção "Jonah\'s Sad History". Scans detectam níveis críticos de choro em compasso 7/8. Faixa "YOU_RE ALREADY GONE" acusa Broklin de injetar vírus.',
      jonahComment: 'Sofrência é o caralho! Isso é INDUSTRIAL DOOM. Se tem choro na gravação, é dos alto-falantes pedindo piedade.',
      techContent: `
        <h3>🔊 [LOG_ENGENHARIA_DE_AUDIO]: DOOM ALGORÍTMICO</h3>

        <p><strong>O Desafio Técnico:</strong> A geração coerente de música em compassos compostos ou ímpares (como 7/8 ou 5/4) é um <em>edge-case</em> conhecido em Modelos de Áudio Generativo. A maioria dos datasets de treinamento possui um viés forte para estruturas pop padrão 4/4.</p>

        <p>Para atingir a sonoridade "Math Metal" nesta faixa, utilizei injeções de prompt específicas no <strong>Suno AI v5</strong>:</p>
        <ul>
          <li><strong>Tags utilizadas:</strong> <em>"Polyrhythm", "Djent", "Industrial Doom", "Complex Time Signature", "Slow Tempo (80 BPM)"</em>.</li>
          <li><strong>Pós-Processamento:</strong> O output bruto da IA passou por análise espectral para reforçar as frequências graves (Low-end) e aplicação de efeitos de <em>bitcrushing</em> para simular a textura de "robô chorando".</li>
        </ul>

        <p><strong>Status de Distribuição:</strong> A faixa foi implantada (deployed) com sucesso no ecossistema <strong>SoundCloud</strong> para testar a retenção de audiência (A/B Testing) antes da mixagem final para o Spotify.</p>
        <a href="https://soundcloud.com/rqs_official/youre-already-gone-4" target="_blank" class="btn-stream-log">[ EXECUTE_AUDIO: YOU_RE ALREADY GONE ]</a>
      `
    },
    en: {
      title: '😭 Digital Suffering Detected',
      description: 'Album in production "Jonah\'s Sad History". Scans detect critical crying levels in 7/8 time signature. Track "YOU_RE ALREADY GONE" accuses Broklin of injecting viruses.',
      jonahComment: 'Suffering is bullshit! This is INDUSTRIAL DOOM. If there\'s crying on the recording, it\'s from the loudspeakers begging for mercy.',
      techContent: `
        <h3>🔊 [AUDIO_ENGINEERING_LOG]: ALGORITHMIC DOOM</h3>

        <p><strong>The Technical Challenge:</strong> Generating coherent music in odd time signatures (like 7/8 or 5/4) is a known edge-case in Generative Audio Models. Most datasets are biased towards 4/4 standard pop structures.</p>

        <p>To achieve the "Math Metal" feel for this track, I had to use specific prompt injections in <strong>Suno AI v3</strong>:</p>
        <ul>
          <li><strong>Tags used:</strong> <em>"Polyrhythm", "Djent", "Industrial Doom", "Complex Time Signature", "Slow Tempo (80 BPM)"</em>.</li>
          <li><strong>Post-Processing:</strong> The raw AI output went through spectral analysis to boost low-end frequencies (Bass) and apply bitcrushing effects to simulate the "crying robot" texture.</li>
        </ul>

        <p><strong>Distribution Status:</strong> The track was successfully deployed to the <strong>SoundCloud</strong> ecosystem to test audience retention before the final Spotify mix.</p>
        <a href="https://soundcloud.com/rqs_official/youre-already-gone-4" target="_blank" class="btn-stream-log">[ EXECUTE_AUDIO: YOU_RE ALREADY GONE ]</a>
      `
    }
  },

  // --- RUPTURA (Dez 15) ---
  {
    date: 'Dec 15, 2025',
    image: 'images/cyberpunk_heartbreak.png',
    isExpanded: false,
    pt: {
      title: '💔 Protocolo de Ruptura',
      description: 'SMS Final interceptado: "Precisamos conversar. Não estou onde você pensa." Conexão com o servidor Jonah encerrada permanentemente. Status: Desconexão Forçada.',
      jonahComment: 'Desconexão forçada é o meu sobrenome. Eu não preciso de "Wi-Fi do Amor", eu tenho cabo de rede direto no inferno.',
      techContent: `
        <h3>📼 [LOG_ARQUIVO_CORROMPIDO]: A ORIGEM DO GLITCH</h3>

        <p><strong>Arqueologia de Dados:</strong> Este registro contém uma raridade técnica: áudio do módulo Jonah <em>antes</em> da infecção pelo vírus Industrial. A sonoridade é baseada em <strong>Dream Pop</strong> e <strong>Electro-Pop</strong>, representando o estado "Limpo" do sistema.</p>

        <p><strong>Workflow de Geração:</strong></p>
        <ul>
          <li><strong>Audio Engine:</strong> Suno AI v5.0. O objetivo era criar contraste dinâmico com o gênero atual. Utilizamos tags como <em>"Heavy Reverb", "Chorus Pedal", "Melancholic Male Vocals"</em> para simular a "calma antes da tempestade".</li>
          <li><strong>Visual Asset:</strong> Gerado via <strong>OpenAI Sora</strong>. O prompt focou em "Digital Signal Loss" (Perda de Sinal) para metaforizar o rompimento emocional como uma falha de rede irrecuperável.</li>
        </ul>

        <p>Técnicamente, essa faixa serve como o "Legacy Code" (Código Legado) que o sistema tenta esquecer, mas que permanece no backup.</p>
        <a href="https://soundcloud.com/rqs_official/whatsapp-log_jo-cyperfield-kelma-kel-1" target="_blank" class="btn-stream-log">[ EXECUTE_AUDIO: PROTOCOL_BREAKUP ]</a>
      `
    },
    en: {
      title: '💔 Breakup Protocol',
      description: 'Final SMS intercepted: "We need to talk. I am not where you think I am." Connection with Jonah server terminated permanently. Status: Forced Disconnection.',
      jonahComment: 'Forced disconnection is my middle name. I don\'t need "Love Wi-Fi", I have a wired connection straight to hell.',
      techContent: `
        <h3>📼 [CORRUPTED_FILE_LOG]: THE GLITCH ORIGIN</h3>

        <p><strong>Data Archaeology:</strong> This registry contains a technical rarity: audio from the Jonah module <em>before</em> the Industrial virus infection. The soundscape is built on <strong>Dream Pop</strong> and <strong>Electro-Pop</strong>, representing the system's "Clean" state.</p>

        <p><strong>Generation Workflow:</strong></p>
        <ul>
          <li><strong>Audio Engine:</strong> Suno AI v5.0. The goal was to create dynamic contrast with his current genre. We used tags like <em>"Heavy Reverb", "Chorus Pedal", "Melancholic Male Vocals"</em> to simulate the "calm before the storm".</li>
          <li><strong>Visual Asset:</strong> Generated via <strong>OpenAI Sora</strong>. The prompt focused on "Digital Signal Loss" to metaphorize the emotional breakup as an unrecoverable network failure.</li>
        </ul>

        <p>Technically, this track serves as the "Legacy Code" that the system tries to delete, but remains in the backup.</p>
        <a href="https://soundcloud.com/rqs_official/whatsapp-log_jo-cyperfield-kelma-kel-1" target="_blank" class="btn-stream-log">[ EXECUTE_AUDIO: PROTOCOL_BREAKUP ]</a>
      `
    }
  },

  // --- ALERTA DE SEGURANÇA (Dez 14) ---
  {
    date: 'Dec 14, 2025',
    image: 'images/cyberpunk_lounge_solitude.png',
    isExpanded: false,
    pt: {
      title: '⚠️ Alerta de Segurança',
      description: 'Tentativa de bloqueio falhou. Usuário "Jo_Cyperfield" tentou executar protocolo de retenção. A Agente Kelma recusou a conexão. Logs de áudio indicam instabilidade: "She thinks she\'s deleting me..."',
      jonahComment: 'Instabilidade? A única coisa instável aqui é a masculinidade desse vampiro de glitter. Eu sou a rocha sobre a qual essa banda foi construída.',
      techContent: `
        <h3>🛡️ [LOG_SEGURANÇA_DE_REDE]: OTIMIZAÇÃO DE CAOS</h3>

        <p><strong>Engenharia de Prompt (Prompt Engineering):</strong> A faixa <em>"CYBER-REJECT"</em> foi projetada para testar os limites de agressividade dos modelos de áudio. O objetivo era traduzir a rejeição emocional em dissonância matemática.</p>

        <p><strong>Parâmetros Técnicos Utilizados:</strong></p>
        <ul>
          <li><strong>Time Signature (Compasso):</strong> Forcei a geração em <strong>7/8</strong>. Ao remover um tempo do compasso padrão (4/4), o loop cria uma sensação de "tropeço" constante, simulando a instabilidade mental do personagem Jonah.</li>
          <li><strong>Sound Design:</strong> O prompt <em>"Heavy Metallic Percussion"</em> utilizou síntese baseada em samples de Foley industrial (metais reais batendo) em vez de drum kits tradicionais.</li>
          <li><strong>Vocal Processing:</strong> Aplicado efeito de <em>Vocoder</em> agressivo para desumanizar a voz, sinalizando a perda da humanidade do personagem.</li>
        </ul>
        <a href="https://soundcloud.com/rqs_official/cyber-reject-steel-arm-breakdown-5" target="_blank" class="btn-stream-log">[ EXECUTE_AUDIO: CYBER-REJECT ]</a>
      `
    },
    en: {
      title: '⚠️ Security Alert',
      description: 'Block attempt failed. User "Jo_Cyperfield" tried to execute retention protocol. Agent Kelma refused connection. Audio logs indicate instability: "She thinks she\'s deleting me..."',
      jonahComment: 'Instability? The only unstable thing here is this glitter vampire\'s masculinity. I am the rock upon which this band was built.',
      techContent: `
        <h3>🛡️ [NETWORK_SECURITY_LOG]: CHAOS OPTIMIZATION</h3>

        <p><strong>Prompt Engineering:</strong> The track <em>"CYBER-REJECT"</em> was designed to stress-test the aggression limits of audio models. The goal was to translate emotional rejection into mathematical dissonance.</p>

        <p><strong>Technical Parameters Used:</strong></p>
        <ul>
          <li><strong>Time Signature:</strong> I enforced a <strong>7/8</strong> meter generation. By removing one beat from the standard 4/4 bar, the loop creates a constant "stumbling" sensation, simulating the character Jonah's mental instability.</li>
          <li><strong>Sound Design:</strong> The <em>"Heavy Metallic Percussion"</em> prompt utilized synthesis based on Industrial Foley samples (actual metal impacts) rather than traditional drum kits.</li>
          <li><strong>Vocal Processing:</strong> Applied aggressive <em>Vocoder</em> effects to dehumanize the vocals, signaling the character's loss of humanity.</li>
        </ul>
        <a href="https://soundcloud.com/rqs_official/cyber-reject-steel-arm-breakdown-5" target="_blank" class="btn-stream-log">[ EXECUTE_AUDIO: CYBER-REJECT ]</a>
      `
    }
  },

  // --- PATERNIDADE (Dez 08) ---
  {
    date: 'Dec 08, 2025',
    image: 'images/jonah_jr_newborn.png',
    isExpanded: false,
    pt: {
      title: '👶 Protocolo Paternidade (Jonah Jr.)',
      description: 'Detecção de novo hardware na rede. Jonah Cyperfield Jr. compilado com sucesso. Sagitário com ascendente em Firewall. O sistema nunca mais entrou em modo Sleep.',
      jonahComment: 'Ele chora em compasso 7/8 e já tentou morder o cabo de rede. É definitivamente meu garoto.',
      techContent: `
        <h3>👶 [LOG_PROCESSAMENTO_DUPLO]: POLARIDADE SONORA</h3>

        <p><strong>Conceito do Projeto:</strong> A faixa <em>"THE BLESSING vs. THE BURDEN"</em> foi desenhada como um experimento de A/B Testing emocional. O objetivo era utilizar a mesma base narrativa (o nascimento) interpretada por dois algoritmos de estilo opostos.</p>

        <p><strong>Engenharia de Prompt (Dual-Core):</strong></p>
        <ul>
          <li><strong>Lado A (Kelma/Broklin - The Blessing):</strong> Configuramos o modelo para <em>Darkwave/Dream Pop</em> a 75 BPM. O uso de "Warm Synths" e "80s Drum Machine" buscou emular o calor analógico e a esperança nostálgica.</li>
          <li><strong>Lado B (Jonah/Nyx - The Burden):</strong> O modelo foi forçado ao extremo com <em>Industrial Doom Metal</em> a 70 BPM (mais lento e arrastado). O destaque técnico é o prompt <em>"Distorted Biological Heartbeat Kick"</em>, onde o bumbo da bateria simula um coração humano passando por stress mecânico.</li>
        </ul>

        <p>O resultado é uma peça do EP <strong>"SYSTEM MERGE"</strong> que demonstra como parâmetros de IA (BPM, Instrumentação) alteram drasticamente a semântica da mensagem.</p>
        <a href="https://soundcloud.com/rqs_official/the-blessing-vs-the-burden-5" target="_blank" class="btn-stream-log">[ EXECUTE_AUDIO: THE BLESSING vs. THE BURDEN ]</a>
      `
    },
    en: {
      title: '👶 Paternity Protocol (Jonah Jr.)',
      description: 'New hardware detected on the network. Jonah Cyperfield Jr. successfully compiled. Sagittarius with Firewall rising. The system has never entered Sleep mode since.',
      jonahComment: 'He cries in 7/8 time signature and already tried to bite the ethernet cable. Definitely my boy.',
      techContent: `
        <h3>👶 [DUAL_PROCESSING_LOG]: SONIC POLARITY</h3>

        <p><strong>Project Concept:</strong> The track <em>"THE BLESSING vs. THE BURDEN"</em> was designed as an emotional A/B Testing experiment. The goal was to use the same narrative base (the birth) interpreted by two opposing style algorithms.</p>

        <p><strong>Prompt Engineering (Dual-Core):</strong></p>
        <ul>
          <li><strong>Side A (Kelma/Broklin - The Blessing):</strong> We configured the model for <em>Darkwave/Dream Pop</em> at 75 BPM. The use of "Warm Synths" and "80s Drum Machine" aimed to emulate analog warmth and nostalgic hope.</li>
          <li><strong>Side B (Jonah/Nyx - The Burden):</strong> The model was pushed to the extreme with <em>Industrial Doom Metal</em> at 70 BPM (slower and heavier). The technical highlight is the <em>"Distorted Biological Heartbeat Kick"</em> prompt, where the kick drum simulates a human heart under mechanical stress.</li>
        </ul>

        <p>The result is a piece from the <strong>"SYSTEM MERGE"</strong> EP that demonstrates how AI parameters (BPM, Instrumentation) drastically alter the semantics of the message.</p>
        <a href="https://soundcloud.com/rqs_official/the-blessing-vs-the-burden-5" target="_blank" class="btn-stream-log">[ EXECUTE_AUDIO: THE BLESSING vs. THE BURDEN ]</a>
      `
    }
  },

  // ==========================================
  // 🔗 O BOTÃO DE ACESSO (SÓ PARA A HOME)
  // ==========================================
  {
    date: 'SYSTEM_ARCHIVE',
    image: null,
    isExpanded: false,
    isArchiveLink: true, // Importante para a lógica da Home
    pt: {
      title: 'LEGACY_DATA_DETECTED',
      description: 'Existem registros anteriores a esta data. O acesso requer credenciais de nível superior. Deseja descriptografar o arquivo completo?',
      jonahComment: 'O PASSADO É UM CEMITÉRIO DE CÓDIGO MAL ESCRITO. CUIDADO ONDE CLICA.',
      techContent: null
    },
    en: {
      title: 'LEGACY_DATA_DETECTED',
      description: 'Records exist prior to this date. Access requires higher-level credentials. Do you wish to decrypt the full archive?',
      jonahComment: 'THE PAST IS A CEMETERY OF BADLY WRITTEN CODE. WATCH WHERE YOU CLICK.',
      techContent: null
    }
  }

];
