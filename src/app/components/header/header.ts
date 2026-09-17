import { Component, Inject, inject, PLATFORM_ID, REQUEST, signal, OnInit, OnDestroy, afterNextRender } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslationService } from '../../services/translation.service';
import { NAV_DATA } from '../../data/app-data';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TrackingService } from '../../services/tracking.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, RouterModule, MatTooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  // 🛡️ REATIVIDADE ABSOLUTA: A variável de estado foi promovida a Signal
  isJonahMode = signal<boolean>(false);

  private platformId = inject(PLATFORM_ID);
  private themeObserver: MutationObserver | null = null;

  private request = inject(REQUEST, { optional: true });
  constructor(
    @Inject(DOCUMENT) private document: Document,
    public translate: TranslationService, // ← SERVIÇO CORRETO INJETADO
    private router: Router,
    private trackingService: TrackingService
  ) {
    // A URL é a fonte de verdade do modo durante o SSR e a hidratação.
    const routeMode = this.getRouteMode(this.request?.url ?? this.router.url);
    if (routeMode) {
      this.isJonahMode.set(routeMode === 'jonah');
    }

    // 🛡️ TRAVA TÁTICA: Sincroniza o estado do tema apenas após a hidratação (DOM Estável)
    afterNextRender(() => {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const routeMode = this.getRouteMode(event.urlAfterRedirects);
        if (routeMode) this.isJonahMode.set(routeMode === 'jonah');
      }
    });

  }


  ngOnInit() {
    // Removido - Movido para afterNextRender no construtor para proteção de Hidratação
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();

  }

  private getRouteMode(url: string): 'broklin' | 'jonah' | null {
    const path = url.startsWith('http') ? new URL(url).pathname : (url.startsWith('/') ? url : `/${url}`);
    const match = path.match(/^\/(?:visual-novel|lore)\/(broklin|jonah)(?:\/|$)/);
    return (match?.[1] as 'broklin' | 'jonah' | undefined) ?? null;
  }

  // 🛡️ A FUNÇÃO DO BOTÃO MANUAL AGORA USA O SERVIÇO CORRETO
  mudarIdioma(novoIdioma: string) {
    this.translate.setLanguage(novoIdioma); // USA O MÉTODO 'setLanguage'
    this.trackingService.trackCustomEvent('HOME_LANGUAGE_TOGGLE', {
      location: 'header',
      selected_language: novoIdioma
    });
  }

  get navText() {
    return this.translate.isPt() ? NAV_DATA.pt : NAV_DATA.en;
  }

  scrollTo(elementId: string): void {
    if (this.router.url === '/') {
      this.doScroll(elementId);
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          this.doScroll(elementId);
        }, 100);
      });
    }
  }

  private doScroll(id: string) {
    const element = this.document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openExternal(url: string): void {
    window.open(url, '_blank');
  }

  activateBroklinMode(): void {
  if (!isPlatformBrowser(this.platformId)) {
    return;
  }

  this.document.body.classList.remove('mode-jonah');
  this.document.body.classList.add('mode-broklin');

  this.isJonahMode.set(false);

  localStorage.setItem('rqs-theme', 'broklin');

  this.document.defaultView?.dispatchEvent(
    new CustomEvent('theme-changed')
  );

  this.trackingService.trackCustomEvent('HOME_MODE_TOGGLE', {
    location: 'header',
    selected_mode: 'broklin'
  });

  this.navigateForMode('broklin');
}

activateJonahMode(): void {
  if (!isPlatformBrowser(this.platformId)) {
    return;
  }

  this.document.body.classList.remove('mode-broklin');
  this.document.body.classList.add('mode-jonah');

  this.isJonahMode.set(true);

  localStorage.setItem('rqs-theme', 'jonah');

  this.document.defaultView?.dispatchEvent(
    new CustomEvent('theme-changed')
  );

  this.trackingService.trackCustomEvent('HOME_MODE_TOGGLE', {
    location: 'header',
    selected_mode: 'jonah'
  });

  this.navigateForMode('jonah');
}

private navigateForMode(
  mode: 'broklin' | 'jonah'
): void {

  const url = this.router.url.split('?')[0];

  // =====================================================
  // 1. USUÁRIO ESTÁ LENDO UM EPISÓDIO
  //
  // /lore/broklin/s1-e2
  //          ↓
  // /lore/jonah/s1-e2
  // =====================================================

  const loreMatch = url.match(
    /^\/lore\/(broklin|jonah)\/([^/?]+)$/
  );

  if (loreMatch) {
    const episodeId = loreMatch[2];

    this.router.navigate([
      '/lore',
      mode,
      episodeId
    ]);

    return;
  }

  // =====================================================
  // 2. USUÁRIO ESTÁ NO SUMÁRIO
  //
  // /visual-novel/broklin/s1
  //              ↓
  // /visual-novel/jonah/s1
  // =====================================================

  const summaryMatch = url.match(
    /^\/visual-novel\/(broklin|jonah)\/(s1|s2)$/
  );

  if (summaryMatch) {
    const season = summaryMatch[2];

    this.router.navigate([
      '/visual-novel',
      mode,
      season
    ]);

    return;
  }

  // =====================================================
  // 3. RESTANTE DO SITE
  //
  // Não altera a URL.
  // Apenas mantém o comportamento tradicional do tema.
  // =====================================================

}
}
