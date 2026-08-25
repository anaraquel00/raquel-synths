import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  PLATFORM_ID,
  afterNextRender,
  Injector,
  RESPONSE_INIT // 👈 Token nativo do Angular 19+ para manipulação de cabeçalhos de resposta
} from '@angular/core';
import {
  CommonModule,
  isPlatformBrowser,
  isPlatformServer, // 👈 Necessário para isolar execuções de backend de forma segura
  DOCUMENT
} from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { SafeHtmlPipe } from "../../components/pipes/safe-html.pipe";
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';
import { Observable, combineLatest, map, switchMap, of, tap, catchError, timeout } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdArticleComponent } from '../../components/ad-article/ad-article';
import { SplitContentPipe } from '../../components/pipes/content-splitter.pipe';

@Component({
  selector: 'app-log-reader',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe, RouterLink, AdArticleComponent, SplitContentPipe],
  templateUrl: './log-reader.html',
  styleUrl: './log-reader.scss',
})
export class LogReaderComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  public translate = inject(TranslationService);
  private seoService = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private injector = inject(Injector);
  private router = inject(Router);
  private http = inject(HttpClient);

  // 🛡️ Injeção opcional para evitar quebras em ambientes Client-Side (CSR) e compilação de rotas (SSG)
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  private isPt$ = toObservable(this.translate.isPt);

  logData$!: Observable<any>;
  loadComplete = signal(false);
  loadFailed = signal(false);
  isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | null = null;
  private ssrFetchFailed = false;

  constructor() {
    this.isJonahMode.set(false);

    afterNextRender(() => {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });
  }

 ngOnInit(): void {
  const isPt = this.translate.isPt();

  this.document.documentElement.lang =
    isPt ? 'pt-BR' : 'en-US';

  const id$ = this.route.paramMap.pipe(
    map(params => params.get('id'))
  );

  this.logData$ = combineLatest([
    id$,
    this.isPt$
  ]).pipe(

    switchMap(([id, isPt]) => {
      this.loadComplete.set(false);
      this.loadFailed.set(false);

      if (!id) {
        this.setSsrStatus(404);
        this.loadComplete.set(true);
        return of(null);
      }

      const source$ =
        isPlatformServer(this.platformId)
          ? this.fetchSsrLogRest(id)
          : this.injector
              .get(ContentService)
              .getLogById(id)
              .pipe(take(1));

      return source$.pipe(

        map((data: any) => {
          this.loadComplete.set(true);

          if (!data) {
            if (!this.ssrFetchFailed) {
              this.setSsrStatus(404);
            }
            return null;
          }

          const localized =
            isPt ? data.pt : data.en;

          return {
            id,
            date: data.date,

            title:
              localized?.title ||
              `RQS Log - ${id}`,

            description:
              localized?.description || '',

            techContent:
              localized?.techContent || '',

            jonahComment:
              localized?.jonahComment || ''
          };
        }),

        tap(mappedData => {
          if (!mappedData) {
            return;
          }

          const absoluteUrl =
            `https://raquelsynths.com/log-reader/${mappedData.id}`;

          this.seoService.updateCanonical(
            absoluteUrl
          );

          this.seoService.updateMetaTags({
            title:
              `${mappedData.title} | RQS Logs`,

            description:
              mappedData.description,

            type: 'article',

            url:
              absoluteUrl
          });

          this.seoService.setJsonLd({
            '@context':
              'https://schema.org',

            '@type':
              'TechArticle',

            headline:
              mappedData.title,

            description:
              mappedData.description,

            image: [
              'https://raquelsynths.com/images/banner-seo-global.jpg'
            ],

            datePublished:
              mappedData.date,

            author: [{
              '@type': 'Person',
              name: 'Ana Raquel',
              jobTitle: 'Dev & Creator',
              url:
                'https://raquelsynths.com/creator'
            }],

            publisher: {
              '@type':
                'Organization',

              name:
                'RaQuel Synths',

              logo: {
                '@type':
                  'ImageObject',

                url:
                  'https://raquelsynths.com/rqs-logo.webp'
              }
            },

            mainEntityOfPage: {
              '@type':
                'WebPage',

              '@id':
                absoluteUrl
            }
          });
        }),

        catchError(err => {
          console.error(
            '🛡️ [RQS MAIN ENGINE] Erro no fluxo de dados do leitor:',
            err
          );

          this.ssrFetchFailed = true;
          this.loadFailed.set(true);
          this.loadComplete.set(true);
          this.setSsrStatus(503);

          return of(null);
        })
      );
    })
  );
}

  /**
   * Realiza a consulta ao Firestore utilizando REST API puro para impedir o travamento de ciclo do Node.js
   */
  private fetchSsrLogRest(
  id: string
): Observable<any> {

  this.ssrFetchFailed = false;

  const projectId =
    'raquel-synths-platform';

  const safeId =
    encodeURIComponent(id);

  const url =
    `https://firestore.googleapis.com/v1/projects/` +
    `${projectId}/databases/(default)/documents/logs/${safeId}`;

  return this.http.get<any>(url).pipe(

    timeout({ first: 10000 }),

    map((doc: any) => {
      if (!doc?.fields) {
        return null;
      }

      if (doc.fields.published?.booleanValue === false) {
        this.setSsrStatus(404);
        return null;
      }

      const date =
        doc.fields.date?.stringValue ||
        doc.fields.date?.timestampValue ||
        '';

      if (!date) {
        this.setSsrStatus(404);
        return null;
      }

      const publishDate =
        new Date(
          date.length === 10
            ? `${date}T00:00:00Z`
            : date
        );

      if (
        Number.isNaN(publishDate.getTime()) ||
        publishDate.getTime() > Date.now()
      ) {
        this.setSsrStatus(404);
        return null;
      }

      return {
        date,

        pt: {
          title:
            doc.fields.pt?.mapValue?.fields
              ?.title?.stringValue || '',

          description:
            doc.fields.pt?.mapValue?.fields
              ?.description?.stringValue || '',

          techContent:
            doc.fields.pt?.mapValue?.fields
              ?.techContent?.stringValue || '',

          jonahComment:
            doc.fields.pt?.mapValue?.fields
              ?.jonahComment?.stringValue || ''
        },

        en: {
          title:
            doc.fields.en?.mapValue?.fields
              ?.title?.stringValue || '',

          description:
            doc.fields.en?.mapValue?.fields
              ?.description?.stringValue || '',

          techContent:
            doc.fields.en?.mapValue?.fields
              ?.techContent?.stringValue || '',

          jonahComment:
            doc.fields.en?.mapValue?.fields
              ?.jonahComment?.stringValue || ''
        }
      };
    }),

    catchError(err => {
      if (err?.status === 404) {
        this.setSsrStatus(404);
        return of(null);
      }

      console.error(
        '🛡️ [RQS SSR REST] Erro crítico ao buscar dados do log:',
        err
      );

      this.ssrFetchFailed = true;
      this.loadFailed.set(true);
      this.loadComplete.set(true);
      this.setSsrStatus(503);

      return of(null);
    })
  );
}

  /**
   * Modifica com segurança o status de resposta HTTP de acordo com o contexto
   */
  private setSsrStatus(statusCode: number): void {
    if (isPlatformServer(this.platformId) && this.responseInit) {
      this.responseInit.status = statusCode;
    }
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }
}
