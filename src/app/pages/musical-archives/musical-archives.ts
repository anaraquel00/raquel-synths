import { Component, inject, OnInit, OnDestroy, signal, afterNextRender, RESPONSE_INIT } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Services & Models
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { Album } from '../../models/album.model';
import { NgOptimizedImage } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TrackingService } from '../../services/tracking.service';
import { SeoService } from '../../services/seo.service';

export function releasePageForId(
  releases: Album[] | undefined,
  releaseId: string,
  pageSize: number
): number | null {
  if (
    !releases ||
    !releaseId ||
    pageSize < 1
  ) {
    return null;
  }

  const index =
    releases.findIndex(
      album =>
        album.id === releaseId
    );

  if (index < 0) {
    return null;
  }

  return (
    Math.floor(
      index / pageSize
    ) + 1
  );
}

export function archivePageFromQuery(value: unknown): number | null {
  const rawValue = typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : '';

  if (!/^[1-9]\d*$/.test(rawValue)) {
    return null;
  }

  const page = Number(rawValue);
  return Number.isSafeInteger(page) ? page : null;
}

interface ArchiveReleaseLocation {
  lane: 'broklin' | 'jonah';
  page: number;
}

@Component({
  selector: 'app-musical-archives',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './musical-archives.html',
  styleUrl: './musical-archives.scss',
})
export class MusicalArchives implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);
  public translate = inject(TranslationService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private seoService = inject(SeoService);
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | null = null;
  private targetReleaseId: string | null = null;
  private hasReleaseParam = false;
  private invalidArchiveState = false;
  private canonicalArchivePath = '/musical-archives';

  legacyReleases: Album[] = [];
  isLoading = true;
  featuredJonah: any;
  featuredBroklin: any;
  introEN: any;
  introPT: any;
  isLast: any;
  trackSoundcloudClick: any;

  constructor() {
    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM nascem apenas pós-hidratação
    afterNextRender(() => {

      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });
  }

  ngOnInit() {
    // 1. Armazena o estado do idioma para não recalcular à toa
    const isPt = this.translate.isPt();

    // 2. 🛡️ PATCH DO CRAWLER: Altera o idioma da tag HTML raiz dinamicamente
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

    // 🔥 BLINDAGEM SEO + DEEP LINK DE RELEASE
    this.route.queryParams.subscribe(params => {
      const hasBroPage = Object.prototype.hasOwnProperty.call(params, 'broPage');
      const hasJonahPage = Object.prototype.hasOwnProperty.call(params, 'joPage');
      this.hasReleaseParam = Object.prototype.hasOwnProperty.call(params, 'release');

      const broPage = hasBroPage
        ? archivePageFromQuery(params['broPage'])
        : 1;
      const jonahPage = hasJonahPage
        ? archivePageFromQuery(params['joPage'])
        : 1;

      this.targetReleaseId =
        this.hasReleaseParam && typeof params['release'] === 'string'
          ? params['release'].trim()
          : null;

      this.invalidArchiveState =
        (hasBroPage && broPage === null) ||
        (hasJonahPage && jonahPage === null) ||
        (hasBroPage && hasJonahPage) ||
        (this.hasReleaseParam && !this.targetReleaseId) ||
        (this.hasReleaseParam && (hasBroPage || hasJonahPage));

      this.currentPageBroklin = broPage ?? 1;
      this.currentPageJonah = jonahPage ?? 1;
      this.canonicalArchivePath = '/musical-archives';

      if (!this.invalidArchiveState && hasJonahPage) {
        this.alignArchiveMode('jonah');
        this.canonicalArchivePath =
          `/musical-archives?joPage=${this.currentPageJonah}`;
      } else if (!this.invalidArchiveState && hasBroPage) {
        this.alignArchiveMode('broklin');
        if (this.currentPageBroklin > 1) {
          this.canonicalArchivePath =
            `/musical-archives?broPage=${this.currentPageBroklin}`;
        }
      }
    });

    this.getArchives();
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

getArchives() {
    this.contentService.getDiscography().subscribe({
      next: (data: any[]) => {
        const albums = data as Album[];

        // 1. Ordena o banco de dados COMPLETO do mais novo pro mais velho
        const sortedData = albums.sort((a, b) => {
           const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
           const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
           return dateB - dateA;
        });

        // 2. Filtra todos os EPs de cada facção
        const broklinFull = sortedData.filter(album => album.faction === 'broklin' || album.faction === 'hybrid');
        const jonahFull = sortedData.filter(album => album.faction === 'jonah' || album.faction === 'hybrid');

        // 3. O arquivo é a fonte histórica completa; nada é removido por aparecer na Home.
        this.featuredBroklin = broklinFull;
        this.featuredJonah = jonahFull;
        this.legacyReleases = sortedData;
     // 🛡️ MOTOR DE AUTORIDADE: Meta Tags da Discografia Completa
      this.seoService.updateMetaTags({
        title: this.translate.isPt() ? 'Arquivos Musicais' : 'Musical Archives',
        description: this.translate.isPt()
          ? 'O diretório completo de áudio da RaQuel Synths. Explore o legado de Broklin Garpeter e as anomalias de Jonah Cyperfield.'
          : 'The complete audio directory of RaQuel Synths. Explore the legacy of Broklin Garpeter and the anomalies of Jonah Cyperfield.',
        type: 'website'
      });

      // 🚀 INJEÇÃO DE LEGADO (JSON-LD): O catálogo completo para o Google
      this.seoService.setJsonLd({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "MusicGroup",
            "@id": "https://raquelsynths.com/#musicgroup",
            "name": "RaQuel Synths"
          },
          {
            "@type": "CollectionPage",
            "url": "https://raquelsynths.com/musical-archives",
            "name": this.translate.isPt() ? "Arquivos Musicais RaQuel Synths" : "RaQuel Synths Musical Archives",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": albums
                .filter(album => Boolean(album.title))
                .map((album, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "MusicAlbum",
                    "name": album.title,
                    "image": album.cover,
                    "datePublished": album.releaseDate,
                    "description": this.translate.isPt()
                      ? album.descriptionPT
                      : (album.descriptionEN || album.descriptionPT),
                    "byArtist": { "@id": "https://raquelsynths.com/#musicgroup" }
                  }
                }))
            }
          }
        ]
      });
        this.isLoading = false;

        const releaseLocation = this.applyReleaseDeepLink(
          sortedData
        );

        this.finalizeArchiveRequest(releaseLocation);
      }
    });
  }

  private applyReleaseDeepLink(
    albums: Album[]
  ): ArchiveReleaseLocation | null {
    if (
      !this.targetReleaseId
    ) {
      return null;
    }

    const releaseId =
      this.targetReleaseId;

    const release =
      albums.find(
        album =>
          album.id === releaseId
      );

    if (!release) {
      return null;
    }

    let lane:
      'broklin' | 'jonah';

    if (release.faction === 'jonah') {
      lane = 'jonah';
    } else if (
      release.faction === 'broklin'
    ) {
      lane = 'broklin';
    } else {
      lane =
        this.document.body
          .classList
          .contains('mode-jonah')
          ? 'jonah'
          : 'broklin';
    }

    let page =
      releasePageForId(
        lane === 'jonah'
          ? this.featuredJonah
          : this.featuredBroklin,
        releaseId,
        this.pageSize
      );

    // Defensive fallback for hybrid/legacy faction data.
    if (page === null) {
      lane =
        lane === 'jonah'
          ? 'broklin'
          : 'jonah';

      page =
        releasePageForId(
          lane === 'jonah'
            ? this.featuredJonah
            : this.featuredBroklin,
          releaseId,
          this.pageSize
        );
    }

    if (page === null) {
      return null;
    }

    this.alignArchiveMode(
      lane
    );

    if (lane === 'jonah') {
      this.currentPageJonah =
        page;
    } else {
      this.currentPageBroklin =
        page;
    }

    if (isPlatformBrowser(this.platformId)) {
      this.scrollToRelease(releaseId);
    }

    return { lane, page };
  }

  private finalizeArchiveRequest(
    releaseLocation: ArchiveReleaseLocation | null
  ): void {
    if (this.hasReleaseParam) {
      if (!releaseLocation) {
        this.invalidArchiveState = true;
      } else if (releaseLocation.lane === 'jonah') {
        this.canonicalArchivePath =
          `/musical-archives?joPage=${releaseLocation.page}`;
      } else if (releaseLocation.page > 1) {
        this.canonicalArchivePath =
          `/musical-archives?broPage=${releaseLocation.page}`;
      }
    }

    const broklinOutOfRange =
      this.currentPageBroklin > Math.max(this.totalPagesBroklin, 1);
    const jonahOutOfRange =
      this.currentPageJonah > Math.max(this.totalPagesJonah, 1);

    if (
      this.invalidArchiveState ||
      broklinOutOfRange ||
      jonahOutOfRange
    ) {
      this.canonicalArchivePath = '/musical-archives';
      this.setSsrStatus(404);
    }

    this.seoService.updateCanonical(this.canonicalArchivePath);
  }

  private setSsrStatus(statusCode: number): void {
    if (this.responseInit) {
      this.responseInit.status = statusCode;
    }
  }

  private alignArchiveMode(
    lane: 'broklin' | 'jonah'
  ): void {
    this.isJonahMode.set(
      lane === 'jonah'
    );

    this.contentService.currentMode =
      lane;

    this.document.body.classList.remove(
      'mode-broklin',
      'mode-jonah'
    );

    this.document.body.classList.add(
      `mode-${lane}`
    );
  }

  public releaseElementId(
    releaseId: string
  ): string {
    return (
      'release-' +
      encodeURIComponent(
        String(releaseId || '')
      )
    );
  }

  private scrollToRelease(
    releaseId: string
  ): void {
    const elementId =
      this.releaseElementId(
        releaseId
      );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.document
          .getElementById(
            elementId
          )
          ?.scrollIntoView({
            behavior:
              'smooth',
            block:
              'start'
          });
      });
    });
  }

  // Configurações de Paginação
pageSize = 5; // Mostra 5 álbuns por vez (ajuste se quiser mais ou menos)
currentPageBroklin = 1;
currentPageJonah = 1;

public scrollToId(id: string) {
    // 🛡️ BLINDAGEM SSR
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

// --- LÓGICA DO BROKLIN (Getters para fatiar o array automaticamente) ---
get paginatedBroklin() {
  // 🛡️ BLINDAGEM SSR: Se o array não existir ainda no servidor, retorna vazio.
  if (!this.featuredBroklin) {
    return [];
  }
  const startIndex = (this.currentPageBroklin - 1) * this.pageSize;
  return this.featuredBroklin.slice(startIndex, startIndex + this.pageSize);
}

get totalPagesBroklin() {
  // 🛡️ BLINDAGEM SSR: Protege o cálculo do '.length' contra undefined.
  if (!this.featuredBroklin) {
    return 0;
  }
  return Math.ceil(this.featuredBroklin.length / this.pageSize);
}


// --- LÓGICA DO JONAH (Independente) ---
get paginatedJonah() {
  if (!this.featuredJonah) {
    return [];
  }
  const startIndex = (this.currentPageJonah - 1) * this.pageSize;
  return this.featuredJonah.slice(startIndex, startIndex + this.pageSize);
}

get totalPagesJonah() {
  // 🛡️ BLINDAGEM SSR: Protege o cálculo do '.length' contra undefined.
  if (!this.featuredJonah) {
    return 0;
  }
  return Math.ceil(this.featuredJonah.length / this.pageSize);
}


  GoHome() {
    this.router.navigate(['/']);
  }

  // Link Externo (SoundCloud/Spotify)
  openLink(url: string | undefined) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  getSafeUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private trackingService = inject(TrackingService);

    // Radar passivo que não interfere na abertura da aba
    trackAlbumClick(albumTitle: string) {
      if (albumTitle) {
        this.trackingService.trackSpotifyClick(albumTitle);
      }

  }
}
