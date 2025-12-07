import { Component, Inject, Renderer2, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common'; // Importante para acessar o 'body'
import { MatToolbar } from '@angular/material/toolbar';
import { MatMenuModule, MatMenuPanel } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Se quiser ícones bonitos

@Component({
  selector: 'app-header',
  standalone: true, // Vi que seu componente é standalone pelos imports
  imports: [MatMenuModule, MatButtonModule, MatToolbar, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  // Mantive suas variáveis de menu caso use depois
  afterMenu!: MatMenuPanel<any> | null;
  beforeMenu!: MatMenuPanel<any> | null;
  belowMenu!: MatMenuPanel<any> | null;
  discografiaMenu!: MatMenuPanel<any> | null;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  // --- MODO BROKLIN (Ordem / Luz / Synthwave) ---
  activateBroklinMode() {
    console.log('💎 Ativando Modo Broklin: Synthwave Order');
    // Remove o caos
    this.document.body.classList.remove('mode-jonah');
    // Adiciona a ordem
    this.document.body.classList.add('mode-broklin');
  }

  // --- MODO JONAH (Caos / Trevas / Industrial) ---
  activateJonahMode() {
    console.log('⚠️ Ativando Modo Jonah: Industrial Chaos');
    // Remove a ordem
    this.document.body.classList.remove('mode-broklin');
    // Adiciona o caos
    this.document.body.classList.add('mode-jonah');
  }
}
