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
        ? 'Ana Raquel de Holanda | Angular Developer • Software Engineer • AI Automation'
        : 'Ana Raquel de Holanda | Angular Developer • Software Engineer • AI Automation',
      description: isPt
        ? 'Software Engineer especializada em Angular 20+, TypeScript, Firebase, IA Generativa e automação inteligente. Criadora da plataforma RaQuel Synths, onde desenvolve aplicações escaláveis, arquitetura Front-End moderna, SEO, Serverless e Growth Engineering.'
        : 'Software Engineer specializing in Angular 20+, TypeScript, Firebase, Generative AI, and intelligent automation. Creator of the RaQuel Synths platform, where she develops scalable applications and focuses on modern front-end architecture, SEO, serverless technologies, and growth engineering.',
      url: `https://raquelsynths.com${currentPath}`
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
      "founder": {
    "@type":"Organization",
    "name":"RaQuel Synths"
     },
     "worksFor": {
    "@type":"Organization",
    "name":"RaQuel Synths"
     },
      "mainEntity": {
        "@type": "Person",
        "name": "Ana Raquel de Holanda",
        "jobTitle": "Software Engineer | Front-End Architect | AI Product Builder",
        "description": isPt
          ? "Desenvolvedora de Software especializada em Angular 20+, TypeScript, Signals, RxJS, Firebase, SEO técnico, Performance Web, Arquitetura Front-End e aplicações Serverless."
          : "Software Developer specializing in Angular 20+, TypeScript, Signals, RxJS, Firebase, technical SEO, web performance, front-end architecture, and serverless applications.",
        "url": `https://raquelsynths.com${currentPath}`,
        "image": "images/foto_perfil.webp",
        "knowsAbout": [
  "Angular 20",
  "TypeScript",
  "RxJS",
  "Signals",
  "Firebase",
  "Front-End Architecture",
  "Software Engineering",
  "Technical SEO",
  "Serverless Architecture",
  "Artificial Intelligence",
  "Web Performance",
  "Google Analytics",
  "n8n",
  "GitHub Actions"
 ],
  "hasOccupation":{
   "@type":"Occupation",
   "name":"Software Engineer"
 },
 "knowsLanguage":[
    "Portuguese",
    "English",
    "French",
    "Polish (basic)"
],
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
