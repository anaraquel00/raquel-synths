import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { ADS_DATA } from '../../data/app-data';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ad-container">
      <div class="ad-label">{{ t.label }}</div>

      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-5619990751602183"
           data-ad-slot="1234567890"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  `,
  styles: [`
    .ad-container {
      margin: 40px auto;
      max-width: 728px;
      /* AQUI ESTÁ O TRUQUE: Usamos var(--accent-color)
         Se for Broklin = Verde Neon.
         Se for Jonah = Laranja Queimado. */
      border: 1px dashed var(--accent-color);
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      text-align: center;
      transition: border-color 0.5s ease; /* Transição suave na troca de tema */
    }

    .ad-label {
      font-family: 'Courier New', monospace; /* Fonte Hacker */
      font-size: 0.7rem;
      /* A cor do texto também segue o tema */
      color: var(--text-color);
      opacity: 0.7;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
  `]
})
export class AdBannerComponent implements AfterViewInit {
  translate = inject(TranslationService); // Injeção moderna do Angular 19

  // Getter para pegar o texto certo (PT ou EN)
  get t() {
    return this.translate.isPt() ? ADS_DATA.pt : ADS_DATA.en;
  }

  ngAfterViewInit() {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }
}
