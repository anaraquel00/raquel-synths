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
import { toObservable } from '@angular/core/rxjs-interop';
import { SafeHtmlPipe } from "../../components/pipes/safe-html.pipe";
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';
import { Observable, combineLatest, map, switchMap, of, tap, catchError, from } from 'rxjs';
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

  // 🛡️ Injeção opcional para evitar quebras em ambientes Client-Side (CSR) e compilação de rotas (SSG)
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  private isPt$ = toObservable(this.translate.isPt);

  logData$!: Observable<any>;
  isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | null = null;

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

  ngOnInit() {
    const isPt = this.translate.isPt();
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';
    const id$ = this.route.paramMap.pipe(map(params => params.get('id')));

    this.logData$ = combineLatest([id$, this.isPt$]).pipe(
      switchMap(([id, isPt]) => {
        if (!id) {
          this.setSsrStatus(404);
          return of(null);
        }

        // 🛡️ ARQUITETURA DE REDE DE BLINDAGEM CONTRA HANG DO ZONE.JS:
        // Evitamos instanciar o SDK pesado em tempo real do Firebase no servidor do Angular.
        // Em ambiente SSR, realizamos uma requisição REST limpa de ciclo curto de vida.
        // No navegador, mantemos a reatividade fluida do ContentService.
        const source$ = isPlatformServer(this.platformId)
          ? this.fetchSsrLogRest(id)
          : this.injector.get(ContentService).getLogById(id).pipe(take(1));

        return source$.pipe(
          map((data: any) => {
            if (!data) {
              this.setSsrStatus(404); // Retorna erro 404 real no SSR se o documento for nulo
              return null;
            }

            const localized = isPt ? data.pt : data.en;

            return {
              id: id,
              date: data.date,
              title: localized?.title || `RQS Log - ${id}`,
              description: localized?.description || '',
              techContent: localized?.techContent || '',
              jonahComment: localized?.jonahComment || ''
            };
          }),
          tap(mappedData => {
            if (mappedData) {
              const absoluteUrl = `https://raquelsynths.com/log-reader/${mappedData.id}`;
              this.seoService.updateCanonical(this.router.url);
              this.seoService.updateMetaTags({
                title: `${mappedData.title} | RQS Logs`,
                description: mappedData.description,
                type: 'article',
                url: absoluteUrl
              });

              this.seoService.setJsonLd({
                 "@context": "https://schema.org",
                 "@type": "TechArticle",
                 "headline": mappedData.title,
                 "description": mappedData.description,
                 "image": [ "https://raquelsynths.com/images/banner-seo-global.jpg" ],
                 "datePublished": mappedData.date,
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
                   "@id": absoluteUrl
                 }
               });
            }
          }),
          catchError(err => {
            console.error(`🛡️ [RQS MAIN ENGINE] Erro no fluxo de dados do leitor:`, err);
            this.setSsrStatus(404);
            return of(null);
          })
        );
      })
    );
  }

  /**
   * Realiza a consulta ao Firestore utilizando REST API puro para impedir o travamento de ciclo do Node.js
   */
  private fetchSsrLogRest(id: string): Observable<any> {
    const projectId = 'raquel-synths-platform';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/logs/${id}`;

    return from(
      fetch(url)
        .then(res => {
          if (!res.ok) {
            if (res.status === 404) {
              this.setSsrStatus(404);
            }
            return null;
          }
          return res.json();
        })
    ).pipe(
      map((doc: any) => {
        if (!doc || !doc.fields) return null;

        // Mapeamento compatível do payload bruto JSON retornado pela REST API do Google Cloud
        return {
          date: doc.fields.date?.stringValue || doc.fields.date?.timestampValue || new Date().toISOString(),
          pt: {
            title: doc.fields.pt?.mapValue?.fields?.title?.stringValue || '',
            description: doc.fields.pt?.mapValue?.fields?.description?.stringValue || '',
            techContent: doc.fields.pt?.mapValue?.fields?.techContent?.stringValue || '',
            jonahComment: doc.fields.pt?.mapValue?.fields?.jonahComment?.stringValue || ''
          },
          en: {
            title: doc.fields.en?.mapValue?.fields?.title?.stringValue || '',
            description: doc.fields.en?.mapValue?.fields?.description?.stringValue || '',
            techContent: doc.fields.en?.mapValue?.fields?.techContent?.stringValue || '',
            jonahComment: doc.fields.en?.mapValue?.fields?.jonahComment?.stringValue || ''
          }
        };
      }),
      catchError(err => {
        console.error(`🛡️ [RQS SSR REST] Erro crítico ao buscar dados do log no backend:`, err);
        this.setSsrStatus(404);
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
