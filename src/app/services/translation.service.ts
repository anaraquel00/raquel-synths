import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, REQUEST, computed, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private request = inject(REQUEST, { optional: true });

  // 🚀 Define o idioma explicitamente (PT ou EN)
  setLanguage(lang: string) {
    this.isPt.set(lang === 'pt');
  }
  // --- ESTADO DO IDIOMA ---
  // true = Português, false = Inglês
  isPt = signal(this.getInitialLanguageIsPt());

  // Computed: Retorna automaticamente 'pt' ou 'en' para os componentes usarem
  currentLang = computed(() => this.isPt() ? 'pt' : 'en');

  // --- ESTADO DO MODO (A Alma do Site) ---
  // false = Broklin (Tech/Azul), true = Jonah (Caos/Vermelho)
  isJonahMode = signal(false);

  // Computed: Retorna 'broklin' ou 'jonah' para facilitar o uso no CSS
  currentMode = computed(() => this.isJonahMode() ? 'jonah' : 'broklin');

  // --- AÇÕES ---

  // Troca o idioma
  toggle() {
    this.isPt.update(val => !val);
  }

  // Alterna entre Broklin e Jonah
  toggleMode() {
    this.isJonahMode.update(val => !val);
  }
  //Função para definir o modo explicitamente pelos botões
  setMode(mode: 'broklin' | 'jonah') {
    this.isJonahMode.set(mode === 'jonah');
  }

  private getInitialLanguageIsPt(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return this.document.documentElement.lang
        .toLowerCase()
        .startsWith('pt');
    }

    const isPt = this.hasPortuguesePreference(
      this.request?.headers.get('accept-language')
    );

    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';
    return isPt;
  }

  private hasPortuguesePreference(acceptLanguage: string | null | undefined): boolean {
    if (!acceptLanguage) {
      return false;
    }

    return acceptLanguage.split(',').some(preference => {
      const [languageRange, ...parameters] = preference
        .trim()
        .toLowerCase()
        .split(';');
      const qualityParameter = parameters.find(parameter =>
        parameter.trim().startsWith('q=')
      );
      const quality = qualityParameter
        ? Number.parseFloat(qualityParameter.trim().slice(2))
        : 1;

      return quality > 0 && (languageRange === 'pt' || languageRange.startsWith('pt-'));
    });
  }
}
