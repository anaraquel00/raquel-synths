import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslationService } from '../../services/translation.service';
import { NAV_DATA } from '../../data/app-data';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  // A CORREÇÃO ESTÁ AQUI EMBAIXO:
  // Precisamos injetar o 'TranslationService' aqui dentro dos parênteses do constructor!
  constructor(
    @Inject(DOCUMENT) private document: Document,
    public translate: TranslationService
  ) {}

  // Getter inteligente
  get navText() {
    return this.translate.isPt() ? NAV_DATA.pt : NAV_DATA.en;
  }

  scrollTo(elementId: string): void {
    const element = this.document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openExternal(url: string): void {
    window.open(url, '_blank');
  }

  activateBroklinMode() {
    this.document.body.classList.remove('mode-jonah');
    this.document.body.classList.add('mode-broklin');
  }

  activateJonahMode() {
    this.document.body.classList.remove('mode-broklin');
    this.document.body.classList.add('mode-jonah');
  }
}
