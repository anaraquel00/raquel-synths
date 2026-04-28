import { Component, inject, PLATFORM_ID, signal, computed, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule} from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { SafeHtmlPipe } from "../../components/pipes/safe-html.pipe";
import { AdArticleComponent } from "../../components/ad-article/ad-article";
import { NgOptimizedImage } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-logs-archive',
  standalone: true,
  imports: [CommonModule, RouterModule, AdArticleComponent, NgOptimizedImage, ScrollingModule, SafeHtmlPipe],
  templateUrl: './logs-archive.html',
  styleUrls: ['./logs-archive.scss']
})
export class LogsArchiveComponent {
  public translate = inject(TranslationService);
  private contentService = inject(ContentService);
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);

  public pageSize = 5; // 5 logs por página é o ideal para mobile

  // 🛡️ MOTOR REATIVO (Sinaliza para o SSR aguardar ou resolver graciosamente)
  private logsSignal = toSignal(this.contentService.getLogs(), { initialValue: null });
  private queryParamsSignal = toSignal(this.route.queryParams, { initialValue: {} as any });

  private allLogs = computed(() => {
    const logs = this.logsSignal();
    if (!logs) return null;
    let contentLogs = logs.filter(log => !log.isArchiveLink);
    contentLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return contentLogs.slice(4);
  });

  public totalPages = computed(() => {
    const logs = this.allLogs();
    return logs ? Math.ceil(logs.length / this.pageSize) : 0;
  });

  public currentPage = computed(() => {
    const params = this.queryParamsSignal();
    return params['page'] ? Number(params['page']) : 0;
  });

  public logsPaginated = computed(() => {
    const logs = this.allLogs();
    if (!logs) return null;
    const start = this.currentPage() * this.pageSize;
    const end = start + this.pageSize;
    return logs.slice(start, end);
  });

  constructor() {
    effect(() => {
      this.currentPage(); // Ouve a mudança de página
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
  }

  getLogContent(log: any) {
    return this.translate.isPt() ? log.pt : log.en;
  }
}
