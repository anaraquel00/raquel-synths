import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslationService } from '../../services/translation.service';
import { NAV_DATA } from '../../data/app-data';
import { Router, RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar,
       MatButtonModule,
       MatIconModule,
       MatMenuModule,
       MatDividerModule ,
       RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    // 2. NOME DA CLASSE CERTO:
    public translate: TranslationService,
    private router: Router
  ) {}

  // Getter inteligente
  get navText() {
    return this.translate.isPt() ? NAV_DATA.pt : NAV_DATA.en;
  }

  // 3. ATUALIZE ESTA FUNÇÃO:
  scrollTo(elementId: string): void {
    // Verifica se estamos na página principal ('/')
    if (this.router.url === '/') {
      // Se já estamos na Home, só rola
      this.doScroll(elementId);
    } else {
      // Se estamos na Lore, navega pra Home primeiro!
      this.router.navigate(['/']).then(() => {
        // Espera um pouquinho (100ms) pro site carregar e então rola
        setTimeout(() => {
          this.doScroll(elementId);
        }, 100);
      });
    }
  }

  // Função auxiliar pra não repetir código
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
