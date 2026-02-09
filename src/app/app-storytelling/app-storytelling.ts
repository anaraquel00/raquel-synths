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

  // 🔥 O FLUXO DE DADOS (COM LIMITADOR DE QUANTIDADE)
  logs$: Observable<any[]> = this.contentService.getLogs().pipe(
    map(logs => {
      if (!logs) return [];

      // 1º PASSO: RESGATAR O BOTÃO "VER MAIS" (Se existir no DB)
      // Precisamos separá-lo para ele não ser cortado pelo slice
      const archiveLinkDoc = logs.find(log => log.isArchiveLink);

      // 2º PASSO: FILTRAR E ORDENAR APENAS CONTEÚDO REAL
      let contentLogs = logs.filter(log => {
        const dateStr = String(log.date || '');
        const isOld = dateStr.includes('2025'); // Filtra legado
        const isLink = !!log.isArchiveLink;     // Remove o botão dessa lista
        return !isOld && !isLink;               // Só passa conteúdo de 2026+
      });

      // Ordenação (JavaScript Date)
      contentLogs.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Decrescente (Mais novo no topo)
      });

      // 3º PASSO: A GUILHOTINA (LIMITAR A 4 LOGS) ✂️
      // Aqui definimos quantos logs aparecem na Home.
      const recentLogs = contentLogs.slice(0, 4);

      // 4º PASSO: MONTAGEM FINAL
      // Retornamos os 4 recentes + o botão de arquivo no final
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
