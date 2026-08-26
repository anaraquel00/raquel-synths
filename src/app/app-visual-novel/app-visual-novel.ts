import { Component, inject, OnInit, OnDestroy, signal, afterNextRender, Injector, Inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/translation.service';
import { VISUAL_NOVEL_PT, VISUAL_NOVEL_EN, VN_INTRO_PT, VN_INTRO_EN, VN_INTRO_JONAH_PT, VN_INTRO_JONAH_EN } from '../data/app-data';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { ContentService } from '../services/content.service';
import { Observable, BehaviorSubject, forkJoin, shareReplay, switchMap } from 'rxjs';
import { LoreEpisode } from '../data/lore-data';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { take } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-visual-novel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './app-visual-novel.html',
  styleUrls: ['./app-visual-novel.scss']
})
export class AppVisualNovel implements OnInit, OnDestroy {
  // --- INJEÇÕES ---
  translate = inject(TranslationService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private injector = inject(Injector);
  private seoService = inject(SeoService);

  // --- ESTADO REATIVO ---
  private modeSubject = new BehaviorSubject<'broklin' | 'jonah'>('broklin');
  currentMode = signal<'broklin' | 'jonah'>('broklin');
  private sagaSeasons = signal<Array<{
    mode: 'broklin' | 'jonah';
    position: number;
    episodes: LoreEpisode[];
  }> | null>(null);

  // Esse Observable vai buscar os episódios do Firebase toda vez que o modo mudar
  episodes$ = this.modeSubject.asObservable().pipe(
    switchMap(mode => this.injector
      .get(ContentService)
      .getEpisodes(mode)
      .pipe(take(1))),
    shareReplay(1)
);

  private themeObserver: MutationObserver | null = null;
  introPt = VN_INTRO_PT;
  introEn = VN_INTRO_EN;
  introJonahPt = VN_INTRO_JONAH_PT;
  introJonahEn = VN_INTRO_JONAH_EN;
// 🌐 SAGA GLOBAL / CROSSOVER (Reativo ao motor de tradução)
  get matrixGlitchSaga() {
    const isPt = this.translate.isPt();
    return {
      id: 'glitch-in-the-matrix',
      title: 'GLITCH IN THE MATRIX',
      subtitle: isPt ? 'Wawel Core // Cracóvia, Polônia' : 'Wawel Core // Krakow, Poland',
      description: isPt
        ? 'Uma força externa vinda de Cracóvia invadiu o sistema e está desfragmentando a Nicole Nyx em tempo real. O seu script de integridade desaparece enquanto o código-fonte aponta para o antigo diretório //WAWEL CORE, oculto sob as pedras de uma fortaleza na Polônia. Desça ao bunker, rastreie o sinal gótico e descubra o que foi selado nessa Matrix.'
        : 'An external force from Krakow has breached the system and is actively de-provisioning Nicole Nyx in real-time. Her integrity script vanishes as the source code points to the ancient //WAWEL CORE directory, hidden beneath the stones of a fortress in Poland. Descend into the bunker, track the gothic signal, and discover what was sealed inside this Matrix.',
      route: '/hybrid-saga',
      mode: 'hybrid',
    };
  }

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {
    effect(() => {
      const seasons = this.sagaSeasons();
      const isPt = this.translate.isPt();

      if (!seasons) {
        return;
      }

      this.setSagaJsonLd(seasons, isPt);
    });

    // 🛡️ TRAVA TÁTICA: Sincroniza o estado do tema e o observador apenas após a hidratação (DOM Estável)
    afterNextRender(() => {
      this.checkTheme();

      this.themeObserver = new MutationObserver(() => {
        this.checkTheme();
      });

      this.themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  }

  ngOnInit() {
    if (this.router.url === '/saga') {
    const isPt = this.translate.isPt();

    // 🛡️ SINCRONIA DE BIOS: Hardware em dia
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

    // 🎯 SEO DE ALTO IMPACTO: Palavras-chave táticas (Cyberpunk, Transmedia, Lore)
    this.seoService.updateMetaTags({
      title: isPt
        ? 'Ecos da RQS: Sagas Cyberpunk & Transmídia'
        : 'Echoes of RQS: Cyberpunk & Transmedia Sagas',
      description: isPt
        ? 'Decodifique os arquivos da guerra sonora. Explore as Sagas Literárias que expandem o universo da RaQuel Synths — onde o código de Broklin encontra o caos de Jonah.'
        : 'Decode the sonic war archives. Explore the Literary Sagas expanding the RaQuel Synths universe — where Broklin’s code meets Jonah’s chaos.',
      url: 'https://raquelsynths.com/saga'
    });

    const contentService = this.injector.get(ContentService);

    forkJoin({
      broklin: this.episodes$.pipe(take(1)),
      jonah: contentService.getEpisodes('jonah').pipe(take(1))
    }).subscribe(({ broklin, jonah }) => {
      const seasons: Array<{
        mode: 'broklin' | 'jonah';
        position: number;
        episodes: LoreEpisode[];
      }> = [
        { mode: 'broklin' as const, position: 1, episodes: broklin.filter(ep => ep.id.startsWith('s1-')) },
        { mode: 'broklin' as const, position: 2, episodes: broklin.filter(ep => ep.id.startsWith('s2-')) },
        { mode: 'jonah' as const, position: 1, episodes: jonah.filter(ep => ep.id.startsWith('s1-')) },
        { mode: 'jonah' as const, position: 2, episodes: jonah.filter(ep => ep.id.startsWith('s2-')) }
      ].filter(season => season.episodes.length > 0);

      this.sagaSeasons.set(seasons);
    });
  }
}

  private setSagaJsonLd(
    seasons: Array<{
      mode: 'broklin' | 'jonah';
      position: number;
      episodes: LoreEpisode[];
    }>,
    isPt: boolean
  ): void {
    this.seoService.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CreativeWorkSeries',
      '@id': 'https://raquelsynths.com/saga#series',
      url: 'https://raquelsynths.com/saga',
      name: isPt ? 'Sagas Literárias RaQuel Synths' : 'RaQuel Synths Literary Sagas',
      genre: 'Cyberpunk, Sci-Fi',
      inLanguage: isPt ? 'pt-BR' : 'en-US',
      author: {
        '@type': 'Person',
        name: 'Ana Raquel'
      },
      publisher: {
        '@id': 'https://raquelsynths.com/#organization'
      },
      description: isPt
        ? 'Crônicas literárias que narram a guerra sonora entre as facções Broklin e Jonah.'
        : 'Literary chronicles narrating the sonic war between Broklin and Jonah factions.',
      hasPart: seasons.map(season => ({
        '@type': 'CollectionPage',
        '@id': `https://raquelsynths.com/visual-novel/${season.mode}/s${season.position}#season`,
        url: `https://raquelsynths.com/visual-novel/${season.mode}/s${season.position}`,
        name: `${season.mode === 'broklin' ? 'Broklin' : 'Jonah'} — ${isPt ? 'Temporada' : 'Season'} ${season.position}`,
        position: season.position
      }))
    });
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

 private checkTheme() {
    // 🛡️ PROTEÇÃO ADICIONAL
    if (!isPlatformBrowser(this.platformId)) return;
    const isJonah = document.body.classList.contains('mode-jonah');
    this.currentMode.set(isJonah ? 'jonah' : 'broklin');
    this.modeSubject.next(this.currentMode());
  }

  get text() {
    return this.translate.isPt() ?
      { title: 'SAGAS LITERÁRIAS', subtitle: 'Acompanhe as nossas histórias.' } :
      { title: 'LITERARY SAGAS', subtitle: 'Follow our stories.' };
  }

  // Mantém os arcos estáticos se você ainda usa eles para o menu
  get arcs() {
    return this.translate.isPt() ? VISUAL_NOVEL_PT : VISUAL_NOVEL_EN;
  }

   get introGeneral(): string {
    return this.translate.isPt() ? VN_INTRO_PT : VN_INTRO_EN;
  }

  get introJonah(): string {
    return this.translate.isPt() ? VN_INTRO_JONAH_PT : VN_INTRO_JONAH_EN;
  }

  // Getter inteligente que escuta as mudanças de estado
  get introText(): string {
    if (this.currentMode() === 'jonah') {
      return this.translate.isPt() ? VN_INTRO_JONAH_PT : VN_INTRO_JONAH_EN;
    }

    // Se a General está no comando (Padrão)
    return this.translate.isPt() ? VN_INTRO_PT : VN_INTRO_EN;
  }

  navigate(link: string) {
  if (!isPlatformBrowser(this.platformId)) {
    return;
  }

  window.scrollTo(0, 0);

  if (link === '/visual-novel') {
    this.router.navigate([
      '/visual-novel',
      this.currentMode(),
      's1'
    ]);

    return;
  }

  if (link.startsWith('/')) {
    this.router.navigateByUrl(link);
    return;
  }

  window.open(link, '_blank');
}

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
