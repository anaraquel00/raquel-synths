import { Component, OnInit, OnDestroy, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop'; // 👈 Essencial
import { SafeHtmlPipe } from "../../components/pipes/safe-html.pipe";
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';
import { Observable, combineLatest, map, switchMap, of, tap } from 'rxjs';
import { AdArticleComponent } from '../../components/ad-article/ad-article';

@Component({
  selector: 'app-log-reader',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe, RouterLink, AdArticleComponent],
  templateUrl: './log-reader.html',
  styleUrl: './log-reader.scss',
})
export class LogReaderComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  public translate = inject(TranslationService);
  private contentService = inject(ContentService);
  private seoService = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  // 🛡️ A CORREÇÃO: toObservable deve ser inicializado aqui, no topo da classe!
  private isPt$ = toObservable(this.translate.isPt);

  logData$!: Observable<any>;
  isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | null = null;

  ngOnInit() {
    // 🛡️ MOTOR DE ESTADO (BLINDAGEM SSR CONTRA CLOAKING)
    if (isPlatformBrowser(this.platformId)) {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    }

    // �️ Captura o ID da URL de forma reativa
    const id$ = this.route.paramMap.pipe(map(params => params.get('id')));

    // 🛰️ COMBINAÇÃO TÁTICA
    this.logData$ = combineLatest([id$, this.isPt$]).pipe(
      switchMap(([id, isPt]) => {
        if (!id) return of(null);

        // Abre o uplink com o Firebase
        return this.contentService.getLogById(id).pipe(
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
              this.seoService.updateMetaTags({
                title: `${mappedData.title} | RQS Logs`,
                description: mappedData.description,
                type: 'article' // Classifica como artigo nas redes sociais
              });

              // 🚀 MOTOR 2: O Injetor Neural JSON-LD (Structured Data)
              this.seoService.setJsonLd({
                 "@context": "https://schema.org",
                 "@type": "TechArticle",
                 "headline": mappedData.title,
                 "description": mappedData.description,
                 "image": [ "https://raquelsynths.com.br/images/banner-seo-global.jpg" ], // Fallback de blindagem
                 "datePublished": mappedData.date,
                 "author": [{
                     "@type": "Person",
                     "name": "Ana Raquel",
                     "jobTitle": "Dev & Creator",
                     "url": "https://raquelsynths.com.br/creator"
                   }],
                 "publisher": {
                   "@type": "Organization",
                   "name": "RaQuel Synths",
                   "logo": {
                     "@type": "ImageObject",
                     "url": "https://raquelsynths.com.br/rqs-logo.webp"
                   }
                 },
                 "mainEntityOfPage": {
                   "@type": "WebPage",
                   "@id": `https://raquelsynths.com.br/log-reader/${mappedData.id}`
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
