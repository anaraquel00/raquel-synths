import { Component, effect } from '@angular/core'; // Importe 'effect'
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service'; // Importe seu serviço
import { MEMBERS_PT, MEMBERS_EN } from '../../data/app-data'; // Importe os dados

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sobre.html',
  styleUrl: './sobre.scss'
})
export class SobreComponent {

  // Começa com PT
  members = MEMBERS_PT;

  constructor(private translate: TranslationService) {
    // A MÁGICA: Sempre que o idioma mudar, ele troca o array inteiro!
    effect(() => {
      if (this.translate.isPt()) {
        this.members = MEMBERS_PT;
      } else {
        this.members = MEMBERS_EN;
      }
    });
  }
}
