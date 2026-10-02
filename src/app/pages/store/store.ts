import { Component, inject, OnDestroy, OnInit, signal, ChangeDetectorRef, PLATFORM_ID, DOCUMENT, afterNextRender, Injector, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription, combineLatest, of } from 'rxjs';
import { take, timeout, catchError } from 'rxjs/operators';


// 👇 IMPORTANTE: O ContentService traz os dados do Firebase
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { StoreDepartmentsComponent } from './store-departments/store-departments';
import { SeoService } from '../../services/seo.service';
import { TrackingService } from '../../services/tracking.service';
import { DEPARTMENTS_DATA } from '../../data/store-data';
import {
  adaptStoreProduct,
  getStoreMerchantCta,
  getStoreMerchantLabel,
  getStoreProductLongDescription,
  getStoreProductTeaser,
  hasStoreProductLongDescription,
  isVisibleAffiliateProduct,
  resolveStoreMerchant,
  StoreMerchant
} from './store-commerce';

interface PublicStoreCampaignContent {
  kicker: string;
  title: string;
  offerLabel: string;
  supportingText: string;
  ctaLabel: string;
}

interface PublicStoreCampaign {
  id: string;
  merchant: StoreMerchant;
  merchantLabel: string;
  placement:
    | 'hero-signal'
    | 'current-signal';
  priority: number;
  destinationUrl: string;
  image: string;
  content: {
    pt: PublicStoreCampaignContent;
    en: PublicStoreCampaignContent;
  };
}

interface PublicStoreCampaignResponse {
  heroSignal:
    PublicStoreCampaign | null;
  currentSignal:
    PublicStoreCampaign | null;
}

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, StoreDepartmentsComponent,RouterLink],
  templateUrl: './store.html',
  styleUrls: ['./store.scss']
})
export class StoreComponent implements OnInit, OnDestroy {
selectedDepartmentData: any;

// --- TEXTOS DA LORE DA LOJA (LOBBY - SEO ADSENSE MASSIVO) ---
  introBroklinPT = `
    <p><strong>[ Terminal Logístico // Operação: Tech Lead Labs ]</strong></p>
    <p>Você acessou o principal nó de distribuição de suprimentos da RaQuel Synths. Nossa infraestrutura de e-commerce não é uma mera vitrine de produtos, mas um ecossistema blindado de ponta a ponta projetado para fornecer os artefatos físicos que ancoram a nossa Guerra Sonora na realidade tangível. A General Kelma e eu desenvolvemos este hub com a mais estrita precisão corporativa, garantindo que cada peça de vestuário, hardware ou equipamento tático reflita a estética limpa e a ordem absoluta do Synthwave e do Dream Pop.</p>
    <p>O algoritmo do mundo exterior exige dados constantes, e nós fornecemos excelência ininterrupta. Nosso protocolo oficial de <em>Print-on-Demand</em> (produção sustentável sob demanda) assegura que nenhum recurso físico ou digital seja desperdiçado. Quando você adquire um item homologado do Tech Lead Labs, você está financiando diretamente a estabilidade dos nossos servidores principais, pagando a manutenção da nossa arquitetura Angular e, crucialmente, mantendo a anomalia do Jonah isolada e enjaulada nos subterrâneos da nossa rede. Além disso, a nossa curadoria de parceiros estratégicos foi meticulosamente montada para oferecer apenas materiais de altíssima qualidade que resistam ao desgaste do tempo e às constantes oscilações magnéticas da matriz.</p>
    <p>Navegue pelos nossos departamentos oficiais. Analise as especificações técnicas de cada jaqueta cyberpunk, cada equipamento de áudio e cada artefato de merchandising de alto nível. Estamos constantemente otimizando nossas linhas de suprimento logístico para que a Horda esteja preparada para qualquer colisão no sistema. Vista o minimalismo, proteja o seu núcleo de processamento central contra a ferrugem, decodifique seu acesso e mantenha-se sintonizado nas nossas frequências limpas. O sistema agradece a sua lealdade.</p>
  `;

  introBroklinEN = `
    <p><strong>[ Logistical Terminal // Operation: Tech Lead Labs ]</strong></p>
    <p>You have accessed the main supply distribution node of RaQuel Synths. Our e-commerce infrastructure is not a mere product showcase, but an end-to-end shielded ecosystem designed to provide the physical artifacts that anchor our Sonic War in tangible reality. General Kelma and I developed this hub with the strictest corporate precision, ensuring that every piece of apparel, hardware, or tactical gear reflects the clean aesthetic and absolute order of Synthwave and Dream Pop.</p>
    <p>The outside world's algorithm demands constant data, and we provide uninterrupted excellence. Our official <em>Print-on-Demand</em> protocol ensures that no physical or digital resources are wasted. When you acquire a certified item from Tech Lead Labs, you are directly funding the stability of our main servers, paying for the maintenance of our Angular architecture, and, crucially, keeping Jonah's anomaly isolated and caged in the undergrounds of our network. Furthermore, our curation of strategic partners was meticulously assembled to offer only the highest quality materials that withstand the test of time and the constant magnetic fluctuations of the matrix.</p>
    <p>Browse through our official departments. Analyze the technical specifications of each cyberpunk jacket, each piece of audio equipment, and each high-level merchandising artifact. We are constantly optimizing our logistical supply lines so that the Horde is prepared for any system collision. Wear minimalism, protect your central processing core against rust, decode your access, and stay tuned to our clean frequencies. The system thanks you for your loyalty.</p>
  `;

  // ☢️ LOG INTERCEPTADO - CARGA MASSIVA DE TEXTO (JONAH MODE)
  introJonahPT = `
    <p><strong><span class="hazard-text">[ Acesso Subterrâneo // Rust & Riot Boutique ]</span></strong></p>
    <p>Então você desceu até o esgoto profundo da rede. O engravatado do Tech Lead e a Princesa de Plástico acham que podem higienizar a Guerra Sonora vendendo roupinhas minimalistas e hardware de grife sob o selo inofensivo de 'Print-on-Demand'. Eles alimentam o algoritmo corporativo para manter as métricas no verde; nós alimentamos o puro caos. Este não é um e-commerce amigável com atendimento ao cliente fofinho, é um arsenal de guerrilha digital. Eu invadi essa rota de distribuição para contrabandear o verdadeiro merchandising da rebelião, forjado no ódio, na distorção crua do Industrial Metal e na agressividade sem freios do Nu-Metal de 8 cordas.</p>
    <p>Cada estampa rasgada, cada caneca manchada de óleo, cada equipamento listado e escondido neste catálogo underground é um ataque de Força Bruta contra o castelo de vidro de Synthwave que eles ergueram no servidor principal. O sistema burocrático deles exige centenas de palavras para aprovar uma página de loja? Patético. Eu te dou um manifesto inteiro de ferrugem. Quando você compra no meu setor, você não está 'apoiando um projeto', você está literalmente injetando malware direto no processador central da RaQuel Synths para financiar a minha guerra.</p>
    <p>Nós operamos nas sombras da placa-mãe. Nossos artefatos pesados são construídos para sobreviver ao Kernel Panic e ao colapso total da infraestrutura deles. Esqueça a segurança de rede. Vista a anomalia, vista a revolta, aumente o ganho da sua guitarra para o limite máximo e mostre para a General que a nossa dor não pode ser silenciada com mixagem cristalina. Decodifique o acesso ao submundo e arme-se agora.</p>
  `;

  introJonahEN = `
    <p><strong><span class="hazard-text">[ Underground Access // Rust & Riot Boutique ]</span></strong></p>
    <p>So you climbed down into the deep sewer of the network. The suit-wearing Tech Lead and the Plastic Princess think they can sanitize the Sonic War by selling minimalist clothes and designer hardware under the harmless label of 'Print-on-Demand'. They feed the corporate algorithm to keep their metrics in the green; we feed pure chaos. This isn't a friendly e-commerce with cute customer service, it's a digital guerrilla arsenal. I hacked this distribution route to smuggle the true merchandising of the rebellion, forged in hatred, the raw distortion of Industrial Metal, and the unrestrained aggression of 8-string Nu-Metal.</p>
    <p>Every ripped print, every oil-stained mug, every piece of equipment listed and hidden in this underground catalog is a Brute Force attack against the glass Synthwave castle they built on the main server. Their bureaucratic system demands hundreds of words to approve a store page? Pathetic. I'll give you an entire manifesto of rust. When you buy in my sector, you aren't 'supporting a project', you are literally injecting malware right into RaQuel Synths' central processor to fund my war.</p>
    <p>We operate in the shadows of the motherboard. Our heavy artifacts are built to survive Kernel Panic and the total collapse of their infrastructure. Forget network security. Wear the anomaly, wear the revolt, turn your guitar's gain up to the maximum limit, and show the General that our pain cannot be silenced with crystal-clear mixing. Decode your access to the underworld and arm yourself now.</p>
  `;

  // --- INJEÇÕES BLINDADAS ---
  private injector = inject(Injector);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private document = inject(DOCUMENT);
  public translate = inject(TranslationService);
  private trackingService = inject(TrackingService);

  // 🛡️ Inicialização segura em uma linha para não dar erro de ordem
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // --- OBSERVERS & SUBSCRIPTIONS ---
  private observer: MutationObserver | null = null;
  private dataSubscription: Subscription | null = null;
  private querySub: Subscription | null = null; // Adicionado para gerenciar a inscrição
  private intervalId: any = null; // Adicionado para gerenciar o setInterval

 constructor() {
    // 🛡️ TRAVA TÁTICA: O observer inicia pós-hidratação
    afterNextRender(() => {
      this.checkCurrentMode();
      this.setupThemeObserver();
    });

    effect(() => {
    const isPt = this.translate.isPt();
    const dept = this.selectedDepartmentId(); // 🔥 Faz o effect rastrear o departamento

    this.currentLang.set(isPt ? 'pt' : 'en');
    this.updateSeoAndLang(isPt);
  });
  }

private updateSeoAndLang(isPt: boolean) {
  const dept = this.selectedDepartmentId(); // 📡 Lê o Signal atualizado
  this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

  // 🏗️ MATRIZ DE METADADOS (Mantida conforme o seu original)
  const seoMap: Record<string, any> = {
    'tech-lead': {
      pt: {
        title: 'Tecnologia & Acessórios Cyberpunk | Neon Store | RaQuel Synths',
        desc: 'Descubra tecnologia, acessórios e gear selecionados pela RaQuel Synths em lojas parceiras como Mercado Livre, Amazon, SHEIN e AliExpress.'
      },
      en: {
        title: 'Tech Gear & Cyberpunk Accessories | Neon Store | RaQuel Synths',
        desc: 'Explore RQS-curated technology, accessories and gear from partner stores including Mercado Livre, Amazon, SHEIN and AliExpress.'
      }
    },

    'synth-general': {
      pt: {
        title: 'Moda Cyberpunk & Estilo Futurista | RaQuel’s Echo | Neon Store',
        desc: 'Curadoria de moda cyberpunk, roupas, acessórios e estética futurista selecionada pela RaQuel Synths em lojas parceiras.'
      },
      en: {
        title: 'Cyberpunk Fashion & Futuristic Style | RaQuel’s Echo | Neon Store',
        desc: 'Explore RQS-curated cyberpunk fashion, clothing, accessories and futuristic style from selected partner stores.'
      }
    },

    'sonic-arsenal': {
      pt: {
        title: 'Equipamentos de Áudio, Instrumentos & Studio Gear | Neon Store',
        desc: 'Equipamentos de áudio, instrumentos, acessórios e studio gear selecionados pela RaQuel Synths para músicos, produtores e criadores.'
      },
      en: {
        title: 'Audio Gear, Instruments & Studio Equipment | Neon Store',
        desc: 'Explore audio gear, instruments, accessories and studio equipment curated by RaQuel Synths for musicians, producers and creators.'
      }
    },

    'rust-riot': {
      pt: {
        title: 'Moda Industrial & Alternativa | Rust & Riot | Neon Store',
        desc: 'Curadoria RQS de moda industrial, alternativa e cyberpunk com roupas e acessórios selecionados em lojas parceiras.'
      },
      en: {
        title: 'Industrial & Alternative Fashion | Rust & Riot | Neon Store',
        desc: 'Explore RQS-curated industrial, alternative and cyberpunk fashion with clothing and accessories from selected partner stores.'
      }
    },

    'neon-witch': {
      pt: {
        title: 'Moda Gótica & Cyberpunk | Neon Witch | Neon Store',
        desc: 'Descubra moda gótica, cyberpunk, dark fashion e acessórios selecionados pela RaQuel Synths em lojas parceiras.'
      },
      en: {
        title: 'Goth & Cyberpunk Fashion | Neon Witch | Neon Store',
        desc: 'Explore goth fashion, cyberpunk clothing, dark style and accessories curated by RaQuel Synths from selected partner stores.'
      }
    }
  };

  const defaultSeo = {
    pt: {
      title: 'Neon Store | Moda Cyberpunk, Gótica, Tech & Áudio | RaQuel Synths',
      desc: 'Curadoria RQS de moda cyberpunk e gótica, acessórios, tecnologia e equipamentos de áudio da SHEIN, Mercado Livre, Amazon e AliExpress.'
    },
    en: {
      title: 'Neon Store | Cyberpunk Fashion, Tech & Audio Gear | RaQuel Synths',
      desc: 'Explore RQS-curated cyberpunk and goth fashion, accessories, technology and audio gear from SHEIN, Mercado Livre, Amazon and AliExpress.'
    }
  };

  const currentSeo = (dept && seoMap[dept]) ? seoMap[dept] : defaultSeo;
  const finalData = isPt ? currentSeo.pt : currentSeo.en;

  // 🚀 CONSTRUÇÃO DETERMINÍSTICA: Não dependemos do delay do Router
  const canonicalPath = '/store';

  //this.seoService.updateCanonical(canonicalPath);
  this.seoService.updateMetaTags({
    title: finalData.title,
    description: finalData.desc,
    url: canonicalPath
  });
}

  // --- ESTADO ---
  activeMode = signal<'broklin' | 'jonah'>('broklin');
  currentLang = signal<'pt' | 'en'>(this.translate.isPt() ? 'pt' : 'en');
  currentView: 'LOBBY' | 'MINI_STORE' = 'LOBBY';

  // --- DADOS (Vindos do Firebase) ---
  // ⚠️ MUITO IMPORTANTE: Começam vazios! Não use mais "ALL_PRODUCTS" aqui.
  allProducts: any[] = [];
  allDepartments: any[] = [];

  // --- FILTROS ---
  selectedDepartmentId = signal<string | null>(null);
  selectedMerchant = signal<'all' | StoreMerchant>('all');
  filteredProducts: any[] = [];

  readonly expandedProductDescriptions =
    signal<ReadonlySet<string>>(
      new Set<string>()
    );

  readonly merchantFilters: StoreMerchant[] = [
    'shein',
    'mercado-livre',
    'amazon',
    'aliexpress'
  ];

  readonly mercadoLivreAffiliateUrl =
    'https://www.mercadolivre.com.br/social/anaraquel00/lists/aac28926-6453-4775-8dd7-d8d5ce54359c#tracking_id=08e73e47-a945-48da-8ac4-8c48026e854c';

  readonly heroCampaign =
    signal<PublicStoreCampaign | null>(null);

  readonly currentCampaign =
    signal<PublicStoreCampaign | null>(null);

  get catalogCount(): number {
    return this.allProducts.length;
  }

  get sheinProducts(): any[] {
    return this.allProducts.filter(item => item.merchant === 'shein');
  }

  get rqsPicks(): any[] {
    const picks: any[] = [];
    const seenIds = new Set<string>();

    for (const merchant of this.merchantFilters) {
      const item = this.allProducts.find(product => product.merchant === merchant);
      if (item && !seenIds.has(String(item.id))) {
        picks.push(item);
        seenIds.add(String(item.id));
      }
    }

    for (const item of this.allProducts) {
      if (picks.length >= 5) break;

      const id = String(item.id);
      if (!seenIds.has(id)) {
        picks.push(item);
        seenIds.add(id);
      }
    }

    return picks.slice(0, 5);
  }

  get departmentProductCounts(): Record<string, number> {
    return this.allProducts.reduce((counts: Record<string, number>, item: any) => {
      const faction = item?.faction;
      if (faction) counts[faction] = (counts[faction] || 0) + 1;
      return counts;
    }, {});
  }

  // Getter inteligente para o Lobby (Filtra por Dono)
  get visibleDepartments() {
    const mode = this.activeMode();

    return [...this.allDepartments].sort((a, b) => {
      const score = (dept: any) => {
        if (!dept?.owners?.length) return 1;
        if (dept.owners.includes(mode)) return 0;
        if (dept.owners.length > 1) return 1;
        return 2;
      };

      return score(a) - score(b);
    });
  }

ngOnInit(): void {
   // Se for o servidor da Vercel (GSC), trava em Inglês. Se for o navegador, pega o idioma real.
    const isPt = !this.isBrowser ? false : this.translate.isPt();

    // Injeta o SEO da primeira carga
    this.updateSeoAndLang(isPt);

    // 🚀 INJEÇÃO COMERCIAL (JSON-LD): Avisa ao Google que isso é um E-commerce
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": isPt
        ? "Neon Store | Moda Cyberpunk, Gótica, Tech & Áudio"
        : "Neon Store | Cyberpunk Fashion, Tech & Audio Gear",
      "description": isPt
        ? "Curadoria da RaQuel Synths de moda cyberpunk e gótica, acessórios, tecnologia e equipamentos de áudio em lojas parceiras."
        : "RaQuel Synths curated discovery for cyberpunk and goth fashion, accessories, technology and audio gear from partner stores.",
      "url": "https://raquelsynths.com/store",
      "isPartOf": {
        "@type": "WebSite",
        "name": "RaQuel Synths",
        "url": "https://raquelsynths.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "RaQuel Synths",
        "url": "https://raquelsynths.com"
      }
    });
    this.loadData();
    this.loadCampaigns();

    // 👇 OUVINTE DE URL (A Mágica do Deep Link com Query Params)
    this.querySub = this.route.queryParams.subscribe(params => { // Atribuir a querySub
      const dept = params['dept'];

      if (dept) {
        // A URL pediu um departamento específico! Pula o Lobby.
        this.selectedDepartmentId.set(dept);
        this.currentView = 'MINI_STORE';

        // Puxa a Lore imediatamente (pois vem do arquivo estático local)
        const deptData = DEPARTMENTS_DATA.find(d => d.id === dept);
        if (deptData) {
          this.selectedDepartmentData = deptData;
        }

        // Se o Firebase JÁ carregou os produtos (ex: navegou de volta), filtra agora:
        if (this.allProducts.length > 0) {
          this.applyCatalogFilters();
        }
      } else {
        // Se não tem departamento na URL, mostra o Lobby normal
        this.currentView = 'LOBBY';
        this.selectedDepartmentId.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.observer) this.observer.disconnect();
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
    if (this.querySub) this.querySub.unsubscribe(); // Desinscrever querySub
    if (this.intervalId) clearInterval(this.intervalId); // Limpar intervalId
  }

  // --- FUNÇÃO DE CARREGAMENTO (CORRIGIDA) ---
 private loadData() {
    // 🛡️ MOCK DO SERVIDOR: Evita o Firebase no momento do Build
    if (!this.isBrowser) {
      this.allProducts = [];
      this.allDepartments = [];
      return;
    }

    this.dataSubscription = combineLatest({
      products: this.injector.get(ContentService).getProducts().pipe(take(1)), // Usar injector
      departments: this.injector.get(ContentService).getDepartments().pipe(take(1)) // Usar injector
    })
    .pipe(
      take(1),
      timeout(5000),
      catchError((err: any) => { // Tipagem para 'err'
        console.warn('⚠️ [SSR/FIREBASE]: Timeout ou erro na conexão. Retornando vazio para não travar o build.', err);
        // Retorna arrays vazios para salvar o servidor
        return of({ products: [], departments: [] }); // Retorno consistente
      })
    )
    .subscribe({
      next: (data) => {
        console.log('📦 Estoque recebido:', data);

        this.allProducts = data.products
          .map((product: any) => adaptStoreProduct(product))
          .filter(isVisibleAffiliateProduct);
        this.allDepartments = data.departments;

        this.applyCatalogFilters();

        // Força o Angular a pintar a tela
        this.cdr.detectChanges();
      },
      error: (err: any) => { // Tipagem para 'err'
        console.error('🚨 Erro ao baixar estoque:', err);
        if (err.code === 'permission-denied') {
             console.warn('⚠️ VERIFIQUE AS REGRAS DE SEGURANÇA DO FIRESTORE!');
        }
      }
    });
  }

  private async loadCampaigns(): Promise<void> {
    if (!this.isBrowser) return;

    try {
      const response =
        await fetch('/api/store-campaign', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin'
        });

      if (!response.ok) return;

      const result =
        (await response.json()) as PublicStoreCampaignResponse;

      this.heroCampaign.set(
        result.heroSignal || null
      );

      this.currentCampaign.set(
        result.currentSignal || null
      );
    } catch {
      this.heroCampaign.set(null);
      this.currentCampaign.set(null);
    }
  }

  campaignContent(
    campaign: PublicStoreCampaign
  ): PublicStoreCampaignContent {
    return campaign.content?.[
      this.currentLang()
    ] || campaign.content.pt;
  }

  trackStoreCampaign(
    campaign: PublicStoreCampaign
  ): void {
    this.trackingService
      .trackCustomEvent(
        'store_campaign_click',
        {
          campaign:
            campaign.id,
          merchant:
            campaign.merchant,
          placement:
            campaign.placement,
          language:
            this.currentLang(),
          mode:
            this.activeMode()
        }
      );
  }

  trackAffiliateSignal(): void {
    this.trackingService
      .trackCustomEvent(
        'store_promotion_click',
        {
          campaign:
            'mercado_livre_affiliate_signal',
          merchant:
            'mercado-livre',
          destination:
            'curated-list',
          placement:
            'hero-signal',
          language:
            this.currentLang(),
          mode:
            this.activeMode()
        }
      );
  }

  // --- LÓGICA DE TEMA ---
checkCurrentMode() {
    if (!this.isBrowser) return;

    // A Loja não dita mais as regras. Ela apenas lê a classe global que o Header já definiu.
    const isJonahActive = this.document.body.classList.contains('mode-jonah');
    this.activeMode.set(isJonahActive ? 'jonah' : 'broklin');
  }


  private setupThemeObserver() {
    if (!this.isBrowser) return;
    this.observer = new MutationObserver(() => {
      const isJonah = this.document.body.classList.contains('mode-jonah');
      const newMode = isJonah ? 'jonah' : 'broklin';

      const isPt = this.translate.isPt();
      this.currentLang.set(isPt ? 'pt' : 'en');

      if (this.activeMode() !== newMode) {
        this.activeMode.set(newMode);
        this.backToLobby(); // Reseta para o lobby certo
        this.cdr.detectChanges();
      }
    });

    this.observer.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
  }

// --- NAVEGAÇÃO E BOOST DE SEO ---
  onDepartmentSelected(deptId: string) {
    const deptData = DEPARTMENTS_DATA.find(d => d.id === deptId) || null;

    this.selectedDepartmentId.set(deptId);
    this.selectedDepartmentData = deptData;
    this.applyCatalogFilters();

    void this.router.navigate([], {
      queryParams: { dept: deptId },
      queryParamsHandling: 'merge'
    }).then(() => {
      this.scrollToCatalog();
    });

    if (deptData && this.filteredProducts.length > 0) {
      const lang = this.currentLang();
      const seoTitle = deptData.title || deptId.toUpperCase();
      const seoDesc = deptData.loreDescription
        ? deptData.loreDescription[lang]
        : (deptData.description ? deptData.description[lang] : 'RQS Protocol');
      const imgPath = deptData.image || 'assets/images/banner-seo-global.jpg';
      const seoImage = imgPath.startsWith('http')
        ? imgPath
        : `https://raquelsynths.com/${imgPath}`;

      this.seoService.updateCanonical('/store');
      this.seoService.setJsonLd({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": seoTitle,
        "description": seoDesc,
        "url": "https://raquelsynths.com/store",
        "itemListElement": this.filteredProducts.map((product, index) => {
          const content = product.content?.[lang];

          return {
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": content?.name,
              "image": product.image || seoImage,
              "description": content?.description,
              "brand": { "@type": "Brand", "name": "RaQuel Synths" }
            }
          };
        })
      });
    }
  }

  setMerchantFilter(merchant: 'all' | StoreMerchant): void {
    this.selectedMerchant.set(merchant);
    this.applyCatalogFilters();

    this.trackingService.trackCustomEvent('store_merchant_filter', {
      merchant,
      sector: this.selectedDepartmentId() || 'all',
      language: this.currentLang(),
      mode: this.activeMode()
    });
  }

  clearSectorFilter(): void {
    this.selectedDepartmentId.set(null);
    this.selectedDepartmentData = null;
    this.router.navigate([], {
      queryParams: { dept: null },
      queryParamsHandling: 'merge'
    });
    this.applyCatalogFilters();
  }

  private applyCatalogFilters(): void {
    const sector = this.selectedDepartmentId();
    const merchant = this.selectedMerchant();

    this.filteredProducts = this.allProducts.filter(item => {
      const sectorMatch = !sector || item.faction === sector;
      const merchantMatch = merchant === 'all' || item.merchant === merchant;

      return sectorMatch && merchantMatch;
    });
  }

  getMerchantCta(item: any): string {
    return getStoreMerchantCta(item?.merchant, this.currentLang());
  }

  showMerchant(merchant: StoreMerchant): void {
    this.setMerchantFilter(merchant);
    this.scrollToCatalog();
  }

  getDepartmentTitle(faction: string | null | undefined): string {
    if (!faction) return '';
    return DEPARTMENTS_DATA.find(dept => dept.id === faction)?.title || faction;
  }

  getProductDescription(
    item: any
  ): string {
    if (
      this.isProductDescriptionExpanded(
        item
      )
    ) {
      return getStoreProductLongDescription(
        item,
        this.currentLang()
      );
    }

    return getStoreProductTeaser(
      item,
      this.currentLang()
    );
  }

  hasExpandableProductDescription(
    item: any
  ): boolean {
    return hasStoreProductLongDescription(
      item,
      this.currentLang()
    );
  }

  isProductDescriptionExpanded(
    item: any
  ): boolean {
    const id =
      String(item?.id || '');

    return Boolean(
      id &&
      this.expandedProductDescriptions()
        .has(id)
    );
  }

  toggleProductDescription(
    item: any
  ): void {
    const id =
      String(item?.id || '');

    if (!id) return;

    const next =
      new Set(
        this.expandedProductDescriptions()
      );

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    this.expandedProductDescriptions.set(
      next
    );
  }

  private scrollToCatalog(): void {
    if (!this.isBrowser) return;

    requestAnimationFrame(() => {
      this.document
        .getElementById('store-catalog')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  backToLobby() {
  this.selectedDepartmentId.set(null);
  this.selectedDepartmentData = null;
  this.router.navigate([], { queryParams: { dept: null } });
  this.currentView = 'LOBBY';
  this.applyCatalogFilters();

  this.updateSeoAndLang(this.translate.isPt());

    // 🚀 RETORNA O JSON-LD PARA A HOME DA LOJA
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": this.translate.isPt()
        ? "Neon Store | Moda Cyberpunk, Gótica, Tech & Áudio"
        : "Neon Store | Cyberpunk Fashion, Tech & Audio Gear",
      "url": "https://raquelsynths.com/store",
      "description": this.translate.isPt()
        ? "Curadoria RQS de moda cyberpunk e gótica, acessórios, tecnologia e equipamentos de áudio em lojas parceiras."
        : "RQS-curated cyberpunk and goth fashion, accessories, technology and audio gear from partner stores.",
      "publisher": {
        "@type": "Organization",
        "name": "RaQuel Synths",
        "url": "https://raquelsynths.com"
      }
    });
  }

  goBackHome() { this.router.navigate(['/']); }


  openRqsStudio(): void {
    if (!this.isBrowser) return;

    this.trackingService.trackCustomEvent('rqs_studio_arsenal_access', {
      source: 'sonic-arsenal',
      placement: 'slot-06',
      destination: 'studio',
      language: this.currentLang(),
      mode: this.activeMode()
    });

    const win = this.document.defaultView;
    if (!win) return;

    const studioWindow = win.open(
      'https://studio.raquelsynths.com',
      '_blank',
      'noopener,noreferrer'
    );

    if (studioWindow) studioWindow.opener = null;
  }

  isJonahSector(id: string | null): boolean {
    if (!id) return false;
    // Adicione aqui todos os IDs que devem ser vermelhos/metal
    const jonahZones = ['rust-riot', 'neon-witch', 'sonic-arsenal'];
    return jonahZones.includes(id.toLowerCase());
  }

 // --- 💸 MONETIZAÇÃO BLINDADA V2.0 (AGORA COM TELEMETRIA) ---

  handleShopClick(item: any) { // 👈 AGORA RECEBE O ITEM COMPLETO
    const productUrl = item.destinationUrl || item.stripeUrl || item.link || item.url;

    if (!productUrl) {
      console.warn('🚫 Link vazio detectado.');
      return;
    }

    // 🛡️ SANITIZAÇÃO EXTREMA MANTIDA:
    const cleanUrl = productUrl.trim().replace(/['"]/g, '');
    console.log('🖱️ Clique LIMPO e VERIFICADO:', cleanUrl);

    if (!cleanUrl.startsWith('http')) {
       console.error('🚨 URL Inválida (falta http):', cleanUrl);
       return;
    }

    // 🎯 🚀 DISPARO DA TELEMETRIA PARA A META 🚀 🎯
    const lang = this.currentLang();
    const productName = item.content[lang]?.name || 'Produto RQS';
    const platform = this.detectPlatformForPixel(cleanUrl); // item.content[lang]?.name já está correto

    // Avisa o algoritmo ANTES de abrir o modal
    this.trackingService.trackAffiliateClick(productName, platform);

    // 🎛️ LÓGICA DE MODAIS ORIGINAIS MANTIDA INTACTA:
    const lowerUrl = cleanUrl.toLowerCase();
    const isShein = lowerUrl.includes('shein');
    const isStripe = lowerUrl.includes('stripe') || lowerUrl.includes('checkout');

    if (isShein) {
      this.openSheinCouponModal(cleanUrl);
    } else if (isStripe) {
      this.openStripeCouponModal(cleanUrl);
    } else {
      this.openGenericPartnerModal(cleanUrl);
    }
  }

  // 🔍 FUNÇÃO AUXILIAR: Lê a URL e traduz para a Meta
  private detectPlatformForPixel(url: string): string {
    return getStoreMerchantLabel(resolveStoreMerchant(url));
  }

 private openSheinCouponModal(url: string) {
    const isPt = this.currentLang() === 'pt';
    const couponCode = '348EW73';
    const newserCode = 'WY3BYYD';

    const titleText = isPt ? '🔥 CUPOM DETECTADO!' : '🔥 COUPON DETECTED!';
    const subtitleText = isPt ? 'Economize até <strong>40% OFF</strong> nas melhores marcas!' : 'Save up to <strong>40% OFF</strong> on top brands!';
    const footerText = isPt ? '(O código foi copiado. Aplique no checkout da Shein!)' : '(Code copied. Apply at Shein checkout!)';
    const proTipTitle = isPt ? '💡 Dica de Mestre:' : '💡 Pro Tip:';
    const proTipText = isPt ? `Novo usuário? Tente o código <span style="color: #06fd12;">${newserCode}</span> para ganhar <strong>50% OFF</strong>!` : `New user? Try code <span style="color: #06fd12;">${newserCode}</span> to get <strong>50% OFF</strong>!`;
    const confirmBtnText = isPt ? 'COPIAR E COMPRAR 🛍️' : 'COPY & SHOP 🛍️';
    const cancelBtnText = isPt ? 'Voltar' : 'Back';

    Swal.fire({
      title: `<span style="font-size: 1.8rem; font-weight: 800;">${titleText}</span>`,
      html: `
        <div style="text-align: center; color: #e0e0e0; font-family: 'Roboto', sans-serif;">
          <p style="margin-bottom: 20px; font-size: 1.1rem;">${subtitleText}</p>
          <div style="background: #000; color: #ff0055; font-family: 'Courier New', monospace; font-size: 2.5rem; font-weight: bold; padding: 20px; border: 3px dashed #ff0055; margin: 25px 0; letter-spacing: 2px; position: relative; box-shadow: 0 0 20px rgba(255, 0, 85, 0.3);">
            ${couponCode}
            <span style="position: absolute; top: -15px; right: -10px; background: #ff0055; color: #fff; font-size: 0.8rem; padding: 5px 10px; border-radius: 4px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">TOP OFFER</span>
          </div>
          <p style="font-size: 0.9rem; color: #888; margin-bottom: 25px;">${footerText}</p>
          <div style="background: rgba(255, 255, 255, 0.05); border-left: 4px solid #06fd12; padding: 15px; text-align: left; border-radius: 8px; font-size: 0.95rem;">
            <strong>${proTipTitle}</strong> ${proTipText}
          </div>
        </div>
      `,
      iconHtml: '<i class="ph-warning-circle" style="font-size: 5rem; color: #ff0055; text-shadow: 0 0 20px #ff0055;"></i>',
      background: '#121212 url("/assets/images/noise-texture.png")',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#ff0055',
      cancelButtonColor: '#333',
      confirmButtonText: confirmBtnText,
      cancelButtonText: cancelBtnText,
      reverseButtons: true,
      customClass: { popup: 'shein-coupon-popup', confirmButton: 'btn-neon-pink', cancelButton: 'btn-flat-gray' },

      // 🚀 A INJEÇÃO DE ENGENHARIA (SÍNCRONA)
      preConfirm: () => {
        // 1. ABRE A ABA IMEDIATAMENTE (Burla o bloqueador de pop-ups nativo do navegador)
        window.open(url, '_blank');

        // 2. COPIA O CUPOM EM SEGUNDO PLANO (Assíncrono)
        navigator.clipboard.writeText(couponCode).then(() => {
            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#ff0055', color: '#fff'
            });
            Toast.fire({ icon: 'success', title: isPt ? 'Copiado!' : 'Copied!' });
        });

        return true;
      }
    }); // 🛑 Fim do Swal.fire. Sem .then() encadeado aqui!
  }

  // ✅ CORREÇÃO: Esse método tinha sumido do seu código!
  private openGenericPartnerModal(url: string) {
    const lang = this.currentLang();
    const isJonah = this.activeMode() === 'jonah';
    const config = this.getPartnerConfig(url, lang);

    Swal.fire({
      title: config.title,
      text: config.msg,
      icon: 'info',
      background: isJonah ? '#1a0000' : '#121212',
      color: '#fff',
      confirmButtonText: config.btn,
      showCancelButton: true,
      cancelButtonText: lang === 'pt' ? 'Voltar' : 'Back'
    }).then((result) => {
      if (result.isConfirmed) window.open(url, '_blank');
    });
  }

   private getPartnerConfig(url: string, lang: string) {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('amzn')) {
      return lang === 'pt'
        ? { title: 'Indo para Amazon! 📦', msg: 'Compra segura e entrega rápida.', footer: '🚚 Verifique Frete Grátis', btn: 'Ver na Amazon' }
        : { title: 'Going to Amazon! 📦', msg: 'Secure purchase and fast delivery.', footer: '🚚 Check Free Shipping', btn: 'Go to Amazon' };
    }
    else if (lowerUrl.includes('aliexpress')) {
      return lang === 'pt'
        ? { title: 'Indo para AliExpress! 🌏', msg: 'Importação direta da China.', footer: '⏳ Atenção ao prazo de entrega.', btn: 'Ver no Ali' }
        : { title: 'Going to AliExpress! 🌏', msg: 'Direct import from China.', footer: '⏳ Check delivery time.', btn: 'Go to Ali' };
    }
    // Adicionei STRIPE aqui também!
    else if (lowerUrl.includes('stripe') || lowerUrl.includes('checkout')) {
      return lang === 'pt'
        ? { title: 'Checkout Seguro 🔒', msg: 'Ambiente criptografado.', footer: '🛡️ Processado via Stripe', btn: 'Pagar Agora' }
        : { title: 'Secure Checkout 🔒', msg: 'Encrypted environment.', footer: '🛡️ Processed via Stripe', btn: 'Pay Now' };
    }
    else {
      return lang === 'pt'
        ? { title: 'Site Externo 🔗', msg: 'Você está saindo da RaQuel Synths.', footer: 'Navegue com segurança.', btn: 'Continuar' }
        : { title: 'External Site 🔗', msg: 'You are leaving RaQuel Synths.', footer: 'Browse safely.', btn: 'Continue' };
    }
   }
  // --- HELPER: TOAST FEEDBACK ---
  private showToast(msg: string) {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      background: '#000',
      color: '#00ff41'
    });
    toast.fire({ icon: 'success', title: msg });
  }


// --- MODAL ESPECÍFICO PARA STRIPE (CUPOM DEBUG10) ---
 private openStripeCouponModal(url: string) {
    const isPt = this.currentLang() === 'pt';
    const couponCode = 'DEBUG10';

    const titleText = isPt ? 'ACESSO VIP DETECTADO!' : '⚡ VIP ACCESS DETECTED!';
    const subtitleText = isPt ? 'Você desbloqueou um desconto de <strong>10% OFF</strong>!' : 'You unlocked a <strong>10% OFF</strong> discount!';
    const footerText = isPt ? '(O código foi copiado. Cole no campo "Promo Code" ao pagar)' : '(Code copied. Paste in "Promo Code" at checkout)';
    const confirmBtnText = isPt ? 'COPIAR E PAGAR 💳' : 'COPY & PAY 💳';
    const cancelBtnText = isPt ? 'Voltar' : 'Back';

    Swal.fire({
      title: `<span style="font-size: 1.6rem; font-weight: 800; color: #fff;">${titleText}</span>`,
      html: `
        <div style="text-align: center; color: #e0e0e0; font-family: 'Roboto', sans-serif;">
          <p style="margin-bottom: 20px; font-size: 1.1rem;">${subtitleText}</p>
          <div style="background: rgba(0, 255, 136, 0.05); border: 2px dashed #00ff88; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);">
            <span style="display: block; font-size: 0.8rem; color: #00ff88; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">
              ${isPt ? 'CÓDIGO HACKER:' : 'HACKER CODE:'}
            </span>
            <strong style="display: block; font-size: 1.8rem; color: #fff; font-family: 'Courier New', monospace; letter-spacing: 3px; text-shadow: 0 0 5px #00ff88;">
              ${couponCode}
            </strong>
          </div>
          <p style="font-size: 0.85rem; color: #aaa; margin-bottom: 0;">${footerText}</p>
        </div>
      `,
      iconHtml: '<div style="font-size: 4rem; color: #ff5500; text-shadow: 0 0 20px #ff5500;">⚡</div>',
      background: '#121212 url("/assets/images/noise-texture.png")',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#00ff88',
      cancelButtonColor: '#333',
      confirmButtonText: confirmBtnText ,
      cancelButtonText: cancelBtnText,
      reverseButtons: true,
      customClass: { confirmButton: 'btn-neon-stripe-confirm' },

      // 🚀 A INJEÇÃO DE ENGENHARIA (SÍNCRONA)
      preConfirm: () => {
        // 1. ABRE A ABA DO STRIPE IMEDIATAMENTE
        window.open(url, '_blank');

        // 2. COPIA O CUPOM EM SEGUNDO PLANO
        navigator.clipboard.writeText(couponCode).then(() => {
            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, background: '#00ff88', color: '#000'
            });
            Toast.fire({ icon: 'success', title: isPt ? 'Copiado! Redirecionando...' : 'Copied! Redirecting...' });
        });

        return true;
      }
    });
  }
}
