import { Component, OnInit, OnDestroy, inject, Inject, PLATFORM_ID, signal, afterNextRender, Injector } from '@angular/core';
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

  // 🛡️ O CANO AGORA ENTREGA APENAS UM EPISÓDIO, NÃO UM ARRAY
  episode$!: Observable<LoreEpisode | null>;

  private themeObserver: MutationObserver | null = null;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.document = document;

    // 🛡️ TRAVA TÁTICA: Move a verificação de tema e o observer para após a hidratação
    afterNextRender(() => {
      this.checkTheme();

      this.themeObserver = new MutationObserver(() => {
        this.checkTheme();
        // A reatividade lida com a mudança de modo automaticamente!
      });
      this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    });
  }

  ngOnInit() {
    const isPt = this.translate.isPt();

    // 🛡️ SINCRONIA DE BIOS: Hardware em dia
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';
    // 🛰️ CAPTURA O ID DA URL
    const id$ = this.route.paramMap.pipe(map(params => params.get('id')));

    // 💻 CONECTA O CANO DE FORMA REATIVA DUPLA
    this.episode$ = combineLatest([id$, this.mode$]).pipe(
      switchMap(([id, mode]) => {
        if (!id) return of(null);

        // 🛡️ O BYPASS DO SERVIDOR (Bloqueia o Firebase no Build para não dar Timeout)
        const source$ = !this.isBrowser
          ? of([{
              id: id,
              title: 'RQS Lore Archive',
              title_en: 'RQS Lore Archive',
              description: 'Transmedia Cyberpunk storytelling from RaQuel Synths.',
              description_en: 'Transmedia Cyberpunk storytelling from RaQuel Synths.',
              image: 'https://raquelsynths.com.br/images/banner-seo-global.jpg',
              releaseDate: new Date().toISOString()
            } as LoreEpisode])
          // 🌐 O MUNDO REAL: Puxa o array do Firebase no navegador do usuário
          : this.injector.get(ContentService).getEpisodes(mode).pipe(take(1));

        return source$.pipe(
          map(episodes => episodes ? episodes.find(ep => ep.id === id) || null : null),
          tap(ep => {
            if (ep) {
               // 🛡️ O QUE JÁ EXISTE: Atualiza as abas e Open Graph
               const title = this.translate.isPt() ? ep.title : (ep.title_en || ep.title);
               const desc = this.translate.isPt() ? ep.description : (ep.description_en || ep.description);
               const imageUrl = ep.image || 'https://raquelsynths.com.br/images/banner-seo-global.jpg';

               this.seoService.updateMetaTags({
                 title: `${title} | RQS Saga`,
                 description: desc,
                 image: imageUrl,
                 type: 'article' // 🚀 Boost de OG que configuramos no serviço!
               });

               // 🚀 O SEGUNDO MOTOR: Structured Data JSON-LD
               // Isso é o que o webcode.tools gerou, agora automatizado!
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
                   "@id": `https://raquelsynths.com.br/lore-reader/${ep.id}`
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

 private checkTheme() {
    if (!this.isBrowser) return;

    // 1. O radar verifica se a classe de perigo existe
    const isJonah = document.body.classList.contains('mode-jonah');

    // 2. APRESENTAMOS o newMode pro compilador (A linha que faltava!)
    const newMode: 'broklin' | 'jonah' = isJonah ? 'jonah' : 'broklin';

    // 3. Só dispara o gatilho reativo se houver mudança real
    if (this.currentMode() !== newMode) {
      this.currentMode.set(newMode);
      this.mode$.next(newMode); // 🚀 Envia o sinal de rádio pra trocar de episódio
    }
  }

  goBack() {
    this.router.navigate(['/visual-novel']);
  }
}
