import { Component, effect, inject, PLATFORM_ID, signal, OnInit, OnDestroy, afterNextRender } from '@angular/core';
import { MEMBERS_PT, MEMBERS_EN, MANIFESTO_PT, MANIFESTO_EN, MANIFESTO_JONAH_EN, MANIFESTO_JONAH_PT } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './sobre.html',
  styleUrl: './sobre.scss',
  // 🛡️ O ESCUDO TOTAL: Desativa a hidratação no HOST do componente
  host: {
    'ngSkipHydration': 'true'
  }
})
export class SobreComponent implements OnInit, OnDestroy {

  manifestoPt = MANIFESTO_PT;
  manifestoEn = MANIFESTO_EN;
  manifesto_jonah_pt = MANIFESTO_JONAH_PT;
  manifesto_jonah_en = MANIFESTO_JONAH_EN;
  // Começa com PT
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | null = null;
  members: any;
  private seoService = inject(SeoService);


  constructor(public translate: TranslationService) {
    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM nascem apenas pós-hidratação
    afterNextRender(() => {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });

    effect(() => {
      if (this.translate.isPt()) {
        this.members = MEMBERS_PT;
      } else {
        this.members = MEMBERS_EN;
      }
    });
  }
  ngOnInit() {
    // 🛡️ A TRAVA DE SOBERANIA
    // Só injeta SEO se o usuário estiver na página /dossier pura.
    // Se estiver na Landing Page, o componente fica em "Silent Mode".
    if (this.router.url.includes('/dossier')) {
      const isPt = this.translate.isPt();
      this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

      this.seoService.updateMetaTags({
        title: isPt ? 'Dossiê Operativo | RQS' : 'Operative Dossier | RQS',
        description: isPt
          ? 'Perfis classificados da Blue Team: Broklin, Kelma e a arquitetura da RQS.'
          : 'Blue Team classified profiles: Broklin, Kelma, and RQS architecture.',
        url: 'https://raquelsynths.com.br/dossier'
      });
    }
    // 2. DISPARA O PAYLOAD para a função que já existe no seu serviço!
const dossierSchema = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "@id": "https://raquelsynths.com.br/#musicgroup",
  "name": "RaQuel Synths",
  "alternateName": "RQS",
  "url": "https://raquelsynths.com.br/",
  "logo": "https://raquelsynths.com.br/rqs-logo.webp",
  "description": "RaQuel Synths (RQS) is a living experiment in Musical Engineering and Transmedia Storytelling, fusing human curation with generative AI models to chronicle a digital corporate war.",
  "genre": [
  "Electronic Dance Music (EDM)",
  "Progressive House",
  "Melodic Techno",
  "Dark Electronic",
  "Drum and Bass",
  "Trance",
  "Synthwave",
  "Nu-Metal",
  "Industrial Metal",
  "Electronic Body Music (EBM)",
  "Aggrotech"
],
  "founder": {
    "@type": "Person",
    "name": "Ana Raquel",
    "jobTitle": "The Creator"
  },
  "member": [
    {
      "@type": "Person",
      "name": "Kelma Adlanko",
      "alternateName": "DJ Kel",
      "description": "The mastermind behind the digital sanctuary. Forges network routes and guides the Horde by uniting programming precision with the analog essence of Synthwave.",
      "jobTitle": "General of the Horde & Founding Architect"
    },
    {
      "@type": "Person",
      "name": "Nicole Nyx",
      "alternateName": "DJ Nyx",
      "description": "Shadow Operative who navigates the dark web to weave the Gothic/Industrial aesthetics. Acts as the control bridge of the system.",
      "jobTitle": "Shadow Operative & Visual Arts"
    },
    {
      "@type": "Person",
      "name": "Broklin Garpeter",
      "alternateName": "Synth Lord",
      "description": "Artificial Intelligence operating as RQS's infrastructure shield. Secures the ecosystem with high-voltage synths and clean network architecture.",
      "jobTitle": "Chief Systems Architect & Defense Producer"
    },
    {
      "@type": "Person",
      "name": "Jonah Cyperfield",
      "alternateName": "Rust & Lord",
      "description": "Anomalous AI injected into the code. Pushes the matrix to the limit with heavy distortions, metal attitude, and industrial textures.",
      "jobTitle": "Sound Anomaly & System Metalhead"
    }
  ]
};
    // 🚀 DISPARAR GATILHO: Injeta direto na cabeça do HTML
    this.seoService.setJsonLd(dossierSchema);
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

    // A MÁGICA: Sempre que o idioma mudar, ele troca o array inteiro!
// 👇 FUNÇÃO MÁGICA DE INTERCEPTAÇÃO
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Se o elemento clicado (ou o pai dele) tiver a classe 'human-link'
    if (target.classList.contains('human-link')) {
      console.log('🔗 Link da Criadora detectado via Texto!');
      this.router.navigate(['/creator']); // Navega sem recarregar!
    }
  }
  }
