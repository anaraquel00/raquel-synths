import { Component, inject, OnDestroy, OnInit, signal, ChangeDetectorRef, Inject, PLATFORM_ID, DOCUMENT, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription, combineLatest } from 'rxjs';
import { take, timeout, catchError } from 'rxjs/operators';
import{ of } from 'rxjs';


// 👇 IMPORTANTE: O ContentService traz os dados do Firebase
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { StoreDepartmentsComponent } from './store-departments/store-departments';
import { SeoService } from '../../services/seo.service';
import { TrackingService } from '../../services/tracking.service';
import { DEPARTMENTS_DATA } from '../../data/store-data';

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // 🛡️ TRAVA TÁTICA: A checagem do modo Jonah e o observer só iniciam pós-hidratação
    afterNextRender(() => {
      this.checkCurrentMode();
      this.setupThemeObserver();
    });
  }
  isBrowser: boolean;

  // --- INJEÇÕES ---
  private contentService = inject(ContentService); // Conexão com o Firebase
  private seoService = inject(SeoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef); // Para forçar a atualização da tela
  private document = inject(DOCUMENT);
  public translate = inject(TranslationService);
  private trackingService = inject(TrackingService); // Para a telemetria de afiliados

  // --- OBSERVERS & SUBSCRIPTIONS ---
  private observer: MutationObserver | null = null;
  private dataSubscription: Subscription | null = null;

  // --- ESTADO ---
  activeMode = signal<'broklin' | 'jonah'>('broklin');
  currentLang = signal<'pt' | 'en'>('pt');
  currentView: 'LOBBY' | 'MINI_STORE' = 'LOBBY';

  // --- DADOS (Vindos do Firebase) ---
  // ⚠️ MUITO IMPORTANTE: Começam vazios! Não use mais "ALL_PRODUCTS" aqui.
  allProducts: any[] = [];
  allDepartments: any[] = [];

  // --- FILTROS ---
  selectedDepartmentId: string | null = null;
  filteredProducts: any[] = [];

  // Getter inteligente para o Lobby (Filtra por Dono)
  get visibleDepartments() {
    return this.allDepartments.filter(dept => {
       // Se não tiver 'owners' no banco, mostra pra todos.
       // Se tiver, só mostra se o activeMode (broklin/jonah) estiver na lista.
       return !dept.owners || dept.owners.includes(this.activeMode());
    });
  }

ngOnInit(): void {
    this.currentLang.set(this.translate.isPt() ? 'pt' : 'en');
    this.loadData();

    // 👇 OUVINTE DE URL (A Mágica do Deep Link com Query Params)
    this.route.queryParams.subscribe(params => {
      const dept = params['dept'];

      if (dept) {
        // A URL pediu um departamento específico! Pula o Lobby.
        this.selectedDepartmentId = dept;
        this.currentView = 'MINI_STORE';

        // Puxa a Lore imediatamente (pois vem do arquivo estático local)
        const deptData = DEPARTMENTS_DATA.find(d => d.id === dept);
        if (deptData) {
          this.selectedDepartmentData = deptData;
        }

        // Se o Firebase JÁ carregou os produtos (ex: navegou de volta), filtra agora:
        if (this.allProducts.length > 0) {
          this.filteredProducts = this.allProducts.filter(item => item.faction === dept);
        }
      } else {
        // Se não tem departamento na URL, mostra o Lobby normal
        this.currentView = 'LOBBY';
        this.selectedDepartmentId = null;
      }
    });

    // 🛡️ BLINDAGEM: Só o celular do fã roda esse cronômetro!
    if (this.isBrowser) {
      setInterval(() => {
        const newLang = this.translate.isPt() ? 'pt' : 'en';
        if (this.currentLang() !== newLang) {
          this.currentLang.set(newLang);
          this.cdr.detectChanges();
        }
      }, 500);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.observer) this.observer.disconnect();
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
  }

  // --- FUNÇÃO DE CARREGAMENTO (CORRIGIDA) ---
 private loadData() {
    this.dataSubscription = combineLatest({
      products: this.contentService.getProducts(),
      departments: this.contentService.getDepartments()
    })
    .pipe(
      take(1),
      timeout(5000),
      catchError(err => {
        console.warn('⚠️ Erro ou Timeout no Firebase', err);
        // Retorna arrays vazios para salvar o servidor
        return of({ products: new Array<any>(), departments: new Array<any>() });
      })
    )
    .subscribe({
      next: (data) => {
        console.log('📦 Estoque recebido:', data);

        this.allProducts = data.products;
        this.allDepartments = data.departments;

        // Se o usuário entrou por link direto, filtra os produtos
        if (this.selectedDepartmentId) {
           this.filteredProducts = this.allProducts.filter(item => item.faction === this.selectedDepartmentId);
        }

        // Força o Angular a pintar a tela
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('🚨 Erro ao baixar estoque:', err);
        if (err.code === 'permission-denied') {
             console.warn('⚠️ VERIFIQUE AS REGRAS DE SEGURANÇA DO FIRESTORE!');
        }
      }
    });
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

      this.currentLang.set(this.translate.isPt() ? 'pt' : 'en');

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
    // 🛡️ UNIFICAÇÃO: Busca os dados uma única vez no LOCAL
    const deptData = DEPARTMENTS_DATA.find(d => d.id === deptId) || null;
    this.selectedDepartmentId = deptId;
    this.selectedDepartmentData = deptData;
    this.filteredProducts = this.allProducts.filter(item => item.faction === deptId);
    this.currentView = 'MINI_STORE';

    if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'smooth' });

    // 🚀 INJEÇÃO DE SEO & METADADOS
    if (deptData) {
      const lang = this.currentLang();
      const seoTitle = deptData.title || deptId.toUpperCase();
      const seoDesc = deptData.loreDescription ? deptData.loreDescription[lang] : (deptData.description ? deptData.description[lang] : 'RQS Protocol');
      const imgPath = deptData.image || 'assets/images/banner-seo-global.jpg';
      const seoImage = imgPath.startsWith('http') ? imgPath : `https://raquelsynths.com.br/${imgPath}`;

      // 🛡️ MOTOR 1: Atualiza a vitrine visual
      this.seoService.updateMetaTags({
        title: `${seoTitle} | Neon Store`,
        description: seoDesc,
        image: seoImage,
        type: 'website'
      });

      // 🚀 MOTOR 2 (O BOOST!): Informa ao Google que isso é uma página de Produtos
      // Só dispara se houver produtos carregados no departamento
      if (this.filteredProducts.length > 0) {
        this.seoService.setJsonLd({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": seoTitle,
          "description": seoDesc,
          "url": `https://raquelsynths.com.br/store?dept=${deptId}`,
          "itemListElement": this.filteredProducts.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": product.name ? product.name[lang] : 'RQS Item',
              "image": product.images ? product.images[0] : seoImage,
              "description": product.description ? product.description[lang] : seoDesc,
              "brand": {
                "@type": "Brand",
                "name": "RaQuel Synths"
              },
              "offers": {
                "@type": "Offer",
                "url": product.link || `https://raquelsynths.com.br/store?dept=${deptId}`,
                // Colocamos o BRL por padrão. O Google entende BRL.
                "priceCurrency": "BRL",
                "price": product.price || "0.00",
                "availability": "https://schema.org/InStock"
              }
            }
          }))
        });
      }
    }
  }


 backToLobby() {
    this.currentView = 'LOBBY';
    this.selectedDepartmentId = null;
    this.filteredProducts = [];

    // ♻️ --- RESET DE SEO (O FIX DO ERRO) ---
    // Agora passamos o título explicitamente para o compilador não chiar.
    this.seoService.updateMetaTags({
      title: 'Neon Store | RQS Oficial',
      description: 'Mercado Negro Cyberpunk. Equipamentos, Vestuário e Arquivos Confidenciais.',
      type: 'website'
    });

    // 🚀 RETORNA O JSON-LD PARA A HOME DA LOJA
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "RQS Neon Store",
      "url": "https://raquelsynths.com.br/store",
      "description": "Oficial Merchandise from RaQuel Synths virtual band."
    });
  }

  goBackHome() { this.router.navigate(['/']); }

  isJonahSector(id: string | null): boolean {
    if (!id) return false;
    // Adicione aqui todos os IDs que devem ser vermelhos/metal
    const jonahZones = ['rust-riot', 'neon-witch', 'sonic-arsenal'];
    return jonahZones.includes(id.toLowerCase());
  }

 // --- 💸 MONETIZAÇÃO BLINDADA V2.0 (AGORA COM TELEMETRIA) ---

  handleShopClick(item: any) { // 👈 AGORA RECEBE O ITEM COMPLETO
    const productUrl = item.stripeUrl; // 👈 Extrai a URL original aqui

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
    const platform = this.detectPlatformForPixel(cleanUrl);

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
    const lower = url.toLowerCase();
    if (lower.includes('amazon')) return 'Amazon';
    if (lower.includes('shein')) return 'Shein';
    if (lower.includes('aliexpress')) return 'AliExpress';
    if (lower.includes('stripe') || lower.includes('checkout')) return 'Stripe Official';
    return 'Partner Store';
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
