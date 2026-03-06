import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
  private contentService = inject(ContentService);

  // 🔥 ARQUIVO: Pega a sobra da Home (do 5º log em diante)
  logs$: Observable<any[]> = this.contentService.getLogs().pipe(
    map(logs => {
      if (!logs) return [];

      // Tira o botão "Ver Mais"
      let contentLogs = logs.filter(log => !log.isArchiveLink);

      // Ordena igualzinho na Home
      contentLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // A MÁGICA: Pega do item 4 até o infinito!
      return contentLogs.slice(4);
    }),
    catchError(error => {
      console.error('🔥 [FIREBASE ERROR]:', error);
      return of([]);
    })
  );

  getLogContent(log: any) {
    return this.translate.isPt() ? log.pt : log.en;
  }
}