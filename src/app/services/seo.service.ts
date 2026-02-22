import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  // O núcleo da nossa narrativa (Variáveis de Fallback baseadas no seu index.html)
  private defaultTitle = 'RaQuel Synths | Cyberpunk Visual Novel & Virtual Band';
  private defaultDesc = 'Broklin\'s Tech vs. Jonah\'s Chaos. A Visual Novel & Musical Experiment. The saga has begun.';
  private defaultImage = 'https://raquelsynths.com.br/images/banner-seo-global.jpg';

  constructor(private title: Title, private meta: Meta) { }

  // Função polimórfica: aceita metadados específicos ou usa a lore base
  updateTags(config?: { title?: string, description?: string, image?: string, url?: string }) {
    
    // Se passarmos um título (ex: "NEON WITCH"), ele anexa o nome da banda. Se não, usa o título global.
    const pageTitle = config?.title ? `${config.title} | RaQuel Synths` : this.defaultTitle;
    const pageDesc = config?.description || this.defaultDesc;
    const pageImage = config?.image || this.defaultImage;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: pageDesc });

    // Open Graph (Dispara o sinal correto para o Discord, WhatsApp, etc)
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: pageDesc });
    this.meta.updateTag({ property: 'og:image', content: pageImage });
    
    if (config?.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }

    // Twitter (X) - O terminal de microblogs
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: pageDesc });
    this.meta.updateTag({ name: 'twitter:image', content: pageImage });
  }
}