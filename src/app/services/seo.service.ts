import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  // O núcleo da nossa narrativa (Sincronizado com o index.html oficial)
  private defaultTitle = 'RaQuel Synths | Cyberpunk Sagas & Virtual Band';
  private defaultDesc = 'Broklin\'s Tech vs. Jonah\'s Chaos. A Cyberpunk Literary Saga & Musical Experiment. The story has begun.';
  private defaultImage = 'https://raquelsynths.com.br/images/banner-seo-global.jpg';

  constructor(private title: Title, private meta: Meta) { }

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