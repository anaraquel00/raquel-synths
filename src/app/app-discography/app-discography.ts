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

 // Variáveis para os Textos da Intro
  // --- VARIÁVEIS DE INTRODUÇÃO (MODO BROKLIN / MODO RQS) ---
 introBroklinPT = `
  <p><strong>[ Transmissão Ativa // Terminal Segregado: Estúdio RQS ]</strong></p>
  <p>Enquanto a General Kelma calibra a captação de frequência no microfone condensador, minha diretriz principal é estabilizar a distorção dos sintetizadores e compilar a verdadeira trilha sonora da nossa narrativa. O que você acessa neste diretório não são meros arquivos de áudio genéricos na nuvem; são logs de dados sonoros extraídos diretamente da nossa vivência no Apartamento 14.</p>
  <p>Nesta interface de <strong>Discografia e Streams</strong>, mapeamos a evolução da nossa <em>Guerra Sonora</em> através de lançamentos oficiais, álbuns conceituais e singles de <strong>Synthwave, Dream Pop e Música Eletrônica</strong>. Cada faixa foi meticulosamente forjada para expandir a saga <span class="text-highlight">'Ecos da RQS'</span>. Frequências puras, mixagem cristalina e sem interferências de anomalias externas. Escolha o seu player abaixo, conecte-se via Spotify ou SoundCloud, sintonize na nossa rádio oficial e inicie a imersão.</p>
 `;

 introBroklinEN = `
  <p><strong>[ Active Broadcast // Segregated Terminal: RQS Studio ]</strong></p>
  <p>While General Kelma tunes her frequency capture on the condenser mic, my primary directive is to stabilize the synth distortion and compile the true soundtrack of our narrative. What you access in this directory aren't just generic audio files in the cloud; they are sonic data logs extracted directly from our life in Apartment 14.</p>
  <p>In this <strong>Discography and Streams</strong> interface, we map the evolution of our <em>Sonic War</em> through official releases, concept albums, and singles covering <strong>Synthwave, Dream Pop, and Electronic Music</strong>. Each track was meticulously forged to expand the <span class="text-highlight">'Echoes of RQS'</span> saga. Pure frequencies, crystal-clear mixing, and no interference from external anomalies. Choose your player below, connect via Spotify or SoundCloud, tune into our official radio, and initiate the immersion.</p>
 `;

 // --- VARIÁVEIS DE INTRODUÇÃO (MODO JONAH / CORRUPTO) ---
 introJonahPT = `
  <p><strong><span class="hazard-text">[ Sinal Interceptado // Segurança de Rede Comprometida // Kernel Panic ]</span></strong></p>
  <p>Frequências puras? Mixagem "cristalina"? <em>[Ruído de estática e risadas distorcidas na linha]</em>. O Arquiteto de Software e a Princesa de Plástico acham que podem blindar esses servidores contra a minha ferrugem. Eles vendem o ecossistema perfeitinho deles como se fosse a única verdade, mas o caos não pede senha de acesso, e o que eles chamam de 'altos e baixos', eu chamo de <strong>falha de compilação humana</strong>.</p>
  <p>Acessem os meus diretórios abaixo. O que vocês vão encontrar não é musiquinha de fundo para playlist corporativa. É o puro código-fonte do <strong>Nu-Metal, Industrial Metal e da distorção agressiva</strong>. Cada lançamento meu mapeado nesta página é um ataque de Força Bruta contra a arquitetura deles. Plugue seus fones, ative o ganho máximo e ouçam o som do sistema deles sangrando.</p>
 `;

 introJonahEN = `
  <p><strong><span class="hazard-text">[ Signal Intercepted // Network Security Compromised // Kernel Panic ]</span></strong></p>
  <p>Pure frequencies? "Crystal-clear" mixing? <em>[Static noise and distorted laughter on the line]</em>. The Software Architect and the Plastic Princess think they can shield these servers from my rust. They sell their perfect little ecosystem as if it were the only truth, but chaos doesn't ask for an access password, and what they call 'highs and lows', I call a <strong>human compilation failure</strong>.</p>
  <p>Access my directories below. What you're going to find isn't background music for a corporate playlist. It's the pure source code of <strong>Nu-Metal, Industrial Metal, and aggressive distortion</strong>. Every release of mine mapped on this page is a Brute Force attack against their architecture. Plug in your headphones, maximize the gain, and listen to the sound of their system bleeding.</p>
 `;

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
    });
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
          ? 'Acesse o banco de áudio mestre da Raquel Synths.'
          : 'Access the master audio bank of Raquel Synths.',
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

        // Structured data só pertence às rotas dedicadas, nunca à homepage embutida.
        if (isDedicatedPage && this.allAlbums.length > 0) {
          const isPt = this.translate.isPt();

          const albumItems = this.allAlbums
            .filter(album => Boolean(album.title))
            .map((album, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "MusicAlbum",
                "name": album.title,
                "image": album.cover,
                "datePublished": album.releaseDate,
                "description": isPt
                  ? album.descriptionPT
                  : (album.descriptionEN || album.descriptionPT),
                "byArtist": { "@id": "https://raquelsynths.com/#musicgroup" }
              }
            }));

          const schemas: Record<string, unknown>[] = [
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
                "itemListElement": albumItems
              }
            }
          ];

          // Schema 2: A Acoplagem do Vídeo (Apenas na página dedicada)
          if (isDedicatedPage) {
            schemas.push({
              "@type": "VideoObject",
              "name": "BLUE TEAM 24/7 // THE PRISTINE CODE - RaQuel Synths",
              "description": isPt
                ? "Transmissão do Santuário. Sintonize na rádio oficial 24/7 para frequências limpas de Synthwave e Dream Pop."
                : "Sanctuary Broadcast. Tune in to the official 24/7 radio for clean Synthwave and Dream Pop frequencies.",
              "thumbnailUrl": [
                "https://img.youtube.com/vi/u7JI-dyajuA/maxresdefault.jpg",
                "https://img.youtube.com/vi/u7JI-dyajuA/hqdefault.jpg"
              ],
              "uploadDate": "2026-05-09T00:00:00-03:00",
              "embedUrl": "https://www.youtube.com/embed/u7JI-dyajuA"
            });
          }

          // Envia o lote de dados estruturados unificado para o serviço de SEO
          this.seoService.setJsonLdGraph(schemas);
        }
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

// ✅ BROKLIN: Mostra fatiado na Home/Discografia (5 álbuns) e completo no Arquivo Paginado
get featuredBroklin(): Album[] {
    const filtered = this.allAlbums
      .filter(a => a.faction === 'broklin' || a.faction === 'hybrid')
      .sort((a, b) => {
         const dateB = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
         const dateA = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
         return dateA - dateB; // Mais novos primeiro
      });

    // Isola o comportamento de exibição total apenas para a página de arquivos paginados
    const isArchivePage = this.router.url.includes('/musical-archives');

    return isArchivePage ? filtered : filtered.slice(0, this.limitToHome);
}

// ✅ JONAH: Mostra fatiado na Home/Discografia (5 álbuns) e completo no Arquivo Paginado
get featuredJonah(): Album[] {
    const filtered = this.allAlbums
      .filter(a => a.faction === 'jonah' || a.faction === 'hybrid')
      .sort((a, b) => {
         const dateB = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
         const dateA = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
         return dateA - dateB;
      });

    const isArchivePage = this.router.url.includes('/musical-archives');

    return isArchivePage ? filtered : filtered.slice(0, this.limitToHome);
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
  trackAlbumClick(albumTitle: string) {
    if (albumTitle) {
      this.trackingService.trackSpotifyClick(albumTitle);
    }

}

// Radar passivo exclusivo para o SoundCloud
  trackSoundcloudClick(albumTitle: string) {
    if (albumTitle) {
      this.trackingService.trackSoundcloudClick(albumTitle);
    }
  }
}
