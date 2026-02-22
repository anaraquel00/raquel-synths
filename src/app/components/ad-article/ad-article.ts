/* src/app/components/ad-article/ad-article.ts */
import { Component, AfterViewInit, Inject, PLATFORM_ID, Input } from '@angular/core';
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
    :host { display: block; width: 100%; margin: 3rem 0; }
    
    .ad-native-container {
      width: 100%;
      border-top: 1px solid rgba(0,255,0,0.2); /* Linha sutil verde */
      border-bottom: 1px solid rgba(0,255,0,0.2);
      padding: 20px 0;
      background: rgba(255,255,255,0.02); /* Leve destaque do fundo */
    }

    .system-label {
      font-family: 'Courier New', monospace;
      font-size: 0.6rem;
      color: rgba(255,255,255,0.4);
      margin-bottom: 10px;
      text-align: center;
      letter-spacing: 2px;
    }
  `]
})
export class AdArticleComponent implements AfterViewInit {
  @Input() adSlot: string = '6867170250'; // Para poder mudar se criar outro
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      setTimeout(() => {
        try {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
        } catch (e) { console.error('AdArticle Error:', e); }
      }, 500);
    }
  }
}
