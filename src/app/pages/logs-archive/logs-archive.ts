import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importa os dados centralizados
import { SYSTEM_LOGS_DATA } from '../../data/log-data';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SafeHtmlPipe } from "../../components/pipes/safe-html.pipe";
import { AdArticleComponent } from "../../components/ad-article/ad-article";

@Component({
  selector: 'app-logs-archive',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe, AdArticleComponent],
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
  private contentService = inject(ContentService);

  logs$: Observable<any[]> = this.contentService.getLogs().pipe(
    map(logs => {
      // Ordena também, só para garantir
      const sorted = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return sorted.filter(log => {
        const dateStr = String(log.date || '');
        const isOld = dateStr.includes('2025'); // É de 2025?
        const isLink = !!log.isArchiveLink;     // É o botão "Legacy"?

        // NO ARQUIVO: Queremos (É VELHO) E (NÃO É O BOTÃO)
        return isOld && !isLink;
      });
    })
  );



}
