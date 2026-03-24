import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { CREATOR_DATA, NAV_DATA } from '../../data/app-data';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-creator',
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './creator.html',
  styleUrl: './creator.scss',
})
export class Creator implements OnInit{
currentTheme!: string;
activeTheme: any;
private platformId = inject(PLATFORM_ID);
constructor(public translate: TranslationService) {}

  // Atalho para pegar os textos
  get navText() {
    return this.translate.isPt() ? NAV_DATA.pt : NAV_DATA.en;
  }
 get text() {
    return this.translate.isPt() ? CREATOR_DATA.pt : CREATOR_DATA.en;
  }

  ngOnInit() {
    // 🛡️ BLINDAGEM SSR: Só executa se estiver rodando no NAVEGADOR (Browser)
    // Se estiver no servidor durante o build, ele pula esse bloco e não dá erro!
    if (isPlatformBrowser(this.platformId)) {
      
      const isJonah = document.body.classList.contains('mode-jonah');

      if (isJonah) {
        this.currentTheme = 'jonah';
      } else {
        this.currentTheme = 'broklin';
      }
      
    } else {
      // 🚀 VALOR DEFAULT PARA O SERVIDOR:
      // Durante o build, definimos um tema padrão para o HTML estático não virar cinza
      this.currentTheme = 'broklin'; 
    }
  }
}

