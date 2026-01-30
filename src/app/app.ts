import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { Home } from "./pages/home/home";
import { AppThemeSwitcher } from './app-theme-switcher/app-theme-switcher';
import { StorytellingComponent } from "./app-storytelling/app-storytelling";
import { SobreComponent } from "./pages/sobre/sobre";

import { DiscographyComponent } from "./app-discography/app-discography";
import { ReactiveFormsModule } from '@angular/forms';
import { ContatoComponent } from "./pages/contato/contato";
import { AdBannerComponent } from "./components/ad-banner/ad-banner";
import { injectSpeedInsights } from '@vercel/speed-insights';
import { CommonModule } from '@angular/common';
import { TranslationService } from './services/translation.service';


@Component({
  selector: 'app-root',
  imports: [CommonModule,
    Header,
    Footer,
    AdBannerComponent,
    RouterOutlet,
    RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App implements OnInit{
  title = 'raquel-synths';
public translate = inject(TranslationService);
  cookiesAccepted!: boolean;

  constructor() {
    // 2. Inicie o monitoramento aqui!
    // Isso conecta seu Angular ao painel da Vercel
    injectSpeedInsights();
  }
  ngOnInit() {
    // Verifica no navegador se já aceitou antes
    if (typeof window !== 'undefined' && localStorage) {
      // Se NÃO tiver o item 'true', então ele mostra o banner
      this.cookiesAccepted = localStorage.getItem('rqs_cookies_consent') === 'true';
    }
  }

  acceptCookies() {
    this.cookiesAccepted = true; // Esconde o banner visualmente
    localStorage.setItem('rqs_cookies_consent', 'true'); // Salva a decisão no navegador
  }
}
