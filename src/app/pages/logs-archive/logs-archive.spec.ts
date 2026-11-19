import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID, RESPONSE_INIT, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ContentService } from '../../services/content.service';
import { SeoService } from '../../services/seo.service';
import { TranslationService } from '../../services/translation.service';
import { LogsArchiveComponent } from './logs-archive';

describe('LogsArchiveComponent SEO and status policy', () => {
  let fixture: ComponentFixture<LogsArchiveComponent>;
  let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let seo: jasmine.SpyObj<SeoService>;
  let router: jasmine.SpyObj<Router>;
  let responseInit: ResponseInit;

  const publishedLogs = Array.from({ length: 44 }, (_, index) => ({
    id: `log-${index + 1}`,
    date: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    pt: {
      title: `Log ${index + 1}`,
      description: 'Descrição'
    },
    en: {
      title: `Log ${index + 1}`,
      description: 'Description'
    }
  }));

  async function configure(
    rawPage: string | null,
    logsSource: Observable<any[]> = of(publishedLogs)
  ): Promise<void> {
    queryParamMap$ = new BehaviorSubject(
      convertToParamMap(
        rawPage === null
          ? {}
          : { page: rawPage }
      )
    );
    seo = jasmine.createSpyObj<SeoService>(
      'SeoService',
      ['updateMetaTags', 'setJsonLd']
    );
    router = jasmine.createSpyObj<Router>(
      'Router',
      ['navigate']
    );
    responseInit = {};

    await TestBed.configureTestingModule({
      imports: [LogsArchiveComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: DOCUMENT, useValue: document },
        {
          provide: ContentService,
          useValue: { getLogs: () => logsSource }
        },
        {
          provide: TranslationService,
          useValue: {
            currentLang: signal<'pt' | 'en'>('pt'),
            isPt: () => true
          }
        },
        { provide: SeoService, useValue: seo },
        { provide: Router, useValue: router },
        { provide: RESPONSE_INIT, useValue: responseInit },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap$.asObservable(),
            snapshot: {
              queryParamMap: queryParamMap$.value
            }
          }
        }
      ]
    })
      .overrideComponent(LogsArchiveComponent, {
        set: {
          imports: [],
          template: ''
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(LogsArchiveComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  it('emits page=1 canonical on SSR', async () => {
    await configure('1');

    expect(responseInit.status).toBeUndefined();
    expect(seo.updateMetaTags).toHaveBeenCalled();

    const urls = seo.updateMetaTags.calls.allArgs()
      .map(([config]) => config.url);

    expect(urls).toContain(
      'https://raquelsynths.com/logs-archive?page=1'
    );
  });

  it('updates canonical when the page changes without recreating the component', async () => {
    await configure('1');

    queryParamMap$.next(convertToParamMap({ page: '2' }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const urls = seo.updateMetaTags.calls.allArgs()
      .map(([config]) => config.url);

    expect(urls.at(-1)).toBe(
      'https://raquelsynths.com/logs-archive?page=2'
    );
  });

  it('returns SSR 404 for an out-of-range page instead of a soft 404', async () => {
    await configure('999');

    expect(responseInit.status).toBe(404);
    expect(fixture.componentInstance.archiveState())
      .toBe('not-found');
  });

  it('returns SSR 404 for malformed page params', async () => {
    await configure('abc');

    expect(responseInit.status).toBe(404);
  });

  it('normalizes page=0 with a permanent SSR redirect', async () => {
    await configure('0');

    expect(responseInit.status).toBe(308);
    expect(new Headers(responseInit.headers).get('Location'))
      .toBe('/logs-archive');
  });

  it('returns SSR 503 when the archive query fails', async () => {
    spyOn(console, 'error');
    await configure(
      null,
      throwError(() => new Error('Firestore unavailable'))
    );

    expect(responseInit.status).toBe(503);
    expect(fixture.componentInstance.archiveState())
      .toBe('error');
  });

  it('distinguishes a genuinely empty archive from an operational error', async () => {
    await configure(null, of([]));

    expect(responseInit.status).toBeUndefined();
    expect(fixture.componentInstance.archiveState())
      .toBe('empty');
  });
});
