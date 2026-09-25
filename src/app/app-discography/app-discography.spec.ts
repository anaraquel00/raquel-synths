import { DiscographyComponent } from './app-discography';
import { Album } from '../models/album.model';

describe('DiscographyComponent conversion boundary', () => {
  const album = (id: string, faction: string, day: number): Album => ({
    id,
    faction,
    title: `Release ${id}`,
    type: 'Single',
    cover: `/cover-${id}.webp`,
    releaseDate: `2026-09-${String(day).padStart(2, '0')}`,
    descriptionPT: `<p>Contexto ${id}. Texto longo que não deve aparecer por inteiro.</p>`,
    descriptionEN: `<p>Context ${id}. Long text that must not appear in full.</p>`,
    soundcloud: true,
    spotify: 'spotify',
    embedLink: null,
    spotifyUrl: null,
    soundcloudUrl: null
  });

  const albums = [
    album('b8', 'broklin', 8),
    album('b6', 'broklin', 6),
    album('b5', 'broklin', 5),
    album('h4', 'hybrid', 4),
    album('b3', 'broklin', 3),
    album('b2', 'broklin', 2),
    album('b1', 'broklin', 1),
    album('j9', 'jonah', 9),
    album('j7', 'jonah', 7),
    album('j6', 'jonah', 6)
  ];

  function createComponent(url: string, isPt = true): any {
    const component = Object.create(DiscographyComponent.prototype) as any;
    component.router = { url };
    component.translate = { isPt: () => isPt };
    component.allAlbums = [...albums];
    component._limitToHome = 3;
    component.dedicatedReleaseLimit = 4;
    component._modeSignal = () => 'broklin';
    component.trackingService = jasmine.createSpyObj('TrackingService', ['trackCustomEvent']);
    component.seoService = jasmine.createSpyObj('SeoService', ['setJsonLdGraph']);
    return component;
  }

  it('keeps three current releases on Home and limits dedicated discography to four', () => {
    const home = createComponent('/');
    const dedicated = createComponent('/discografia');

    expect(home.featuredBroklin.map((item: Album) => item.id)).toEqual(['b8', 'b6', 'b5']);
    expect(dedicated.featuredBroklin.map((item: Album) => item.id)).toEqual(['b8', 'b6', 'b5', 'h4']);
  });

  it('keeps hybrid releases in each relevant faction selection', () => {
    const component = createComponent('/discografia');
    component._modeSignal = () => 'jonah';

    expect(component.featuredJonah.map((item: Album) => item.id)).toEqual(['j9', 'j7', 'j6', 'h4']);
  });

  it('builds /discografia schema from only the four visible releases', () => {
    const component = createComponent('/discografia');

    component.updateDiscographySchema();

    const graph = component.seoService.setJsonLdGraph.calls.mostRecent().args[0];
    const collection = graph.find((item: any) => item['@type'] === 'CollectionPage');
    expect(collection.mainEntity.numberOfItems).toBe(4);
    expect(collection.mainEntity.itemListElement.map((item: any) => item.item.name)).toEqual([
      'Release b8',
      'Release b6',
      'Release b5',
      'Release h4'
    ]);
    expect(graph.some((item: any) => item['@type'] === 'VideoObject')).toBeFalse();
  });

  it('tracks every dedicated conversion action through trackCustomEvent', () => {
    const component = createComponent('/discografia');
    const release = albums[1];

    component.trackSpotifyProfileClick();
    component.trackRadioClick();
    component.trackArchiveClick();
    component.trackAlbumClick(release);
    component.trackSoundcloudClick(release);

    expect(component.trackingService.trackCustomEvent).toHaveBeenCalledWith(
      'DISCOGRAPHY_SPOTIFY_PROFILE_CLICK',
      { target: 'rqs-mainframe' }
    );
    expect(component.trackingService.trackCustomEvent).toHaveBeenCalledWith(
      'DISCOGRAPHY_RADIO_CLICK',
      { target: 'rqs-cyberpunk-radio' }
    );
    expect(component.trackingService.trackCustomEvent).toHaveBeenCalledWith(
      'DISCOGRAPHY_ARCHIVE_CLICK',
      { target: 'musical-archives' }
    );
    expect(component.trackingService.trackCustomEvent).toHaveBeenCalledWith(
      'DISCOGRAPHY_RELEASE_CLICK',
      {
        release_id: 'b6',
        release_title: 'Release b6',
        service: 'spotify',
        faction: 'broklin'
      }
    );
    expect(component.trackingService.trackCustomEvent).toHaveBeenCalledWith(
      'DISCOGRAPHY_RELEASE_CLICK',
      jasmine.objectContaining({ release_id: 'b6', service: 'soundcloud' })
    );
  });

  it('tracks Home acquisition and release actions through the existing custom-event layer', () => {
    const component = createComponent('/');

    component.trackSpotifyProfileClick();
    component.trackRadioClick();
    component.trackAlbumClick(albums[1]);
    component.trackSoundcloudClick(albums[1]);

    expect(component.trackingService.trackCustomEvent).toHaveBeenCalledWith(
      'HOME_SPOTIFY_PROFILE_CLICK',
      { location: 'homepage', target: 'rqs-mainframe' }
    );
    expect(component.trackingService.trackCustomEvent).toHaveBeenCalledWith(
      'HOME_RADIO_CLICK',
      { location: 'homepage', target: 'rqs-cyberpunk-radio' }
    );
    expect(component.trackingService.trackCustomEvent).toHaveBeenCalledWith(
      'HOME_RELEASE_CLICK',
      jasmine.objectContaining({
        location: 'homepage',
        release_id: 'b6',
        service: 'spotify'
      })
    );
    expect(component.trackingService.trackCustomEvent).toHaveBeenCalledWith(
      'HOME_RELEASE_CLICK',
      jasmine.objectContaining({
        location: 'homepage',
        release_id: 'b6',
        service: 'soundcloud'
      })
    );
  });

  it('does not emit discography structured data from the Home teaser', () => {
    const component = createComponent('/');

    component.updateDiscographySchema();

    expect(component.seoService.setJsonLdGraph).not.toHaveBeenCalled();
  });
});
