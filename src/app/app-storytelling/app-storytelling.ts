import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { TranslationService } from '../services/translation.service';
import { ContentService } from '../services/content.service';
import { SafeHtmlPipe } from '../components/pipes/safe-html.pipe';
import { AdBannerComponent } from "../components/ad-banner/ad-banner";
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-storytelling',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe, AdBannerComponent, NgOptimizedImage],
  templateUrl: './app-storytelling.html',
  styleUrls: ['./app-storytelling.scss']
})
export class StorytellingComponent {

  private router = inject(Router);
  public translate = inject(TranslationService);
  private contentService = inject(ContentService);

// 🔥 HOME: Corta os 4 primeiros e não liga pro ano!
  logs$: Observable<any[]> = this.contentService.getLogs().pipe(
    map(logs => {
      if (!logs) return [];

      const archiveLinkDoc = logs.find(log => log.isArchiveLink);

      // DELETA AQUELE FILTRO DE '2025'. Tira só o botão.
      let contentLogs = logs.filter(log => !log.isArchiveLink);

      // Ordena por data (Mais novo no topo)
      contentLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Pega do 0 ao 4 (Os 4 mais recentes)
      const recentLogs = contentLogs.slice(0, 4);

      if (archiveLinkDoc) {
        return [...recentLogs, archiveLinkDoc];
      }
      return recentLogs;
    }),
    catchError(error => {
      console.error('🔥 [FIREBASE ERROR]:', error);
      return of([{ _isError: true, message: error.message }]);
    })
  );

  getEventContent(event: any) {
    return this.translate.isPt() ? event.pt : event.en;
  }

  toggleLog(event: any) {
    event.isExpanded = !event.isExpanded;
  }

  navigateToArchive() {
    this.router.navigate(['/logs-archive']);
  }
}
