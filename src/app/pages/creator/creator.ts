import { Component, OnInit, OnDestroy, signal, afterNextRender, inject, DOCUMENT, effect, NgZone } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { CREATOR_DATA, NAV_DATA } from '../../data/app-data';
import { CREATOR_STUDIO_DATA } from './creator-studio.data';
import { CREATOR_EXPERIENCE_DATA } from './creator-experience.data';
import {
  CREATOR_CANONICAL,
  CREATOR_OG_IMAGE,
  CREATOR_PROFILE_ID,
  CREATOR_SEO_DATA,
  createCreatorJsonLd
} from './creator-seo.data';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-creator',
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './creator.html',
  styleUrl: './creator.scss',
  standalone: true
})
export class Creator implements OnInit, OnDestroy {

  private document = inject(DOCUMENT);
  private ngZone = inject(NgZone); // 🛡️ O Módulo de Fuga de Radar
  public currentTheme = signal<'broklin' | 'jonah'>('broklin'); // Default para SSR
  public currentLang = signal<'pt' | 'en'>('pt'); // Default para SSR
  private themeObserver: MutationObserver | null = null;
  seoService: SeoService = inject(SeoService);

  // 🛡️ MÓDULO DE INJEÇÃO DINÂMICA
  private updateSeoAndLang(isPt: boolean): void {
    const lang = isPt ? 'pt' : 'en';
    const seo = CREATOR_SEO_DATA[lang];

    this.document.documentElement.lang = seo.language;

    this.seoService.updateMetaTags({
      title: seo.title,
      description: seo.description,
      image: CREATOR_OG_IMAGE,
      imageAlt: seo.imageAlt,
      url: CREATOR_CANONICAL,
      type: 'profile'
    });

    this.seoService.setJsonLd(
      createCreatorJsonLd(lang)
    );
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

ngOnInit(): void {
    this.updateSeoAndLang(
      this.translate.isPt()
    );
  }

  ngOnDestroy(): void {
    this.themeObserver?.disconnect();

    // Remove only structured data owned by this page.
    const script = this.document.querySelector(
      'script[data-rqs-seo="structured-data"]'
    );

    if (script?.textContent) {
      try {
        const schema = JSON.parse(script.textContent);

        if (schema['@id'] === CREATOR_PROFILE_ID) {
          script.remove();
        }
      } catch {
        // Do not remove another page's structured data.
      }
    }
  }

  private checkTheme() {
    const isJonah = this.document.body.classList.contains('mode-jonah');
    this.currentTheme.set(isJonah ? 'jonah' : 'broklin');
  }


  get experience() {
    return CREATOR_EXPERIENCE_DATA[this.currentLang()];
  }

  get studio() {
    return CREATOR_STUDIO_DATA[this.currentLang()];
  }

  // Atalho para pegar os textos
  get navText() {
    return this.currentLang() === 'pt' ? NAV_DATA.pt : NAV_DATA.en;
  }
 get text() {
    return this.currentLang() === 'pt' ? CREATOR_DATA.pt : CREATOR_DATA.en;
  }
}
