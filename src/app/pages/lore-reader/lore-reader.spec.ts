import { PLATFORM_ID, RESPONSE_INIT, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoreEpisode } from '../../data/lore-data';
import { ContentService } from '../../services/content.service';
import { SeoService } from '../../services/seo.service';
import { TranslationService } from '../../services/translation.service';
import { LoreReaderComponent } from './lore-reader';

describe('LoreReaderComponent SSR states', () => {
  const episode: LoreEpisode = {
    id: 's1-e5',
    title: 'Episódio 5',
    title_en: 'Episode 5',
    category: 'Temporada 1',
    content: '<p>Conteúdo da história.</p>',
    content_en: '<p>Story content.</p>',
    description: 'Descrição.',
    description_en: 'Description.',
    image: '',
    mode: 'jonah',
    published: true,
    releaseDate: '2025-01-01'
  };
  const params = convertToParamMap({ mode: 'jonah', id: 's1-e5' });

  let fixture: ComponentFixture<LoreReaderComponent>;
  let contentService: jasmine.SpyObj<ContentService>;
  let responseInit: ResponseInit;

  beforeEach(async () => {
    const isPt = signal(true);
    contentService = jasmine.createSpyObj<ContentService>(
      'ContentService',
      ['getEpisodeByIdStrict', 'getEpisodes']
    );
    contentService.getEpisodes.and.returnValue(of([episode]));
    responseInit = { status: 200 };

    await TestBed.configureTestingModule({
      imports: [LoreReaderComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: RESPONSE_INIT, useValue: responseInit },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(params),
            snapshot: { paramMap: params }
          }
        },
        {
          provide: TranslationService,
          useValue: {
            isPt,
            currentLang: computed(() => isPt() ? 'pt' : 'en')
          }
        },
        {
          provide: SeoService,
          useValue: jasmine.createSpyObj<SeoService>(
            'SeoService',
            ['updateCanonical', 'updateMetaTags', 'setJsonLdGraph']
          )
        },
        { provide: ContentService, useValue: contentService }
      ]
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  function render(): LoreReaderComponent {
    fixture = TestBed.createComponent(LoreReaderComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('renders the primary article without loading the full collection on SSR', () => {
    contentService.getEpisodeByIdStrict.and.returnValue(of(episode));

    const component = render();

    expect(component.readerState()).toBe('LOADED');
    expect(fixture.nativeElement.textContent).toContain(episode.title);
    expect(contentService.getEpisodes).not.toHaveBeenCalled();
    expect(responseInit.status).toBe(200);
  });

  it('renders a distinct not-found state and returns 404 for a missing document', () => {
    contentService.getEpisodeByIdStrict.and.returnValue(of(null));

    const component = render();

    expect(component.readerState()).toBe('NOT_FOUND');
    expect(fixture.nativeElement.textContent).toContain('ARQUIVO NÃO ENCONTRADO');
    expect(fixture.nativeElement.textContent).not.toContain('AGUARDANDO SINAL DA MATRIX');
    expect(responseInit.status).toBe(404);
  });

  it('renders a distinct error state and returns 503 for an operational failure', () => {
    spyOn(console, 'error');
    contentService.getEpisodeByIdStrict.and.returnValue(
      throwError(() => new Error('upstream unavailable'))
    );

    const component = render();

    expect(component.readerState()).toBe('ERROR');
    expect(fixture.nativeElement.textContent).toContain('FALHA TEMPORÁRIA DE CONEXÃO');
    expect(fixture.nativeElement.textContent).not.toContain('AGUARDANDO SINAL DA MATRIX');
    expect(responseInit.status).toBe(503);
  });
});
