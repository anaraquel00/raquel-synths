import { Component, effect, signal } from '@angular/core';
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

  constructor(private trackingService: TrackingService) {
    // A PEÇA 1: O OBSERVADOR AUTOMÁTICO (Passivo)
    effect(() => {
      const modoAtual = this.currentMode();

      // Muda a cor do navegador e salva no disco local
      document.body.classList.remove('mode-broklin', 'mode-jonah');
      document.body.classList.add(`mode-${modoAtual}`);
      localStorage.setItem('rqs-theme', modoAtual);
    });
  }

  // A PEÇA 2: A AÇÃO DIRETA (Ativada pelo clique do usuário)
  switchMode(mode: 'broklin' | 'jonah') {
    // 1. Injeta o novo valor na fibra ótica (o effect lá em cima vai reagir sozinho!)
    this.currentMode.set(mode);

    // 2. Dispara o laser de rastreio de métricas
    this.trackingService.trackCustomEvent('theme_switched', {
      selected_mode: mode,
      location: 'header_switcher'
    });
  }
}




