import { Component, Inject, OnInit, OnDestroy, signal, effect, HostListener, inject, PLATFORM_ID, ChangeDetectorRef, afterNextRender, Injector } from '@angular/core';
import { DOCUMENT, CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; 
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs'; 

// Seus Imports
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service'; 
import { CONTACT_DATA, HOME_DATA } from '../../data/app-data';
import { LastReleasesComponent } from '../../components/last-releases/last-releases';
import { SystemAlert } from "../../components/system-alert/system-alert";
import { UplinkTerminalComponent } from "../../components/uplink-terminal/uplink-terminal";


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
    if (typeof document !== 'undefined') {
      // Injeta ou remove a ferrugem do sistema
      document.body.classList.toggle('mode-jonah');
      
      // Atualiza a nossa variável de controle instantaneamente
      this.isJonahMode = document.body.classList.contains('mode-jonah');
      
      // O log do console atualizado
      if (this.isJonahMode) {
        console.warn('⚠️ [ALERTA DE SISTEMA] O arquivo corrompido MODO_JONAH.bat comprometeu a interface.');
      } else {
        console.log('🛡️ [SISTEMA RESTAURADO] Ameaça isolada. Protocolo Neon reativado.');
      }
    }
  }

executarQuickhack(targetId: string) {
  if (typeof document !== 'undefined') {
    const element = document.getElementById(targetId);
    
    if (element) {
      // 🛡️ O SALTO QUÂNTICO: Troque 'smooth' por 'auto'. 
      // O teletransporte não acorda os @defer do meio do caminho!
      element.scrollIntoView({ behavior: 'auto', block: 'start' });

      // ⚡ Radar Estabilizador Curto
      // A seção de Contato vai acordar e esticar um pouco.
      // O radar dá pequenos "snaps" invisíveis para garantir que a tela não saia do lugar.
      let varreduras = 0;
      const radarInterval = setInterval(() => {
        const alvo = document.getElementById(targetId);
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
 isJonahMode = true; // Controle do Modo (Broklin/Jonah)
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

  // --- DADOS DA MÚSICA (NOVO) ---
  allMusic: any[] = [];
  featuredTrack: any = null;
  safeSpotifyUrl: SafeResourceUrl | null = null;
  private musicSub: Subscription | null = null;

  // --- SEU CÓDIGO ANTIGO (TEXTOS) ---
  private homeSignal = signal<any>({});
  private contactSignal = signal<any>({});
  private themeObserver: MutationObserver | undefined;

  constructor(
    public translate: TranslationService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // 1. Reage se o idioma mudar
    effect(() => {
      this.updateContent();
    });
     
   // 🛡️ PROTOCOLO DE ATRASO TÁTICO (Fura-Fila do Firebase)
    // Deixa a Home carregar o visual 100% primeiro. Depois busca a música silenciosamente.
    afterNextRender(() => {
      // ⚡ 3. O PULO DO GATO: Só agora, depois da tela renderizada, nós chamamos o Firebase!
        const contentService = this.injector.get(ContentService);
        this.musicSub = this.injector.get(ContentService).getDiscography().subscribe(data => {
        this.allMusic = data;
        this.featuredTrack = this.allMusic.find(track => track.featured) || null;
        
        // ⚡ Avisa a placa-mãe que os dados chegaram em background
        this.cdr.detectChanges(); 
      });
    });
  }


  ngOnInit() {
    if (typeof document !== 'undefined') {
      this.isJonahMode = document.body.classList.contains('mode-jonah');
    }
    
     // 👇 2. O VIGIA DO BODY (SEU CÓDIGO)
    if (isPlatformBrowser(this.platformId)) {
      this.themeObserver = new MutationObserver(() => {
        this.updateContent();
      });

      this.themeObserver.observe(this.document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Inicializa conteúdo
    this.updateContent();
  }

  ngOnDestroy() {
    this.themeObserver?.disconnect();
    if (this.musicSub) this.musicSub.unsubscribe(); // 👈 Limpeza nova
  }

  // 👇 ATUALIZA TUDO (TEXTO + MÚSICA)
  updateContent() {
    // A. ATUALIZA TEXTOS (SEU CÓDIGO)
    const lang = this.translate.isPt() ? 'pt' : 'en';
    const rawHome = HOME_DATA[lang];
    const isJonahMode = this.document.body.classList.contains('mode-jonah');

    this.homeSignal.set({
      title: rawHome.title,
      subtitle: isJonahMode ? (rawHome as any).subtitleJonah || rawHome.subtitle : rawHome.subtitle,
      cta: isJonahMode ? (rawHome as any).ctaJonah || rawHome.cta : rawHome.cta
    });

    this.contactSignal.set(CONTACT_DATA[lang]);
    
  } 

  // 🛡️ GERADOR DE LINK SEGURO (CORRIGIDO E OTIMIZADO)
  generateSafeUrl(originalUrl: string) {
    if (!originalUrl) {
      this.safeSpotifyUrl = null;
      return;
    }

    let embedUrl = originalUrl.trim();

    // Lógica robusta para transformar link normal em Embed
    // De: https://open.spotify.com/track/xyz
    // Para: https://open.spotify.com/embed/track/xyz
    if (!embedUrl.includes('/embed/')) {
      embedUrl = embedUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }

    // Sanitiza para o Angular aceitar o iframe
    this.safeSpotifyUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
  // --- SEUS GETTERS E HELPERS ORIGINAIS ---

  get navText() { return this.homeSignal(); }
  get contactText() { return this.contactSignal(); }

  
}
