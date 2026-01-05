import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  // --- ESTADO DO IDIOMA ---
  // true = Português, false = Inglês
  isPt = signal(true);

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
}
