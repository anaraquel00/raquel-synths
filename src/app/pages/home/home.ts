import { Component } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { HOME_DATA } from '../../data/app-data';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
   constructor(public translate: TranslationService) { }
  get navText() {
    return this.translate.isPt() ? HOME_DATA.pt : HOME_DATA.en;
  }


}
