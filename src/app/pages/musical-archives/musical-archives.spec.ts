import { of } from 'rxjs';
import { Album } from '../../models/album.model';
import { MusicalArchives } from './musical-archives';

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
    component.seoService = jasmine.createSpyObj('SeoService', ['updateMetaTags', 'setJsonLd']);
    component.pageSize = 5;
    component.currentPageBroklin = 1;
    component.currentPageJonah = 1;

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
  });
});
