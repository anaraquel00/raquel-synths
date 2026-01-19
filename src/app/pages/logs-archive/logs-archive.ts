import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importa os dados centralizados
import { SYSTEM_LOGS_DATA } from '../../data/log-data';
import { AdBannerComponent } from '../../components/ad-banner/ad-banner';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-logs-archive',
  standalone: true,
  imports: [CommonModule, RouterModule, AdBannerComponent],
  templateUrl: './logs-archive.html',
  styleUrls: ['./logs-archive.scss']
})
export class LogsArchiveComponent {

  public translate = inject(TranslationService);

  // 🔥 O FILTRO CORRIGIDO:
  // 1. Queremos apenas logs de 2025.
  // 2. Não queremos o botão de arquivo (isArchiveLink).
  logs = SYSTEM_LOGS_DATA.filter(log => {
    // Verifica se é de 2025 (Isso inclui Dec 24, 20, 15, etc)
    const is2025 = log.date.includes('2025') || log.date.includes('Dec');

    // Verifica se NÃO é o botão
    const isNotButton = !log.isArchiveLink;

    return is2025 && isNotButton;
  });

  // Função para pegar o texto certo (PT ou EN)
  getLogContent(log: any) {
    return this.translate.isPt() ? log.pt : log.en;
  }
}
