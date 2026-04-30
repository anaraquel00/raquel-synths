import { Component, inject, OnInit, PLATFORM_ID, effect, Renderer2, signal, afterNextRender } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';

// 🛡️ IMPORTAÇÕES DA ENGENHARIA DE ROTEAMENTO:
import { Router, NavigationEnd, ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';

// 🛡️ IMPORTAÇÕES DO RXJS:
import { filter, map, mergeMap } from 'rxjs/operators';

import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { AdBannerComponent } from "./components/ad-banner/ad-banner";
import { injectSpeedInsights } from '@vercel/speed-insights';
import { TranslationService } from './services/translation.service';
import { SeoService } from './services/seo.service';
import { AdSenseService } from './services/ad-sense.service';
import { TrackingService } from './services/tracking.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    Footer,
    AdBannerComponent,
    RouterOutlet,
    RouterModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'raquel-synths';

  // --- INJEÇÕES DE SERVIÇOS MODERNAS ---
  public translate = inject(TranslationService);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  // 🛡️ INJEÇÕES DE MANIPULAÇÃO DO DOM (Para o AdSense)
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);

  // 🛡️ INJEÇÃO DO PLATAFORM ID (Necessário para não quebrar o SSR)
  private platformId = inject(PLATFORM_ID);

  cookiesAccepted = signal(false);

  constructor(
    private adSenseService: AdSenseService,
    private trackingService: TrackingService) {
    injectSpeedInsights();

    // 🚀 GATILHO REATIVO DO IDIOMA PARA O ADSENSE (SEO/RPM)
    effect(() => {
      // Escuta o idioma atual do seu TranslationService
      const currentLang = this.translate.currentLang();

      // Define a tag para o robô do AdSense faturar em dólar ou real
      const langAttribute = currentLang === 'en' ? 'en-US' : 'pt-BR';

      // Injeta diretamente na tag <html>
      this.renderer.setAttribute(this.document.documentElement, 'lang', langAttribute);
    });

    // 🛡️ TRAVA TÁTICA: Lógicas que leem o DOM/Storage do cliente são movidas para pós-hidratação.
    afterNextRender(() => {
      // 1. --- LÓGICA DE COOKIES ---
      const win = this.document.defaultView as any;
      if (win && win.localStorage) {
        const consent = win.localStorage.getItem('rqs_cookies_consent') === 'true';
        this.cookiesAccepted.set(consent);
      }

      // 2. --- PROTOCOLO DE IDIOMA ---
      this.iniciarProtocoloDeIdioma();

      // 3. --- LEITURA DE PARÂMETRO DE URL (OVERRIDE DE TEMA) ---
      if (win) {
        const params = new URLSearchParams(win.location.search);
        const modeNaURL = params.get('mode');
        if (modeNaURL === 'jonah') {
          this.aplicarModo('jonah');
        }
        // Removido o 'else' que forçava o modo Broklin, respeitando o localStorage.
      }
    });
  }

ngOnInit() {
    // 2. --- 🚀 PROTOCOLO DE RASTREAMENTO E IDIOMA (O Cofre do Navegador) ---
    // 🛡️ TUDO o que for de Google Analytics, AdSense ou Idioma DEVE ficar aqui dentro!
    if (isPlatformBrowser(this.platformId)) {
      // A inicialização do idioma foi movida para afterNextRender para evitar Hydration Mismatch.

      // Inicia o AdSense em segurança
      const meuAdSenseId = 'ca-pub-5619990751602183';
      this.adSenseService.initLazyLoad(meuAdSenseId);

      // Inicia o Analytics/GTM em segurança
      const meuGtmId = 'G-Z1TSQ0NV6T';
      this.trackingService.initLazyTracking(meuGtmId);

    }

    // 4. --- INTERCEPTADOR GLOBAL DE SEO ---
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe(data => {
      if (data['seo']) {
        const lang = this.translate.isPt() ? 'pt' : 'en';
        this.seoService.updateMetaTags({
          title: data['seo'].title ? data['seo'].title[lang] : undefined,
          description: data['seo'].description ? data['seo'].description[lang] : undefined
        });
      }
    });
  }

  // --- MÉTODOS DE SISTEMA ---
  aplicarModo(mode: string) {
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView as any;

      this.document.body.classList.remove('mode-broklin', 'mode-jonah');
      this.document.body.classList.add(`mode-${mode}`);

      if (win && win.localStorage) {
        win.localStorage.setItem('rqs-theme', mode);
      }
      if (win) {
        win.dispatchEvent(new Event('theme-changed'));
      }
    }
  }

  acceptCookies() {
    this.cookiesAccepted.set(true);
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView as any;
      if (win && win.localStorage) {
        win.localStorage.setItem('rqs_cookies_consent', 'true');
      }
    }
  }

  private iniciarProtocoloDeIdioma() {
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView as any;
      if (!win) return;

      const idiomaGuardado = win.localStorage.getItem('rqs_lang_override');

      if (!idiomaGuardado) {
        const idiomaNavegador = win.navigator.language || win.navigator.languages[0];
        if (idiomaNavegador.startsWith('en')) {
          this.translate.setLanguage('en');
        } else {
          this.translate.setLanguage('pt');
        }
      }
    }
  }
}
