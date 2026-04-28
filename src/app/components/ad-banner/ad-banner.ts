import { Component, Inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { ADS_DATA } from '../../data/app-data';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isBrowser) {
      <div class="ad-container">
      <div class="ad-label">{{ t.label }}</div>
      @if (!isMobile) {
        <ins class="adsbygoogle"
             style="display:inline-block;width:728px;height:90px"
             data-ad-client="ca-pub-5619990751602183"
             data-ad-slot="7562190937"></ins>
      } @else {
        <ins class="adsbygoogle"
            style="display:inline-block;width:300px;height:250px"
            data-ad-client="ca-pub-5619990751602183"
            data-ad-slot="8226577285"></ins>
      }
      <div class="ad-standby-bg">[ SYSTEM_STABILIZED ]</div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .ad-container { margin: 40px auto; width: 100%; text-align: center; position: relative; background: rgba(0, 0, 0, 0.5); border: 1px dashed var(--accent-color); padding: 10px; }
    .ad-label { font-family: 'Courier New', monospace; font-size: 0.7rem; color: var(--text-color); opacity: 0.7; display: block; margin-bottom: 10px; }
    .adsbygoogle { z-index: 2; position: relative; }
    .ad-standby-bg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--accent-color); font-family: 'Oswald', sans-serif; font-size: 0.8rem; opacity: 0.1; z-index: 1; pointer-events: none; }
    @media (min-width: 768px) { .ad-container { max-width: 748px; min-height: 110px; } }
  `]
})
export class AdBannerComponent {
  isBrowser = false;
  isMobile = false;

  constructor(private translate: TranslationService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.isMobile = window.innerWidth <= 768;
    }

    // 🛡️ MOTOR DE RENDERIZAÇÃO ANGULAR 17+: afterNextRender ancora-se nativamente
    // no ciclo de pintura do navegador. Elimina callbacks órfãos e previne CLS.
    afterNextRender(() => {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.warn('🛡️ RQS Firewall: Anomalia no AdSense contida na rede isolada.', e);
      }
    });
  }

  get t() { return this.translate.isPt() ? ADS_DATA.pt : ADS_DATA.en; }
}
