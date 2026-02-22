import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// 🛡️ IMPORTAÇÕES DA ENGENHARIA DE ROTEAMENTO:
import { Router, NavigationEnd, ActivatedRoute, RouterLink, RouterModule, RouterOutlet } from '@angular/router';

// 🛡️ IMPORTAÇÕES DO RXJS (Para filtrar e mapear os dados da rota):
import { filter, map, mergeMap } from 'rxjs/operators';

import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { AdBannerComponent } from "./components/ad-banner/ad-banner";
import { injectSpeedInsights } from '@vercel/speed-insights';
import { TranslationService } from './services/translation.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true, // Arquitetura moderna requer componentes standalone
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

  // --- INJEÇÕES DE SERVIÇOS ---
  public translate = inject(TranslationService);
  private seoService = inject(SeoService);
  
  // 🛡️ INJEÇÕES DO MOTOR DE ROTAS:
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  cookiesAccepted!: boolean;

  constructor() {
    // Conecta o Angular ao painel de telemetria da Vercel
    injectSpeedInsights();
  }

  ngOnInit() {
    // 1. --- LÓGICA DE COOKIES ---
    if (typeof window !== 'undefined' && localStorage) {
      this.cookiesAccepted = localStorage.getItem('rqs_cookies_consent') === 'true';
    }
   
    // 2. --- LEITURA BRUTA DA URL (Protegida contra SSR crash) ---
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeNaURL = params.get('mode'); 

      console.log('🔍 URL DETECTADA BRUTAMENTE:', modeNaURL);

      if (modeNaURL === 'jonah') {
        this.aplicarModo('jonah');
      } else {
        this.aplicarModo('broklin'); 
      }
    }

    // 3. --- 🚀 INTERCEPTADOR GLOBAL DE SEO BILÍNGUE ---
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
      // Quando a rota termina de carregar, nós olhamos o pacote 'data'
      if (data['seo']) {
        // Puxa o idioma instantaneamente da sua matriz de tradução
        const lang = this.translate.isPt() ? 'pt' : 'en';
        
        // Injeta os dados da rota no idioma correto
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
}