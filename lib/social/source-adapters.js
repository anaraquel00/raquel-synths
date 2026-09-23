import { createHash } from 'node:crypto';
import { documentData, getDocument, listDocuments } from './firestore.js';

const SITE = 'https://raquelsynths.com';
const COLLECTIONS = {
  system_log: ['logs'],
  saga_episode: ['lore', 'lore-jonah', 'global-sagas'],
  music_release: ['discography']
};

function dateMs(value) {
  if (typeof value !== 'string' || !value) return NaN;
  return Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00-03:00` : value);
}

function absoluteImage(value) {
  if (typeof value !== 'string' || !value) return undefined;
  try {
    const url = new URL(value, `${SITE}/`);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch { return undefined; }
}

function defaultSoundCloudUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      (host === 'soundcloud.com' || host.endsWith('.soundcloud.com')) ? url.href : undefined;
  } catch { return undefined; }
}

function plain(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, stable(value[key])])
  );
  return value;
}

function revision(document) {
  // Hash do documento completo: mudanças no corpo editorial invalidam a aprovação,
  // enquanto o package armazena apenas este digest.
  return createHash('sha256').update(JSON.stringify(stable(document.fields || {}))).digest('hex');
}

export function normalizeSource(sourceType, collection, document, language = 'pt-BR', now = Date.now()) {
  if (!COLLECTIONS[sourceType]?.includes(collection)) return null;
  if (!['pt-BR', 'en-US'].includes(language)) return null;
  const data = documentData(document);
  const id = data.id;
  const sourceId = `${collection}/${id}`;
  const base = {
    sourceType, sourceId, sourceUrl: `${SITE}/${sourceId}`,
    language, sourceRevision: revision(document)
  };

  if (sourceType === 'system_log') {
    if (id === 'system-archive' || data.published === false || !Number.isFinite(dateMs(data.date)) || dateMs(data.date) > now) return null;
    const locale = language === 'pt-BR' ? data.pt : data.en;
    const summary = plain(locale?.description || locale?.techContent || locale?.jonahComment);
    if (!plain(locale?.title) || !summary) return null;
    const canonicalUrl = `${SITE}/log-reader/${encodeURIComponent(id)}`;
    return { ...base, sourceUrl: canonicalUrl, canonicalUrl, title: plain(locale.title), summary: summary.slice(0, 280),
      primaryImage: absoluteImage(data.image), publishedAt: data.date, logDate: data.date,
      logType: typeof data.type === 'string' ? data.type : undefined };
  }

  if (sourceType === 'saga_episode') {
    if (data.published !== true || !Number.isFinite(dateMs(data.releaseDate)) || dateMs(data.releaseDate) > now) return null;
    const english = language === 'en-US';
    if (english && (!plain(data.title_en) || !plain(data.content_en))) return null;
    const title = plain(english ? data.title_en : data.title);
    const summary = plain(english ? data.description_en || data.content_en : data.description || data.content);
    if (!title || !summary) return null;
    const mode = collection === 'lore-jonah' ? 'jonah' : collection === 'lore' ? 'broklin' : 'hybrid';
    if (collection !== 'global-sagas' && data.mode !== mode) return null;
    const canonicalUrl = collection === 'global-sagas'
      ? `${SITE}/hybrid-reader/${encodeURIComponent(id)}`
      : `${SITE}/lore/${mode}/${encodeURIComponent(id)}`;
    const episode = /^s(\d+)-e(\d+)$/i.exec(id);
    return { ...base, sourceUrl: canonicalUrl, canonicalUrl, title, summary: summary.slice(0, 280),
      primaryImage: absoluteImage(data.image), publishedAt: data.releaseDate,
      arc: plain(english ? data.category_en || data.category : data.category),
      season: episode ? Number(episode[1]) : undefined,
      episode: episode ? Number(episode[2]) : undefined,
      team: mode };
  }

  if (!['Single', 'EP', 'Album'].includes(data.type) ||
      !plain(data.title) || !absoluteImage(data.cover) ||
      !Number.isFinite(dateMs(data.releaseDate)) || dateMs(data.releaseDate) > now) return null;
  // /play/:id sem service usa soundcloud (src/server.ts). Reproduzimos
  // a validação do ID e do host para não oferecer um CTA quebrado.
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(id)) return null;
  const soundcloudUrl = defaultSoundCloudUrl(data.soundcloud || data.soundCloudWebUrl);
  if (!soundcloudUrl) return null;
  const musicDeepLinkUrl = `${SITE}/play/${encodeURIComponent(id)}`;
  return { ...base, sourceUrl: `${SITE}/discografia`, canonicalUrl: `${SITE}/discografia`,
    title: plain(data.title), summary: plain(language === 'pt-BR' ? data.descriptionPT : data.descriptionEN || data.descriptionPT).slice(0, 280),
    primaryImage: absoluteImage(data.cover), publishedAt: data.releaseDate,
    releaseType: data.type, team: data.faction, artist: 'RaQuel Synths',
    soundcloudUrl,
    spotifyUrl: absoluteImage(data.spotify || data.spotifyUrl), musicDeepLinkUrl };
}

export async function listSources(sourceType, language) {
  if (!COLLECTIONS[sourceType]) throw new Error('INVALID_SOURCE_TYPE');
  const groups = await Promise.all(COLLECTIONS[sourceType].map(async collection =>
    (await listDocuments(collection)).map(document => normalizeSource(sourceType, collection, document, language)).filter(Boolean)
  ));
  return groups.flat().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function resolveSource(sourceType, sourceId, language) {
  const [collection, id, ...rest] = String(sourceId || '').split('/');
  if (rest.length || !COLLECTIONS[sourceType]?.includes(collection)) return null;
  const document = await getDocument(collection, id);
  return document ? normalizeSource(sourceType, collection, document, language) : null;
}
