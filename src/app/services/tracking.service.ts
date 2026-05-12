import { Injectable, PLATFORM_ID, inject, afterNextRender, Injector } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private injector = inject(Injector);
  private scriptsLoaded = false;

  trackAffiliateClick(productName: string, platform: string) {
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView as any;
      if (win && typeof win.fbq === 'function') {
        // 🎯 EVENTO 'ViewContent': Avisa que o fã quer ver o produto na loja parceira
        win.fbq('track', 'ViewContent', {
          content_name: productName,
          content_category: `Affiliate - ${platform}`,
          status: 'Redirecting to Partner'
        });
        console.log(`🔗 [UPLINK AFILIADO] Redirecionando para ${platform}: ${productName}`);
      }
    }
  }

  public initLazyTracking(gtmId: string): void {
    // Aborta se estiver a correr no servidor (SSR) ou se já estiver carregado
    if (!isPlatformBrowser(this.platformId) || this.scriptsLoaded) return;

    // 🛡️ TRAVA TÁTICA: Move a inicialização do rastreamento para pós-hidratação
    afterNextRender(() => {
      const loadScripts = () => {
        if (this.scriptsLoaded) return;
        const win = this.document.defaultView as any;
        if (!win) return;

        // 🚀 INJEÇÃO DO VERDADEIRO MOTOR DO GTM
        const scriptInline = this.document.createElement('script');
        scriptInline.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `;
        this.document.head.appendChild(scriptInline);

        this.scriptsLoaded = true;
        console.log(`🛡️ [Tracking Service] GTM (${gtmId}) ativo e operante após interação.`);

        // Desliga os radares para não consumir RAM do telemóvel
        ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event =>
          win.removeEventListener(event, loadScripts)
        );
      };

      const win = this.document.defaultView as any;
      if (!win) return;
      // Fica à espreita do primeiro toque ou scroll no ecrã
      ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event =>
        win.addEventListener(event, loadScripts, { once: true, passive: true })
      );
    }, { injector: this.injector });
  }

  /**
   * Dispara um evento personalizado para o painel do Google Analytics
   */
  public trackCustomEvent(eventName: string, eventParams: any = {}): void {
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView as any;
      // Adiciona o evento à Fila de Espera (dataLayer)
      const dataLayer = win?.dataLayer || [];
      dataLayer.push({
        event: eventName,
        ...eventParams
      });
      console.log(`🛡️ [Tracking] Evento capturado: ${eventName}`);
    }
  }

  // 🎯 O GATILHO: Dispara quando o botão do Spotify for clicado
  trackSpotifyClick(albumName: string) {
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView as any;
      if (win && typeof win.fbq === 'function') {
        win.fbq('trackCustom', 'SpotifyClick', {
          content_name: albumName,
          content_category: 'Music'
        });
        console.log(`🛡️ [TELEMETRIA META] Disparo confirmado para: ${albumName}`);
      }
    }
  }

  // 🎯 O GATILHO: Dispara quando o botão do SoundCloud for clicado
  trackSoundcloudClick(albumName: string) {
    if (isPlatformBrowser(this.platformId)) {
      const win = this.document.defaultView as any;
      if (win && typeof win.fbq === 'function') {
        win.fbq('trackCustom', 'SoundcloudClick', {
          content_name: albumName,
          content_category: 'Music Stream'
        });
        console.log(`🛡️ [TELEMETRIA META] Disparo SoundCloud confirmado para: ${albumName}`);
      }
    }
  }
}
