import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { CREATOR_DATA, NAV_DATA } from '../../data/app-data';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-creator',
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './creator.html',
  styleUrl: './creator.scss',
})
export class Creator implements OnInit{
  currentTheme!: string;
activeTheme: any;
constructor(public translate: TranslationService) {}

  // Atalho para pegar os textos
  get navText() {
    return this.translate.isPt() ? NAV_DATA.pt : NAV_DATA.en;
  }
 get text() {
    return this.translate.isPt() ? CREATOR_DATA.pt : CREATOR_DATA.en;
  }

  ngOnInit() {
  // Verifica se o corpo já tem a classe do Jonah
  const isJonah = document.body.classList.contains('mode-jonah');

  if (isJonah) {
    // Força as variáveis locais a ficarem no modo Jonah
    this.currentTheme = 'jonah';
  } else {
    this.currentTheme = 'broklin';
  }
}
}
