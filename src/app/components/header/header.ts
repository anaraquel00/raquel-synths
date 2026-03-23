import { Component, Inject, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslationService } from '../../services/translation.service';
import { NAV_DATA } from '../../data/app-data';
import { Router, RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, RouterModule, MatTooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  isJonahMode: boolean = false; 

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public translate: TranslationService, // ← SERVIÇO CORRETO INJETADO
    private router: Router
  ) {}

  // 🛡️ A FUNÇÃO DO BOTÃO MANUAL AGORA USA O SERVIÇO CORRETO
  mudarIdioma(novoIdioma: string) {
    this.translate.setLanguage(novoIdioma); // USA O MÉTODO 'setLanguage'
    localStorage.setItem('rqs_lang_override', novoIdioma); 
  }

  get navText() {
    return this.translate.isPt() ? NAV_DATA.pt : NAV_DATA.en;
  }

  scrollTo(elementId: string): void {
    if (this.router.url === '/') {
      this.doScroll(elementId);
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          this.doScroll(elementId);
        }, 100);
      });
    }
  }

  private doScroll(id: string) {
    const element = this.document.getElementById(id);
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