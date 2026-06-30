import { Component, OnInit, OnDestroy, inject, Inject, PLATFORM_ID, signal, afterNextRender, Injector, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { SeoService } from '../../services/seo.service'; // 🛡️ Importante para SEO
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap, take } from 'rxjs/operators';
import { SplitContentPipe } from "../../components/pipes/content-splitter.pipe";
import { LoreEpisode } from '../../data/lore-data';
import { AdArticleComponent } from "../../components/ad-article/ad-article";
import { NgOptimizedImage } from '@angular/common';
import { AuthorSignatureComponent } from '../../components/author-signature/author-signature';
import { DOCUMENT } from '@angular/core';

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
  currentMode = signal<'broklin' | 'jonah'>('broklin');

  // 🛡️ O CANAL DE RÁDIO DO TEMA
  private mode$ = new BehaviorSubject<'broklin' | 'jonah'>('broklin');

  // 🛡️ O CANO QUE ALIMENTA A TELA E O SIGNAL DO SEO
  episode$!: Observable<LoreEpisode | null>;
  activeEpisode = signal<LoreEpisode | null>(null);

  private themeObserver: MutationObserver | null = null;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.document = document;

    // 🛡️ TRAVA TÁTICA
    afterNextRender(() => {
      this.checkTheme();
      this.themeObserver = new MutationObserver(() => {
        this.checkTheme();
      });
      this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    });

  // 📡 O RADAR DE SEO REATIVO (CORRIGIDO SEM DADOS FANTASMAS)
    effect(() => {
      const lang = this.translate.currentLang(); // 1. Escuta o botão de idioma
      const isPt = lang === 'pt';
      const ep = this.activeEpisode();           // 2. Escuta a chegada do episódio

      if (ep) {
        // 🛡️ Sincronia instantânea do <html lang="x">
        this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

        // 🛡️ LÊ ESTRITAMENTE O QUE EXISTE NA INTERFACE
        const title = isPt ? ep.title : (ep.title_en || ep.title);
        const desc = isPt ? ep.description : (ep.description_en || ep.description);
        const imageUrl = ep.image || 'https://raquelsynths.com/images/banner-seo-global.jpg';

        this.seoService.updateCanonical(`https://raquelsynths.com/lore-reader/${ep.id}`);

        // 🚀 TÍTULO EXATO COMO VOCÊ HAVIA PROGRAMADO ORIGINALMENTE
        this.seoService.updateMetaTags({
          title: `${title} | RQS Saga`,
          description: desc,
          image: imageUrl,
          type: 'article',
          url: `https://raquelsynths.com/lore-reader/${ep.id}`
        });

        // 🚀 O SEGUNDO MOTOR: Structured Data JSON-LD
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
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // A inicialização estática do HTML foi apagada daqui e foi pro effect()

    const id$ = this.route.paramMap.pipe(map(params => params.get('id')));

    this.episode$ = combineLatest([id$, this.mode$]).pipe(
      switchMap(([id, mode]) => {
        if (!id) return of(null);

        // 🛡️ O BYPASS DO SERVIDOR (Agora com Dados Únicos!)
        const source$ = !this.isBrowser
          ? of([{
              id: id,
              title: `RQS Lore Archive - Arquivo ${id}`,
              title_en: `RQS Lore Archive - File ${id}`,
              description: `Acesse o log confidencial ${id} da saga transmedia RaQuel Synths.`,
              description_en: `Access the confidential log ${id} from the RaQuel Synths saga.`,
              image: 'https://raquelsynths.com/images/banner-seo-global.jpg',
              releaseDate: new Date().toISOString()
            } as LoreEpisode])
          : this.injector.get(ContentService).getEpisodes(mode).pipe(take(1));

        return source$.pipe(
          map(episodes => episodes ? episodes.find(ep => ep.id === id) || null : null),
          tap(ep => {
            // 🔌 O CABO ESTÁ CONECTADO!
            // Agora o RxJS não atualiza o SEO, ele apenas joga o episódio pro Signal.
            // Quem atualiza o SEO automaticamente na hora é o effect() lá em cima!
            this.activeEpisode.set(ep);
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
