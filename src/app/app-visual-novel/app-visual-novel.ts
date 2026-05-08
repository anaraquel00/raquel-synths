import { Component, inject, OnInit, OnDestroy, signal, afterNextRender, Injector, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/translation.service';
import { VISUAL_NOVEL_PT, VISUAL_NOVEL_EN, VN_INTRO_PT, VN_INTRO_EN, VN_INTRO_JONAH_PT, VN_INTRO_JONAH_EN } from '../data/app-data';
import { Router } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { ContentService } from '../services/content.service'; // 👈 IMPORTANTE
import { Observable, BehaviorSubject, switchMap, of } from 'rxjs'; // 👈 IMPORTANTE
import { LoreEpisode } from '../data/lore-data';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { take } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-visual-novel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
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

  // Esse Observable vai buscar os episódios do Firebase toda vez que o modo mudar
  episodes$: Observable<LoreEpisode[]> = this.modeSubject.asObservable().pipe(
    take(1),
    switchMap(mode => {
      if (!isPlatformBrowser(this.platformId)) {
        return of([{ id: 'seo-mock', title: 'Visual Novel: Cyberpunk Story', description: 'Interactive audio civil war narrative.', mode: 'broklin', route: '/saga' } as any]);
      }
      return this.injector.get(ContentService).getEpisodes(mode).pipe(take(1)); // 🛡️ INJEÇÃO LAZY E TAKE(1)
    })
  );

  private themeObserver: MutationObserver | null = null;
  introPt = VN_INTRO_PT;
  introEn = VN_INTRO_EN;
  introJonahPt = VN_INTRO_JONAH_PT;
  introJonahEn = VN_INTRO_JONAH_EN;

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {
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
    const isPt = this.translate.isPt();

    // 🛡️ SINCRONIA DE BIOS: Hardware em dia
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

    // 🎯 SEO DE ALTO IMPACTO: Palavras-chave táticas (Cyberpunk, Transmedia, Lore)
    this.seoService.updateMetaTags({
      title: isPt
        ? 'Ecos da RQS: Sagas Cyberpunk & Transmídia | RaQuel Synths'
        : 'Echoes of RQS: Cyberpunk & Transmedia Sagas | RaQuel Synths',
      description: isPt
        ? 'Decodifique os arquivos da guerra sonora. Explore as Sagas Literárias que expandem o universo da RaQuel Synths — onde o código de Broklin encontra o caos de Jonah.'
        : 'Decode the sonic war archives. Explore the Literary Sagas expanding the RaQuel Synths universe — where Broklin’s code meets Jonah’s chaos.',
      url: 'https://raquelsynths.com.br/saga'
    });

    // 🚀 INJEÇÃO DE SÉRIE CRIATIVA (JSON-LD): Avisa ao Google que isso é uma Série Literária
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "CreativeWorkSeries",
      "name": isPt ? "Sagas Literárias RaQuel Synths" : "RaQuel Synths Literary Sagas",
      "genre": "Cyberpunk, Sci-Fi",
      "author": {
        "@type": "Person",
        "name": "Ana Raquel"
      },
      "description": isPt
        ? "Crônicas literárias que narram a guerra sonora entre as facções Broklin e Jonah."
        : "Literary chronicles narrating the sonic war between Broklin and Jonah factions."
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
    if (link.startsWith('/')) {
      window.scrollTo(0, 0);
      this.router.navigate([link]);
    } else {
      window.open(link, '_blank');
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
