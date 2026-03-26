import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  
  trackAffiliateClick(productName: string, platform: string) {
  if (isPlatformBrowser(this.platformId)) {
    if (typeof (window as any).fbq === 'function') {
      
      // 🎯 EVENTO 'ViewContent': Avisa que o fã quer ver o produto na loja parceira
      (window as any).fbq('track', 'ViewContent', {
        content_name: productName,
        content_category: `Affiliate - ${platform}`,
        status: 'Redirecting to Partner'
      });
      
      console.log(`🔗 [UPLINK AFILIADO] Redirecionando para ${platform}: ${productName}`);
    }
  }
}
  private scriptsLoaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  public initLazyTracking(gtmId: string): void {
    // Aborta se estiver a correr no servidor (SSR) ou se já estiver carregado
    if (!isPlatformBrowser(this.platformId) || this.scriptsLoaded) return;

  
    const loadScripts = () => {
      if (this.scriptsLoaded) return;
      
      // Injeta o Google Tag Manager silenciosamente
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gtmId}`;
      script.async = true;
      document.head.appendChild(script);

      // Inicializa o DataLayer
      const scriptInline = document.createElement('script');
      scriptInline.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gtmId}');
      `;
      document.head.appendChild(scriptInline);

      this.scriptsLoaded = true;
      console.log('🛡️ [Tracking Service] GTM/Analytics injetados com sucesso após interação.');

      // Desliga os radares para não consumir RAM do telemóvel
      ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event =>
        window.removeEventListener(event, loadScripts)
      );
    };

    // Fica à espreita do primeiro toque ou scroll no ecrã
    ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event =>
      window.addEventListener(event, loadScripts, { once: true, passive: true })
    );
  }
  /**
   * Dispara um evento personalizado para o painel do Google Analytics
   */
  public trackCustomEvent(eventName: string, eventParams: any = {}): void {
    if (isPlatformBrowser(this.platformId)) {
      // Adiciona o evento à Fila de Espera (dataLayer)
      const dataLayer = (window as any).dataLayer || [];
      dataLayer.push({
        event: eventName,
        ...eventParams
      });
      console.log(`🛡️ [Tracking] Evento capturado: ${eventName}`);
    }
  }

  // 🎯 O GATILHO: Dispara quando o botão do Spotify for clicado
  trackSpotifyClick(albumName: string) {
    // 🛡️ BLINDAGEM: O servidor não pode enviar eventos pra Meta, só o humano!
    if (isPlatformBrowser(this.platformId)) {
      
      // Verifica se o Pixel carregou com sucesso no index.html
      if (typeof (window as any).fbq === 'function') {
        
        // Envia o sinal "Lead" (Conversão) para a Meta
        (window as any).fbq('trackCustom', 'SpotifyClick', {
          content_name: albumName,
          content_category: 'Music'
        });
        
        console.log(`🛡️ [TELEMETRIA META] Disparo confirmado para: ${albumName}`);
      }
    }
  }
}