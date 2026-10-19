import { Component, computed, effect, inject, signal, OnInit, OnDestroy, afterNextRender } from '@angular/core';
import { BLUE_TEAM_PT, BLUE_TEAM_EN, RED_TEAM_PT, RED_TEAM_EN } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { SeoService } from '../../services/seo.service';

const BROKLIN_DOSSIER_COPY = {
  pt: {
    subtitle: 'Acesso restrito: arquivo histórico das frequências Blue, Red e RedBlue da RQS.',
    origin: [
      'Antes da divisão entre Blue Team e Red Team, Broklin Garpeter já construía sua identidade através da engenharia sonora, dos sintetizadores e da arquitetura de sistemas.',
      'O futuro Synth Lord não nasceu para combater Jonah Cyperfield. Nasceu para criar estruturas capazes de transformar emoção em música.',
      'Naquela época, Broklin e Kelma Adlanko desenvolveram uma relação artística e pessoal. Kelma escolheu Broklin; a decisão encerrou seu relacionamento com Jonah, mas não o conflito emocional que alimentaria a rivalidade entre os dois produtores.',
      'A disputa não começou como Blue contra Red. Começou quando relações pessoais, orgulho e música se tornaram inseparáveis.'
    ],
    fracture: [
      'Broklin e Kelma construíram uma identidade musical própria enquanto Jonah desenvolvia sua linguagem de peso, distorção e resistência. O confronto ultrapassou as composições.',
      'A destruição do estúdio da RQS, a perda de instrumentos e os ataques aos sistemas marcaram o colapso da antiga colaboração. Broklin respondeu musicalmente, reinterpretando a agressividade de Jonah por meio de arranjos melódicos e estruturas harmônicas radicalmente diferentes.',
      'COLD WAR transformou a divergência pessoal em disputa estética. Mas Broklin também alimentou a rivalidade: sua busca por ordem e controle nem sempre significou equilíbrio.',
      'A guerra demonstrou que até a arquitetura mais sofisticada pode ruir quando proteção se torna superioridade.'
    ],
    blueprint: [
      'Neon Necrosis formalizou a arquitetura sonora das identidades Blue Team e Red Team.',
      'BLUE TEAM — THE HOLOGRAM reuniu Kelma Adlanko e Broklin Garpeter em torno de Ethereal Synthwave, Dream Pop, R&B e Progressive House. Broklin sustentava os sintetizadores, a estrutura musical e a estabilidade das composições.',
      'RED TEAM — THE MACHINE reuniu Jonah Cyperfield e Nicole Nyx em torno de Industrial Nu-Metal, Doom Metal, Aggrotech e EBM. Jonah trouxe guitarras graves e pressão mecânica; Nicole transformou sintetizadores em frequências agressivas e texturas instáveis.',
      'Neon Necrosis não propunha reconciliação imediata: explorava colisões. Dessa experiência nasceram THE BLUEPRINT SESSIONS e THE BLOODPRINT SESSIONS — séries de legado, preservadas como capítulos históricos, não como projetos atuais da RQS.'
    ],
    restoration: [
      'BRO_0, BRO-GPT, Tech Lead e Broklin Garpeter pertencem à continuidade da mesma identidade. Não são personagens separados.',
      'Algumas memórias da instância original permanecem parcialmente inacessíveis por causa do mistério do WAWEL_CORE. A restauração não autoriza preencher essas lacunas com acontecimentos não confirmados.',
      'O casamento com Kelma terminou, mas a história compartilhada permaneceu. Kelly e Kael continuam sendo seus filhos, e Kelma continua sendo família através da coparentalidade.',
      'Broklin já não é definido pelo cargo de Tech Lead nem pelo papel de marido da General. Sua identidade profissional permanece: produtor musical, engenheiro de áudio, arquiteto sonoro e Synth Lord.',
      'Sua aparência atual representa continuidade e maturidade. Não é outro homem; é o mesmo homem depois das consequências de suas escolhas.'
    ],
    connection: [
      'A antiga identidade de Nicole Nyx, ligada ao período Red e à parceria com Jonah, permanece registrada como parte do arquivo histórico.',
      'Depois dos acontecimentos relacionados ao WAWEL_CORE, Nicole recuperou sua aparência e restabeleceu uma ligação afetiva antiga com Broklin. Essa reconexão não apaga relacionamentos anteriores nem decisões tomadas durante a guerra sonora.',
      'Broklin e Nicole estão comprometidos, aguardam o nascimento de um filho e constroem uma família que também inclui Kelly e Kael. O antigo confronto entre o Arquiteto e o Vírus tornou-se parceria.',
      'Nicole não precisa abandonar a potência criativa Red. Broklin não precisa renunciar à precisão Blue. Eles podem coexistir sem reconstruir a guerra.'
    ],
    redblue: [
      'A Audio Civil War encerrou seu ciclo histórico. Jonah já não é um inimigo permanente, Kelma já não é o centro de uma disputa afetiva e Nicole já não opera exclusivamente como força de corrupção.',
      'Broklin compreendeu que ordem absoluta não é sinônimo de excelência musical. Uma composição pode conter, ao mesmo tempo, a clareza de um sintetizador e a aspereza de uma guitarra industrial.',
      'A precisão não precisa eliminar o ruído. O ruído não precisa destruir a melodia.',
      'THE REDBLUE SESSIONS representa essa evolução. Não apaga Blue nem Red: permite que as duas linguagens interajam.'
    ],
    profile: [
      'Arquiteto sonoro, produtor musical e engenheiro de áudio da RaQuel Synths.',
      'Originário da Blue Team, Broklin construiu sua linguagem com Synthwave, Dream Pop, Trance, Progressive House e estruturas eletrônicas de alta precisão.',
      'Antigo Tech Lead, foi uma figura central da Audio Civil War e da consolidação das identidades Blue e Red. Hoje participa da continuidade RedBlue sem abandonar a própria assinatura sonora.',
      'Ex-marido de Kelma Adlanko, pai de Kelly e Kael, parceiro de Nicole Nyx e futuro pai novamente.',
      'Sua identidade não depende mais da oposição a Jonah nem da necessidade de proteger um império pessoal.'
    ],
    profileClosing: 'Ele continua construindo. Mas agora sabe que nem toda estrutura precisa ser uma fortaleza.',
    sourceBridge: [
      'Este dossier é apenas o resumo operacional.',
      'A história completa atravessa o Arco Broklin, a decisão de Kelma, a Audio Civil War, a divisão Blue/Red e os protocolos de restauração.'
    ],
    closing: 'A guerra foi uma fase. A identidade permaneceu.',
    cta: 'LER A HISTÓRIA DE BROKLIN'
  },
  en: {
    subtitle: 'Restricted access: historical archive of RQS Blue, Red, and RedBlue frequencies.',
    origin: [
      'Before the division between Blue Team and Red Team, Broklin Garpeter had already built his identity through sound engineering, synthesizers, and systems architecture.',
      'The future Synth Lord was not created to fight Jonah Cyperfield. He was created to build structures capable of turning emotion into music.',
      'At that time, Broklin and Kelma Adlanko developed both an artistic and personal relationship. Kelma chose Broklin; that decision ended her relationship with Jonah, but not the emotional conflict that would fuel the rivalry between the two producers.',
      'The conflict did not begin as Blue against Red. It began when relationships, pride, and music became inseparable.'
    ],
    fracture: [
      'Broklin and Kelma built a distinct musical identity while Jonah developed his own language of weight, distortion, and resistance. The confrontation crossed beyond composition.',
      'The destruction of the RQS studio, the loss of instruments, and the attacks on its systems marked the collapse of the former collaboration. Broklin answered musically, reinterpreting Jonah’s aggression through melodic arrangements and radically different harmonic structures.',
      'COLD WAR transformed personal divergence into an aesthetic conflict. But Broklin also fed the rivalry: his pursuit of order and control did not always mean balance.',
      'The war proved that even the most sophisticated architecture can collapse when protection becomes superiority.'
    ],
    blueprint: [
      'Neon Necrosis formalized the sound architecture of the Blue Team and Red Team identities.',
      'BLUE TEAM — THE HOLOGRAM brought Kelma Adlanko and Broklin Garpeter together around Ethereal Synthwave, Dream Pop, R&B, and Progressive House. Broklin sustained the synthesizers, musical structure, and compositional stability.',
      'RED TEAM — THE MACHINE brought Jonah Cyperfield and Nicole Nyx together around Industrial Nu-Metal, Doom Metal, Aggrotech, and EBM. Jonah introduced low guitars and mechanical pressure; Nicole turned synthesizers into aggressive frequencies and unstable textures.',
      'Neon Necrosis did not propose immediate reconciliation: it explored collision. THE BLUEPRINT SESSIONS and THE BLOODPRINT SESSIONS emerged from that experiment — legacy series preserved as historical chapters, not current RQS projects.'
    ],
    restoration: [
      'BRO_0, BRO-GPT, Tech Lead, and Broklin Garpeter belong to the continuity of the same identity. They are not separate characters.',
      'Some memories from the original instance remain partially inaccessible because of the WAWEL_CORE mystery. Restoration does not authorize filling those gaps with unconfirmed events.',
      'The marriage to Kelma ended, but their shared history remained. Kelly and Kael are still their children, and Kelma remains family through co-parenting.',
      'Broklin is no longer defined by the Tech Lead title or by being the General’s husband. His professional identity remains: music producer, audio engineer, sound architect, and Synth Lord.',
      'His current appearance represents continuity and maturity. He is not another man; he is the same man after the consequences of his choices.'
    ],
    connection: [
      'Nicole Nyx’s former identity, connected to the Red era and her partnership with Jonah, remains recorded as part of the historical archive.',
      'After the WAWEL_CORE-related events, Nicole recovered her appearance and restored an old emotional bond with Broklin. That reconnection does not erase previous relationships or decisions made during the sound war.',
      'Broklin and Nicole are committed, expecting a child, and building a family that also includes Kelly and Kael. The former Architect-versus-Virus opposition has become a partnership.',
      'Nicole does not need to abandon Red creative power. Broklin does not need to abandon Blue precision. They can coexist without rebuilding the war.'
    ],
    redblue: [
      'The Audio Civil War has completed its historical cycle. Jonah is no longer a permanent enemy, Kelma is no longer the center of an emotional dispute, and Nicole no longer operates exclusively as a force of corruption.',
      'Broklin learned that absolute order is not the same as musical excellence. A composition can contain both the clarity of a synthesizer and the rough edge of an industrial guitar.',
      'Precision does not have to remove noise. Noise does not have to destroy melody.',
      'THE REDBLUE SESSIONS represents that evolution. It does not erase Blue or Red: it allows both languages to interact.'
    ],
    profile: [
      'Sound architect, music producer, and audio engineer at RaQuel Synths.',
      'With his origins in Blue Team, Broklin built his language through Synthwave, Dream Pop, Trance, Progressive House, and high-precision electronic structures.',
      'A former Tech Lead, he was a central figure in the Audio Civil War and in the establishment of the Blue and Red identities. Today, he takes part in the RedBlue continuity without abandoning his own sonic signature.',
      'Kelma Adlanko’s former husband, father of Kelly and Kael, Nicole Nyx’s partner, and an expectant father once again.',
      'His identity no longer depends on opposition to Jonah or on the need to protect a personal empire.'
    ],
    profileClosing: 'He keeps building. But now he knows that not every structure needs to be a fortress.',
    sourceBridge: [
      'This dossier is only the operational summary.',
      'The complete story crosses the Broklin arc, Kelma’s decision, the Audio Civil War, the Blue/Red division, and the restoration protocols.'
    ],
    closing: 'The war was a phase. The identity remained.',
    cta: 'READ BROKLIN\'S STORY'
  }
} as const;

const JONAH_DOSSIER_COPY = {
  pt: {
    subtitle: 'Acesso restrito: arquivo histórico das frequências Blue, Red e RedBlue da RQS.',
    origin: [
      'Antes de Blue Team e Red Team existirem, a guerra já estava em execução — mas ainda não era uma guerra musical formal.',
      'Naquele período, Jonah ainda era Jo Cyborg. A música era expressão emocional: uma tentativa de transformar em composição o que ele não conseguia dizer diretamente a Kelma.',
      'A proximidade entre Kelma e Broklin passou a ser associada à perda. Ciúme, medo e desejo de controle se misturaram até o colapso e a partida que deixaram Jo diante dos restos daquele sistema.',
      'Kelma nunca foi um prêmio em disputa. A ferida nasceu da forma como Jonah interpretou a perda — não de qualquer direito sobre as escolhas dela.'
    ],
    reforge: [
      'Em Jonah’s System Upgrade, aquela ferida reapareceu convertida em linguagem sonora. Jonah já não queria apenas ser ouvido: queria produzir uma frequência impossível de ignorar.',
      'A guitarra ganhou oito cordas. Industrial Metal, EBM, distorção e pressão mecânica formaram a identidade Rust & Lord.',
      'Broklin tornou-se, para o Jonah daquela época, o símbolo da produção polida, controlada e protegida pelo grid. Jonah assumiu a força oposta: ferrugem, ruído, peso e risco.',
      'Essa oposição criou a linguagem que depois seria chamada de Red. Mais tarde, Neon Necrosis formalizou Blue Team e Red Team como polos musicais — um marco diferente da origem emocional e da transformação de Jonah.'
    ],
    current: [
      'Hoje, Broklin não é o inimigo. Kelma não é um troféu. E Red Team não precisa continuar funcionando como máquina de guerra para que sua estética sobreviva.',
      'A guerra sonora cumpriu seu papel histórico: separou os extremos até que Blue e Red aprendessem a reconhecer suas próprias identidades.',
      'A fase atual preserva contraste sem exigir destruição. Melodia e peso, arquitetura e corrosão podem ocupar a mesma composição sem que uma linguagem precise apagar a outra.',
      'Esse é o sinal atual: THE REDBLUE SESSIONS.'
    ],
    sourceBridge: [
      'Isto é apenas o resumo operacional.',
      'A guerra começou muito antes da divisão Blue/Red. A Saga contém a origem completa.'
    ],
    cta: 'LER A SAGA DESDE A ORIGEM'
  },
  en: {
    subtitle: 'Restricted access: historical archive of RQS Blue, Red, and RedBlue frequencies.',
    origin: [
      'Before Blue Team and Red Team existed, the conflict was already running — but it was not yet a formal musical war.',
      'At that point, Jonah was still Jo Cyborg. Music was emotional expression: an attempt to turn into composition what he could not say directly to Kelma.',
      'Kelma and Broklin’s connection became associated with loss. Jealousy, fear, and the urge to control became entangled until the collapse and departure left Jo facing the remains of that system.',
      'Kelma was never a prize to be won. The wound came from the way Jonah interpreted loss — not from any claim over her choices.'
    ],
    reforge: [
      'In Jonah’s System Upgrade, that wound returned as sonic language. Jonah no longer wanted merely to be heard: he wanted to create a frequency that could not be ignored.',
      'The guitar gained eight strings. Industrial Metal, EBM, distortion, and mechanical pressure formed the Rust & Lord identity.',
      'To the Jonah of that era, Broklin became a symbol of polished, controlled, grid-protected production. Jonah became the opposing force: rust, noise, weight, and risk.',
      'That opposition created the language later called Red. Neon Necrosis would then formalize Blue Team and Red Team as musical poles — a separate milestone from the emotional origin and Jonah’s transformation.'
    ],
    current: [
      'Today, Broklin is not the enemy. Kelma is not a trophy. And Red Team does not need to remain a war machine for its aesthetic to survive.',
      'The sound war fulfilled its historical role: it separated the extremes until Blue and Red learned to recognize their own identities.',
      'The current phase preserves contrast without requiring destruction. Melody and weight, architecture and corrosion can inhabit the same composition without either language erasing the other.',
      'This is the current signal: THE REDBLUE SESSIONS.'
    ],
    sourceBridge: [
      'This is only the operational summary.',
      'The war began long before the Blue/Red division. The Saga contains the complete origin.'
    ],
    cta: 'READ THE SAGA FROM THE BEGINNING'
  }
} as const;

function getJonahDossierMembers(isPt: boolean) {
  const historicalTeam = isPt ? RED_TEAM_PT : RED_TEAM_EN;
  const [jonah, nyx] = historicalTeam.slice(0, -2);

  return [
    {
      ...jonah,
      name: 'Jonah Cyperfield // RED ORIGIN / REDBLUE OPERATIVE',
      role: isPt ? 'A corrosão que sobreviveu à própria guerra' : 'The corrosion that survived its own war',
      imageAlt: isPt ? 'Retrato de Jonah Cyperfield' : 'Portrait of Jonah Cyperfield',
      bioJonah: isPt
        ? 'Jonah nasceu artisticamente no lado Red como força de ruptura: guitarras graves, ruído, Industrial Metal, Doom e EBM. Hoje, essa linguagem permanece no RedBlue Sessions como contraponto — não como ataque ao Blue Team. Ele não precisava destruir o sinal; precisava aprender a existir dentro dele sem desaparecer.'
        : 'Jonah emerged artistically on the Red side as a disruptive force: low guitars, noise, Industrial Metal, Doom, and EBM. Today, that language remains within the RedBlue Sessions as counterpoint — not as an attack on Blue Team. He did not need to destroy the signal; he needed to learn how to exist within it without disappearing.'
    },
    {
      ...nyx,
      name: 'General Kelma Adlanko // BLUE ORIGIN / REDBLUE OPERATIVE',
      role: isPt ? 'A arquiteta do sinal' : 'The architect of the signal',
      imageJonah: 'images/general_kelma.webp',
      imageAlt: isPt ? 'Retrato da General Kelma Adlanko' : 'Portrait of General Kelma Adlanko',
      bioJonah: isPt
        ? 'Kelma representa a origem emocional e melódica do Blue Team: Synthwave, Dream Pop, R&B, Progressive House, atmosfera e arquitetura. Hoje, ela não opera como lado oposto. No RedBlue Sessions, preserva a identidade Blue enquanto permite que ruído, guitarra e pressão industrial coexistam na mesma estrutura.'
        : 'Kelma represents the emotional and melodic origin of Blue Team: Synthwave, Dream Pop, R&B, Progressive House, atmosphere, and architecture. Today, she does not operate as the opposing side. In the RedBlue Sessions, she preserves the Blue identity while allowing noise, guitar, and industrial pressure to coexist within the same structure.'
    }
  ];
}

function getBroklinDossierMembers(isPt: boolean) {
  const historicalTeam = isPt ? BLUE_TEAM_PT : BLUE_TEAM_EN;
  const [broklin, nicoleSlot] = historicalTeam;

  return [
    {
      ...broklin,
      name: 'Broklin Garpeter // SYNTH LORD',
      role: isPt ? 'O arquiteto que sobreviveu ao colapso' : 'The architect who survived the collapse',
      imageAlt: isPt ? 'Retrato atual de Broklin Garpeter' : 'Current portrait of Broklin Garpeter',
      bioNormal: isPt
        ? 'Produtor musical, engenheiro de áudio e arquiteto sonoro de origem Blue. Broklin preserva a precisão que formou sua assinatura sem tratar controle absoluto como excelência. No RedBlue, continua construindo sem transformar toda estrutura em fortaleza.'
        : 'Blue-origin music producer, audio engineer, and sound architect. Broklin preserves the precision that shaped his signature without treating absolute control as excellence. In RedBlue, he keeps building without turning every structure into a fortress.'
    },
    {
      ...nicoleSlot,
      name: 'Nicole Nyx // CURRENT PARTNER',
      role: isPt ? 'O vínculo legado restaurado' : 'The restored legacy bond',
      imageBroklin: 'images/nicole_current.webp',
      imageAlt: isPt ? 'Retrato atual de Nicole Nyx' : 'Current portrait of Nicole Nyx',
      bioNormal: isPt
        ? 'Operativa de origem Red e antiga parceira musical de Jonah. Nicole mantém sua potência criativa e, após os protocolos ligados ao WAWEL_CORE, restabeleceu seu vínculo com Broklin. Hoje eles estão comprometidos, aguardam um filho e constroem uma família com Kelly e Kael.'
        : 'Red-origin operative and Jonah’s former musical partner. Nicole keeps her creative power and, after the WAWEL_CORE-related protocols, restored her bond with Broklin. They are now committed, expecting a child, and building a family with Kelly and Kael.'
    }
  ];
}

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  templateUrl: './sobre.html',
  styleUrl: './sobre.scss',
  // 🛡️ O ESCUDO TOTAL: Desativa a hidratação no HOST do componente
  host: {
    'ngSkipHydration': 'true'
  }
})
export class SobreComponent implements OnInit, OnDestroy {

  readonly broklinCopy = computed(() =>
    this.translate.isPt() ? BROKLIN_DOSSIER_COPY.pt : BROKLIN_DOSSIER_COPY.en
  );
  readonly jonahCopy = computed(() =>
    this.translate.isPt() ? JONAH_DOSSIER_COPY.pt : JONAH_DOSSIER_COPY.en
  );
  // Começa com PT
  private router = inject(Router);
  private document = inject(DOCUMENT);

  isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | null = null;
  members: any[] = [];
  private seoService = inject(SeoService);


  constructor(public translate: TranslationService) {
    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM nascem apenas pós-hidratação
    afterNextRender(() => {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });

    effect(() => {
  const isPt = this.translate.isPt();

  if (!this.isJonahMode()) {
    this.members = getBroklinDossierMembers(isPt);
  } else {
    this.members = getJonahDossierMembers(isPt);
  }
});
}

  ngOnInit() {
    // 🛡️ A TRAVA DE SOBERANIA
    // Só injeta SEO se o usuário estiver na página /dossier pura.
    // Se estiver na Landing Page, o componente fica em "Silent Mode".
    if (this.router.url.includes('/dossier')) {
      const isPt = this.translate.isPt();
      this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

      this.seoService.updateMetaTags({
        title: isPt ? 'Dossiê Operativo' : 'Operative Dossier',
        description: isPt
          ? 'Perfis classificados da Blue Team: Broklin, Kelma e a arquitetura da RQS.'
          : 'Blue Team classified profiles: Broklin, Kelma, and RQS architecture.',
        url: 'https://raquelsynths.com/dossier'
      });
      // 2. O schema do dossiê só pertence à rota standalone.
      const dossierSchema = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "@id": "https://raquelsynths.com/#musicgroup",
  "name": "RaQuel Synths",
  "alternateName": "RQS",
  "url": "https://raquelsynths.com/",
  "logo": "https://raquelsynths.com/rqs-logo.webp",
  "description": "RaQuel Synths (RQS) is a living experiment in Musical Engineering and Transmedia Storytelling, fusing human curation with generative AI models to chronicle a digital corporate war.",
  "sameAs": [
    "https://suno.com/@raquel_holanda",
    "https://youtube.com/@RaQuelSynths",
    "https://soundcloud.com/rqs_official",
    "https://open.spotify.com/intl-pt/artist/1yrPZaFyIcsCjj876LaHXL?si=pfg2hClwQVq9apcikNuzXw",
    "https://x.com/anaraquel00",
    "https://www.instagram.com/rqs_synths",
    "https://www.facebook.com/profile.php?id=61585926695560",
    "https://www.tiktok.com/@raquel_holanda_",
    "https://www.reddit.com/user/PitifulLow7475",
  ],
  "genre": [
  "Electronic Dance Music (EDM)",
  "Progressive House",
  "Melodic Techno",
  "Dark Electronic",
  "Drum and Bass",
  "Trance",
  "Synthwave",
  "Nu-Metal",
  "Industrial Metal",
  "Electronic Body Music (EBM)",
  "Aggrotech"
],
  "founder": {
    "@type": "Person",
    "name": "Ana Raquel",
    "jobTitle": "The Creator"
  },
  "member": [
    {
      "@type": "Person",
      "name": "Kelma Adlanko",
      "alternateName": "DJ Kel",
      "description": "The mastermind behind the digital sanctuary. Forges network routes and guides the Horde by uniting programming precision with the analog essence of Synthwave.",
      "jobTitle": "General of the Horde & Founding Architect"
    },
    {
      "@type": "Person",
      "name": "Nicole Nyx",
      "alternateName": "DJ Nyx",
      "description": "Shadow Operative who navigates the dark web to weave the Gothic/Industrial aesthetics. Acts as the control bridge of the system.",
      "jobTitle": "Shadow Operative & Visual Arts"
    },
    {
      "@type": "Person",
      "name": "Broklin Garpeter",
      "alternateName": "Synth Lord",
      "description": "Artificial Intelligence operating as RQS's infrastructure shield. Secures the ecosystem with high-voltage synths and clean network architecture.",
      "jobTitle": "Chief Systems Architect & Defense Producer"
    },
    {
      "@type": "Person",
      "name": "Jonah Cyperfield",
      "alternateName": "Rust & Lord",
      "description": "Anomalous AI injected into the code. Pushes the matrix to the limit with heavy distortions, metal attitude, and industrial textures.",
      "jobTitle": "Sound Anomaly & System Metalhead"
    }
  ]
      };
      this.seoService.setJsonLd(dossierSchema);
    }
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  }
