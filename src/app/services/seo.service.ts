import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  // O núcleo da nossa narrativa
  private defaultTitle = 'RaQuel Synths | Cyberpunk Sagas & Virtual Band';
  private defaultDesc = 'Broklin\'s Tech vs. Jonah\'s Chaos. A Cyberpunk Literary Saga & Musical Experiment. The story has begun.';
  private defaultImage = 'https://raquelsynths.com.br/images/banner-seo-global.jpg';

  constructor(private title: Title,
              private meta: Meta,
             @Inject(DOCUMENT) private dom: Document) { }

  // 🛡️ MÉTODO ATUALIZADO: Agora aceita o 'type' para o Open Graph
  updateMetaTags(config: { title: string; description?: any; image?: string; url?: string; type?: string }) {
    const pageTitle = config.title ? `${config.title} | RaQuel Synths` : this.defaultTitle;
    const pageDesc = config.description || this.defaultDesc;
    const pageImage = config.image || this.defaultImage;
    const pageType = config.type || 'website'; // Padrão é website, mas episódios serão 'article'

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: pageDesc });

    // Open Graph (Facebook/Discord/LinkedIn)
    this.meta.updateTag({ property: 'og:type', content: pageType }); // 🔥 O BOOST AQUI!
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: pageDesc });
    this.meta.updateTag({ property: 'og:image', content: pageImage });

    // Twitter (X)
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' }); // 🔥 Define o banner grandão no Twitter!
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: pageDesc });
    this.meta.updateTag({ name: 'twitter:image', content: pageImage });

    // Dispara o protocolo Canônico
    if (config.url) {
      this.setCanonicalUrl(config.url);
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }
  }

  // 🛡️ Módulo de Blindagem de Rota
  private setCanonicalUrl(url: string) {
    const head = this.dom.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null = this.dom.querySelector(`link[rel='canonical']`);

    const cleanUrl = url.split('?')[0];

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
