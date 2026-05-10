import { Component, OnInit, OnDestroy, signal, afterNextRender, inject, DOCUMENT } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { CREATOR_DATA, NAV_DATA } from '../../data/app-data';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PLATFORM_ID} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../services/seo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-creator',
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './creator.html',
  styleUrl: './creator.scss',
  standalone: true
})
export class Creator implements OnInit, OnDestroy {

  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  public currentTheme = signal<'broklin' | 'jonah'>('broklin'); // Default para SSR
  public currentLang = signal<'pt' | 'en'>('pt'); // Default para SSR
  private themeObserver: MutationObserver | null = null;
  router: Router = inject(Router);
  seoService: SeoService = inject(SeoService);

  constructor(public translate: TranslationService) {
    // 🛡️ SINCRONIA DE HEMISFÉRIOS: Espelha o serviço imediatamente no SSR
    const lang = this.translate.isPt() ? 'pt' : 'en';

    // ⚠️ Evita Hydration Mismatch fatal que trava o Router
    this.currentTheme.set('broklin');
    this.currentLang.set(lang); // Agora o conteúdo segue a mesma bússola do SEO

    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM iniciam APENAS após a hidratação (DOM Estável)
    afterNextRender(() => {
      this.checkTheme();
      this.themeObserver = new MutationObserver(() => this.checkTheme());
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });
  }

ngOnInit() {
    const isPt = this.translate.isPt();
    const currentPath = this.router.url.split('?')[0];

    // 1. 🛡️ PATCH DO CRAWLER: Sincroniza o hardware (Tag HTML)
    // Define se a "Arquiteta" fala PT ou EN para o robô
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

    // 2. 🎯 SEO DE AUTORIDADE: Elevando o nível do portfólio
    this.seoService.updateMetaTags({
      title: isPt
        ? 'A Arquiteta | Desenvolvimento & Direção Criativa'
        : 'The Architect | Development & Creative Direction',
      description: isPt
        ? 'Engenharia de Front-End e Design de Música com IA. Conheça a mente por trás da RaQuel Synths e a fusão entre código, Angular e narrativas transmídia.'
        : 'Front-End Engineering & AI Music Design. Meet the mind behind RaQuel Synths and the fusion of code, Angular, and transmedia narratives.',
      url: `https://raquelsynths.com.br${currentPath}`
    });

    // 3. 🚀 INJEÇÃO DE AUTORIDADE (JSON-LD): Perfil Profissional Verificado
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "name": "Ana Raquel de Holanda",
        "jobTitle": "Arquiteta de Software & AI Music Producer",
        "description": isPt
          ? "Desenvolvedora Front-End especializada em Angular e criação de universos transmídia com inteligência artificial."
          : "Front-End Developer specializing in Angular and building transmedia universes with artificial intelligence.",
        "url": `https://raquelsynths.com.br${currentPath}`,
        "image": "images/foto_perfil.webp",
        "sameAs":[
          "https://www.linkedin.com/in/ana-raquel-de-holanda",
          "https://github.com/anaraquel00"
        ]
      }
    });
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  private checkTheme() {
    const isJonah = this.document.body.classList.contains('mode-jonah');
    this.currentTheme.set(isJonah ? 'jonah' : 'broklin');
  }

  // Atalho para pegar os textos
  get navText() {
    return this.currentLang() === 'pt' ? NAV_DATA.pt : NAV_DATA.en;
  }
 get text() {
    return this.currentLang() === 'pt' ? CREATOR_DATA.pt : CREATOR_DATA.en;
  }
}
