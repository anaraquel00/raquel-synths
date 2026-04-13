import { Component, inject, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SafeHtmlPipe } from "../../components/pipes/safe-html.pipe";
import { AdArticleComponent } from "../../components/ad-article/ad-article";
import { NgOptimizedImage } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-logs-archive',
  standalone: true,
  imports: [CommonModule, RouterModule, AdArticleComponent, NgOptimizedImage, ScrollingModule],
  templateUrl: './logs-archive.html',
  styleUrls: ['./logs-archive.scss']
})
export class LogsArchiveComponent {
  public translate = inject(TranslationService);
  private contentService = inject(ContentService);
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);

  private allLogs: any[] = [];
  public logsPaginated$ = new BehaviorSubject<any[]>([]);

  public currentPage = 0;
  public pageSize = 5; // 5 logs por página é o ideal para mobile
  public totalPages = 0;


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

 trackById(index: number, log: any) { return log.id; }

 ngOnInit() {

    this.contentService.getLogs().subscribe(logs => {
      if (!logs) return;

      // 1. Filtra o lixo (links de arquivo)
      let contentLogs = logs.filter(log => !log.isArchiveLink);

      // 2. Ordenação Garantida (Newest First)
      contentLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // 3. ISOLAMENTO: O Arquivo só começa a partir do 5º log (index 4)
      // Isso mata a repetição dos logs da Home no Arquivo!
      this.allLogs = contentLogs.slice(4);

      // 4. Calcula as páginas baseadas APENAS no que sobrou
      this.totalPages = Math.ceil(this.allLogs.length / this.pageSize);
      // 🔥 A MÁGICA DO SEO AQUI: O componente agora ESCUTA a URL!
      this.route.queryParams.subscribe(params => {
        // Se a URL tiver ?page=1, ele pega o 1. Se não tiver nada, assume o 0.
        this.currentPage = params['page'] ? Number(params['page']) : 0;

        // Dispara a atualização visual
        this.updatePage();
      });
    });
      }

  getLogContent(log: any) {
    return this.translate.isPt() ? log.pt : log.en;
  }

 updatePage() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.logsPaginated$.next(this.allLogs.slice(start, end));

    // 🛡️ BLINDAGEM: O servidor não tem janela pra rolar!
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

}
