import { PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { Firestore } from '@angular/fire/firestore';
import { LoreEpisode } from '../data/lore-data';
import { ContentService } from './content.service';

describe('ContentService lore episode transfer state', () => {
  const endpoint =
    'https://firestore.googleapis.com/v1/projects/' +
    'raquel-synths-platform/databases/(default)/documents/lore-jonah/s1-e5';
  const transferKey = makeStateKey<LoreEpisode | null>(
    'rqs-lore-episode:jonah:s1-e5'
  );
  const episode: LoreEpisode = {
    id: 's1-e5',
    title: 'Episódio 5',
    title_en: 'Episode 5',
    category: 'Temporada 1',
    content: '<p>Conteúdo.</p>',
    content_en: '<p>Content.</p>',
    description: 'Descrição.',
    description_en: 'Description.',
    image: '',
    mode: 'jonah',
    published: true,
    releaseDate: '2025-01-01'
  };

  function configure(platformId: 'server' | 'browser'): void {
    TestBed.configureTestingModule({
      providers: [
        ContentService,
        TransferState,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: Firestore, useValue: {} }
      ]
    });
  }

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.resetTestingModule();
  });

  it('stores a resolved SSR episode for synchronous browser hydration', () => {
    configure('server');
    const service = TestBed.inject(ContentService);
    const transferState = TestBed.inject(TransferState);
    let result: LoreEpisode | null | undefined;

    service
      .getEpisodeByIdStrict('jonah', 's1-e5')
      .subscribe(episodeResult => result = episodeResult);

    TestBed.inject(HttpTestingController).expectOne(endpoint).flush({
      name: 'projects/raquel-synths-platform/databases/(default)/documents/lore-jonah/s1-e5',
      fields: {
        title: { stringValue: episode.title },
        title_en: { stringValue: episode.title_en },
        category: { stringValue: episode.category },
        content: { stringValue: episode.content },
        content_en: { stringValue: episode.content_en },
        description: { stringValue: episode.description },
        description_en: { stringValue: episode.description_en },
        image: { stringValue: episode.image },
        mode: { stringValue: episode.mode },
        published: { booleanValue: true },
        releaseDate: { stringValue: episode.releaseDate }
      }
    });

    expect(result).toEqual(episode);
    expect(transferState.get(transferKey, null)).toEqual(episode);
  });

  it('consumes a transferred episode synchronously without a browser request', () => {
    configure('browser');
    const transferState = TestBed.inject(TransferState);
    transferState.set(transferKey, episode);
    const service = TestBed.inject(ContentService);
    let result: LoreEpisode | null | undefined;

    service
      .getEpisodeByIdStrict('jonah', 's1-e5')
      .subscribe(episodeResult => result = episodeResult);

    expect(result).toEqual(episode);
    expect(transferState.hasKey(transferKey)).toBeFalse();
    TestBed.inject(HttpTestingController).expectNone(endpoint);
  });

  it('transfers a genuine SSR 404 as a not-found result', () => {
    configure('server');
    const service = TestBed.inject(ContentService);
    const transferState = TestBed.inject(TransferState);
    let result: LoreEpisode | null | undefined;

    service
      .getEpisodeByIdStrict('jonah', 's1-e5')
      .subscribe(episodeResult => result = episodeResult);

    TestBed.inject(HttpTestingController).expectOne(endpoint).flush(
      { error: 'not found' },
      { status: 404, statusText: 'Not Found' }
    );

    expect(result).toBeNull();
    expect(transferState.hasKey(transferKey)).toBeTrue();
    expect(transferState.get(transferKey, episode)).toBeNull();
  });

  it('propagates operational SSR failures without storing a false not-found result', () => {
    configure('server');
    const service = TestBed.inject(ContentService);
    const transferState = TestBed.inject(TransferState);
    const consoleError = spyOn(console, 'error');
    let status: number | undefined;

    service
      .getEpisodeByIdStrict('jonah', 's1-e5')
      .subscribe({ error: err => status = err.status });

    TestBed.inject(HttpTestingController).expectOne(endpoint).flush(
      { error: 'unavailable' },
      { status: 503, statusText: 'Service Unavailable' }
    );

    expect(status).toBe(503);
    expect(transferState.hasKey(transferKey)).toBeFalse();
    expect(consoleError).toHaveBeenCalled();
  });

  it('preserves the tolerant prefetch contract for existing callers', () => {
    configure('server');
    const service = TestBed.inject(ContentService);
    spyOn(console, 'error');
    const consoleWarn = spyOn(console, 'warn');
    let result: LoreEpisode | null | undefined;

    service
      .getEpisodeById('jonah', 's1-e5')
      .subscribe(episodeResult => result = episodeResult);

    TestBed.inject(HttpTestingController).expectOne(endpoint).flush(
      { error: 'unavailable' },
      { status: 503, statusText: 'Service Unavailable' }
    );

    expect(result).toBeNull();
    expect(consoleWarn).toHaveBeenCalled();
  });
});

describe('ContentService global saga publication gate', () => {
  const collectionEndpoint =
    'https://firestore.googleapis.com/v1/projects/' +
    'raquel-synths-platform/databases/(default)/documents/global-sagas?pageSize=300';
  const documentEndpoint = (id: string): string =>
    'https://firestore.googleapis.com/v1/projects/' +
    `raquel-synths-platform/databases/(default)/documents/global-sagas/${id}`;

  const firestoreEpisode = (id: string, releaseDate: string) => ({
    name:
      'projects/raquel-synths-platform/databases/(default)/documents/' +
      `global-sagas/${id}`,
    fields: {
      title: { stringValue: `Episode ${id}` },
      category: { stringValue: 'Season 2' },
      description: { stringValue: 'Canonical episode.' },
      content: { stringValue: '<p>Canonical content.</p>' },
      image: { stringValue: 'https://raquelsynths.com/episode.jpg' },
      mode: { stringValue: 'hybrid' },
      published: { booleanValue: true },
      releaseDate: { stringValue: releaseDate }
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContentService,
        TransferState,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: Firestore, useValue: {} }
      ]
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.resetTestingModule();
  });

  function fixPublicationClock(service: ContentService): void {
    (service as unknown as { HYBRID_PREVIEW_NOW: string | null })
      .HYBRID_PREVIEW_NOW = '2026-09-30T12:00:00-03:00';
  }

  it('bloqueia episódio futuro aprovado na listagem SSR e libera episódio lançado', () => {
    const service = TestBed.inject(ContentService);
    fixPublicationClock(service);
    let result: LoreEpisode[] | undefined;

    service.getGlobalSagas().subscribe(episodes => result = episodes);

    TestBed.inject(HttpTestingController).expectOne(collectionEndpoint).flush({
      documents: [
        firestoreEpisode('s2-e1', '2027-01-10'),
        firestoreEpisode('s1-e10', '2026-09-01')
      ]
    });

    expect(result?.map(episode => episode.id)).toEqual(['s1-e10']);
  });

  it('bloqueia acesso direto SSR antes da releaseDate e libera após o gate', () => {
    const service = TestBed.inject(ContentService);
    fixPublicationClock(service);
    let futureResult: LoreEpisode | null | undefined;
    let releasedResult: LoreEpisode | null | undefined;

    service.getGlobalSagaById('s2-e1').subscribe(episode => futureResult = episode);
    TestBed.inject(HttpTestingController)
      .expectOne(documentEndpoint('s2-e1'))
      .flush(firestoreEpisode('s2-e1', '2027-01-10'));

    service.getGlobalSagaById('s1-e10').subscribe(episode => releasedResult = episode);
    TestBed.inject(HttpTestingController)
      .expectOne(documentEndpoint('s1-e10'))
      .flush(firestoreEpisode('s1-e10', '2026-09-01'));

    expect(futureResult).toBeNull();
    expect(releasedResult?.id).toBe('s1-e10');
  });
});
