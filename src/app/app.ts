import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
  
  // 🛡️ INJEÇÃO DO PLATAFORM ID (Necessário para não quebrar o SSR)
  private platformId = inject(PLATFORM_ID);

  cookiesAccepted!: boolean;

  constructor(
    private adSenseService: AdSenseService,
    private trackingService: TrackingService) {
    injectSpeedInsights();
  }

  ngOnInit() {
   // Insira aqui o seu ID de cliente real (ca-pub-XXXXXXXXXXXXX)
    const meuAdSenseId = 'ca-pub-5619990751602183'; 
    
    // Liga o radar de interação
    this.adSenseService.initLazyLoad(meuAdSenseId);

    // O Gatilho do Analytics / GTM
    const meuGtmId = 'G-Z1TSQ0NV6T'; // Substitua pelo seu ID real (G-XXXX ou GTM-XXXX)
    this.trackingService.initLazyTracking(meuGtmId);

    // 1. --- LÓGICA DE COOKIES ---
    if (typeof window !== 'undefined' && localStorage) {
      this.cookiesAccepted = localStorage.getItem('rqs_cookies_consent') === 'true';
    }

    // 2. --- 🚀 PROTOCOLO DE IDIOMA (O Interceptador Gringo) ---
    if (isPlatformBrowser(this.platformId)) {
      this.iniciarProtocoloDeIdioma();
    }
   
    // 3. --- LEITURA BRUTA DA URL ---
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeNaURL = params.get('mode'); 
      if (modeNaURL === 'jonah') {
        this.aplicarModo('jonah');
      } else {
        this.aplicarModo('broklin'); 
      }
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
        this.seoService.updateTags({
          title: data['seo'].title ? data['seo'].title[lang] : undefined,
          description: data['seo'].description ? data['seo'].description[lang] : undefined
        });
      }
    });
  }

  // --- MÉTODOS DE SISTEMA ---
  aplicarModo(mode: string) {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('mode-broklin', 'mode-jonah');
      document.body.classList.add(`mode-${mode}`);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rqs-theme', mode); 
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('theme-changed'));
    }
  }

  acceptCookies() {
    this.cookiesAccepted = true; 
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rqs_cookies_consent', 'true'); 
    }
  }

  private iniciarProtocoloDeIdioma() {
    const idiomaGuardado = localStorage.getItem('rqs_lang_override');

    if (!idiomaGuardado) {
      const idiomaNavegador = navigator.language || navigator.languages[0];
      // ATENÇÃO AQUI: Mudamos para usar this.translate.setLanguage(xxx)
      if (idiomaNavegador.startsWith('en')) {
        this.translate.setLanguage('en'); 
      } else {
        this.translate.setLanguage('pt');
      }
    }
  }
}