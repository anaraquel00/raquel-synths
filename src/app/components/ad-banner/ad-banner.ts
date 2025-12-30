/* src/app/components/ad-banner/ad-banner.ts */

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

      <div class="ad-standby">
        [ SYSTEM STANDBY... ]
      </div>

    </div>
  `,
  styles: [`
    .ad-container {
      margin: 40px auto;
      max-width: 728px;
      border: 1px dashed var(--accent-color); /* Borda Neon */
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      text-align: center;
      transition: border-color 0.5s ease;
      min-height: 100px; /* Altura mínima pro visual ficar legal */
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .ad-label {
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      color: var(--text-color);
      opacity: 0.7;
      letter-spacing: 2px;
      margin-bottom: 15px;
      width: 100%;
    }
    /* Estilo novo pro texto de Standby */
    .ad-standby {
      color: var(--accent-color);
      font-family: 'Oswald', sans-serif;
      letter-spacing: 3px;
      font-size: 0.9rem;
      opacity: 0.5;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.3; }
      50% { opacity: 0.8; }
      100% { opacity: 0.3; }
    }
  `]
})
export class AdBannerComponent implements AfterViewInit {
  isBrowser = false;

  constructor(private translate: TranslationService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get t() {
    return this.translate.isPt() ? ADS_DATA.pt : ADS_DATA.en;
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      // 👇 Comentei a lógica de push pra não dar erro no console à toa
      // (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      // (window as any).adsbygoogle.push({});
    }
  }
}
