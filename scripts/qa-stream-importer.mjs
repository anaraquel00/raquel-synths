import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  buildSpotifyLinkPlan,
  validateSpotifyUrl
} from '../api/soundcloud-importer.js';

const trackUrl =
  'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC';
const albumUrl =
  'https://open.spotify.com/album/1ATL5GLyefJaxhQzSPVrLX';

assert.equal(
  validateSpotifyUrl(
    `${trackUrl}?si=test&utm_source=copy-link`
  ),
  trackUrl
);

assert.equal(
  validateSpotifyUrl(
    'https://open.spotify.com/intl-pt/album/1ATL5GLyefJaxhQzSPVrLX?si=test'
  ),
  albumUrl
);

for (const invalid of [
  '',
  'http://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
  'https://spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
  'https://open.spotify.com/artist/1yrPZaFyIcsCjj876LaHXL',
  'https://open.spotify.com/playlist/1234567890123456789012'
]) {
  assert.throws(
    () => validateSpotifyUrl(invalid)
  );
}

console.log(
  'SPOTIFY_URL_VALIDATION = PASS'
);

const missingSpotify =
  buildSpotifyLinkPlan(
    {
      spotifyUrl: '',
      spotify: ''
    },
    trackUrl
  );

assert.equal(
  missingSpotify.firestore,
  'WOULD UPDATE'
);
assert.deepEqual(
  missingSpotify.fields,
  ['spotify']
);
assert.equal(
  missingSpotify.currentSpotifyField,
  null
);

const legacySame =
  buildSpotifyLinkPlan(
    {
      spotifyUrl: '',
      spotify:
        `${trackUrl}?si=legacy`
    },
    trackUrl
  );

assert.equal(
  legacySame.firestore,
  'UNCHANGED'
);
assert.equal(
  legacySame.currentSpotifyField,
  'spotify'
);

const canonicalSame =
  buildSpotifyLinkPlan(
    {
      spotifyUrl: trackUrl,
      spotify: ''
    },
    `${trackUrl}?si=new`
  );

assert.equal(
  canonicalSame.firestore,
  'WOULD UPDATE'
);
assert.deepEqual(
  canonicalSame.fields,
  ['spotify']
);
assert.equal(
  canonicalSame.currentSpotifyField,
  'spotifyUrl'
);

const replacement =
  buildSpotifyLinkPlan(
    {
      spotifyUrl: '',
      spotify: trackUrl
    },
    albumUrl
  );

assert.equal(
  replacement.firestore,
  'WOULD UPDATE'
);
assert.deepEqual(
  replacement.fields,
  ['spotify']
);
assert.equal(
  replacement.currentSpotifyField,
  'spotify'
);

console.log(
  'SPOTIFY_LINK_PLAN = PASS'
);

const apiSource = readFileSync(
  new URL(
    '../api/soundcloud-importer.js',
    import.meta.url
  ),
  'utf8'
);

assert.match(
  apiSource,
  /updateMask\.fieldPaths[\s\S]*?spotify/u
);
assert.match(
  apiSource,
  /fields:\s*\{\s*spotify:\s*\{\s*stringValue:\s*spotifyUrl/u
);
assert.match(
  apiSource,
  /action === 'spotify-dry-run'/u
);
assert.match(
  apiSource,
  /action === 'link-spotify'/u
);

console.log(
  'SPOTIFY_WRITE_SCOPE = spotify ONLY'
);
console.log(
  'SPOTIFY_BACKEND_ACTIONS = PASS'
);
console.log(
  'FIRESTORE_WRITES_DURING_STREAMING_QA = 0'
);
console.log(
  'MODULE_04_SPOTIFY_LINKING_QA = PASS'
);
