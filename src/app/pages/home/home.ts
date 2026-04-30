import { Component, Inject, OnInit, OnDestroy, signal, effect, HostListener, inject, PLATFORM_ID, ChangeDetectorRef, afterNextRender, Injector } from '@angular/core';
import { DOCUMENT, CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

// Seus Imports
import { TranslationService } from '../../services/translation.service';
import { CONTACT_DATA, HOME_DATA } from '../../data/app-data';
import { UplinkTerminalComponent } from "../../components/uplink-terminal/uplink-terminal";
import { SeoService } from '../../services/seo.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, UplinkTerminalComponent, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  isBrowser: any;

// 2. A porta dos fundos tática atualizada
  forcarModoJonah() {
    if (isPlatformBrowser(this.platformId)) {
      // Injeta ou remove a ferrugem do sistema
      this.document.body.classList.toggle('mode-jonah');

      // Atualiza a nossa variável de controle instantaneamente
      const isJonah = this.document.body.classList.contains('mode-jonah');
      this.isJonahMode.set(isJonah);

      // 🛡️ Sincroniza com o ecossistema global e persiste a escolha
      localStorage.setItem('rqs-theme', isJonah ? 'jonah' : 'broklin');
      this.document.defaultView?.dispatchEvent(new CustomEvent('theme-changed'));

      // O log do console atualizado
      if (this.isJonahMode()) {
        console.warn('⚠️ [ALERTA DE SISTEMA] O arquivo corrompido MODO_JONAH.bat comprometeu a interface.');
      } else {
        console.log('🛡️ [SISTEMA RESTAURADO] Ameaça isolada. Protocolo Neon reativado.');
      }
    }
  }

executarQuickhack(targetId: string) {
  if (isPlatformBrowser(this.platformId)) {
    const element = this.document.getElementById(targetId);

    if (element) {
      // 🛡️ O SALTO QUÂNTICO: Troque 'smooth' por 'auto'.
      // O teletransporte não acorda os @defer do meio do caminho!
      element.scrollIntoView({ behavior: 'auto', block: 'start' });

      // ⚡ Radar Estabilizador Curto
      // A seção de Contato vai acordar e esticar um pouco.
      // O radar dá pequenos "snaps" invisíveis para garantir que a tela não saia do lugar.
      let varreduras = 0;
      const radarInterval = setInterval(() => {
        const alvo = this.document.getElementById(targetId);
        if (alvo) {
          alvo.scrollIntoView({ behavior: 'auto', block: 'start' });
        }

        varreduras++;
        if (varreduras >= 4) { // 2 segundos são suficientes para o Contato renderizar
          clearInterval(radarInterval);
        }
      }, 500);

    } else {
      console.warn(`[FALHA DE SISTEMA] Sinalizador "${targetId}" offline. Saltando para a raiz...`);
      this.router.navigate(['/'], { fragment: targetId });
    }
  }
}

  showUplink = false; // Controle do Modal
 isJonahMode = signal<boolean>(false); // 🛡️ SSR FIX: Padrão Broklin para alinhar hidratação do Servidor
 public currentMode: 'broklin' | 'jonah' = 'broklin';


  // Função que o botão chama
  triggerUplink() {
    this.showUplink = true;
  }

  // Função que o modal chama quando fecha
  closeUplink() {
    this.showUplink = false;
  }
currentLanguage: any;

  // --- INJEÇÕES NOVAS ---
  private injector = inject(Injector);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

    // --- SEU CÓDIGO ANTIGO (TEXTOS) ---
  private homeSignal = signal<any>({});
  private contactSignal = signal<any>({});
  private themeObserver: MutationObserver | undefined;
  private seoService = inject(SeoService);

  constructor(
    public translate: TranslationService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // 1. Reage se o idioma mudar
    effect(() => {
      this.updateContent();
    });

    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM iniciam APENAS após a hidratação (DOM Estável)
    afterNextRender(() => {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.updateContent(); // 🛡️ Sincroniza os textos (Broklin/Jonah) com segurança

      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah')); // Sincroniza o sinal com o DOM
        this.updateContent();
      });

      this.themeObserver.observe(this.document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  }

  ngOnInit() {
    // Inicializa conteúdo
    this.updateContent();
  }

  ngOnDestroy() {
    this.themeObserver?.disconnect();
  }

  // 👇 ATUALIZA TUDO (TEXTO + MÚSICA)
  updateContent() {

    // A. ATUALIZA TEXTOS (SEU CÓDIGO)
    const lang = this.translate.isPt() ? 'pt' : 'en';
    const rawHome = HOME_DATA[lang];
    const isJonahModeActive = this.isJonahMode(); // 🛡️ Usa a Single Source of Truth reativa!

    this.homeSignal.set({
      title: rawHome.title,
      subtitle: isJonahModeActive ? (rawHome as any).subtitleJonah || rawHome.subtitle : rawHome.subtitle,
      cta: isJonahModeActive ? (rawHome as any).ctaJonah || rawHome.cta : rawHome.cta
    });

    this.contactSignal.set(CONTACT_DATA[lang]);

     // 🛡️ MOTOR DE AUTORIDADE: Atestado de URL Canônica da Home
    this.seoService.updateMetaTags({
      title: this.translate.isPt() ? 'Início' : 'Home',
      description: rawHome.subtitle, // Usa o subtítulo atualizado como descrição pro Google
      url: 'https://raquelsynths.com.br/' // 🔥 O CARIMBO QUE EXTERMINA O "?mode=jonah"
    });

  }
  // --- SEUS GETTERS E HELPERS ORIGINAIS ---

  get navText() { return this.homeSignal(); }
  get contactText() { return this.contactSignal(); }
}
