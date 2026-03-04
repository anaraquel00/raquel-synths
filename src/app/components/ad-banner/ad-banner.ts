import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
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

      @if (!isMobile) {
        <ins class="adsbygoogle"
             style="display:inline-block;width:728px;height:90px"
             data-ad-client="ca-pub-5619990751602183"
             data-ad-slot="7562190937">
        </ins>
      } @else {
        <ins class="adsbygoogle"
            style="display:inline-block;width:300px;height:250px"
            data-ad-client="ca-pub-5619990751602183"
            data-ad-slot="8226577285"></ins>
      }

      <div class="ad-standby-bg">
        [ SYSTEM_STABILIZED ]
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .ad-container {
      margin: 40px auto;
      width: 100%;
      text-align: center;
      position: relative;
      background: rgba(0, 0, 0, 0.5);
      border: 1px dashed var(--accent-color);
      padding: 10px;
    }
    .ad-label {
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      color: var(--text-color);
      opacity: 0.7;
      display: block;
      margin-bottom: 10px;
    }
    .adsbygoogle { z-index: 2; position: relative; }
    .ad-standby-bg {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      color: var(--accent-color);
      font-family: 'Oswald', sans-serif;
      font-size: 0.8rem;
      opacity: 0.1;
      z-index: 1;
      pointer-events: none;
    }

    /* 🚀 APAGUEI AQUELAS CLASSES DE DISPLAY: NONE DAQUI! O Angular já resolveu. */
    @media (min-width: 768px) {
      .ad-container { max-width: 748px; min-height: 110px; }
    }
  `]
})
export class AdBannerComponent implements AfterViewInit {
  isBrowser = false;
  isMobile = false; // 👈 Adicionamos um sensor de tela

  constructor(private translate: TranslationService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      // Verifica se é celular logo que carrega
      this.isMobile = window.innerWidth <= 768; 
    }
  }

  // Se o usuário redimensionar a janela do PC, ele atualiza!
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.isBrowser) {
      this.isMobile = event.target.innerWidth <= 768;
    }
  }

  get t() { return this.translate.isPt() ? ADS_DATA.pt : ADS_DATA.en; }

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        try {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
        } catch (e) {
          console.error('RQS AdSense Error:', e);
        }
      }, 1000); 
    }
  }
}