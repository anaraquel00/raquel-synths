import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EVENTS_EN, EVENTS_PT } from '../data/app-data';
import { TranslationService } from '../services/translation.service';

/* interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  image: string;
  jonahComment?: string; // O comentário ácido do Jonah
} */

@Component({
  selector: 'app-storytelling',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-storytelling.html',
  styleUrl: './app-storytelling.scss'
})
export class StorytellingComponent {

  // Começa com PT por padrão
  events = EVENTS_PT;
  translate: any;

  constructor(private TranslationService: TranslationService) {
    // O "Ouvido" do componente:
    effect(() => {
      if (this.translate.isPt()) {
        this.events = EVENTS_PT;
      } else {
        this.events = EVENTS_EN;
      }
    });
  }
}

