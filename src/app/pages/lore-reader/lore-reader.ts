import { Component, OnInit, OnDestroy, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { SeoService } from '../../services/seo.service'; // 🛡️ Importante para SEO
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
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
  private contentService = inject(ContentService);
  public translate = inject(TranslationService);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentMode: 'broklin' | 'jonah' = 'broklin';
  // 🛡️ O CANAL DE RÁDIO DO TEMA
  private mode$ = new BehaviorSubject<'broklin' | 'jonah'>('broklin');

  // 🛡️ O CANO AGORA ENTREGA APENAS UM EPISÓDIO, NÃO UM ARRAY
  episode$!: Observable<LoreEpisode | null>;

  private themeObserver: MutationObserver | null = null;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkTheme();

      this.themeObserver = new MutationObserver(() => {
        this.checkTheme();
        // A reatividade lida com a mudança de modo automaticamente!
      });
      this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    // 🛰️ CAPTURA O ID DA URL
    const id$ = this.route.paramMap.pipe(map(params => params.get('id')));

    // 💻 CONECTA O CANO DE FORMA REATIVA DUPLA
    this.episode$ = combineLatest([id$, this.mode$]).pipe(
      switchMap(([id, mode]) => {
        if (!id) return of(null);

        // Puxa o array do servidor usando o modo atualizado instantaneamente!
        return this.contentService.getEpisodes(mode).pipe(
          map(episodes => episodes ? episodes.find(ep => ep.id === id) || null : null),
          tap(ep => {
            if (ep) {
               // Atualiza a aba do navegador para o SEO rastrear
               const title = this.translate.isPt() ? ep.title : (ep.title_en || ep.title);
               const desc = this.translate.isPt() ? ep.description : (ep.description_en || ep.description);
               this.seoService.updateMetaTags({ title: `${title} | RQS Saga`, description: desc });
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
    if (this.currentMode !== newMode) {
      this.currentMode = newMode;
      this.mode$.next(newMode); // 🚀 Envia o sinal de rádio pra trocar de episódio
    }
  }

  goBack() {
    this.router.navigate(['/visual-novel']);
  }
}
