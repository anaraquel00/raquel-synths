import { Component, Inject, OnInit, OnDestroy, signal, effect, HostListener, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT, CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // 👈 NOVO
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs'; // 👈 NOVO

// Seus Imports
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service'; // 👈 NOVO (O Serviço do Firebase)
import { CONTACT_DATA, HOME_DATA } from '../../data/app-data';
import { LastReleasesComponent } from '../../components/last-releases/last-releases';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, LastReleasesComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
currentLanguage: any;
  scrollToContact() {
    // Procura o elemento com id 'contact-section' e rola até ele
    const element = document.getElementById('contato');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback: Se não achar (ex: se contato for outra página), redireciona
      // this.router.navigate(['/contato']);
      console.warn('Alvo do scroll não encontrado!');
    }
  }

  // --- INJEÇÕES NOVAS ---
  private contentService = inject(ContentService);
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
  }

  ngOnInit() {
    // 👇 1. BAIXA A DISCOGRAFIA (NOVO)
    this.musicSub = this.contentService.getDiscography().subscribe(data => {
      this.allMusic = data;
      this.updatePlayer(); // Atualiza o player assim que os dados chegarem
    });

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

    // B. ATUALIZA O PLAYER (NOVO)
    this.updatePlayer(isJonahMode);
  }

  // --- 🎵 FUNÇÕES DO PLAYER (NOVO) ---

  // --- 🎵 FUNÇÕES DO PLAYER (ATUALIZADO COM RANDOM) ---

  updatePlayer(isJonahMode?: boolean) {
    if (!this.allMusic.length) return;

    // Se não passou o modo, descobre
    const isJonah = isJonahMode ?? this.document.body.classList.contains('mode-jonah');
    const faction = isJonah ? 'jonah' : 'broklin';

    // 1. Filtra músicas da facção atual que tenham link VÁLIDO do Spotify
    // (Ignoramos músicas que só têm Soundcloud para o player principal)
    const validTracks = this.allMusic.filter(t =>
      t.faction === faction && t.spotify && t.spotify.trim() !== ''
    );

    if (validTracks.length === 0) {
      this.safeSpotifyUrl = null; // Aciona o fallback visual do SoundCloud
      return;
    }

    // 2. ESTRATÉGIA HÍBRIDA:
    // Tenta achar o Lançamento Recente (Marketing)
    let target = validTracks.find(t => t.isLatest === true);

    // Se NÃO tiver lançamento recente, ativa o MODO RANDOM
    if (!target) {
      const randomIndex = Math.floor(Math.random() * validTracks.length);
      target = validTracks[randomIndex];
      console.log(`🎲 Modo Random Ativado para ${faction}: Tocando ${target.title}`);
    }

    // 3. Renderiza
    if (target) {
      this.featuredTrack = target;
      this.generateSafeUrl(target.spotify);
      this.cdr.detectChanges();
    }
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

  scrollTo(elementId: string): void {
    const element = document.getElementById(elementId);
        if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn(`ALERTA: Elemento '${elementId}' não encontrado.`);
    }
  }


}
