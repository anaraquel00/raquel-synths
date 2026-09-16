import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, REQUEST, computed, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly languagePreferenceKey = 'rqs_lang_override';
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private request = inject(REQUEST, { optional: true });

  // 🚀 Define o idioma explicitamente (PT ou EN)
  setLanguage(lang: string) {
    const language = this.normalizeLanguage(lang) ?? 'en';

    this.isPt.set(language === 'pt');
    this.updateDocumentLanguage(language);

    if (isPlatformBrowser(this.platformId)) {
      this.persistLanguage(language);
    }
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
    this.setLanguage(this.isPt() ? 'en' : 'pt');
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
    const persistedLanguage = this.readLanguageCookie();
    const language = persistedLanguage ?? (
      isPlatformBrowser(this.platformId)
        ? this.normalizeLanguage(this.document.documentElement.lang) ?? 'en'
        : this.getRequestLanguage(this.request?.headers.get('accept-language'))
    );

    this.updateDocumentLanguage(language);
    return language === 'pt';
  }

  private persistLanguage(language: 'pt' | 'en'): void {
    const secureAttribute = this.document.location.protocol === 'https:' ? '; Secure' : '';
    this.document.cookie = `${this.languagePreferenceKey}=${language}; Path=/; Max-Age=31536000; SameSite=Lax${secureAttribute}`;
  }

  private readLanguageCookie(): 'pt' | 'en' | null {
    const cookieHeader = isPlatformBrowser(this.platformId)
      ? this.document.cookie
      : this.request?.headers.get('cookie') ?? '';

    const rawValue = cookieHeader
      .split(';')
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith(`${this.languagePreferenceKey}=`))
      ?.split('=')
      .slice(1)
      .join('=');

    if (!rawValue) {
      return null;
    }

    try {
      return this.normalizeLanguage(decodeURIComponent(rawValue));
    } catch {
      return null;
    }
  }

  private getRequestLanguage(acceptLanguage: string | null | undefined): 'pt' | 'en' {
    if (!acceptLanguage) {
      return 'en';
    }

    const preferences = acceptLanguage
      .split(',')
      .map((preference, index) => {
        const [languageRange, ...parameters] = preference.trim().toLowerCase().split(';');
        const language = this.normalizeLanguage(languageRange);
        const qualityParameter = parameters.find(parameter => parameter.trim().startsWith('q='));
        const parsedQuality = qualityParameter
          ? Number.parseFloat(qualityParameter.trim().slice(2))
          : 1;

        return {
          language,
          quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
          index
        };
      })
      .filter(preference => preference.language && preference.quality > 0)
      .sort((a, b) => b.quality - a.quality || a.index - b.index);

    return preferences[0]?.language ?? 'en';
  }

  private normalizeLanguage(language: string | null | undefined): 'pt' | 'en' | null {
    const normalizedLanguage = language?.trim().toLowerCase();

    if (normalizedLanguage === 'pt' || normalizedLanguage?.startsWith('pt-')) {
      return 'pt';
    }

    if (normalizedLanguage === 'en' || normalizedLanguage?.startsWith('en-')) {
      return 'en';
    }

    return null;
  }

  private updateDocumentLanguage(language: 'pt' | 'en'): void {
    this.document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en-US';
  }
}
