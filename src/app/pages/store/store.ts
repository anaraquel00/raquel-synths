import { Component, inject, OnDestroy, OnInit, signal, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription, combineLatest } from 'rxjs';

// 👇 IMPORTANTE: O ContentService traz os dados do Firebase
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { StoreDepartmentsComponent } from './store-departments/store-departments';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, StoreDepartmentsComponent,RouterLink],
  templateUrl: './store.html',
  styleUrls: ['./store.scss']
})
export class StoreComponent implements OnInit, OnDestroy {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  isBrowser: boolean;

  // --- INJEÇÕES ---
  private contentService = inject(ContentService); // Conexão com o Firebase
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // Para forçar a atualização da tela
  public translate = inject(TranslationService);

  // --- OBSERVERS & SUBSCRIPTIONS ---
  private observer: MutationObserver | null = null;
  private dataSubscription: Subscription | null = null;

  // --- ESTADO ---
  activeMode: 'broklin' | 'jonah' = 'broklin';
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
       return !dept.owners || dept.owners.includes(this.activeMode);
    });
  }

  // --- CICLO DE VIDA (Onde a mágica acontece) ---
  ngOnInit(): void {
    // 1. Sincroniza idioma
    this.currentLang.set(this.translate.isPt() ? 'pt' : 'en');

    // 2. Verifica tema inicial
    this.checkCurrentMode();

    // 3. 📡 CHAMA O FIREBASE! (Sem isso, nada baixa)
    this.loadData();

    // 4. Inicia vigilância do tema
    this.setupThemeObserver();
    setInterval(() => {
  const newLang = this.translate.isPt() ? 'pt' : 'en';
  if (this.currentLang() !== newLang) {
    this.currentLang.set(newLang);
    this.cdr.detectChanges(); // Pinta a tela de novo
  }
}, 500);
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.observer) this.observer.disconnect();
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
  }

  // --- FUNÇÃO DE CARREGAMENTO (CORRIGIDA) ---
  private loadData() {
    // 👇 AQUI ESTÁ A MÁGICA: combineLatest em vez de forkJoin
    this.dataSubscription = combineLatest({
      products: this.contentService.getProducts(),
      departments: this.contentService.getDepartments()
    }).subscribe({
      next: (data) => {
        console.log('📦 Estoque recebido:', data); // Vai aparecer no console!

        this.allProducts = data.products;
        this.allDepartments = data.departments;

        // Força o Angular a pintar a tela
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('🚨 Erro ao baixar estoque:', err);
        // Se der erro de permissão (aquele XML do seu print), vai avisar aqui
        if (err.code === 'permission-denied') {
             console.warn('⚠️ VERIFIQUE AS REGRAS DE SEGURANÇA DO FIRESTORE!');
        }
      }
    });
  }

  // --- LÓGICA DE TEMA ---
  checkCurrentMode()   {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem('rqs-theme') as 'broklin' | 'jonah';
    this.activeMode = saved || (document.body.classList.contains('mode-jonah') ? 'jonah' : 'broklin');

    if (!document.body.classList.contains(`mode-${this.activeMode}`)) {
      document.body.classList.remove('mode-broklin', 'mode-jonah');
      document.body.classList.add(`mode-${this.activeMode}`);
    }
  }


  private setupThemeObserver() {
    if (!this.isBrowser) return;
    this.observer = new MutationObserver(() => {
      const isJonah = document.body.classList.contains('mode-jonah');
      const newMode = isJonah ? 'jonah' : 'broklin';

      this.currentLang.set(this.translate.isPt() ? 'pt' : 'en');

      if (this.activeMode !== newMode) {
        this.activeMode = newMode;
        this.backToLobby(); // Reseta para o lobby certo
        this.cdr.detectChanges();
      }
    });

    this.observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // --- NAVEGAÇÃO ---
  onDepartmentSelected(deptId: string) {
    this.selectedDepartmentId = deptId;
    // Filtra: só mostra produtos onde a 'faction' for igual ao ID do departamento
    this.filteredProducts = this.allProducts.filter(item => item.faction === deptId);
    this.currentView = 'MINI_STORE';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToLobby() {
    this.currentView = 'LOBBY';
    this.selectedDepartmentId = null;
    this.filteredProducts = [];
  }

  goBackHome() { this.router.navigate(['/']); }

  isJonahSector(id: string | null): boolean {
    if (!id) return false;
    // Adicione aqui todos os IDs que devem ser vermelhos/metal
    const jonahZones = ['rust-riot', 'neon-witch', 'sonic-arsenal'];
    return jonahZones.includes(id.toLowerCase());
  }

 // --- 💸 MONETIZAÇÃO BLINDADA V2.0 ---

  handleShopClick(productUrl: string) {
    if (!productUrl) {
      console.warn('🚫 Link vazio detectado.');
      return;
    }

    // 🛡️ SANITIZAÇÃO EXTREMA:
    // 1. .trim() -> Remove espaços no começo e fim
    // 2. .replace() -> Remove aspas duplas (") e simples (') que podem ter vindo do Copy/Paste
    const cleanUrl = productUrl.trim().replace(/['"]/g, '');

    console.log('🖱️ Clique LIMPO e VERIFICADO:', cleanUrl);

    // Verificação de Segurança Extra: O link parece um link?
    if (!cleanUrl.startsWith('http')) {
       console.error('🚨 URL Inválida (falta http):', cleanUrl);
       return;
    }

    const isShein = cleanUrl.toLowerCase().includes('shein');

    if (isShein) {
      this.openSheinCouponModal(cleanUrl);
    } else {
      this.openGenericPartnerModal(cleanUrl);
    }
  }

 private openSheinCouponModal(url: string) {
    const isPt = this.currentLang() === 'pt';
    const couponCode = '348EW73'; // Código principal
    const newserCode = 'WY3BYYD'; // Código de novo usuário

    // Textos traduzidos
    const titleText = isPt ? '🔥 CUPOM DETECTADO!' : '🔥 COUPON DETECTED!';
    const subtitleText = isPt ? 'Economize até <strong>40% OFF</strong> nas melhores marcas!' : 'Save up to <strong>40% OFF</strong> on top brands!';
    const footerText = isPt ? '(Clique abaixo para copiar e aplicar no checkout)' : '(Click below to copy and apply at checkout)';
    const proTipTitle = isPt ? '💡 Dica de Mestre:' : '💡 Pro Tip:';
    const proTipText = isPt ? `Novo usuário? Tente o código <span style="color: #06fd12;">${newserCode}</span> para ganhar <strong>50% OFF</strong>!` : `New user? Try code <span style="color: #06fd12;">${newserCode}</span> to get <strong>50% OFF</strong>!`;
    const confirmBtnText = isPt ? 'COPIAR E COMPRAR 🛍️' : 'COPY & SHOP 🛍️';
    const cancelBtnText = isPt ? 'Voltar' : 'Back';

    Swal.fire({
      title: `<span style="font-size: 1.8rem; font-weight: 800;">${titleText}</span>`,
      html: `
        <div style="text-align: center; color: #e0e0e0; font-family: 'Roboto', sans-serif;">
          <p style="margin-bottom: 20px; font-size: 1.1rem;">
            ${subtitleText}
          </p>

          <div style="
              background: #000;
              color: #ff0055; /* Rosa Neon */
              font-family: 'Courier New', monospace;
              font-size: 2.5rem;
              font-weight: bold;
              padding: 20px;
              border: 3px dashed #ff0055;
              margin: 25px 0;
              letter-spacing: 2px;
              position: relative;
              box-shadow: 0 0 20px rgba(255, 0, 85, 0.3);
          ">
            ${couponCode}
            <span style="
                position: absolute;
                top: -15px;
                right: -10px;
                background: #ff0055;
                color: #fff;
                font-size: 0.8rem;
                padding: 5px 10px;
                border-radius: 4px;
                font-family: sans-serif;
                text-transform: uppercase;
                letter-spacing: 1px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.5);
            ">TOP OFFER</span>
          </div>

          <p style="font-size: 0.9rem; color: #888; margin-bottom: 25px;">
            ${footerText}
          </p>

          <div style="
              background: rgba(255, 255, 255, 0.05);
              border-left: 4px solid #06fd12; /* Verde Neon */
              padding: 15px;
              text-align: left;
              border-radius: 8px;
              font-size: 0.95rem;
          ">
            <strong>${proTipTitle}</strong> ${proTipText}
          </div>
        </div>
      `,
      // Ícone de aviso personalizado (sem a animação padrão chata)
      iconHtml: '<i class="ph-warning-circle" style="font-size: 5rem; color: #ff0055; text-shadow: 0 0 20px #ff0055;"></i>',
      background: '#121212 url("/assets/images/noise-texture.png")', // Fundo com textura (opcional)
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#ff0055', // Botão Rosa
      cancelButtonColor: '#333',     // Botão Cinza
      confirmButtonText: confirmBtnText,
      cancelButtonText: cancelBtnText,
      reverseButtons: true, // Botão de ação na direita
      customClass: {
        popup: 'shein-coupon-popup', // Classe para customizar mais no SCSS se quiser
        confirmButton: 'btn-neon-pink',
        cancelButton: 'btn-flat-gray'
      },

      // AÇÃO AO CLICAR EM "COPIAR E COMPRAR"
      preConfirm: () => {
        // 1. Copia o código
        navigator.clipboard.writeText(couponCode).then(() => {
            // Feedback visual rápido
            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#ff0055', color: '#fff'
            });
            Toast.fire({ icon: 'success', title: isPt ? 'Copiado!' : 'Copied!' });
        });
        // 2. Retorna true para fechar o modal
        return true;
      }
    }).then((result) => {
      // SE O USUÁRIO CONFIRMOU
      if (result.isConfirmed) {
        // 3. Abre o link da Shein
        window.open(url, '_blank');
      }
    });
  }

  // ✅ CORREÇÃO: Esse método tinha sumido do seu código!
  private openGenericPartnerModal(url: string) {
    const lang = this.currentLang();
    const isJonah = this.activeMode === 'jonah';
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
}
