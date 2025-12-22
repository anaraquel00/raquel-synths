import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
// 👇 IMPORTANTE: Importando as duas listas separadas!
import { BROKLIN_ARC_PT, BROKLIN_ARC_EN, LoreEpisode } from '../../data/lore-data';
import { AdBannerComponent } from "../../components/ad-banner/ad-banner";

@Component({
  selector: 'app-lore-reader',
  standalone: true,
  imports: [CommonModule, AdBannerComponent],
  templateUrl: './lore-reader.html',
  styleUrls: ['./lore-reader.scss']
})
export class LoreReaderComponent {

  constructor(
    public translate: TranslationService, // Injetando o serviço de tradução
    private router: Router
  ) {}

  // 👇 O SEGREDO: Esse 'get' decide qual lista mostrar em tempo real
  get episodes(): LoreEpisode[] {
    // Se o site estiver em PT, usa a lista PT. Se não, usa a EN.
    const currentList = this.translate.isPt() ? BROKLIN_ARC_PT : BROKLIN_ARC_EN;

    // Filtra apenas os episódios marcados como 'published: true'
    return currentList.filter(ep => ep.published);
  }

  // Função para voltar para a Home
  goBack() {
    this.router.navigate(['/']);
  }
}
