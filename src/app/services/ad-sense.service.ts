import { Injectable, PLATFORM_ID, inject, afterNextRender, Injector } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ConsentService } from './consent.service';
import { MonetizationPolicyService } from './monetization-policy.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdSenseService {
  private scriptLoaded = false;
  private scriptReady = false;
  private readyCallbacks: Array<() => void> = [];

  // 🛡️ INJEÇÃO BLINDADA: Atualizado para Angular 19+
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private injector = inject(Injector);
  private consent = inject(ConsentService);
  private policy = inject(MonetizationPolicyService);
  private router = inject(Router);

  /**
   * Inicia o radar. Assim que o humano respirar na página, injetamos o anúncio.
   */
  public initLazyLoad(clientId: string): void {
    // Se estiver rodando no servidor ou se o script já carregou, aborta.
    if (this.scriptLoaded || !isPlatformBrowser(this.platformId) || this.consent.state() !== 'ACCEPTED' || !this.policy.currentEligible()) {
      return;
    }

    // 🛡️ TRAVA TÁTICA: afterNextRender garante execução pós-hidratação no DOM real
    afterNextRender(() => {
      if (this.consent.state() === 'ACCEPTED' && this.policy.currentEligible()) this.injectScript(clientId);
    }, { injector: this.injector });
  }

  public runWhenReady(callback: () => void): void {
    if (this.consent.state() !== 'ACCEPTED' || !this.policy.currentEligible()) return;
    if (this.scriptReady) callback();
    else this.readyCallbacks.push(callback);
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
    script.addEventListener('load', () => {
      this.scriptReady = true;
      this.readyCallbacks.splice(0).forEach(callback => callback());
    }, { once: true });
    this.document.head.appendChild(script);

    this.scriptLoaded = true;
    console.log('🛡️ [AdSense Service] Tag injetada com sucesso após interação.');
  }
}
