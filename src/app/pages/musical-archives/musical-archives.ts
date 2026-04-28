import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Services & Models
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { Album } from '../../models/album.model';
import { AdArticleComponent } from "../../components/ad-article/ad-article";
import { NgOptimizedImage } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TrackingService } from '../../services/tracking.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-musical-archives',
  standalone: true,
  imports: [CommonModule, RouterModule, AdArticleComponent, NgOptimizedImage], // Imports corretos
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

  isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | null = null;

  legacyReleases: Album[] = [];
  isLoading = true;
  featuredJonah: any;
  featuredBroklin: any;
  introEN: any;
  introPT: any;
  isLast: any;


  ngOnInit() {
    // 🛡️ MOTOR DE ESTADO E PREVENÇÃO DE CLOAKING (SSR SAFE)
    if (isPlatformBrowser(this.platformId)) {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    }

    this.getArchives();
    // 🔥 BLINDAGEM SEO: O terminal agora rastreia a URL
    this.route.queryParams.subscribe(params => {
      // Se não tiver página na URL, ele assume 1 (padrão)
      this.currentPageBroklin = params['broPage'] ? Number(params['broPage']) : 1;
      this.currentPageJonah = params['joPage'] ? Number(params['joPage']) : 1;
    });
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

        // 🛡️ 3. O GOLPE DE MISERICÓRDIA: .slice(5)
        // Isso diz ao Angular: "Pule os 5 primeiros (que já estão na Home) e me dê todo o resto!"
        this.featuredBroklin = broklinFull.slice(5);
        this.featuredJonah = jonahFull.slice(5);

        // Se você usar a variável legacyReleases globalmente, aplique o corte nela também:
        this.legacyReleases = sortedData.slice(5);
        // 🛡️ MOTOR DE AUTORIDADE: Meta Tags da Discografia Completa
      this.seoService.updateMetaTags({
        title: this.translate.isPt() ? 'Arquivos Musicais | RQS' : 'Musical Archives | RQS',
        description: 'O diretório completo de áudio da RaQuel Synths. Explore o legado de Broklin Garpeter e as anomalias de Jonah Cyperfield.',
        type: 'website'
      });

      // 🚀 INJEÇÃO DE LEGADO (JSON-LD): O catálogo completo para o Google
      this.seoService.setJsonLd({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": this.translate.isPt() ? "Arquivos Musicais RaQuel Synths" : "RaQuel Synths Musical Archives",
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": albums.map((a, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "MusicAlbum",
              "name": a.title,
              "image": a.cover,
              "datePublished": a.releaseDate,
              "description": this.translate.isPt() ? a.descriptionPT : (a.descriptionEN || a.descriptionPT),
              "byArtist": { "@type": "MusicGroup", "name": "RaQuel Synths" }
            }
          }))
        }
      });
        this.isLoading = false;
      }
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
