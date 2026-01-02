import { Component, effect } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslationService } from '../services/translation.service';
import { DISCOGRAPHY_EN, DISCOGRAPHY_PT } from '../data/app-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-discography',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './app-discography.html',
  styleUrl: './app-discography.scss'
})
export class DiscographyComponent {

 // Armazena TUDO (o banco de dados completo)
  allBroklin: any[] = [];
  allJonah: any[] = [];

  // Armazena só o que aparece na tela
  visibleBroklin: any[] = [];
  visibleJonah: any[] = [];

  // Quantos aparecem inicialmente?
  initialLimit = 8;
  limitBroklin = this.initialLimit;
  limitJonah = this.initialLimit;

  constructor(private translate: TranslationService) {
    effect(() => {
      // 1. Carrega os dados corretos (PT ou EN)
      const data = this.translate.isPt() ? DISCOGRAPHY_PT : DISCOGRAPHY_EN;
      this.allBroklin = data.broklin;
      this.allJonah = data.jonah;

      // 2. Atualiza a visualização
      this.updateView();
    });
  }

  // Atualiza as listas visíveis baseado no limite atual
  updateView() {
    this.visibleBroklin = this.allBroklin.slice(0, this.limitBroklin);
    this.visibleJonah = this.allJonah.slice(0, this.limitJonah);
  }

  // Botão "Carregar Mais" do Broklin
  showMoreBroklin() {
    this.limitBroklin += 8; // Mostra mais 6
    this.updateView();
  }

  // Botão "Carregar Mais" do Jonah
  showMoreJonah() {
    this.limitJonah += 8; // Mostra mais 6
    this.updateView();
  }

  openLink(url: string) {
    if(url && url !== 'LINK_SPOTIFY' && url !== 'LINK_SOUNDCLOUD') {
        window.open(url, '_blank');
    } else {
        alert('🚧 LINK CRIPTOGRAFADO: Em breve disponível nos canais oficiais! 😉');
    }
  }
}
