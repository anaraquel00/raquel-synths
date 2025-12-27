import { Component, effect } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslationService } from '../services/translation.service';
import { DISCOGRAPHY_EN, DISCOGRAPHY_PT } from '../data/app-data';

@Component({
  selector: 'app-discography',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './app-discography.html',
  styleUrl: './app-discography.scss'
})
export class DiscographyComponent {

  // Variáveis para o HTML
  broklinReleases = DISCOGRAPHY_PT.broklin;
  jonahReleases = DISCOGRAPHY_PT.jonah;

  constructor(private translate: TranslationService) {
    effect(() => {
      // Atualiza as listas quando troca o idioma
      const data = this.translate.isPt() ? DISCOGRAPHY_PT : DISCOGRAPHY_EN;
      this.broklinReleases = data.broklin;
      this.jonahReleases = data.jonah;
    });
  }

  openLink(url: string) {
    if(url && url !== 'LINK_SPOTIFY' && url !== 'LINK_SOUNDCLOUD') {
        window.open(url, '_blank');
    } else {
        alert('Link em breve! (Ainda estamos masterizando...) 😉');
    }
  }
}
