import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Removi MatIcon solto
import { TranslationService } from '../services/translation.service';
import { VISUAL_NOVEL_EN, VISUAL_NOVEL_PT } from '../data/app-data';

@Component({
  selector: 'app-visual-novel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './app-visual-novel.html',
  styleUrl: './app-visual-novel.scss'
})
export class VisualNovelComponent {

  arcs = VISUAL_NOVEL_PT;
  text: any;

  constructor(public translate: TranslationService) {
    effect(() => {
      if (this.translate.isPt()) {
        this.arcs = VISUAL_NOVEL_PT;
      } else {
        this.arcs = VISUAL_NOVEL_EN;
      }
    });
  }

  // --- AQUI ESTÁ A TRADUÇÃO DO BOTÃO ---
  get buttonText() {
    return this.translate.isPt() ? 'ASSISTIR AGORA' : 'WATCH NOW';
  }

  openLink(url: string) {
    window.open(url, '_blank');
  }
}
