import { Meta } from '@angular/platform-browser';
import { PLATFORM_ID, RESPONSE_INIT, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SeoService } from '../../services/seo.service';
import { TranslationService } from '../../services/translation.service';
import { LogReaderComponent } from './log-reader';

describe('LogReaderComponent System Log publication gate', () => {
  const id = 'future-log';
  const logImage =
    'https://firebasestorage.googleapis.com/v0/b/raquel-synths-platform.firebasestorage.app/o/log-images%2Fqa-log.webp?alt=media';
  const endpoint =
    'https://firestore.googleapis.com/v1/projects/' +
    `raquel-synths-platform/databases/(default)/documents/logs/${id}`;
  const params = convertToParamMap({ id });

  let fixture: ComponentFixture<LogReaderComponent>;
  let http: HttpTestingController;
  let responseInit: ResponseInit;

  beforeEach(async () => {
    const isPt = signal(true);
    responseInit = { status: 200 };

    await TestBed.configureTestingModule({
      imports: [LogReaderComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: RESPONSE_INIT, useValue: responseInit },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(params),
            snapshot: { paramMap: params }
          }
        },
        { provide: TranslationService, useValue: { isPt } },
        {
          provide: SeoService,
          useValue: jasmine.createSpyObj<SeoService>(
            'SeoService',
            ['updateCanonical', 'updateMetaTags', 'setJsonLd']
          )
        },
        {
          provide: Meta,
          useValue: jasmine.createSpyObj<Meta>('Meta', ['updateTag'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogReaderComponent);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  const firestoreLog = (date: string, published?: boolean) => ({
    fields: {
      date: { stringValue: date },
      image: { stringValue: logImage },
      ...(published === undefined
        ? {}
        : { published: { booleanValue: published } }),
      pt: {
        mapValue: {
          fields: {
            title: { stringValue: 'CONTEÚDO FUTURO SIGILOSO' },
            description: { stringValue: 'Não deve vazar.' },
            techContent: { stringValue: '' },
            jonahComment: { stringValue: '' }
          }
        }
      },
      en: { mapValue: { fields: {} } }
    }
  });

  it('retorna 404 e não expõe o corpo quando a URL futura é conhecida', async () => {
    fixture.detectChanges();
    http.expectOne(endpoint).flush(firestoreLog('2999-01-01', true));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(responseInit.status).toBe(404);
    expect(fixture.nativeElement.textContent).toContain('LOG_NÃO_ENCONTRADO');
    expect(fixture.nativeElement.textContent).not.toContain('CONTEÚDO FUTURO SIGILOSO');
  });

  it('mantém um Log legado lançado acessível no leitor SSR', async () => {
    fixture.detectChanges();
    http.expectOne(endpoint).flush(firestoreLog('2025-01-01'));
    await fixture.whenStable();
    fixture.detectChanges();

    const seo =
      TestBed.inject(SeoService) as jasmine.SpyObj<SeoService>;

    expect(responseInit.status).toBe(200);
    expect(fixture.nativeElement.textContent).toContain('CONTEÚDO FUTURO SIGILOSO');
    expect(fixture.nativeElement.textContent).toContain('JAN 01, 2025');

    expect(seo.updateMetaTags).toHaveBeenCalledWith(
      jasmine.objectContaining({
        image: logImage,
        type: 'article',
        url:
          `https://raquelsynths.com/log-reader/${id}`
      })
    );

    expect(seo.setJsonLd).toHaveBeenCalledWith(
      jasmine.objectContaining({
        image: [logImage]
      })
    );
  });
});
