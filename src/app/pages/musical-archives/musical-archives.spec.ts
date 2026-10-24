import { of } from 'rxjs';
import { Album } from '../../models/album.model';
import {
  archivePageFromQuery,
  MusicalArchives,
  releasePageForId
} from './musical-archives';

describe('MusicalArchives complete catalog', () => {
  const album = (id: string, faction: string, day: number): Album => ({
    id,
    faction,
    title: id,
    type: 'Single',
    cover: `/cover-${id}.webp`,
    releaseDate: `2026-09-${String(day).padStart(2, '0')}`,
    soundcloud: null,
    spotify: undefined,
    embedLink: null,
    spotifyUrl: null,
    soundcloudUrl: null
  });

  it('locates a release page from its stable Firestore document id', () => {
    const releases =
      Array.from(
        { length: 60 },
        (_, index) => ({
          id:
            `release-${index}`,
          faction:
            'broklin',
          title:
            `Release ${index}`
        } as Album)
      );

    expect(
      releasePageForId(
        releases,
        'release-50',
        5
      )
    ).toBe(11);

    expect(
      releasePageForId(
        releases,
        'missing-release',
        5
      )
    ).toBeNull();
  });

  it('accepts only positive integer archive pages', () => {
    expect(archivePageFromQuery('1')).toBe(1);
    expect(archivePageFromQuery('12')).toBe(12);
    expect(archivePageFromQuery('0')).toBeNull();
    expect(archivePageFromQuery('-1')).toBeNull();
    expect(archivePageFromQuery('1.5')).toBeNull();
    expect(archivePageFromQuery('invalid')).toBeNull();
  });

  it('includes newest, older, and hybrid releases before pagination', () => {
    const data = [
      album('old-broklin', 'broklin', 1),
      album('hybrid', 'hybrid', 4),
      album('newest-broklin', 'broklin', 7),
      album('jonah-1', 'jonah', 6),
      album('jonah-2', 'jonah', 5),
      album('broklin-2', 'broklin', 3),
      album('broklin-3', 'broklin', 2)
    ];
    const component = Object.create(MusicalArchives.prototype) as any;
    component.contentService = { getDiscography: () => of(data) };
    component.translate = { isPt: () => true };
    component.seoService = jasmine.createSpyObj('SeoService', [
      'updateMetaTags',
      'updateCanonical',
      'setJsonLd'
    ]);
    component.pageSize = 5;
    component.currentPageBroklin = 1;
    component.currentPageJonah = 1;
    component.hasReleaseParam = false;
    component.invalidArchiveState = false;
    component.canonicalArchivePath = '/musical-archives';

    component.getArchives();

    expect(component.legacyReleases.map((item: Album) => item.id)).toEqual([
      'newest-broklin',
      'jonah-1',
      'jonah-2',
      'hybrid',
      'broklin-2',
      'broklin-3',
      'old-broklin'
    ]);
    expect(component.featuredBroklin.map((item: Album) => item.id)).toEqual([
      'newest-broklin',
      'hybrid',
      'broklin-2',
      'broklin-3',
      'old-broklin'
    ]);
    expect(component.featuredJonah.map((item: Album) => item.id)).toEqual([
      'jonah-1',
      'jonah-2',
      'hybrid'
    ]);
    expect(component.paginatedBroklin.length).toBe(5);
    expect(component.totalPagesBroklin).toBe(1);
    expect(component.seoService.updateCanonical)
      .toHaveBeenCalledOnceWith('/musical-archives');
  });

  it('returns SSR 404 for an archive page outside the available range', () => {
    const component = Object.create(MusicalArchives.prototype) as any;
    component.featuredBroklin = Array.from({ length: 5 }, (_, index) =>
      album(`broklin-${index}`, 'broklin', index + 1)
    );
    component.featuredJonah = [album('jonah-1', 'jonah', 1)];
    component.pageSize = 5;
    component.currentPageBroklin = 2;
    component.currentPageJonah = 1;
    component.hasReleaseParam = false;
    component.invalidArchiveState = false;
    component.canonicalArchivePath = '/musical-archives?broPage=2';
    component.responseInit = {};
    component.seoService = jasmine.createSpyObj('SeoService', ['updateCanonical']);

    component.finalizeArchiveRequest(null);

    expect(component.responseInit.status).toBe(404);
    expect(component.seoService.updateCanonical)
      .toHaveBeenCalledOnceWith('/musical-archives');
  });
});
