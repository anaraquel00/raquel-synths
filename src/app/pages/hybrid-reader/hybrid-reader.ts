import { Component, OnInit, OnDestroy, inject, Inject, PLATFORM_ID, signal, afterNextRender, Injector, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { SeoService } from '../../services/seo.service';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap, take } from 'rxjs/operators';
import { SplitContentPipe } from "../../components/pipes/content-splitter.pipe";
import { LoreEpisode } from '../../data/lore-data';
import { AdArticleComponent } from "../../components/ad-article/ad-article";
import { NgOptimizedImage } from '@angular/common';
import { AuthorSignatureComponent } from '../../components/author-signature/author-signature';
import { DOCUMENT } from '@angular/core';

@Component({
  selector: 'app-hybrid-reader',
  standalone: true,
  imports: [CommonModule, SplitContentPipe, AdArticleComponent, RouterLink, NgOptimizedImage, AuthorSignatureComponent],
  templateUrl: './hybrid-reader.html',
  styleUrls: ['./hybrid-reader.scss']
})
export class HybridReaderComponent implements OnInit, OnDestroy {
  public translate = inject(TranslationService);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private injector = inject(Injector);
  private document = inject(DOCUMENT);
  currentMode = signal<'broklin' | 'jonah'>('broklin');

  private mode$ = new BehaviorSubject<'broklin' | 'jonah'>('broklin');

  episode$!: Observable<LoreEpisode | null>;
  activeEpisode = signal<LoreEpisode | null>(null);

  private themeObserver: MutationObserver | null = null;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    afterNextRender(() => {
      if (this.isBrowser) {
        this.themeObserver = new MutationObserver(() => this.checkTheme());
        this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
      }
    });

    effect(() => {
      const lang = this.translate.currentLang();
      const isPt = lang === 'pt';
      const ep = this.activeEpisode();

      if (ep) {
        this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

        const title = isPt ? ep.title : (ep.title_en || ep.title);
        const desc = isPt ? ep.description : (ep.description_en || ep.description);
        const imageUrl = ep.image || 'https://raquelsynths.com/images/banner-seo-global.jpg';

        this.seoService.updateCanonical(`https://raquelsynths.com/hybrid-reader/${ep.id}`);

        this.seoService.updateMetaTags({
          title: `${title} | RQS Core Híbrido`,
          description: desc,
          image: imageUrl,
          type: 'article',
          url: `https://raquelsynths.com/hybrid-reader/${ep.id}`
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
            "@id": `https://raquelsynths.com/hybrid-reader/${ep.id}`
          }
        });
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // 🚀 OUVINDO APENAS O ID DA ROTA DIRETAMENTE (Adeus travamento por dependência de tema!)
    this.episode$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => {
        if (!id) return of(null);

        // 🚀 CONEXÃO COM O MÉTODO GLOBAL DO SERVIÇO
        return this.injector.get(ContentService).getGlobalSagaById(id).pipe(
          tap(ep => {
            if (ep) {
              this.activeEpisode.set(ep);
            }
          })
        );
      })
    );
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  private checkTheme() {
    if (!this.isBrowser) return;
    const isJonah = this.document.body.classList.contains('mode-jonah');
    const newMode: 'broklin' | 'jonah' = isJonah ? 'jonah' : 'broklin';
    if (this.currentMode() !== newMode) {
      this.currentMode.set(newMode);
      this.mode$.next(newMode);
    }
  }

  goBack() {
    this.router.navigate(['/hybrid-saga']);
  }
}
