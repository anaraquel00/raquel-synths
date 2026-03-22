import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AdSenseService {
  private scriptLoaded = false;

  // O isPlatformBrowser é CRÍTICO porque usamos Server-Side Rendering (SSR).
  // O servidor não tem "window" nem "document".
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Inicia o radar. Assim que o humano respirar na página, injetamos o anúncio.
   */
  public initLazyLoad(clientId: string): void {
    // Se estiver rodando no servidor ou se o script já carregou, aborta.
    if (!isPlatformBrowser(this.platformId) || this.scriptLoaded) {
      return;
    }

    const loadAds = () => {
      this.injectScript(clientId);
      // Desliga o radar após o primeiro disparo para economizar CPU
      ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event =>
        window.removeEventListener(event, loadAds)
      );
    };

    // Liga os sensores de interação do usuário (passive: true para não travar a rolagem)
    ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event =>
      window.addEventListener(event, loadAds, { once: true, passive: true })
    );
  }

  /**
   * A injeção cirúrgica na matriz do DOM
   */
  private injectScript(clientId: string): void {
    if (this.scriptLoaded) return;

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    this.scriptLoaded = true;
    console.log('🛡️ [AdSense Service] Tag injetada com sucesso após interação.');
  }
}