import { Component, inject, PLATFORM_ID, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule, Router} from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { SafeHtmlPipe } from "../../components/pipes/safe-html.pipe";
import { AdArticleComponent } from "../../components/ad-article/ad-article";
import { NgOptimizedImage } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { toSignal } from '@angular/core/rxjs-interop';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-logs-archive',
  standalone: true,
  imports: [CommonModule, RouterModule, AdArticleComponent, NgOptimizedImage, ScrollingModule, SafeHtmlPipe],
  templateUrl: './logs-archive.html',
  styleUrls: ['./logs-archive.scss']
})
export class LogsArchiveComponent implements OnInit {
  public translate = inject(TranslationService);
  private contentService = inject(ContentService);
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private router = inject(Router); // <-- Inject Router

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
  
  ngOnInit() {
    const isPt = this.translate.isPt();
    const currentPath = this.router.url.split('?')[0];

    this.seoService.updateMetaTags({
      title: isPt ? 'Arquivo de Logs' : 'Logs Archive',
      description: isPt 
        ? 'Os bastidores da narrativa transmídia e DevNotes da RQS.' 
        : 'The behind-the-scenes of the transmedia narrative and RQS DevNotes.',
      url: `https://raquelsynths.com.br${currentPath}`
    });
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage", 
      "name": isPt ? 'Arquivo de Logs | RaQuel Synths' : 'Logs Archive | RaQuel Synths',
      "description": isPt 
        ? 'Acesse os bastidores, diários de desenvolvimento e arquivos interceptados.' 
        : 'Access behind-the-scenes, dev diaries, and intercepted archives.',
      "url": `https://raquelsynths.com.br${currentPath}`,
      "publisher": {
        "@type": "Organization",
        "name": "RaQuel Synths",
        "logo": {
          "@type": "ImageObject",
          "url": "https://raquelsynths.com.br/rqs-logo.webp"
        }
      }
    });
  }

  getLogContent(log: any) {
    return this.translate.isPt() ? log.pt : log.en;
  }
}
