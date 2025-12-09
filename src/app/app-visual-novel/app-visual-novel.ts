import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslationService } from '../services/translation.service';
import { VISUAL_NOVEL_EN, VISUAL_NOVEL_PT, VN_TEXT } from '../data/app-data';

@Component({
  selector: 'app-visual-novel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './app-visual-novel.html',
  styleUrl: './app-visual-novel.scss'
})
export class VisualNovelComponent {

  arcs = VISUAL_NOVEL_PT;

  constructor(public translate: TranslationService) {
    effect(() => {
      // Atualiza os cards (Arcos)
      if (this.translate.isPt()) {
        this.arcs = VISUAL_NOVEL_PT;
      } else {
        this.arcs = VISUAL_NOVEL_EN;
      }
    });
  }

  // 2. AQUI ESTÁ A CURA DO ERRO (O GETTER MÁGICO):
  get text() {
    return this.translate.isPt() ? VN_TEXT.pt : VN_TEXT.en;
  }

  // Getter do botão
  get buttonText() {
    return this.translate.isPt() ? 'ASSISTIR AGORA' : 'WATCH NOW';
  }

  openLink(url: string) {
    window.open(url, '_blank');
  }
}
