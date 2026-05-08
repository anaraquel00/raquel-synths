import { Component, inject, OnInit, OnDestroy, Inject, PLATFORM_ID, signal, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
// 🛡️ AQUI: Adicionamos o 'of' para criar a rota de fuga do servidor
import { Observable, BehaviorSubject, switchMap, combineLatest, map, take, of } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { SeoService } from '../../services/seo.service';

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

  public currentMode = signal<'broklin' | 'jonah'>('broklin');
  private modeSubject = new BehaviorSubject<'broklin' | 'jonah'>('broklin');

  // 🚀 AQUI ESTÁ A NOSSA VARIÁVEL DE ESTADO DAS ABAS
  public temporadaAtiva: number = 1;

  // 📻 NOVO: O sinal de rádio para avisar a matriz que a temporada mudou!
  private temporadaAtivaSubject = new BehaviorSubject<number>(1);

  // ⚡ FUNÇÃO PARA TROCAR DE TEMPORADA (MANTIDA INTACTA)
  public setTemporada(numeroDaTemporada: number): void {
    this.temporadaAtiva = numeroDaTemporada;
    this.temporadaAtivaSubject.next(numeroDaTemporada); // 🚀 Dispara o sinal!
  }

  // 🚀 A MÁGICA ORIGINAL: Blindada para não explodir o Build!
  episodes$: Observable<any[]> = this.modeSubject.asObservable().pipe(
    switchMap(mode => {
      // 🛡️ Se for o Servidor do Angular rodando o build, ignora o Firebase e devolve vazio instantaneamente (Adeus Timeout!)
      if (!isPlatformBrowser(this.platformId)) {
        return of([]);
      }
      // 🌐 Se for o Navegador do Usuário, vai no Firebase e busca os episódios normalmente
      return this.contentService.getEpisodes(mode).pipe(take(1));
    })
  );

  // 🛡️ O SEU FILTRO INTACTO: Pega todos os episódios e entrega pro HTML SÓ os da temporada certa
  filteredEpisodes$: Observable<any[]> = combineLatest([this.episodes$, this.temporadaAtivaSubject]).pipe(
    map(([episodes, season]) => {
      if (!episodes) return [];
      // Se for Temp 1, entrega os 's1-'. Se for Temp 2, entrega os 's2-'.
      return episodes.filter(ep => ep.id && ep.id.startsWith('s' + season + '-'));
    })
  );

  private themeObserver: MutationObserver | null = null;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM nascem apenas pós-hidratação
    afterNextRender(() => {
      this.checkTheme();

      this.themeObserver = new MutationObserver(() => {
        this.checkTheme();
      });

      this.themeObserver.observe(this.document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  }

  ngOnInit() {
    // 1. Radar de Idioma (Lê a configuração da matriz)
    const isPt = this.translate.isPt();

    // 2. 🛡️ PATCH DO CRAWLER: Sincroniza o hardware (Tag HTML)
    // Isso mata a "Síndrome do Idioma Misto" no GSC
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

    // 3. 🛡️ MOTOR DE AUTORIDADE: Meta Tags da Visual Novel
    this.seoService.updateMetaTags({
      title: isPt ? 'Sagas Interativas | RaQuel Synths' : 'Visual Novel | RaQuel Synths',
      description: isPt
        ? 'Mergulhe nas Sagas de Cyberpunk da RaQuel Synths. Escolha entre o código de Broklin ou o caos de Jonah e decida o futuro da rede.'
        : 'Dive into RaQuel Synths’ Cyberpunk Sagas. Choose between Broklin’s code or Jonah’s chaos and decide the future of the network.',
      type: 'website'
    });

    // 4. 🚀 INJEÇÃO DE LORE (JSON-LD): Avisa ao Google que isso é uma Série Criativa
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": isPt ? "Sagas Interativas RaQuel Synths" : "RaQuel Synths Interactive Sagas",
      "description": isPt
        ? "Arquivos de episódios da narrativa transmídia Ecos da RQS."
        : "Episode archives of the Echoes of RQS transmedia narrative.",
      "publisher": {
        "@type": "Organization",
        "name": "RaQuel Synths",
        "logo": {
          "@type": "ImageObject",
          "url": "https://raquelsynths.com.br/rqs-logo.webp"
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  private checkTheme() {
    if (!isPlatformBrowser(this.platformId)) return;
    const isJonah = this.document.body.classList.contains('mode-jonah');
    const newMode: 'broklin' | 'jonah' = isJonah ? 'jonah' : 'broklin';

    this.currentMode.set(newMode);

    if (this.modeSubject.value !== newMode) {
      this.modeSubject.next(newMode);
      this.setTemporada(1); // 🛡️ Bônus de UX: Volta pra Temp 1 ao trocar de personagem
    }
  }
}
