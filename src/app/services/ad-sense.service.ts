import { Injectable, PLATFORM_ID, inject, afterNextRender, Injector } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AdSenseService {
  private scriptLoaded = false;

  // 🛡️ INJEÇÃO BLINDADA: Atualizado para Angular 19+
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private injector = inject(Injector);

  /**
   * Inicia o radar. Assim que o humano respirar na página, injetamos o anúncio.
   */
  public initLazyLoad(clientId: string): void {
    // Se estiver rodando no servidor ou se o script já carregou, aborta.
    if (this.scriptLoaded || !isPlatformBrowser(this.platformId)) {
      return;
    }

    // 🛡️ TRAVA TÁTICA: afterNextRender garante execução pós-hidratação no DOM real
    afterNextRender(() => {
      // 🛡️ Evita o uso direto de 'window' para garantir conformidade corporativa
      const win = this.document.defaultView;
      if (!win) return;

      const loadAds = () => {
        this.injectScript(clientId);
        // Desliga o radar após o primeiro disparo para economizar CPU
        ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event =>
          win.removeEventListener(event, loadAds)
        );
      };

      // Liga os sensores de interação do usuário (passive: true para não travar a rolagem)
      ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event =>
        win.addEventListener(event, loadAds, { once: true, passive: true })
      );
    }, { injector: this.injector });
  }

  /**
   * A injeção cirúrgica na matriz do DOM
   */
  private injectScript(clientId: string): void {
    if (this.scriptLoaded) return;

    const script = this.document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    this.document.head.appendChild(script);

    this.scriptLoaded = true;
    console.log('🛡️ [AdSense Service] Tag injetada com sucesso após interação.');
  }
}
