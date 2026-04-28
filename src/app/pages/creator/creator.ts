import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { CREATOR_DATA, NAV_DATA } from '../../data/app-data';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-creator',
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './creator.html',
  styleUrl: './creator.scss',
})
export class Creator implements OnInit, OnDestroy {

private platformId = inject(PLATFORM_ID);
private document = inject(DOCUMENT);

public currentTheme = signal<'broklin' | 'jonah'>('broklin');
private themeObserver: MutationObserver | null = null;

constructor(public translate: TranslationService) {}

  ngOnInit() {
    // 🛡️ BLINDAGEM SSR: O rastreador não pode sofrer loops no DOM
    if (isPlatformBrowser(this.platformId)) {
      this.checkTheme();
      this.themeObserver = new MutationObserver(() => this.checkTheme());
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    }
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  private checkTheme() {
    const isJonah = this.document.body.classList.contains('mode-jonah');
    this.currentTheme.set(isJonah ? 'jonah' : 'broklin');
  }

  // Atalho para pegar os textos
  get navText() {
    return this.translate.isPt() ? NAV_DATA.pt : NAV_DATA.en;
  }
 get text() {
    return this.translate.isPt() ? CREATOR_DATA.pt : CREATOR_DATA.en;
  }
}
