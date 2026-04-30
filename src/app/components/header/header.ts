import { Component, Inject, inject, PLATFORM_ID, signal, OnInit, OnDestroy, afterNextRender } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
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
export class Header implements OnInit, OnDestroy {
  // 🛡️ REATIVIDADE ABSOLUTA: A variável de estado foi promovida a Signal
  isJonahMode = signal<boolean>(false);

  private platformId = inject(PLATFORM_ID);
  private themeObserver: MutationObserver | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public translate: TranslationService, // ← SERVIÇO CORRETO INJETADO
    private router: Router
  ) {
    // 🛡️ TRAVA TÁTICA: Sincroniza o estado do tema apenas após a hidratação (DOM Estável)
    afterNextRender(() => {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });
  }

  ngOnInit() {
    // Removido - Movido para afterNextRender no construtor para proteção de Hidratação
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

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
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.classList.remove('mode-jonah');
      this.document.body.classList.add('mode-broklin');
      this.isJonahMode.set(false);

      // 🛡️ Mantém a consistência global e avisa o resto da matriz
      localStorage.setItem('rqs-theme', 'broklin');
      this.document.defaultView?.dispatchEvent(new CustomEvent('theme-changed'));
    }
  }

  activateJonahMode() {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.classList.remove('mode-broklin');
      this.document.body.classList.add('mode-jonah');
      this.isJonahMode.set(true);

      // 🛡️ Mantém a consistência global e avisa o resto da matriz
      localStorage.setItem('rqs-theme', 'jonah');
      this.document.defaultView?.dispatchEvent(new CustomEvent('theme-changed'));
    }
  }
}
