import { Component, inject, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { Observable, BehaviorSubject, combineLatest, map, take, of, switchMap } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { SeoService } from '../../services/seo.service';
import { ActivatedRoute } from '@angular/router';
import { LoreEpisode } from '../../data/lore-data';

@Component({
  selector: 'app-hybrid-saga',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  templateUrl: './hybrid-saga.html',
  styleUrl: './hybrid-saga.scss'
})
export class HybridSagaComponent implements OnInit, OnDestroy {

  public contentService = inject(ContentService);
  public translate = inject(TranslationService);
  private document = inject(DOCUMENT);
  private seoService = inject(SeoService);
  private route = inject(ActivatedRoute);

  // 🚀 MÉTODO AUXILIAR DE PRÉ-CARREGAMENTO (Isola o RxJS do HTML)
  public prefetchEpisode(id: string): void {
    this.contentService.getGlobalSagaById(id).pipe(take(1)).subscribe();
  }

  // 🚀 GERENCIAMENTO DE TEMPORADA DAS SAGAS HÍBRIDAS
  public temporadaAtiva: number = 1;
  private temporadaAtivaSubject = new BehaviorSubject<number>(1);
  public setTemporada(numeroDaTemporada: number): void {
    this.temporadaAtiva = numeroDaTemporada;
    this.temporadaAtivaSubject.next(numeroDaTemporada);
  }

  // 🌐 BUSCA UNIFICADA: Puxa os episódios do Core Híbrido sem divisão de facção
 episodes$: Observable<any[]> = of(true).pipe(
  map(() => {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    // 🚀 Chama corretamente a coleção global híbrida!
    return this.contentService.getGlobalSagas('hybrid'); // O segundo argumento (id) é necessário pela assinatura do método, mas não é usado na implementação para esta listagem.
  }),
  switchMap(obs => obs),
  take(1)
 );

  // 🛡️ FILTRO DE TEMPORADA INTACTO
  filteredEpisodes$: Observable<any[]> = combineLatest([this.episodes$, this.temporadaAtivaSubject]).pipe(
    map(([episodes, season]) => {
      if (!episodes) return [];
      return episodes.filter(ep => ep.id && ep.id.startsWith('s' + season + '-'));
    })
  );

  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // 🛡️ ESCUTA ATIVA: Captura o parâmetro de temporada na URL de forma segura
    this.route.queryParams.subscribe(params => {
      const seasonParam = Number(params['season']) || 1;
      this.setTemporada(seasonParam);
    });

    const isPt = this.translate.isPt();

    // Sincroniza o idioma do HTML
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

    // Motor de SEO para a Saga Híbrida
    this.seoService.updateMetaTags({
      title: isPt ? 'Ecos da RQS: Core Híbrido' : 'RQS Echoes: Hybrid Core',
      description: isPt
        ? 'Explore a saga híbrida onde todas as facções e personagens colidem no ecossistema RaQuel Synths.'
        : 'Explore the hybrid saga where all factions and characters collide in the RaQuel Synths ecosystem.',
      type: 'website'
    });

    // JSON-LD de Coleção
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": isPt ? "Core Híbrido RaQuel Synths" : "RaQuel Synths Hybrid Core",
      "description": isPt
        ? "Arquivos unificados da narrativa transmídia Ecos da RQS."
        : "Unified archives of the Echoes of RQS transmedia narrative.",
      "publisher": {
        "@type": "Organization",
        "name": "RaQuel Synths",
        "logo": {
          "@type": "ImageObject",
          "url": "https://raquelsynths.com/rqs-logo.webp"
        }
      }
    });
  }

  ngOnDestroy() {
    // Sem necessidade de observer de temas de facção no componente híbrido neutro
  }
}
