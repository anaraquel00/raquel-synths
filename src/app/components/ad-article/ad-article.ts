/* src/app/components/ad-article/ad-article.ts */
import { Component, AfterViewInit, Inject, PLATFORM_ID, Input, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-ad-article', // <--- Nome novo para usar no meio do texto
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ad-native-container" *ngIf="isBrowser">
      <div class="system-label">/// SUGGESTED_DATA_STREAM ///</div>

      <ins class="adsbygoogle"
           style="display:block; text-align:center;"
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-5619990751602183"
           [attr.data-ad-slot]="adSlot"> </ins>

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
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // 🛡️ MOTOR DE RENDERIZAÇÃO ANGULAR 17+: afterNextRender roda SOMENTE no navegador
    // após o DOM estar pronto. Elimina os hacks de setTimeout e o ngAfterViewInit.
    afterNextRender(() => {
        try {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
        } catch (e) { console.error('AdArticle Error:', e); }
    });
  }
}
