import { Component, effect } from '@angular/core';

import { EVENTS_EN, EVENTS_PT } from '../data/app-data';
import { TranslationService } from '../services/translation.service';



@Component({
  selector: 'app-storytelling',
  standalone: true,
  imports: [],
  templateUrl: './app-storytelling.html',
  styleUrl: './app-storytelling.scss'
})
export class StorytellingComponent {

  // Começa com PT por padrão
  events = EVENTS_PT;

  constructor(public translate: TranslationService) {
    // O "Ouvido" do componente:
    effect(() => {
      if (this.translate.isPt()) {
        this.events = EVENTS_PT;
      } else {
        this.events = EVENTS_EN;
      }
    });
  }
  // --- ADICIONE ESSA FUNÇÃO ---
  toggleLog(event: any) {
    event.isExpanded = !event.isExpanded;
  }
}

