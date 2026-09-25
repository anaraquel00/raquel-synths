import { ChangeDetectorRef, Component, computed, HostListener, inject, Input, OnInit, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';

// Services & Models
import { TranslationService } from '../services/translation.service';
import { ContentService } from '../services/content.service';
import { Album } from '../models/album.model';
import { AdBannerComponent } from "../components/ad-banner/ad-banner";
import { NgOptimizedImage } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TrackingService } from '../services/tracking.service';
import { SeoService } from '../services/seo.service';
import { take } from 'rxjs/operators';
import { SpotifyPlaylistComponent } from "../components/spotify-playlist/spotify-playlist";

@Component({
  selector: 'app-discography',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterModule, AdBannerComponent,NgOptimizedImage, SpotifyPlaylistComponent],
  templateUrl:'./app-discography.html',
  styleUrl: './app-discography.scss'
})
export class DiscographyComponent implements OnInit {
  private router = inject(Router);
  public translate = inject(TranslationService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private contentService = inject(ContentService);
  private cdr = inject(ChangeDetectorRef);
  private seoService = inject(SeoService);
  private document = inject(DOCUMENT);

  private _limitToHome: number = 5; // 🛡️ Valor de fábrica blindado (default)
  private readonly dedicatedReleaseLimit = 3;
  currentMode: any;

@Input() set limitToHome(value: any) {
  // Se o roteador injetar 'undefined' ou 'null', a trava mantém o 5.
  // Se vier um valor real (como o 5 da Landing Page), ele aceita.
  if (value !== undefined && value !== null) {
    this._limitToHome = Number(value);
  }
}

get limitToHome(): number {
  return this._limitToHome;
}

  // O Banco de Dados Completo
  allAlbums: Album[] = [];
  isLoading = true;
  last: any;
  private homeAlbumsByMode: Partial<Record<'broklin' | 'jonah', Album[]>> = {};
  private homeLoadingModes = new Set<'broklin' | 'jonah'>();

  // 1. Criamos um signal privado que guarda o estado
private _modeSignal = signal<'broklin' | 'jonah'>('broklin');

  constructor() {
    // 🛡️ TRAVA TÁTICA: Sincroniza o estado do tema apenas após a hidratação ser concluída
    afterNextRender(() => {
      const isJonah = document.body.classList.contains('mode-jonah');
      const mode = isJonah ? 'jonah' : 'broklin';
      this._modeSignal.set(mode);
      this.loadHomeDiscography(mode);
      this.updateDiscographySchema();
    });
  }

get isHomeView(): boolean {
    return !this.router.url.includes('/discografia') && !this.router.url.includes('/musical-archives');
  }

  isJonahMode(): boolean {
    // Retorna o valor do signal. No SSR e hidratação inicial, será sempre 'broklin', evitando Mismatch.
    return this._modeSignal() === 'jonah';
  }

@HostListener('window:theme-changed')
onThemeChange() {
  if (isPlatformBrowser(this.platformId)) {
    const isJonah = document.body.classList.contains('mode-jonah');
    const mode = isJonah ? 'jonah' : 'broklin';
    this._modeSignal.set(mode);
    this.loadHomeDiscography(mode);
    this.updateDiscographySchema();
  }
  this.cdr.detectChanges(); // Força o redesenho físico
}

ngOnInit() {
    const isPt = this.translate.isPt();
    const isDedicatedPage = this.router.url.includes('/discografia') || this.router.url.includes('/musical-archives');

    // 🛡️ TRAVA DE SOBERANIA: SEO e Lang só rodam na página exclusiva
    if (isDedicatedPage) {
      this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

      this.seoService.updateMetaTags({
        title: isPt ? 'Discografia' : 'Discography',
        description: isPt
          ? 'Siga a RaQuel Synths no Spotify, ouça a Cyberpunk Radio 24/7 e descubra os três lançamentos mais recentes.'
          : 'Follow RaQuel Synths on Spotify, listen to Cyberpunk Radio 24/7, and discover the three latest releases.',
        type: 'website'
      });
    }

    // 🚀 UPLINK DE DADOS: Isso deve rodar SEMPRE, seja na Home ou na página dedicada
    this.getDiscography();


  }

getDiscography() {
    const isDedicatedPage =
      this.router.url.includes('/discografia') ||
      this.router.url.includes('/musical-archives');

    if (!isDedicatedPage) {
      this.loadHomeDiscography('broklin');
      return;
    }

    this.contentService.getDiscography().pipe(take(1)).subscribe({
      next: (data: any[]) => {
        this.allAlbums = data as Album[];
        this.isLoading = false;

        // Structured data só pertence à rota dedicada, nunca à homepage embutida.
        if (isDedicatedPage) this.updateDiscographySchema();
      },
      error: (err) => {
        console.error('Erro ao carregar álbuns:', err);
        this.isLoading = false;
      }
    });
  }

private loadHomeDiscography(mode: 'broklin' | 'jonah') {
    if (this.router.url.includes('/discografia') || this.router.url.includes('/musical-archives')) {
      return;
    }

    const cachedAlbums = this.homeAlbumsByMode[mode];

    if (cachedAlbums) {
      this.allAlbums = cachedAlbums;
      this.isLoading = false;
      return;
    }

    if (this.homeLoadingModes.has(mode)) {
      return;
    }

    this.isLoading = true;
    this.homeLoadingModes.add(mode);
    this.contentService.getLatestDiscography(mode, this.limitToHome).pipe(take(1)).subscribe({
      next: (data: any[]) => {
        const albums = data as Album[];
        this.homeLoadingModes.delete(mode);
        this.homeAlbumsByMode[mode] = albums;

        if (this._modeSignal() === mode) {
          this.allAlbums = albums;
          this.isLoading = false;
        }
      },
      error: () => {
        this.homeLoadingModes.delete(mode);
        if (this._modeSignal() === mode) {
          this.isLoading = false;
        }
      }
    });
  }

  // --- GETTERS (A Mágica que conserta o HTML) ---

 // --- HELPER: O CALENDÁRIO INTELIGENTE ---
  // Verifica se a data do álbum é do Mês e Ano atuais
  isCurrentMonth(dateString: string | undefined): boolean {
    if (!dateString) return false;

    // Tenta converter a string "2026-02-03" em Data
    // O trunque do "T00:00:00" é pra evitar problemas de fuso horário voltando um dia
    const releaseDate = new Date(dateString + 'T12:00:00');
    const today = new Date();

    return releaseDate.getMonth() === today.getMonth() &&
    releaseDate.getFullYear() === today.getFullYear();
  }

// ✅ BROKLIN: Home mantém 5; /discografia mostra somente os 3 sinais mais recentes.
get featuredBroklin(): Album[] {
    const filtered = this.allAlbums
      .filter(a => a.faction === 'broklin' || a.faction === 'hybrid')
      .sort((a, b) => {
         const dateB = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
         const dateA = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
         return dateA - dateB; // Mais novos primeiro
      });

    const limit = this.isHomeView ? this.limitToHome : this.dedicatedReleaseLimit;
    return filtered.slice(0, limit);
}

// ✅ JONAH: Home mantém 5; /discografia mostra somente os 3 sinais mais recentes.
get featuredJonah(): Album[] {
    const filtered = this.allAlbums
      .filter(a => a.faction === 'jonah' || a.faction === 'hybrid')
      .sort((a, b) => {
         const dateB = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
         const dateA = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
         return dateA - dateB;
      });

    const limit = this.isHomeView ? this.limitToHome : this.dedicatedReleaseLimit;
    return filtered.slice(0, limit);
}

  get currentReleases(): Album[] {
    return this.isJonahMode() ? this.featuredJonah : this.featuredBroklin;
  }

  compactDescription(album: Album): string {
    const source = this.translate.isPt()
      ? album.descriptionPT
      : (album.descriptionEN || album.descriptionPT);
    const text = (source || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const firstSentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || text;

    return firstSentence.length > 160
      ? `${firstSentence.slice(0, 157).trimEnd()}…`
      : firstSentence;
  }

  private updateDiscographySchema(): void {
    if (this.isHomeView || this.allAlbums.length === 0) return;

    const isPt = this.translate.isPt();
    const albumItems = this.currentReleases
      .filter(album => Boolean(album.title))
      .map((album, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "MusicAlbum",
          "name": album.title,
          "image": album.cover,
          "datePublished": album.releaseDate,
          "description": this.compactDescription(album),
          "byArtist": { "@id": "https://raquelsynths.com/#musicgroup" }
        }
      }));

    this.seoService.setJsonLdGraph([
      {
        "@type": "MusicGroup",
        "@id": "https://raquelsynths.com/#musicgroup",
        "name": "RaQuel Synths",
        "alternateName": "RQS",
        "genre": ["Cyberpunk", "Nu-Metal", "Synthwave"],
        "description": isPt
          ? "Banda Virtual Cyberpunk mesclando frequências puras com o caos industrial."
          : "Cyberpunk Virtual Band blending pure frequencies with industrial chaos."
      },
      {
        "@type": "CollectionPage",
        "url": "https://raquelsynths.com/discografia",
        "name": isPt ? "Discografia RaQuel Synths" : "RaQuel Synths Discography",
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": albumItems.length,
          "itemListElement": albumItems
        }
      }
    ]);
  }

  // --- FUNÇÕES DO HTML ---

  getSafeUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  openLink(url: string | undefined) {
    if (url) window.open(url, '_blank');
  }

  // Função que o seu HTML pediu no final
  GoHome() {
    // Se isso for a Landing Page, talvez você queira ir para o Arquivo
    // Se for o Arquivo, volta pra Home.
    // Como está "Back to Home", vou mandar pra raiz:
    this.router.navigate(['/']);
  }

  // Caso queira o botão de arquivo separado
  navigateFullArchive() {
    this.router.navigate(['/musical-archives']);
  }

  // Injeção do nosso serviço de espionagem
  private trackingService = inject(TrackingService);

  // Radar passivo que não interfere na abertura da aba
  trackAlbumClick(album: Album) {
    if (!album?.title) return;

    if (this.isHomeView) {
      this.trackingService.trackSpotifyClick(album.title);
      return;
    }

    this.trackReleaseClick(album, 'spotify');
  }

// Radar passivo exclusivo para o SoundCloud
  trackSoundcloudClick(album: Album) {
    if (!album?.title) return;

    if (this.isHomeView) {
      this.trackingService.trackSoundcloudClick(album.title);
      return;
    }

    this.trackReleaseClick(album, 'soundcloud');
  }

  trackSpotifyProfileClick(): void {
    this.trackingService.trackCustomEvent('DISCOGRAPHY_SPOTIFY_PROFILE_CLICK', {
      target: 'rqs-mainframe'
    });
  }

  trackRadioClick(): void {
    this.trackingService.trackCustomEvent('DISCOGRAPHY_RADIO_CLICK', {
      target: 'rqs-cyberpunk-radio'
    });
  }

  trackArchiveClick(): void {
    this.trackingService.trackCustomEvent('DISCOGRAPHY_ARCHIVE_CLICK', {
      target: 'musical-archives'
    });
  }

  private trackReleaseClick(album: Album, service: 'spotify' | 'soundcloud'): void {
    this.trackingService.trackCustomEvent('DISCOGRAPHY_RELEASE_CLICK', {
      release_id: album.id,
      release_title: album.title,
      service,
      faction: album.faction
    });
  }
}
