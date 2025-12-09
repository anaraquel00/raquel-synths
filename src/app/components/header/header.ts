import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common'; // Importante para mexer no scroll
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu'; // Mantemos caso use para Discografia/Playlist

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  constructor(@Inject(DOCUMENT) private document: Document) {}

  // A FUNÇÃO MÁGICA DE SCROLL
  scrollTo(elementId: string): void {
    const element = this.document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Link Externo (Para o SoundCloud/Playlist)
  openExternal(url: string): void {
    window.open(url, '_blank');
  }

  // Seus métodos de tema (Broklin/Jonah) continuam aqui...
  activateBroklinMode() {
    this.document.body.classList.remove('mode-jonah');
    this.document.body.classList.add('mode-broklin');
  }

  activateJonahMode() {
    this.document.body.classList.remove('mode-broklin');
    this.document.body.classList.add('mode-jonah');
  }
}
