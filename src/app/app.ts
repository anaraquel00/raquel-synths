import { Component, inject, OnInit, PLATFORM_ID, Renderer2, signal, afterNextRender } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';

import { Router, NavigationEnd, ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
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
  imports: [CommonModule, Header, Footer, AdBannerComponent, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
 isBrowser = signal(false);
  title = 'raquel-synths';

  public translate = inject(TranslationService);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  cookiesAccepted = signal(false);

  // 🛡️ TRAVA DO SEO: Evita atualizar as tags no 1º load do cliente
  private initialLoad = true;

  constructor(
    private adSenseService: AdSenseService,
    private trackingService: TrackingService
  ) {

    // 🛡️ A CAIXA FORTE ABSOLUTA: TUDO QUE TOCA O DOM (SCRIPTS E ATRIBUTOS) VAI AQUI!
    afterNextRender(() => {

      // ✅ AQUI É O LUGAR CORRETO!
      // Agora a hidratação já terminou com sucesso. Podemos mostrar o banner!
      this.isBrowser.set(true);

      // 1. Vercel Speed Insights (Injeta script de forma segura, pós-hidratação)
      injectSpeedInsights();

      // 2. Atualiza o atributo Lang do HTML sem quebrar o DOM inicial
      const currentLang = this.translate.currentLang();
      const langAttribute = currentLang === 'en' ? 'en-US' : 'pt-BR';
      this.renderer.setAttribute(this.document.documentElement, 'lang', langAttribute);

      // Pegamos a referência da janela (window) com segurança
      const win = this.document.defaultView as any;

      // 2.5. Injeta o Tema Base de forma segura pós-hidratação
      const savedTheme = win && win.localStorage ? win.localStorage.getItem('rqs-theme') : null;
      this.aplicarModo(savedTheme === 'jonah' ? 'jonah' : 'broklin');

      // 3. Lógica de Cookies
      if (win && win.localStorage) {
        const consent = win.localStorage.getItem('rqs_cookies_consent') === 'true';
        this.cookiesAccepted.set(consent);
      }

      // 4. Protocolo de Idioma
      this.iniciarProtocoloDeIdioma();

      // 5. Override de Tema via URL
      if (win) {
        const params = new URLSearchParams(win.location.search);
        if (params.get('mode') === 'jonah') this.aplicarModo('jonah');
      }

      // 6. AdSense e Tracking Injetados em Segurança
      this.adSenseService.initLazyLoad('ca-pub-5619990751602183');
      this.trackingService.initLazyTracking('G-Z1TSQ0NV6T');
    });
  }

  ngOnInit() {
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
      const isPt = this.translate.isPt();
      const currentPath = this.router.url.split('?')[0];
      const isHome = currentPath === '/' || currentPath === '';

      // 🛡️ RESET DE SOBERANIA: Se cair na Home, força os dados reais
      // mesmo que o data['seo'] seja nulo.
      if (isHome) {
        this.seoService.updateMetaTags({
          title: isPt ? 'RaQuel Synths | Sagas Cyberpunk & Banda Virtual' : 'RaQuel Synths | Cyberpunk Sagas & Virtual Band',
          description: isPt ? 'Onde o analógico sangra no digital. Mergulhe na Guerra Sonora.' : 'Where analog bleeds into digital. Dive into the Sonic War.',
          url: 'https://raquelsynths.com.br/'
        });
        return; // Sai da função, Home protegida.
      }

      // Lógica para as outras páginas que TÊM seo data nas rotas
      if (data['seo']) {
        // Removemos a trava do initialLoad aqui para permitir a correção se o SSR falhar
        const lang = isPt ? 'pt' : 'en';
        const urlCanonica = `https://raquelsynths.com.br${currentPath}`;

        this.seoService.updateMetaTags({
          title: data['seo'].title ? data['seo'].title[lang] : undefined,
          description: data['seo'].description ? data['seo'].description[lang] : undefined,
          url: urlCanonica
        });
      }
    });
  }

  // --- MÉTODOS MANTIDOS INTACTOS ---
  aplicarModo(mode: string) {
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView as any;
      this.document.body.classList.remove('mode-broklin', 'mode-jonah');
      this.document.body.classList.add(`mode-${mode}`);
      if (win && win.localStorage) win.localStorage.setItem('rqs-theme', mode);
      if (win) win.dispatchEvent(new Event('theme-changed'));
    }
  }

  acceptCookies() {
    this.cookiesAccepted.set(true);
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView as any;
      if (win && win.localStorage) win.localStorage.setItem('rqs_cookies_consent', 'true');
    }
  }

  private iniciarProtocoloDeIdioma() {
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView as any;
      if (!win) return;
      const idiomaGuardado = win.localStorage.getItem('rqs_lang_override');
      if (!idiomaGuardado) {
        const idiomaNavegador = win.navigator.language || win.navigator.languages[0];
        if (idiomaNavegador.startsWith('en')) this.translate.setLanguage('en');
        else this.translate.setLanguage('pt');
      }
    }
  }
}
