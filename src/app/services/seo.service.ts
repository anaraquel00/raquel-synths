import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  // 🛡️ NOVO MÉTODO: Alinhado com o LogReaderComponent
  updateMetaTags(config: { title: string; description: any; image?: string; url?: string }) {
    const pageTitle = config.title ? `${config.title} | RaQuel Synths` : this.defaultTitle;
    const pageDesc = config.description || this.defaultDesc;
    const pageImage = config.image || this.defaultImage;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: pageDesc });

    // Open Graph (Facebook/Discord/LinkedIn)
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: pageDesc });
    this.meta.updateTag({ property: 'og:image', content: pageImage });

    // Twitter (X)
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: pageDesc });
    this.meta.updateTag({ name: 'twitter:image', content: pageImage });

    // 👇 Dispara o protocolo Canônico
    if (config.url) {
      this.setCanonicalUrl(config.url);
    }
  }

 // 🛡️ Módulo de Blindagem de Rota
  private setCanonicalUrl(url: string) {
    const head = this.dom.getElementsByTagName('head')[0];
    let element: HTMLLinkElement | null = this.dom.querySelector(`link[rel='canonical']`);

    // Aqui nós limpamos qualquer parâmetro de caos (?mode=jonah) da URL oficial
    // Se a URL enviada for /dossier?mode=jonah, o cleanUrl será apenas /dossier
    const cleanUrl = url.split('?')[0];

    if (!element) {
      // Se a tag não existe, nós forjamos uma nova
      element = this.dom.createElement('link') as HTMLLinkElement;
      element.setAttribute('rel', 'canonical');
      head.appendChild(element);
    }
    // Ancoramos a URL limpa
    element.setAttribute('href', cleanUrl);
  }
  
  // O núcleo da nossa narrativa (Sincronizado com o index.html oficial)
  private defaultTitle = 'RaQuel Synths | Cyberpunk Sagas & Virtual Band';
  private defaultDesc = 'Broklin\'s Tech vs. Jonah\'s Chaos. A Cyberpunk Literary Saga & Musical Experiment. The story has begun.';
  private defaultImage = 'https://raquelsynths.com.br/images/banner-seo-global.jpg';

  constructor(private title: Title, 
              private meta: Meta,
             @Inject(DOCUMENT) private dom: Document) { }

  updateTags(config?: { title?: string, description?: string, image?: string, url?: string }) {
    
    // Agora o título fica perfeito: "Arquivo Musical | RaQuel Synths"
    const pageTitle = config?.title ? `${config.title} | RaQuel Synths` : this.defaultTitle;
    const pageDesc = config?.description || this.defaultDesc;
    const pageImage = config?.image || this.defaultImage;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: pageDesc });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: pageDesc });
    this.meta.updateTag({ property: 'og:image', content: pageImage });
    
    if (config?.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }

    // Twitter (X)
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: pageDesc });
    this.meta.updateTag({ name: 'twitter:image', content: pageImage });
  }
}