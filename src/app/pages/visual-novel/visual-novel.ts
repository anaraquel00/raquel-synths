import { Component, inject, OnInit, OnDestroy, Inject, PLATFORM_ID, signal, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { Observable, BehaviorSubject, switchMap, combineLatest, map, take, shareReplay } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { SeoService } from '../../services/seo.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-visual-novel',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  templateUrl: './visual-novel.html',
  styleUrl: './visual-novel.scss'
})
export class VisualNovelComponent implements OnInit, OnDestroy {

  private contentService = inject(ContentService);
  public translate = inject(TranslationService);
  private document = inject(DOCUMENT);
  private seoService = inject(SeoService);
  private route = inject(ActivatedRoute);

  public currentMode = signal<'broklin' | 'jonah'>('broklin');
  private seasonRouteState = signal<{
    mode: 'broklin' | 'jonah';
    season: number;
  } | null>(null);
  private seasonSchemaState = signal<{
    mode: 'broklin' | 'jonah';
    season: number;
    episodes: any[];
  } | null>(null);
  private modeSubject = new BehaviorSubject<'broklin' | 'jonah'>('broklin');

  // 🚀 AQUI ESTÁ A NOSSA VARIÁVEL DE ESTADO DAS ABAS
  public temporadaAtiva: number = 1;

  // 📻 NOVO: O sinal de rádio para avisar a matriz que a temporada mudou!
  private temporadaAtivaSubject = new BehaviorSubject<number>(1);
  public prefetchEpisode(id: string): void {
    this.contentService.getEpisodeById(this.currentMode(), id).pipe(take(1)).subscribe();
  }

  // ⚡ FUNÇÃO PARA TROCAR DE TEMPORADA (MANTIDA INTACTA)
  public setTemporada(numeroDaTemporada: number): void {
    this.temporadaAtiva = numeroDaTemporada;
    this.temporadaAtivaSubject.next(numeroDaTemporada); // 🚀 Dispara o sinal!
  }

  // A mesma fonte REST atende SSR e browser e participa do transfer cache do Angular.
  episodes$: Observable<any[]> = this.modeSubject.asObservable().pipe(
    switchMap(mode => this.contentService.getEpisodes(mode).pipe(take(1))),
    shareReplay(1)
  );

  // 🛡️ O SEU FILTRO INTACTO: Pega todos os episódios e entrega pro HTML SÓ os da temporada certa
  filteredEpisodes$: Observable<any[]> = combineLatest([this.episodes$, this.temporadaAtivaSubject]).pipe(
    map(([episodes, season]) => {
      if (!episodes) return [];
      // Se for Temp 1, entrega os 's1-'. Se for Temp 2, entrega os 's2-'.
      return episodes.filter(ep => ep.id && ep.id.startsWith('s' + season + '-'));
    })
  );


  isBrowser: boolean;

 constructor(
  @Inject(PLATFORM_ID) private platformId: Object
) {
  this.isBrowser = isPlatformBrowser(this.platformId);

  effect(() => {
    const routeState = this.seasonRouteState();
    const schemaState = this.seasonSchemaState();
    this.translate.isPt();

    if (routeState) {
      this.setSeasonSeo(routeState.mode, routeState.season);
    }

    if (schemaState) {
      this.setSeasonJsonLd(
        schemaState.mode,
        schemaState.season,
        schemaState.episodes
      );
    }
  });
}

ngOnInit(): void {

this.route.paramMap.subscribe(params => {
      const modeParam =
        params.get('mode');

      const seasonParam =
        params.get('season');

      if (
        modeParam !== 'broklin' &&
        modeParam !== 'jonah'
      ) {
        return;
      }

      if (
        seasonParam !== 's1' &&
        seasonParam !== 's2'
      ) {
        return;
      }

      const mode:
        'broklin' | 'jonah' =
        modeParam;

      const season =
        seasonParam === 's2'
          ? 2
          : 1;

      this.currentMode.set(mode);

      if (
        this.modeSubject.value !== mode
      ) {
        this.modeSubject.next(mode);
      }

      this.setTemporada(season);
      this.seasonRouteState.set({ mode, season });

      this.applyModeTheme(mode);

      this.filteredEpisodes$.pipe(take(1)).subscribe(episodes => {
        this.seasonSchemaState.set({ mode, season, episodes });
      });
    });

}

private setSeasonSeo(
  mode: 'broklin' | 'jonah',
  season: number
): void {
  const isPt = this.translate.isPt();
  const canonicalUrl =
    `https://raquelsynths.com/visual-novel/${mode}/s${season}`;

  const title = mode === 'broklin'
    ? (
        season === 1
          ? (isPt
              ? 'Broklin — Temporada 1 | Ecos da RQS'
              : 'Broklin — Season 1 | RQS Echoes')
          : (isPt
              ? 'Broklin — Temporada 2 | Ecos da RQS'
              : 'Broklin — Season 2 | RQS Echoes')
      )
    : (
        season === 1
          ? (isPt
              ? 'Jonah — Temporada 1 | Ecos da RQS'
              : 'Jonah — Season 1 | RQS Echoes')
          : (isPt
              ? 'Jonah — Temporada 2 | Ecos da RQS'
              : 'Jonah — Season 2 | RQS Echoes')
      );

  const description = mode === 'broklin'
    ? (
        season === 1
          ? (isPt
              ? 'Comece a Saga de Broklin e acompanhe a origem de sua perspectiva tecnológica no universo cyberpunk Ecos da RQS.'
              : 'Begin Broklin’s saga and follow the origin of his technological perspective in the cyberpunk RQS Echoes universe.')
          : (isPt
              ? 'Continue a Saga de Broklin na segunda temporada, com novos conflitos, consequências e conexões no universo Ecos da RQS.'
              : 'Continue Broklin’s saga in Season 2 with new conflicts, consequences, and connections across the RQS Echoes universe.')
      )
    : (
        season === 1
          ? (isPt
              ? 'Comece a Saga de Jonah e acompanhe a origem de sua perspectiva caótica no universo cyberpunk Ecos da RQS.'
              : 'Begin Jonah’s saga and follow the origin of his chaotic perspective in the cyberpunk RQS Echoes universe.')
          : (isPt
              ? 'Continue a Saga de Jonah na segunda temporada, aprofundando os conflitos e revelações do universo Ecos da RQS.'
              : 'Continue Jonah’s saga in Season 2 as the conflicts and revelations of the RQS Echoes universe deepen.')
      );

  this.document.documentElement.lang =
    isPt ? 'pt-BR' : 'en-US';

  this.seoService.updateCanonical(canonicalUrl);

  this.seoService.updateMetaTags({
    title,
    description,
    type: 'website',
    url: canonicalUrl
  });
}

private setSeasonJsonLd(
  mode: 'broklin' | 'jonah',
  season: number,
  episodes: any[]
): void {
  const isPt = this.translate.isPt();
  const seasonUrl = `https://raquelsynths.com/visual-novel/${mode}/s${season}`;
  const seasonId = `${seasonUrl}#season`;

  const episodeItems = episodes
    .map(episode => ({ episode, position: this.getEpisodePosition(episode.id) }))
    .filter(item => item.position !== null)
    .map(({ episode, position }) => ({
      '@type': 'ListItem',
      position,
      item: {
        '@type': 'CreativeWork',
        '@id': `https://raquelsynths.com/lore/${mode}/${episode.id}#episode`,
        url: `https://raquelsynths.com/lore/${mode}/${episode.id}`,
        name: isPt ? episode.title : (episode.title_en || episode.title),
        description: isPt
          ? episode.description
          : (episode.description_en || episode.description),
        datePublished: episode.releaseDate,
        inLanguage: isPt ? 'pt-BR' : 'en-US',
        position,
        isPartOf: { '@id': seasonId }
      }
    }));

  this.seoService.setJsonLdGraph([
    {
      '@type': 'CreativeWorkSeries',
      '@id': 'https://raquelsynths.com/saga#series',
      url: 'https://raquelsynths.com/saga',
      name: isPt ? 'Sagas Literárias RaQuel Synths' : 'RaQuel Synths Literary Sagas'
    },
    {
      '@type': 'CollectionPage',
      '@id': seasonId,
      url: seasonUrl,
      name: `${mode === 'broklin' ? 'Broklin' : 'Jonah'} — ${isPt ? 'Temporada' : 'Season'} ${season}`,
      description: isPt
        ? 'Arquivos de episódios da narrativa transmídia Ecos da RQS.'
        : 'Episode archives of the Echoes of RQS transmedia narrative.',
      inLanguage: isPt ? 'pt-BR' : 'en-US',
      position: season,
      publisher: { '@id': 'https://raquelsynths.com/#organization' },
      isPartOf: { '@id': 'https://raquelsynths.com/saga#series' },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: episodeItems
      }
    }
  ]);
}

private getEpisodePosition(id: string | undefined): number | null {
  const match = id?.match(/^s[12]-e(\d+)$/);
  return match ? Number(match[1]) : null;
}

private applyModeTheme(
  mode: 'broklin' | 'jonah'
): void {

  if (!this.isBrowser) {
    return;
  }

  this.document.body.classList.remove(
    'mode-broklin',
    'mode-jonah'
  );

  this.document.body.classList.add(
    `mode-${mode}`
  );

  const win =
    this.document.defaultView;

  win?.localStorage.setItem(
    'rqs-theme',
    mode
  );
}

 ngOnDestroy(): void {
}
}
