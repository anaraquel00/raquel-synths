import { Component, DOCUMENT, Inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { CONTACT_DATA, HOME_DATA } from '../../data/app-data';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  constructor(public translate: TranslationService,
    @Inject(DOCUMENT) private document: Document) { }

  get navText() {
    return this.translate.isPt() ? HOME_DATA.pt : HOME_DATA.en;
  }
// 👇 Novo Getter para o texto do botão de Contato
  get contactText() {
    return this.translate.isPt() ? CONTACT_DATA.pt : CONTACT_DATA.en;
  }

   scrollTo(elementId: string): void {
    // Agora ele busca no HTML GLOBAL (app.html)
    const element = this.document.getElementById(elementId);
    if (element) {
      // O 'block: start' garante que o topo da seção fique no topo da tela
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn(`ALERTA: Elemento '${elementId}' não encontrado no DOM.`);
    }
  }

}
