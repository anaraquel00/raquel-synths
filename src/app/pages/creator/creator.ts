import { Component } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { NAV_DATA } from '../../data/app-data';
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
export class Creator {
constructor(public translate: TranslationService) {}

  // Atalho para pegar os textos
  get navText() {
    return this.translate.isPt() ? NAV_DATA.pt : NAV_DATA.en;
  }
}
