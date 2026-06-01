import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  updateCanonical(currentPath: string) {
  if (!currentPath) return;

  // Garante URL absoluta para o Google não se perder no Mainframe
  const absoluteUrl = currentPath.startsWith('http')
    ? currentPath
    : `https://raquelsynths.com.br${currentPath.startsWith('/') ? '' : '/'}${currentPath}`;

  this.setCanonicalUrl(absoluteUrl);
}

  // O núcleo da nossa narrativa
  private defaultTitle = 'RaQuel Synths | Cyberpunk Sagas & Virtual Band';
  private defaultDesc = 'Broklin\'s Tech vs. Jonah\'s Chaos. A Cyberpunk Literary Saga & Musical Experiment. The story has begun.';
  private defaultImage = 'https://raquelsynths.com.br/images/banner-seo-global.jpg';

  constructor(private title: Title,
              private meta: Meta,
             @Inject(DOCUMENT) private dom: Document) { }

 // 🛡️ MÉTODO ATUALIZADO E BLINDADO CONTRA ESQUECIMENTO DE SPA
  updateMetaTags(config: { title: string; description?: any; image?: string; url?: string; type?: string }) {
    const pageTitle = config.title ? `${config.title} | RaQuel Synths` : this.defaultTitle;
    const pageDesc = config.description || this.defaultDesc;
    const pageImage = config.image || this.defaultImage;
    const pageType = config.type || 'website';

    // 🛡️ CORREÇÃO DE VAZAMENTO DE SPA: Se a URL não for fornecida, captura do DOM atual de forma segura para SSR
    let absoluteUrl = config.url || '';
    if (!absoluteUrl) {
      // Captura a rota e os parâmetros atuais diretamente através do DOM fornecido pelo Angular
      absoluteUrl = this.dom.location?.pathname + (this.dom.location?.search || '') || '';
    }

    if (absoluteUrl) {
      // 1. CORREÇÃO VITAL: Adiciona o domínio se vier apenas a rota (Ex: /store?dept=...)
      if (!absoluteUrl.startsWith('http')) {
        absoluteUrl = `https://raquelsynths.com.br${absoluteUrl.startsWith('/') ? '' : '/'}${absoluteUrl}`;
      }

      try {
        const urlObj = new URL(absoluteUrl);

        // 2. FILTRO DE PERSONA: Remove parâmetros que não interessam pro SEO
        const forbiddenParams = ['mode', 'fbclid', 'utm_source', 'utm_medium', 'gclid', 'dept'];
        forbiddenParams.forEach(p => urlObj.searchParams.delete(p));

        const finalUrl = urlObj.toString();

        // 3. Atualiza as tags com a URL imaculada
        this.setCanonicalUrl(finalUrl);
        this.meta.updateTag({ property: 'og:url', content: finalUrl });

      } catch (e) {
        // Fallback apenas se a URL for genuinamente bizarra (remove query strings)
        this.setCanonicalUrl(absoluteUrl.split('?')[0]);
      }
    }

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: pageDesc });

    // Open Graph
    this.meta.updateTag({ property: 'og:type', content: pageType });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: pageDesc });
    this.meta.updateTag({ property: 'og:image', content: pageImage });

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: pageDesc });
    this.meta.updateTag({ name: 'twitter:image', content: pageImage });
  }

  // 🛡️ Módulo de Blindagem de Rota
  private setCanonicalUrl(cleanUrl: string) {
    const head = this.dom.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null = this.dom.querySelector(`link[rel='canonical']`);

    if (!element) {
      element = this.dom.createElement('link') as HTMLLinkElement;
      element.setAttribute('rel', 'canonical');
      head.appendChild(element);
    }
    element.setAttribute('href', cleanUrl);
  }

  // 🚀 O NOVO INJETOR NEURAL (Structured Data JSON-LD)
  // Esse cara vai processar o payload do webcode.tools!
  setJsonLd(schema: any) {
    const head = this.dom.getElementsByTagName('head')[0];
    let script: HTMLScriptElement | null = this.dom.querySelector(`script[type='application/ld+json']`);

    if (!script) {
      // Cria a tag invisível para o robô ler
      script = this.dom.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      head.appendChild(script);
    }

    // Transforma o objeto em String e joga na cabeça do HTML
    script.textContent = JSON.stringify(schema);
  }
}
