import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { TranslationService } from '../services/translation.service';
import { ContentService } from '../services/content.service';
import { SafeHtmlPipe } from '../components/pipes/safe-html.pipe';
import { AdBannerComponent } from "../components/ad-banner/ad-banner";

@Component({
  selector: 'app-storytelling',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe, AdBannerComponent],
  templateUrl: './app-storytelling.html',
  styleUrls: ['./app-storytelling.scss']
})
export class StorytellingComponent {

  private router = inject(Router);
  public translate = inject(TranslationService);
  private contentService = inject(ContentService);

  // 🔥 O FLUXO DE DADOS (COM ORDENAÇÃO E FILTRO)
  logs$: Observable<any[]> = this.contentService.getLogs().pipe(
    map(logs => {
      if (!logs) return [];

      // 1º PASSO: ORDENAR (Do mais novo para o mais antigo)
      // Usamos JavaScript para comparar as datas, já que removemos do Firebase
      const sortedLogs = logs.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // B menos A = Decrescente (Mais novo no topo)
      });

      // 2º PASSO: FILTRAR PARA A HOME
      return sortedLogs.filter(log => {
        const dateStr = String(log.date || '');
        const isOld = dateStr.includes('2025'); // É coisa velha?
        const isLink = !!log.isArchiveLink;     // É o botão do arquivo?

        // Na Home mostramos: (NÃO é velho) OU (É o botão)
        return !isOld || isLink;
      });
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
