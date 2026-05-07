import { Component, inject, OnInit, OnDestroy, signal, afterNextRender, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { COMPLIANCE_DATA } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compliance.html',
  styleUrls: ['./compliance.scss']
})
export class ComplianceComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private _document = inject(DOCUMENT);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); // Injetar PLATFORM_ID

  public data = signal<any>(
    null // Inicializar com null, será definido no constructor
  );

  private themeObserver: MutationObserver | undefined;
  translate: TranslationService = inject(TranslationService);

  constructor() {
    // 🛡️ INICIALIZAÇÃO CONSISTENTE: Define o estado inicial para SSR e Browser
    const langKey = this.translationService.currentLang() === 'pt' ? 'pt' : 'en';

    // ⚠️ SEMPRE inicializa como broklin para evitar Hydration Mismatch e Crash do Angular
    this.data.set(COMPLIANCE_DATA[langKey]['broklin']);

    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM nascem apenas pós-hidratação
    afterNextRender(() => {
      this.atualizarDados();

      this.themeObserver = new MutationObserver(() => {
        this.atualizarDados();
      });

      this.themeObserver.observe(this._document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  }

  ngOnInit() {
    const isPt = this.translate.isPt();
    const currentPath = this.router.url.split('?')[0];

    // Meta tags padrão
    this.seoService.updateMetaTags({
      title: isPt ? 'Compliance | RaQuel Synths' : 'Compliance | RaQuel Synths',
      description: isPt ? 'Protocolos de Sistema: Transparência, afiliações e regras.' : 'System Protocols: Transparency, affiliations, and rules.',
      url: `https://raquelsynths.com.br${currentPath}`
    });

    // 🚀 Injeção JSON-LD
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": isPt ? 'Políticas de Privacidade e Cookies' : 'Privacy and Cookies Policy',
      "description": isPt ? 'Transparência, afiliações e as regras do nosso universo digital.' : 'Transparency, affiliations, and the rules of our digital universe.',
      "url": `https://raquelsynths.com.br${currentPath}`,
      "publisher": {
        "@type": "Organization",
        "name": "RaQuel Synths"
      }
    });
  }

  ngOnDestroy() {
    this.themeObserver?.disconnect();
  }

  private atualizarDados() {
    const langKey = this.translationService.isPt() ? 'pt' : 'en';
    const modeKey = this._document.body.classList.contains('mode-jonah') ? 'jonah' : 'broklin';

    // Atualiza o texto na tela de forma limpa e segura
    this.data.set(COMPLIANCE_DATA[langKey][modeKey]);
  }
}
