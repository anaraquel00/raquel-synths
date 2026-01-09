import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // <--- IMPORTANTE: Importar o Router
import { STORE_DATA } from '../../data/store-data';
import { TranslationService } from '../../services/translation.service';


@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store.html',
  styleUrls: ['./store.scss']
})
export class StoreComponent {

  // INJEÇÕES DE DEPENDÊNCIA
  private TranslationService = inject(TranslationService);
  private router = inject(Router); // <--- O Router entra aqui!

  // DADOS
  products = STORE_DATA;

  // SIGNAL DE IDIOMA (Para usar no HTML)
  currentLang = this.TranslationService.currentLang;

  // AÇÃO DO BOTÃO VOLTAR
  goBackHome() {
    this.router.navigate(['/']);
  }

  // AÇÃO DE COMPRA
  buyProduct(url: string) {
    if (url) window.open(url, '_blank');
  }
}
