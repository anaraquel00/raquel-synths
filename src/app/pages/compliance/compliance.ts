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
    // 🛡️ INICIALIZAÇÃO ESTRITA: Força 'pt' e 'broklin' para casar 100% com o Servidor
    this.data.set(COMPLIANCE_DATA['pt']['broklin']);

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

    // 1. 🛡️ PATCH DO CRAWLER: Sincroniza o hardware (Tag HTML)
    // Essencial para o AdSense saber se os anúncios de política são em PT ou EN
    this._document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

    // 2. 🎯 SEO DE AUTORIDADE LEGAL: Transmite confiança para os auditores
    this.seoService.updateMetaTags({
      title: isPt
        ? 'Protocolos de Sistema | Compliance'
        : 'System Protocols | Compliance',
      description: isPt
        ? 'Política de privacidade, cookies, publicidade, direitos LGPD e canal de contato da RaQuel Synths.'
        : 'Privacy, cookies, advertising, data-protection rights, and contact information for RaQuel Synths.',
      url: `https://raquelsynths.com${currentPath}`
    });

    // 3. 🚀 INJEÇÃO DE CONFIANÇA (JSON-LD): Define a página como documento oficial
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": isPt ? 'Transparência e Protocolos de Sistema' : 'System Protocols & Transparency',
      "description": isPt
        ? 'Central de privacidade, cookies, publicidade e proteção de dados da RaQuel Synths.'
        : 'Privacy, cookies, advertising, and data-protection center for RaQuel Synths.',
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [{
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://raquelsynths.com"
        },{
          "@type": "ListItem",
          "position": 2,
          "name": "Compliance"
        }]
      }
    });

    // 🛡️ GARANTIA DE DADOS: Força a atualização do conteúdo baseado no idioma
    this.atualizarDados();
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
