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
  standalone: true,
  host: { 'ngSkipHydration': 'true' }
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
    // 🛡️ INICIALIZAÇÃO CONSISTENTE: Define o estado inicial para SSR e Browser

    // ⚠️ Evita Hydration Mismatch fatal que trava o Router
    this.currentTheme.set('broklin');
    this.currentLang.set('pt'); // 🛡️ Sincronia absoluta com o servidor

    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM iniciam APENAS após a hidratação (DOM Estável)
    afterNextRender(() => {
      this.currentLang.set(this.translate.isPt() ? 'pt' : 'en');
      this.checkTheme(); // Re-avalia o tema após a hidratação
      this.themeObserver = new MutationObserver(() => this.checkTheme());
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });
  }

  ngOnInit() {
    const isPt = this.translate.isPt();
    const currentPath = this.router.url.split('?')[0];

    this.seoService.updateMetaTags({
      title: isPt ? 'A Criadora | Ana Raquel' : 'The Creator | Ana Raquel',
      description: isPt ? 'Engenharia Musical fundindo Angular, IA e a alma humana.' : 'Musical Engineering fusing Angular, AI, and the human soul.',
      url: `https://raquelsynths.com.br${currentPath}`
    });

    // 🚀 Injeção JSON-LD de Perfil Profissional
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "name": "Ana Raquel de Holanda",
        "jobTitle": "Front-End Developer & AI Music Designer",
        "url": `https://raquelsynths.com.br${currentPath}`,
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
