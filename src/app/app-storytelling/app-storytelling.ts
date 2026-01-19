import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// 1. IMPORTAMOS A NOVA FONTE ÚNICA
import { SYSTEM_LOGS_DATA } from '../data/log-data';

// 2. IMPORTAMOS O SERVIÇO DE TRADUÇÃO (Porque agora os dados são bilingues)
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-storytelling',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-storytelling.html',
  styleUrls: ['./app-storytelling.scss']
})
export class StorytellingComponent {

  private router = inject(Router);
  public translate = inject(TranslationService); // Injetamos o tradutor

  // 3. FILTRO DA HOME:
  // Lógica: Pegar tudo que NÃO é de 2025 (ou seja, 2026) OU o botão de Arquivo
  events = SYSTEM_LOGS_DATA.filter(log => {
    const isOld = log.date.includes('2025'); // É velho?
    const isLink = log.isArchiveLink;        // É o botão?

    // Na home, queremos: (NÃO É VELHO) OU (É O BOTÃO)
    return !isOld || isLink;
  });

  // 4. FUNÇÃO AUXILIAR PARA O HTML LER (PT/EN)
  // Como mudamos a estrutura dos dados, o HTML da home precisa dessa ajuda
  getEventContent(event: any) {
    return this.translate.isPt() ? event.pt : event.en;
  }

  // ... (suas funções toggleLog e navigateToArchive continuam aqui)
  toggleLog(event: any) { event.isExpanded = !event.isExpanded; }

  navigateToArchive() { this.router.navigate(['/logs-archive']); }
}
