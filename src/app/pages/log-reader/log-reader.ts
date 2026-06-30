import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID, afterNextRender, Injector } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop'; // 👈 Essencial
import { SafeHtmlPipe } from "../../components/pipes/safe-html.pipe";
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';
import { Observable, combineLatest, map, switchMap, of, tap } from 'rxjs';
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

  // 🛡️ A CORREÇÃO: toObservable deve ser inicializado aqui, no topo da classe!
  private isPt$ = toObservable(this.translate.isPt);

  logData$!: Observable<any>;
  isJonahMode = signal<boolean>(false); // Default para SSR
  private themeObserver: MutationObserver | null = null;


  constructor() { // Construtor único
    // 🛡️ INICIALIZAÇÃO CONSISTENTE: Define o estado inicial para SSR e Browser

    // ⚠️ Evita Hydration Mismatch fatal que trava o Router
    this.isJonahMode.set(false);

    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM nascem apenas pós-hidratação
    afterNextRender(() => {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });
  };

  ngOnInit() {
     const isPt = this.translate.isPt();

    // 🛡️ SINCRONIA DE BIOS: Hardware em dia
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';
    // �️ Captura o ID da URL de forma reativa
    const id$ = this.route.paramMap.pipe(map(params => params.get('id')));

    // 🛰️ COMBINAÇÃO TÁTICA
    this.logData$ = combineLatest([id$, this.isPt$]).pipe(
      switchMap(([id, isPt]) => {
        if (!id) return of(null);

        // 🛡️ O BYPASS DO SERVIDOR (Agora Dinâmico e Blindado!)
        const source$ = !isPlatformBrowser(this.platformId)
          ? of({
              date: new Date().toISOString(),
              pt: {
                title: `RQS System Log - Arquivo ${id}`,
                description: `Acesso ao log criptografado ${id} da RaQuel Synths.`,
                techContent: 'Dados de sistema criptografados. Acesse pelo terminal.'
              },
              en: {
                title: `RQS System Log - File ${id}`,
                description: `Access to RaQuel Synths encrypted log ${id}.`,
                techContent: 'Encrypted system data. Access via terminal.'
              }
            })
          : this.injector.get(ContentService).getLogById(id).pipe(take(1));

        return source$.pipe(
          map((data: any) => {
            if (!data) return null;

            // 🗺️ Desempacota a árvore correta (EN ou PT)
            const localized = isPt ? data.pt : data.en;

            return {
              id: id,
              date: data.date,
              title: localized?.title,
              description: localized?.description,
              techContent: localized?.techContent,
              jonahComment: localized?.jonahComment
            };
          }),
          tap(mappedData => {
            if (mappedData) {
              // 🛡️ MOTOR 1: Meta Tags Básicas e Open Graph
              const absoluteUrl = `https://raquelsynths.com/log-reader/${mappedData.id}`;
              this.seoService.updateCanonical(this.router.url);
              this.seoService.updateMetaTags({
                title: `${mappedData.title} | RQS Logs`,
                description: mappedData.description,
                type: 'article',
                url: absoluteUrl
              });

              // 🚀 MOTOR 2: O Injetor Neural JSON-LD (Structured Data)
              this.seoService.setJsonLd({
                 "@context": "https://schema.org",
                 "@type": "TechArticle",
                 "headline": mappedData.title,
                 "description": mappedData.description,
                 "image": [ "https://raquelsynths.com/images/banner-seo-global.jpg" ], // Fallback de blindagem
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
                   "@id": `https://raquelsynths.com/log-reader/${mappedData.id}`
                 }
               });
            }
          })
        );
      })
    );
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }
}
