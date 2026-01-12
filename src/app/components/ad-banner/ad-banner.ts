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
      <!-- O Label: "/// SPONSORED DATA STREAM ///" -->
      <div class="ad-label">{{ t.label }}</div>

      <!-- AQUI É ONDE O GOOGLE INJETA O ANÚNCIO -->
      <!-- O estilo 'display:block' é obrigatório para responsividade -->
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-5619990751602183"
           data-ad-slot="7562190937"
           data-ad-format="auto"
           data-full-width-responsive="true">
      </ins>

      <!-- Placeholder decorativo (Só aparece se o AdBlock bloquear ou antes de carregar) -->
      <!-- Usamos CSS para esconder isso quando o ad carregar, ou deixamos como fundo -->
      <div class="ad-standby-bg">
        [ SYSTEM STANDBY... ]
      </div>
    </div>
  `,
  styles: [`
    .ad-container {
      margin: 40px auto;
      max-width: 728px; /* Leaderboard Padrão Desktop */
      width: 100%;
      min-height: 100px; /* Evita CLS (Layout Shift) pro Google não reclamar */

      border: 1px dashed var(--accent-color);
      background: rgba(0, 0, 0, 0.4); /* Um pouco mais escuro para destacar o banner */
      padding: 10px; /* Reduzi um pouco para dar espaço ao banner */

      text-align: center;
      transition: border-color 0.5s ease;
      position: relative; /* Para o standby ficar no fundo */
      overflow: hidden; /* Garante que o banner não vaze a borda */
    }

    .ad-label {
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      color: var(--text-color);
      opacity: 0.7;
      letter-spacing: 2px;
      margin-bottom: 5px;
      display: block;
    }

    /* A classe do Google (ins) ganha prioridade */
    .adsbygoogle {
      z-index: 2;
      position: relative;
    }

    /* O texto Standby fica como uma marca d'água no fundo */
    .ad-standby-bg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--accent-color);
      font-family: 'Oswald', sans-serif;
      letter-spacing: 3px;
      font-size: 0.9rem;
      opacity: 0.2; /* Bem suave, para não brigar com o anúncio */
      z-index: 1;
      pointer-events: none; /* Não interfere no clique */
      animation: pulse 3s infinite;
    }

    @keyframes pulse {
      0% { opacity: 0.1; }
      50% { opacity: 0.3; }
      100% { opacity: 0.1; }
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
      try {
        // Lógica de Push do Google (Protegida contra erros)
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.warn('RQS AdBlock Warning: Google Ads could not be loaded.', e);
      }
    }
  }
}
