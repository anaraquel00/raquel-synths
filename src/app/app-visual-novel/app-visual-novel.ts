import { Component, inject } from '@angular/core'; // Adicione inject
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/translation.service';
import { VISUAL_NOVEL_PT, VISUAL_NOVEL_EN } from '../data/app-data';
import { Router } from '@angular/router';
import { MatIcon } from "@angular/material/icon"; // <--- IMPORTANTE: Importe o Router!

@Component({
  selector: 'app-visual-novel',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './app-visual-novel.html',
  styleUrls: ['./app-visual-novel.scss']
})
export class AppVisualNovel {
  translate = inject(TranslationService);
  private router = inject(Router); // <--- Injeta o GPS

  get text() {
    return this.translate.isPt() ?
      { title: 'VISUAL NOVEL', subtitle: 'Acompanhe as nossas histórias animadas.' } :
      { title: 'VISUAL NOVEL', subtitle: 'Follow our animated stories.' };
  }

  get arcs() {
    return this.translate.isPt() ? VISUAL_NOVEL_PT : VISUAL_NOVEL_EN;
  }

  // A Função Mágica de Navegação
  navigate(link: string) {
    if (link.startsWith('/')) {
      // Se começa com barra, é interno (Lore)
      window.scrollTo(0, 0);
      this.router.navigate([link]);
    } else {
      // Se não, é externo (YouTube)
      window.open(link, '_blank');
    }
  }
}
