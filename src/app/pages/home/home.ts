import { Component } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { CONTACT_DATA, HOME_DATA } from '../../data/app-data';
import { MatButtonModule } from '@angular/material/button';
import { ContatoComponent } from '../contato/contato';

@Component({
  selector: 'app-home',
  imports: [ContatoComponent,
       MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  document: any;
   constructor(public translate: TranslationService) { }
  get navText() {
    return this.translate.isPt() ? HOME_DATA.pt : HOME_DATA.en;
  }
// 👇 Novo Getter para o texto do botão de Contato
  get contactText() {
    return this.translate.isPt() ? CONTACT_DATA.pt : CONTACT_DATA.en;
  }

   scrollTo(elementId: string): void {
    const element = this.document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
