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
  RESPONSE_INIT // 👈 Token oficial para gerenciar o status HTTP no servidor SSR
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
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap, take, catchError } from 'rxjs/operators';
import { SplitContentPipe } from "../../components/pipes/content-splitter.pipe";
import { LoreEpisode } from '../../data/lore-data';
import { AdArticleComponent } from "../../components/ad-article/ad-article";
import { NgOptimizedImage } from '@angular/common';
import { AuthorSignatureComponent } from '../../components/author-signature/author-signature';

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
  private platformId = inject(PLATFORM_ID);

  // 🛡️ Injeção segura e condicional para não travar builds estáticos
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  currentMode = signal<'broklin' | 'jonah'>('broklin');
  isBrowser = isPlatformBrowser(this.platformId);

  episode$!: Observable<LoreEpisode | null>;
  activeEpisode = signal<LoreEpisode | null>(null);

  private mode$ = new BehaviorSubject<'broklin' | 'jonah'>('broklin');
  private themeObserver: MutationObserver | null = null;

  constructor() {
    // 🛡️ EXECUÇÃO SEGURA EM BROWSER
    afterNextRender(() => {
      if (this.isBrowser) {
        this.checkTheme(); // Ajuste tático: lê e sincroniza o tema no primeiro ciclo de hidratação
        this.themeObserver = new MutationObserver(() => this.checkTheme());
        this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
      }
    });

    // 📡 MOTOR DE SEO DO CORE HÍBRIDO
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
    });
  }

  ngOnInit() {
    this.episode$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => {
        if (!id) {
          this.setSsrStatus(404);
          return of(null);
        }

        // 🚀 CONEXÃO DINÂMICA AO BANCO (Pelo ID global)
        return this.injector.get(ContentService).getGlobalSagaById(id).pipe(
          take(1),
          tap(ep => {
            if (!ep) {
              this.setSsrStatus(404); // Responde com 404 real se a saga híbrida for inválida ou inexistente
            }
            this.activeEpisode.set(ep); // Garante reset para null em caso de não haver episódio correspondente
          }),
          catchError(err => {
            console.error(`🛡️ [RQS Hybrid Reader] Erro crítico ao buscar saga híbrida ${id}:`, err);
            this.setSsrStatus(404);
            this.activeEpisode.set(null);
            return of(null);
          })
        );
      })
    );
  }

  /**
   * Atribui status de resposta no cabeçalho HTTP nativo no Servidor (SSR)
   */
  private setSsrStatus(statusCode: number): void {
    if (isPlatformServer(this.platformId) && this.responseInit) {
      this.responseInit.status = statusCode;
      console.log(`🛡️ [RQS SSR] Status de resposta do Leitor Híbrido definido para: ${statusCode}`);
    }
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
