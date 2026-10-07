import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ConsentService } from './consent.service';
import { MonetizationPolicyService } from './monetization-policy.service';

const ADSENSE_SCRIPT_SELECTOR =
  'script[data-rqs-adsense-bootstrap], script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

@Injectable({
  providedIn: 'root'
})
export class AdSenseService {
  private scriptLoaded = false;
  private scriptReady = false;
  private readyCallbacks: Array<() => void> = [];

  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private consent = inject(ConsentService);
  private policy = inject(MonetizationPolicyService);

  /**
   * Inicializa somente o carrier oficial usado pela Google CMP/AdSense.
   * Não cria unidade de anúncio e não altera consentimento RQS ou TCF.
   */
  public ensureCmpBootstrap(clientId: string): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const existingScript = this.document.querySelector<HTMLScriptElement>(ADSENSE_SCRIPT_SELECTOR);
    if (existingScript) {
      this.observeScript(existingScript);
      return false;
    }

    const script = this.document.createElement('script');
    script.id = 'rqs-adsense-cmp-bootstrap';
    script.dataset['rqsAdsenseBootstrap'] = 'true';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    this.observeScript(script);
    this.document.head.appendChild(script);
    return true;
  }

  /**
   * Autoriza somente os caminhos manuais de ad serving da RQS.
   * O consentimento local continua sendo uma trava adicional e não representa TCF.
   */
  public enableAdServing(clientId: string): boolean {
    if (
      !isPlatformBrowser(this.platformId) ||
      this.consent.state() !== 'ACCEPTED' ||
      !this.policy.currentEligible()
    ) {
      return false;
    }

    this.ensureCmpBootstrap(clientId);
    return true;
  }

  public runWhenReady(callback: () => void): void {
    if (this.consent.state() !== 'ACCEPTED' || !this.policy.currentEligible()) return;
    if (this.scriptReady) callback();
    else this.readyCallbacks.push(callback);
  }

  private observeScript(script: HTMLScriptElement): void {
    if (this.scriptLoaded) return;

    this.scriptLoaded = true;
    const adsbygoogle = (this.document.defaultView as Window & { adsbygoogle?: unknown } | null)
      ?.adsbygoogle;
    if (adsbygoogle) {
      this.markScriptReady();
      return;
    }

    script.addEventListener('load', () => {
      this.markScriptReady();
    }, { once: true });
  }

  private markScriptReady(): void {
    if (this.scriptReady) return;
    this.scriptReady = true;
    this.readyCallbacks.splice(0).forEach(callback => callback());
  }
}
