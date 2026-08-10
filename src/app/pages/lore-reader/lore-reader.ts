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

import {
  Router,
  ActivatedRoute,
  } from '@angular/router';

import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { SeoService } from '../../services/seo.service';

import { Observable, of } from 'rxjs';
import {
  switchMap,
  tap,
  take,
  catchError
} from 'rxjs/operators';

import { SplitContentPipe } from '../../components/pipes/content-splitter.pipe';
import { LoreEpisode } from '../../data/lore-data';
import { AdArticleComponent } from '../../components/ad-article/ad-article';
import { NgOptimizedImage } from '@angular/common';
import { AuthorSignatureComponent } from '../../components/author-signature/author-signature';

@Component({
  selector: 'app-lore-reader',
  standalone: true,
  imports: [
    CommonModule,
    SplitContentPipe,
    AdArticleComponent,
    NgOptimizedImage,
    AuthorSignatureComponent
  ],
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

  /**
   * Permite definir HTTP status no SSR.
   * No browser pode não existir, por isso optional.
   */
  private responseInit = inject(RESPONSE_INIT, {
    optional: true
  });

  /**
   * Agora a URL é a fonte de verdade do modo.
   *
   * /lore/broklin/s1-e1
   * /lore/jonah/s1-e1
   */
  currentMode = signal<'broklin' | 'jonah'>('broklin');

  isBrowser = isPlatformBrowser(this.platformId);

  episode$!: Observable<LoreEpisode | null>;

  activeEpisode = signal<LoreEpisode | null>(null);

  constructor() {

    /**
     * Código exclusivamente de browser.
     *
     * O tema visual agora é derivado da rota.
     * Ele NÃO decide mais qual coleção Firestore será usada.
     */
    afterNextRender(() => {
      this.applyRouteTheme();
    });

    /**
     * SEO reativo.
     */
    effect(() => {
      const lang = this.translate.currentLang();
      const isPt = lang === 'pt';

      const ep = this.activeEpisode();
      const mode = this.currentMode();

      if (!ep) {
        return;
      }

      this.document.documentElement.lang =
        isPt ? 'pt-BR' : 'en-US';

      const title =
        isPt
          ? ep.title
          : (ep.title_en || ep.title);

      const desc =
        isPt
          ? ep.description
          : (ep.description_en || ep.description);

      const imageUrl =
        ep.image ||
        'https://raquelsynths.com/images/banner-seo-global.jpg';

      /**
       * Cada história passa a ter URL canônica própria.
       */
      const canonicalUrl =
        `https://raquelsynths.com/lore/${mode}/${ep.id}`;

      this.seoService.updateCanonical(canonicalUrl);

      this.seoService.updateMetaTags({
        title: `${title} | RQS Saga`,
        description: desc,
        image: imageUrl,
        type: 'article',
        url: canonicalUrl
      });

      this.seoService.setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',

        headline: title,
        description: desc,

        image: [
          imageUrl
        ],

        datePublished: ep.releaseDate,

        author: [
          {
            '@type': 'Person',
            name: 'Ana Raquel',
            jobTitle: 'Dev & Creator',
            url: 'https://raquelsynths.com/creator'
          }
        ],

        publisher: {
          '@type': 'Organization',
          name: 'RaQuel Synths',

          logo: {
            '@type': 'ImageObject',
            url: 'https://raquelsynths.com/rqs-logo.webp'
          }
        },

        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl
        }
      });
    });
  }

  ngOnInit(): void {

    /**
     * A URL é a única autoridade para:
     *
     * mode
     * id
     *
     * Exemplos:
     *
     * /lore/broklin/s1-e1
     * /lore/jonah/s1-e1
     */
    this.episode$ = this.route.paramMap.pipe(

      switchMap(params => {

        const id = params.get('id');

        const rawMode = params.get('mode');

           /**
         * Só aceitamos os dois modos válidos.
         *
         * Qualquer outro valor gera 404.
         */
        if (
          rawMode !== 'broklin' &&
          rawMode !== 'jonah'
        ) {
          this.activeEpisode.set(null);
          this.setSsrStatus(404);

          return of(null);
        }

        const mode: 'broklin' | 'jonah' = rawMode;

        this.currentMode.set(mode);

        /**
         * No browser, sincroniza visualmente
         * Broklin / Jonah com a URL.
         */
        if (this.isBrowser) {
          this.applyRouteTheme();
        }

        if (!id) {
          this.activeEpisode.set(null);
          this.setSsrStatus(404);

          return of(null);
        }

        const contentService =
          this.injector.get(ContentService);

        /**
         * Importante:
         *
         * NÃO existe mais fallback cruzado.
         *
         * /lore/broklin/s1-e1
         * consulta SOMENTE collection "lore".
         *
         * /lore/jonah/s1-e1
         * consulta SOMENTE collection "lore-jonah".
         */
        return contentService
          .getEpisodeById(mode, id)
          .pipe(

            take(1),

            tap(ep => {

              if (!ep) {
                this.setSsrStatus(404);
              }

              this.activeEpisode.set(ep);
            }),

            catchError(err => {

              console.error(
                `🛡️ [RQS Lore Reader] Falha ao ler ${mode}/${id}:`,
                err
              );

              this.activeEpisode.set(null);

              this.setSsrStatus(404);

              return of(null);
            })
          );
      })
    );
  }

  /**
   * Define o HTTP status real no SSR.
   *
   * Isso é essencial para impedir:
   *
   * URL inexistente → HTTP 200
   *
   * e transformar corretamente em:
   *
   * URL inexistente → HTTP 404
   */
  private setSsrStatus(statusCode: number): void {
  const isServer = isPlatformServer(this.platformId);

  if (isServer && this.responseInit) {
    this.responseInit.status = statusCode;
  }
}

  /**
   * O modo visual agora acompanha a URL.
   *
   * A classe do body NÃO determina mais
   * qual história será carregada.
   */
  private applyRouteTheme(): void {

    if (!this.isBrowser) {
      return;
    }

    const mode = this.currentMode();

    this.document.body.classList.remove(
      'mode-broklin',
      'mode-jonah'
    );

    this.document.body.classList.add(
      `mode-${mode}`
    );

    /**
     * Mantém compatibilidade com o restante
     * do sistema de tema da aplicação.
     */
    const win = this.document.defaultView;

    if (win?.localStorage) {
      win.localStorage.setItem(
        'rqs-theme',
        mode
      );
    }

    /**
     * Se outras partes do site escutam
     * o evento theme-changed, continuam funcionando.
     */
    win?.dispatchEvent(
      new CustomEvent('theme-changed')
    );
  }

    ngOnDestroy(): void {
    /**
     * Não existe mais MutationObserver neste componente.
     *
     * O modo vem da URL, portanto não precisamos
     * observar mudanças de classe no body.
     */
  }

  goBack(): void {
  const mode = this.currentMode();

  const id =
    this.route.snapshot.paramMap.get('id') ?? '';

  const season =
    id.startsWith('s2-')
      ? 's2'
      : 's1';

  this.router.navigate([
    '/visual-novel',
    mode,
    season
  ]);
}
}
