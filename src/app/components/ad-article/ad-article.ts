/* src/app/components/ad-article/ad-article.ts */
import { Component, Inject, PLATFORM_ID, Input, afterNextRender, signal, inject, effect, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConsentService } from '../../services/consent.service';
import { MonetizationPolicyService } from '../../services/monetization-policy.service';
import { AdSenseService } from '../../services/ad-sense.service';

@Component({
  selector: 'app-ad-article', // <--- Nome novo para usar no meio do texto
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ad-native-container" *ngIf="isBrowser() && eligible()">
      <div class="system-label">ANÚNCIOS</div>

      @if (eligible()) {<ins class="adsbygoogle"
           style="display:block; text-align:center;"
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-5619990751602183"
           [attr.data-ad-slot]="adSlot"> </ins>}

    </div>
  `,
  styles: [`
    /* 🛡️ Reduzimos a margem externa pela metade */
    :host { display: block; width: 100%; margin: 1.5rem 0; }

    .ad-native-container {
      width: 100%;
      /* 💻 Trocamos a linha sólida por tracejada (estilo log de sistema) e ajustamos pro Cyan da RQS */
      border-top: 1px dashed rgba(0, 255, 204, 0.3);
      border-bottom: 1px dashed rgba(0, 255, 204, 0.3);
      padding: 15px 0; /* Área de respiro interna mais contida */
      background: rgba(0, 255, 204, 0.02); /* Fundo levíssimo em tom neon */
    }

    .system-label {
      font-family: 'Courier New', monospace;
      font-size: 0.65rem;
      color: rgba(0, 255, 204, 0.5);
      margin-bottom: 8px;
      text-align: center;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
  `]
})
export class AdArticleComponent {
  @Input() adSlot: string = '6867170250'; // Para poder mudar se criar outro
  isBrowser = signal(false);
  private router = inject(Router);
  private consent = inject(ConsentService);
  private policy = inject(MonetizationPolicyService);
  private adSense = inject(AdSenseService);
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private pushed = false;
  eligible = () => this.consent.state() === 'ACCEPTED' && this.policy.currentArticleEligible();
  private renderAdEffect = effect(() => {
    const eligible = this.isBrowser() && this.eligible();
    if (!eligible) { this.pushed = false; return; }
    setTimeout(() => this.adSense.runWhenReady(() => {
      const unit = this.element.nativeElement.querySelector('.adsbygoogle');
      if (!this.pushed && unit && this.eligible()) {
        this.pushed = true;
        (window as any).adsbygoogle.push({});
      }
    }), 0);
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // 🛡️ MOTOR DE RENDERIZAÇÃO ANGULAR 17+: afterNextRender roda SOMENTE no navegador
    // após o DOM estar pronto. Elimina os hacks de setTimeout e o ngAfterViewInit.
    afterNextRender(() => {
      this.isBrowser.set(true); // Libera o HTML do banner apenas pós-hidratação

    });
  }
}
