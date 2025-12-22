import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BROKLIN_ARC_PT, BROKLIN_ARC_EN } from '../../data/lore-data';
import { AdBannerComponent } from '../../components/ad-banner/ad-banner'; // Importa nossa jaula!
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-lore-reader',
  standalone: true,
  imports: [CommonModule, RouterModule, AdBannerComponent],
  templateUrl: './lore-reader.html',
  styleUrls: ['./lore-reader.scss']
})
export class LoreReaderComponent {
episodes: any;
goBack() {
throw new Error('Method not implemented.');
}
  // Injeta o tradutor
  translate = inject(TranslationService);

  // A Mágica: Escolhe o texto baseado na língua atual
  get story() {
    return this.translate.isPt() ? BROKLIN_ARC_PT : BROKLIN_ARC_EN;
  }

  isAdBreak(text: string): boolean {
    return text === '';
  }
}
