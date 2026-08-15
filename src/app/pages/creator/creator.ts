import { Component, OnInit, OnDestroy, signal, afterNextRender, inject, DOCUMENT, effect, NgZone } from '@angular/core';
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
  private ngZone = inject(NgZone); // 🛡️ O Módulo de Fuga de Radar
  public currentTheme = signal<'broklin' | 'jonah'>('broklin'); // Default para SSR
  public currentLang = signal<'pt' | 'en'>('pt'); // Default para SSR
  private themeObserver: MutationObserver | null = null;
  router: Router = inject(Router);
  seoService: SeoService = inject(SeoService);

  // 🛡️ MÓDULO DE INJEÇÃO DINÂMICA
  private updateSeoAndLang(isPt: boolean) {
    const currentPath = this.router.url.split('?')[0];

    // Atualiza o hardware (Tag HTML)
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

    // Atualiza o SEO Dinamicamente
    this.seoService.updateMetaTags({
      title: isPt
        ? 'Ana Raquel — Creative Technology Developer | Portfolio'
        : 'Ana Raquel — Creative Technology Developer | Portfolio',
      description: isPt
        ? 'Portfólio de Tecnologia Criativa de Ana Raquel: Angular, TypeScript, software de áudio, produtos digitais, RQS Studio e o Ecossistema Web RaQuel Synths.'
        : 'Creative Technology portfolio by Ana Raquel: Angular, TypeScript, audio software, digital products, RQS Studio and the RaQuel Synths Web Ecosystem.',
      url: `https://raquelsynths.com${currentPath}`,
      image: 'https://raquelsynths.com/images/creator-creative-technology-og.webp'
    });
  }

  constructor(public translate: TranslationService) {
    // 🛡️ SINCRONIA DE HEMISFÉRIOS: Espelha o serviço imediatamente no SSR
    const lang = this.translate.isPt() ? 'pt' : 'en';

    // ⚠️ Evita Hydration Mismatch fatal que trava o Router
    this.currentTheme.set('broklin');
    this.currentLang.set(lang); // Agora o conteúdo segue a mesma bússola do SEO

    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM iniciam APENAS após a hidratação (DOM Estável)
    afterNextRender(() => {
      this.currentLang.set(this.translate.isPt() ? 'pt' : 'en');
      this.ngZone.runOutsideAngular(() => {

        this.checkTheme();
      this.themeObserver = new MutationObserver(() => {
          // Quando o usuário clica no botão do menu, VOLTAMOS para a Zona para atualizar o signal
          this.ngZone.run(() => this.checkTheme());
        });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });
   });
    // 📡 O RADAR DE REATIVIDADE
    effect(() => {
      const isPt = this.translate.isPt();
      // 1. Atualiza o DOM Visual
      this.currentLang.set(isPt ? 'pt' : 'en');
      // 2. Atualiza o SEO invisível em tempo real no Header do navegador
      this.updateSeoAndLang(isPt);
    });
  }

ngOnInit() {
    const isServer = !isPlatformBrowser(this.platformId);
    // Vercel lê em Inglês (false), Navegador lê o real
    const isPt = isServer ? false : this.translate.isPt();
    const currentPath = this.router.url.split('?')[0];

    // Injeta a primeira carga de SEO
    this.updateSeoAndLang(isPt);

    // 3. 🚀 INJEÇÃO DE AUTORIDADE (JSON-LD): Perfil Profissional Verificado
this.seoService.setJsonLd({
  "@context": "https://schema.org",
  "@type": "ProfilePage",

  "name": isPt
    ? "Ana Raquel — Creative Technology Developer | Portfolio"
    : "Ana Raquel — Creative Technology Developer | Portfolio",

  "description": isPt
    ? "Portfólio de Tecnologia Criativa de Ana Raquel: Angular, TypeScript, software de áudio, produtos digitais, RQS Studio e o Ecossistema Web RaQuel Synths."
    : "Creative Technology portfolio by Ana Raquel: Angular, TypeScript, audio software, digital products, RQS Studio and the RaQuel Synths Web Ecosystem.",

  "url": `https://raquelsynths.com${currentPath}`,

  // Imagem de impacto do portfolio / social preview
  "image": "https://raquelsynths.com/images/creator-creative-technology-og.webp",

  "mainEntity": {
    "@type": "Person",

    "name": "Ana Raquel de Holanda Barros",

    "jobTitle": "Creative Technology Developer",

    "description": isPt
      ? "Desenvolvedora de Creative Technology com foco em Angular, TypeScript, software de áudio, produtos digitais e desenvolvimento do RQS Studio."
      : "Creative Technology Developer focused on Angular, TypeScript, audio software, digital products and the development of RQS Studio.",

    "url": `https://raquelsynths.com${currentPath}`,

    // Aqui permanece a foto real da pessoa
    "image": "https://raquelsynths.com/images/foto_perfil.webp",

    "worksFor": {
      "@type": "Organization",
      "name": "RaQuel Synths",
      "url": "https://raquelsynths.com"
    },

    "knowsAbout": [
      "Creative Technology",
      "Angular 20",
      "TypeScript",
      "RxJS",
      "Angular Signals",
      "Web Audio API",
      "Audio Software Development",
      "Digital Product Development",
      "Node.js",
      "Express",
      "Python",
      "Firebase",
      "Cloud Firestore",
      "Supabase",
      "AWS S3",
      "REST APIs",
      "Server-Side Rendering",
      "Prerendering",
      "Progressive Web Apps",
      "Technical SEO",
      "JSON-LD",
      "Dynamic Sitemap Generation",
      "FFmpeg",
      "Audio Processing Workflows",
      "Git",
      "GitHub",
      "Pull Requests"
    ],

    "hasOccupation": {
      "@type": "Occupation",
      "name": "Creative Technology Developer"
    },

    "knowsLanguage": [
      "Portuguese",
      "English",
      "French"
    ],

    "sameAs": [
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
