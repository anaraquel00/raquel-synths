import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  signal,
  afterNextRender,
  Injector,
  effect,
  RESPONSE_INIT
} from '@angular/core';
import {
  CommonModule,
  isPlatformBrowser,
  isPlatformServer,
  DOCUMENT
} from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { SeoService } from '../../services/seo.service';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap, take, catchError } from 'rxjs/operators';
import { SplitContentPipe } from "../../components/pipes/content-splitter.pipe";
import { LoreEpisode } from '../../data/lore-data';
import { AdArticleComponent } from "../../components/ad-article/ad-article";
import { NgOptimizedImage } from '@angular/common';
import { AuthorSignatureComponent } from '../../components/author-signature/author-signature';

@Component({
  selector: 'app-lore-reader',
  standalone: true,
  imports: [CommonModule, SplitContentPipe, AdArticleComponent, RouterLink, NgOptimizedImage, AuthorSignatureComponent],
  templateUrl: './lore-reader.html',
  styleUrls: ['./lore-reader.scss']
})
export class LoreReaderComponent implements OnInit, OnDestroy {
  public translate = inject(TranslationService);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private injector = inject(Injector);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  // 🛡️ Injeção opcional para evitar quebra em ambiente navegador (CSR) ou compilação estática (SSG)
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  currentMode = signal<'broklin' | 'jonah'>('broklin');
  isBrowser = isPlatformBrowser(this.platformId);

  // 🛡️ O CANAL DE RÁDIO DO TEMA
  private mode$ = new BehaviorSubject<'broklin' | 'jonah'>('broklin');

  episode$!: Observable<LoreEpisode | null>;
  activeEpisode = signal<LoreEpisode | null>(null);

  private themeObserver: MutationObserver | null = null;

  constructor() {
    // 🛡️ TRAVA TÁTICA (Executa estritamente pós-hidratação no Navegador)
    afterNextRender(() => {
      this.checkTheme();
      this.themeObserver = new MutationObserver(() => {
        this.checkTheme();
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });

    // 📡 O RADAR DE SEO REATIVO
    effect(() => {
      const lang = this.translate.currentLang();
      const isPt = lang === 'pt';
      const ep = this.activeEpisode();

      if (ep) {
        this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

        const title = isPt ? ep.title : (ep.title_en || ep.title);
        const desc = isPt ? ep.description : (ep.description_en || ep.description);
        const imageUrl = ep.image || 'https://raquelsynths.com/images/banner-seo-global.jpg';

        this.seoService.updateCanonical(`https://raquelsynths.com/lore-reader/${ep.id}`);

        this.seoService.updateMetaTags({
          title: `${title} | RQS Saga`,
          description: desc,
          image: imageUrl,
          type: 'article',
          url: `https://raquelsynths.com/lore-reader/${ep.id}`
        });

        this.seoService.setJsonLd({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": title,
          "description": desc,
          "image": [ imageUrl ],
          "datePublished": ep.releaseDate,
          "author": [{
              "@type": "Person",
              "name": "Ana Raquel",
              "jobTitle": "Dev & Creator",
              "url": "https://raquelsynths.com/creator"
            }],
          "publisher": {
            "@type": "Organization",
            "name": "RaQuel Synths",
            "logo": {
              "@type": "ImageObject",
              "url": "https://raquelsynths.com/rqs-logo.webp"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://raquelsynths.com/lore-reader/${ep.id}`
          }
        });
      }
    });
  }

  ngOnInit() {
    const id$ = this.route.paramMap.pipe(map(params => params.get('id')));

    this.episode$ = combineLatest([id$, this.mode$]).pipe(
      switchMap(([id, mode]) => {
        if (!id) {
          this.setSsrStatus(404);
          return of(null);
        }

        const contentService = this.injector.get(ContentService);

        // 🚀 RESOLUÇÃO DO DUAL MODE NO SSR:
        // No servidor, o modo padrão inicial sempre será 'broklin' por limitação do DOM.
        // Se a busca retornar nula no SSR, tentamos buscar no modo alternativo ('jonah') antes de dar 404!
        return contentService.getEpisodeById(mode, id).pipe(
          take(1),
          switchMap(ep => {
            if (ep) {
              return of(ep);
            }

            // Fallback exclusivo de busca cruzada para o Servidor (Googlebot)
            if (isPlatformServer(this.platformId)) {
              const alternativeMode = mode === 'broklin' ? 'jonah' : 'broklin';
              console.log(`🛡️ [RQS Lore SSR] Não encontrado no modo '${mode}'. Tentando busca cruzada no modo: '${alternativeMode}'`);

              return contentService.getEpisodeById(alternativeMode, id).pipe(
                take(1),
                tap(altEp => {
                  if (altEp) {
                    // Sincroniza o sinal se o episódio de fato for da outra facção
                    this.currentMode.set(alternativeMode);
                  }
                })
              );
            }

            return of(null);
          }),
          tap(ep => {
            if (!ep) {
              this.setSsrStatus(404);
            }
            this.activeEpisode.set(ep);
          }),
          catchError(err => {
            console.error(`🛡️ [RQS Lore Reader] Falha ao ler banco para o episódio ${id}:`, err);
            this.setSsrStatus(404);
            this.activeEpisode.set(null);
            return of(null);
          })
        );
      })
    );
  }
private setSsrStatus(statusCode: number): void {
  if (isPlatformServer(this.platformId) && this.responseInit) {
    this.responseInit.status = statusCode;
  }
}

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  private checkTheme() {
    if (!this.isBrowser) return;

    const isJonah = document.body.classList.contains('mode-jonah');
    const newMode: 'broklin' | 'jonah' = isJonah ? 'jonah' : 'broklin';

    if (this.currentMode() !== newMode) {
      this.currentMode.set(newMode);
      this.mode$.next(newMode);
    }
  }

  goBack() {
    this.router.navigate(['/visual-novel']);
  }
}
