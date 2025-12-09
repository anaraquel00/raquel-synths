import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import { TranslationService } from '../services/translation.service';
import { VISUAL_NOVEL_EN, VISUAL_NOVEL_PT } from '../data/app-data';

@Component({
  selector: 'app-visual-novel',
  standalone: true,
  imports: [CommonModule, MatIcon, MatIconModule, MatButtonModule],
  templateUrl: './app-visual-novel.html',
  styleUrl: './app-visual-novel.scss'
})
export class VisualNovelComponent {
// Começa com PT por padrão
  events = VISUAL_NOVEL_PT;
arcs: any;

  constructor(private translate: TranslationService) {
    // O "Ouvido" do componente:
    effect(() => {
      if (this.translate.isPt()) {
        this.events = VISUAL_NOVEL_PT;
      } else {
        this.events = VISUAL_NOVEL_EN;
      }
    });
  }
window: any;
}
