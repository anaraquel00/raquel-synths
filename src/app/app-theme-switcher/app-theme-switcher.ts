import { Component, signal, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TrackingService } from '../services/tracking.service';

@Component({
  selector: 'app-app-theme-switcher',
  imports: [],
  templateUrl: './app-theme-switcher.html',
  styleUrl: './app-theme-switcher.scss'
})
export class AppThemeSwitcher {
  // O NOSSO CABO DE FIBRA ÓTICA (Estado Centralizado)
  currentMode = signal<'broklin' | 'jonah'>('broklin');

  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  constructor(private trackingService: TrackingService) {
    // 🛡️ TRAVA TÁTICA: Lê o tema atual do body (injetado pelo script do index.html)
    // APENAS após a hidratação, protegendo o SSR e evitando sobrescrever a escolha do usuário.
    afterNextRender(() => {
      const isJonah = this.document.body.classList.contains('mode-jonah');
      this.currentMode.set(isJonah ? 'jonah' : 'broklin');
    });
  }

  // A PEÇA 2: A AÇÃO DIRETA (Ativada pelo clique do usuário)
  switchMode(mode: 'broklin' | 'jonah') {
    // Previne repetição de ações se clicar no botão que já está ativo
    if (this.currentMode() === mode) return;

    // 1. Injeta o novo valor na fibra ótica
    this.currentMode.set(mode);

    // 2. Manipula o DOM, Storage e avisa a matriz
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.classList.remove('mode-broklin', 'mode-jonah');
      this.document.body.classList.add(`mode-${mode}`);
      localStorage.setItem('rqs-theme', mode);

      // 🛡️ Dispara o sinal global para atualizar a Discografia e Narrativas instantaneamente
      this.document.defaultView?.dispatchEvent(new CustomEvent('theme-changed'));
    }

    // 3. Dispara o laser de rastreio de métricas
    this.trackingService.trackCustomEvent('theme_switched', {
      selected_mode: mode,
      location: 'header_switcher'
    });
  }
}
