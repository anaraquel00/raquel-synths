import {
  Component,
  inject,
  PLATFORM_ID,
  signal,
  computed,
  effect,
  RESPONSE_INIT
} from '@angular/core';
import {
  CommonModule,
  DOCUMENT,
  isPlatformBrowser,
  isPlatformServer
} from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { AdArticleComponent } from '../../components/ad-article/ad-article';
import { NgOptimizedImage } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { SeoService } from '../../services/seo.service';
import {
  buildLogsArchiveCanonical,
  getLogsArchiveTotalPages,
  isLogsArchivePageInRange,
  paginateArchiveLogs,
  parseLogsArchivePageParam,
  prepareArchiveLogs
} from './logs-archive.utils';

type ArchiveState =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'not-found'
  | 'error'
  | 'redirect-root';

@Component({
  selector: 'app-logs-archive',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AdArticleComponent,
    NgOptimizedImage,
    ScrollingModule
  ],
  templateUrl: './logs-archive.html',
  styleUrls: ['./logs-archive.scss']
})
export class LogsArchiveComponent {
  public translate = inject(TranslationService);
  private contentService = inject(ContentService);
  private platformId = inject(PLATFORM_ID);
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  public readonly pageSize = 5;
  private readonly loadState = signal<'loading' | 'loaded' | 'error'>('loading');

  private readonly logsSignal = toSignal(
    this.contentService.getLogs().pipe(
      tap(() => this.loadState.set('loaded')),
      catchError(error => {
        console.error('[RQS Logs Archive] Falha ao carregar o arquivo:', error);
        this.loadState.set('error');
        this.setSsrStatus(503);
        return of(null);
      })
    ),
    { initialValue: null as any[] | null }
  );

  private readonly queryParamMapSignal = toSignal(
    this.route.queryParamMap,
    { initialValue: this.route.snapshot.queryParamMap }
  );

  private readonly pageParam = computed(() =>
    parseLogsArchivePageParam(
      this.queryParamMapSignal().get('page')
    )
  );

  private readonly allLogs = computed(() => {
    const logs = this.logsSignal();

    return logs === null
      ? null
      : prepareArchiveLogs(logs);
  });

  public readonly totalPages = computed(() => {
    const logs = this.allLogs();

    return logs === null
      ? 0
      : getLogsArchiveTotalPages(logs.length, this.pageSize);
  });

  public readonly currentPage = computed(() => {
    const parsed = this.pageParam();

    return parsed.index ?? 0;
  });

  public readonly archiveState = computed<ArchiveState>(() => {
    if (this.loadState() === 'error') {
      return 'error';
    }

    const logs = this.allLogs();

    if (logs === null || this.loadState() === 'loading') {
      return 'loading';
    }

    const parsed = this.pageParam();

    if (parsed.kind === 'invalid') {
      return 'not-found';
    }

    if (parsed.kind === 'redirect-root') {
      return 'redirect-root';
    }

    if (
      !isLogsArchivePageInRange(
        parsed.index,
        this.totalPages(),
        logs.length
      )
    ) {
      return 'not-found';
    }

    return logs.length === 0
      ? 'empty'
      : 'ready';
  });

  public readonly logsPaginated = computed(() => {
    const logs = this.allLogs();
    const state = this.archiveState();

    if (
      logs === null ||
      (state !== 'ready' && state !== 'empty')
    ) {
      return [];
    }

    return paginateArchiveLogs(
      logs,
      this.currentPage(),
      this.pageSize
    );
  });

  constructor() {
    effect(() => {
      const state = this.archiveState();
      const pageIndex = this.currentPage();

      if (state === 'error') {
        this.setSsrStatus(503);
        return;
      }

      if (state === 'not-found') {
        this.setSsrStatus(404);
        return;
      }

      if (state === 'redirect-root') {
        this.applyArchiveSeo(0);
        this.redirectPageZero();
        return;
      }

      if (state === 'ready' || state === 'empty') {
        this.applyArchiveSeo(pageIndex);
      }
    });

    effect(() => {
      this.translate.currentLang();
      const state = this.archiveState();

      if (
        state === 'ready' ||
        state === 'empty' ||
        state === 'redirect-root'
      ) {
        this.applyArchiveSeo(
          state === 'redirect-root'
            ? 0
            : this.currentPage()
        );
      }
    });

    effect(() => {
      this.currentPage();

      if (isPlatformBrowser(this.platformId)) {
        this.document.defaultView?.scrollTo({
          top: 0,
          behavior: 'auto'
        });
      }
    });
  }

  public previousQueryParams(): { page: number } | null {
    const page = this.currentPage();

    return page <= 1
      ? null
      : { page: page - 1 };
  }

  public nextQueryParams(): { page: number } {
    return { page: this.currentPage() + 1 };
  }

  getLogContent(log: any) {
    return this.translate.isPt()
      ? log.pt
      : log.en;
  }

  private applyArchiveSeo(pageIndex: number): void {
    const isPt = this.translate.isPt();
    const canonical = buildLogsArchiveCanonical(pageIndex);
    const pageNumber = pageIndex + 1;
    const baseTitle = isPt
      ? 'Arquivo de Logs'
      : 'Logs Archive';
    const title = pageIndex === 0
      ? baseTitle
      : isPt
        ? `${baseTitle} — Página ${pageNumber}`
        : `${baseTitle} — Page ${pageNumber}`;
    const description = isPt
      ? 'Os bastidores da narrativa transmídia e DevNotes da RQS.'
      : 'The behind-the-scenes of the transmedia narrative and RQS DevNotes.';

    this.document.documentElement.lang =
      isPt ? 'pt-BR' : 'en-US';

    this.seoService.updateMetaTags({
      title,
      description,
      type: 'website',
      url: canonical
    });

    this.seoService.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageIndex === 0
        ? (isPt
            ? 'Arquivo de Logs | RaQuel Synths'
            : 'Logs Archive | RaQuel Synths')
        : title,
      description: isPt
        ? 'Acesse os bastidores, diários de desenvolvimento e arquivos interceptados.'
        : 'Access behind-the-scenes, dev diaries, and intercepted archives.',
      url: canonical,
      inLanguage: isPt ? 'pt-BR' : 'en-US',
      publisher: {
        '@type': 'Organization',
        name: 'RaQuel Synths',
        logo: {
          '@type': 'ImageObject',
          url: 'https://raquelsynths.com/rqs-logo.webp'
        }
      }
    });
  }

  private redirectPageZero(): void {
    if (isPlatformServer(this.platformId) && this.responseInit) {
      const headers = new Headers(this.responseInit.headers);
      headers.set('Location', '/logs-archive');
      this.responseInit.status = 308;
      this.responseInit.headers = headers;
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      void this.router.navigate(
        ['/logs-archive'],
        { replaceUrl: true }
      );
    }
  }

  private setSsrStatus(statusCode: number): void {
    if (
      isPlatformServer(this.platformId) &&
      this.responseInit
    ) {
      this.responseInit.status = statusCode;
    }
  }
}
