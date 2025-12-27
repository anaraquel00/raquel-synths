import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { ADS_DATA } from '../../data/app-data';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ad-container" *ngIf="isBrowser">
      <div class="ad-label">{{ t.label }}</div>

      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-5619990751602183"
           data-ad-slot="1234567890"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  `,
  styles: [`
    .ad-container {
      margin: 40px auto;
      max-width: 728px;
      border: 1px dashed var(--accent-color);
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      text-align: center;
      transition: border-color 0.5s ease;
    }
    .ad-label {
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      color: var(--text-color);
      opacity: 0.7;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
  `]
})
export class AdBannerComponent implements AfterViewInit {
  isBrowser = false; // Variável para controlar o template

  constructor(private translate: TranslationService, @Inject(PLATFORM_ID) private platformId: Object) {
    // Verifica se estamos no navegador
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get t() {
    return this.translate.isPt() ? ADS_DATA.pt : ADS_DATA.en;
  }

  ngAfterViewInit() {
    // A Proteção Mágica: Só roda se for no Browser!
    if (this.isBrowser) {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }
}
