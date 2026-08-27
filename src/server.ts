import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express from 'express';
import { getApps, initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

import { environment } from './environments/environment';

const app = express();

const playRedirectFirebaseApp =
  getApps().find(firebaseApp => firebaseApp.name === 'rqs-play-redirect-server') ||
  initializeApp(environment.firebase, 'rqs-play-redirect-server');

const playRedirectFirestore = getFirestore(playRedirectFirebaseApp);

type MusicalLinkData = Record<string, unknown>;

type ContentService = 'spotify' | 'soundcloud' | 'youtube' | 'site';

type ProfileService =
  | ContentService
  | 'applemusic'
  | 'deezer'
  | 'tidal'
  | 'amazonmusic'
  | 'bandcamp'
  | 'beatport'
  | 'instagram'
  | 'tiktok'
  | 'bluesky'
  | 'x';

const contentServices = new Set<ContentService>([
  'spotify',
  'soundcloud',
  'youtube',
  'site'
]);

const profileServices = new Set<ProfileService>([
  ...contentServices,
  'applemusic',
  'deezer',
  'tidal',
  'amazonmusic',
  'bandcamp',
  'beatport',
  'instagram',
  'tiktok',
  'bluesky',
  'x'
]);

const stringField = (data: MusicalLinkData, ...keys: string[]): string => {
  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const loadMusicalLink = async (id: string): Promise<MusicalLinkData | null> => {
  const discographySnapshot =
    await getDoc(doc(playRedirectFirestore, 'discography', id));

  if (discographySnapshot.exists()) {
    return discographySnapshot.data();
  }

  const deeplinkSnapshot =
    await getDoc(doc(playRedirectFirestore, 'deeplinks', id));

  return deeplinkSnapshot.exists()
    ? deeplinkSnapshot.data()
    : null;
};

const resolveSiteUrl = (data: MusicalLinkData, id: string): string => {
  const configuredUrl = stringField(data, 'siteUrl', 'website');

  if (configuredUrl) {
    return configuredUrl;
  }

  const contentType = stringField(data, 'contentType') || 'lore';

  if (contentType === 'hybrid') {
    return `https://raquelsynths.com/hybrid-reader/${id}`;
  }

  if (contentType === 'log') {
    return `https://raquelsynths.com/log-reader/${id}`;
  }

  const mode = stringField(data, 'mode') === 'jonah' ? 'jonah' : 'broklin';
  return `https://raquelsynths.com/lore/${mode}/${id}`;
};

const resolveWebUrl = (
  data: MusicalLinkData,
  id: string,
  requestedService: string | undefined
): { service: ProfileService; url: string } | null => {
  const isProfile = data['linkType'] === 'profile';

  if (isProfile) {
    if (!requestedService || !profileServices.has(requestedService as ProfileService)) {
      return null;
    }

    const service = requestedService as ProfileService;
    const profileUrls: Record<ProfileService, string> = {
      spotify: stringField(data, 'spotify', 'spotifyUrl'),
      soundcloud: stringField(data, 'soundcloud', 'soundCloudWebUrl'),
      youtube: stringField(data, 'youtube', 'youtubeUrl'),
      applemusic: stringField(data, 'appleMusic', 'appleMusicUrl'),
      deezer: stringField(data, 'deezer'),
      tidal: stringField(data, 'tidal'),
      amazonmusic: stringField(data, 'amazonMusic'),
      bandcamp: stringField(data, 'bandcamp'),
      beatport: stringField(data, 'beatport'),
      instagram: stringField(data, 'instagram'),
      tiktok: stringField(data, 'tiktok'),
      bluesky: stringField(data, 'bluesky'),
      x: stringField(data, 'x'),
      site: stringField(data, 'website', 'siteUrl')
    };

    return profileUrls[service]
      ? { service, url: profileUrls[service] }
      : null;
  }

  const service = requestedService && contentServices.has(requestedService as ContentService)
    ? requestedService as ContentService
    : 'soundcloud';

  const contentUrls: Record<ContentService, string> = {
    spotify: stringField(data, 'spotify', 'spotifyUrl'),
    soundcloud: stringField(data, 'soundcloud', 'soundCloudWebUrl'),
    youtube: stringField(data, 'youtubeUrl', 'youtube'),
    site: resolveSiteUrl(data, id)
  };

  return contentUrls[service]
    ? { service, url: contentUrls[service] }
    : null;
};

const isAllowedDestination = (service: ProfileService, destination: string): boolean => {
  let url: URL;

  try {
    url = new URL(destination);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    return false;
  }

  const hostname = url.hostname.toLowerCase();
  const hostMatches = (...hosts: string[]) =>
    hosts.some(host => hostname === host || hostname.endsWith(`.${host}`));

  const allowedByService: Record<ProfileService, boolean> = {
    spotify: hostMatches('spotify.com'),
    soundcloud: hostMatches('soundcloud.com'),
    youtube: hostMatches('youtube.com', 'youtu.be'),
    applemusic: hostMatches('music.apple.com'),
    deezer: hostMatches('deezer.com'),
    tidal: hostMatches('tidal.com'),
    amazonmusic: /^music\.amazon\.[a-z.]+$/.test(hostname),
    bandcamp: hostMatches('bandcamp.com'),
    beatport: hostMatches('beatport.com'),
    instagram: hostMatches('instagram.com'),
    tiktok: hostMatches('tiktok.com'),
    bluesky: hostname === 'bsky.app',
    x: hostMatches('x.com', 'twitter.com'),
    site: hostMatches('raquelsynths.com')
  };

  return allowedByService[service];
};

const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'raquelsynths.com',
    'www.raquelsynths.com'
  ],

  trustProxyHeaders: [
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-for'
  ]
});

app.get('/play/:id', async (req, res, next) => {
  const id = req.params['id'];
  const requestedService =
    typeof req.query['service'] === 'string'
      ? req.query['service'].toLowerCase()
      : undefined;

  if (!id || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(id)) {
    res.status(404).end();
    return;
  }

  try {
    const data = await loadMusicalLink(id);

    if (!data) {
      res.status(404).end();
      return;
    }

    const destination = resolveWebUrl(data, id, requestedService);

    if (!destination || !isAllowedDestination(destination.service, destination.url)) {
      next();
      return;
    }

    res
      .status(302)
      .set('Location', destination.url)
      .set('Cache-Control', 'no-store')
      .end();

  } catch (error) {
    console.error('[RQS Play Redirect] Server resolution failed:', error);
    next();
  }
});

app.use(async (req, res, next) => {
  try {
    const response =
      await angularApp.handle(req);

    if (response) {
      if (response.headers.get('content-type')?.includes('text/html')) {
        res.vary('Accept-Language');
      }

      await writeResponseToNodeResponse(
        response,
        res
      );

      return;
    }

    next();

  } catch (error) {
    console.error(
      '🔥 [RQS Angular SSR Error]:',
      error
    );

    next(error);
  }
});

export const reqHandler =
  createNodeRequestHandler(app);
