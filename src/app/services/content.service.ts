import { Injectable, inject, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  query,
  where,
  orderBy,
  getDoc,
  getDocs,
  collectionData
} from '@angular/fire/firestore';
import { Observable, of, from } from 'rxjs';
import { map, catchError, take, tap, timeout } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { LoreEpisode } from '../data/lore-data';
import { Product, Department } from '../data/store-data';

interface FirestoreRestValue {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
  nullValue?: null;
  arrayValue?: {
    values?: FirestoreRestValue[];
  };
  mapValue?: {
    fields?: Record<string, FirestoreRestValue>;
  };
}

interface FirestoreRestDocument {
  name: string;
  fields?: Record<string, FirestoreRestValue>;
  createTime?: string;
  updateTime?: string;
}

interface FirestoreRestCollection {
  documents?: FirestoreRestDocument[];
}

interface FirestoreRunQueryResult {
  document?: FirestoreRestDocument;
}
@Injectable({
  providedIn: 'root'
})

export class ContentService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private transferState = inject(TransferState);

  // 🎭 DUAL MODE ENGINE (Restaurado para o Uplink Terminal e componentes visuais)
  public currentMode: 'broklin' | 'jonah' = 'broklin';

  private episodesCache: { [mode: string]: LoreEpisode[] } = {};
  private episodeCache = new Map<string, LoreEpisode | null>();
  private globalSagasCache: LoreEpisode[] | null = null;
  private homeContentCache = new Map<string, any[]>();

  // Relógio de release: nulo em produção; sobrescrevível apenas em QA isolado.
  private readonly HYBRID_PREVIEW_NOW: string | null = null;

  private getHybridNowIso(): string {
    return this.HYBRID_PREVIEW_NOW ?? new Date().toISOString();
  }

  private getHybridNowMs(): number {
    return this.HYBRID_PREVIEW_NOW ? new Date(this.HYBRID_PREVIEW_NOW).getTime() : Date.now();
  }

  private parseHybridReleaseDate(value: string): Date {
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00-03:00`)
      : new Date(value);
  }


  // 🎵 1. DISCOGRAFIA (One-Shot SSR)
  getDiscography(): Observable<any[]> {
    const url =
      'https://firestore.googleapis.com/v1/projects/' +
      'raquel-synths-platform/databases/(default)/documents/' +
      'discography?pageSize=300';

    return this.http.get<FirestoreRestCollection>(url).pipe(
      timeout(4000),
      map(response => (response.documents ?? []).map(restDoc => {
        const id = restDoc.name.split('/').pop() ?? '';
        const fields = restDoc.fields ?? {};

        return {
          id,
          ...Object.fromEntries(
            Object.entries(fields).map(([key, value]) => [
              key,
              this.parseFirestoreValue(value)
            ])
          )
        };
      })),
      catchError(err => {
        console.error('⚠️ [ContentService] Erro ao buscar discografia:', err);
        return of([]);
      })
    );
  }

  getLatestDiscography(
    faction: 'broklin' | 'jonah',
    resultLimit: number = 5
  ): Observable<any[]> {
    const url =
      'https://firestore.googleapis.com/v1/projects/' +
      'raquel-synths-platform/databases/(default)/documents:runQuery';
    const limit = Math.max(1, Math.floor(resultLimit));
    const cacheKey = `discography:${faction}:${limit}`;
    const transferKey = makeStateKey<any[]>(`rqs-home-${cacheKey}`);
    const cachedAlbums = this.homeContentCache.get(cacheKey);

    if (cachedAlbums) {
      return of(cachedAlbums);
    }

    if (this.transferState.hasKey(transferKey)) {
      const transferredAlbums = this.transferState.get(transferKey, []);
      this.transferState.remove(transferKey);
      this.homeContentCache.set(cacheKey, transferredAlbums);
      return of(transferredAlbums);
    }

    return this.http.post<FirestoreRunQueryResult[]>(url, {
      structuredQuery: {
        from: [{ collectionId: 'discography' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'faction' },
            op: 'IN',
            value: {
              arrayValue: {
                values: [
                  { stringValue: faction },
                  { stringValue: 'hybrid' }
                ]
              }
            }
          }
        },
        orderBy: [
          {
            field: { fieldPath: 'releaseDate' },
            direction: 'DESCENDING'
          }
        ],
        limit
      }
    }).pipe(
      timeout(4000),
      map(results => results.flatMap(result => {
        const restDoc = result.document;

        if (!restDoc) {
          return [];
        }

        const id = restDoc.name.split('/').pop() ?? '';
        return [this.mapFirestoreRestDocument(restDoc, id)];
      })),
      tap(albums => {
        this.homeContentCache.set(cacheKey, albums);

        if (isPlatformServer(this.platformId)) {
          this.transferState.set(transferKey, albums);
        }
      }),
      catchError(err => {
        console.error(
          `⚠️ [ContentService] Erro ao buscar discografia limitada (${faction}):`,
          err
        );
        return of([]);
      })
    );
  }

  // 📜 2. LEITOR DE EPISÓDIOS (Broklin / Jonah)
  getEpisodes(mode: 'broklin' | 'jonah'): Observable<LoreEpisode[]> {
    if (this.episodesCache[mode]) {
      return of(this.episodesCache[mode]);
    }

    const collectionName = mode === 'jonah' ? 'lore-jonah' : 'lore';
    const url =
      'https://firestore.googleapis.com/v1/projects/' +
      'raquel-synths-platform/databases/(default)/documents/' +
      `${collectionName}?pageSize=300`;

    return this.http.get<FirestoreRestCollection>(url).pipe(
      timeout(4000),
      map(response => {
        const episodes = (response.documents ?? [])
          .map(restDoc => {
            const id = restDoc.name.split('/').pop() ?? '';
            const fields = restDoc.fields ?? {};

            return {
              id,
              ...Object.fromEntries(
                Object.entries(fields).map(([key, value]) => [
                  key,
                  this.parseFirestoreValue(value)
                ])
              )
            } as LoreEpisode;
          })
          .filter(episode =>
            episode.mode === mode &&
            this.isEpisodePublic(episode)
          );

        const sorted = episodes.sort((a, b) =>
          (a.id || '').localeCompare(b.id || '', undefined, { numeric: true, sensitivity: 'base' })
        );

        this.episodesCache[mode] = sorted;
        return sorted;
      }),
      catchError(err => {
        console.error(`⚠️ [ContentService] Erro ao buscar episódios (${mode}):`, err);
        return of([]);
      })
    );
  }

  getEpisodeById(
    mode: 'broklin' | 'jonah',
    id: string
  ): Observable<LoreEpisode | null> {
    return this.readEpisodeById(mode, id).pipe(
      catchError(err => {
        console.warn(
          `⚠️ Erro ao buscar episódio ${id} no Firestore:`,
          err
        );

        return of(null);
      })
    );
  }

  getEpisodeByIdStrict(
    mode: 'broklin' | 'jonah',
    id: string
  ): Observable<LoreEpisode | null> {
    return this.readEpisodeById(mode, id);
  }

  private readEpisodeById(
    mode: 'broklin' | 'jonah',
    id: string
  ): Observable<LoreEpisode | null> {
    if (!id) {
      return of(null);
    }

    const cacheKey = `${mode}:${id}`;
    const transferKey = makeStateKey<LoreEpisode | null>(
      `rqs-lore-episode:${cacheKey}`
    );

    if (this.episodeCache.has(cacheKey)) {
      return of(this.episodeCache.get(cacheKey) ?? null);
    }

    if (this.transferState.hasKey(transferKey)) {
      const transferredEpisode = this.transferState.get(transferKey, null);
      this.transferState.remove(transferKey);
      this.episodeCache.set(cacheKey, transferredEpisode);
      return of(transferredEpisode);
    }

    if (this.episodesCache[mode]) {
      const found = this.episodesCache[mode].find(ep => ep.id === id);

      if (found) {
        this.episodeCache.set(cacheKey, found);
        return of(found);
      }
    }

    const collectionName = mode === 'jonah' ? 'lore-jonah' : 'lore';

    if (isPlatformServer(this.platformId)) {
      return this.getEpisodeByIdServer(collectionName, id).pipe(
        tap(episode => {
          this.episodeCache.set(cacheKey, episode);
          this.transferState.set(transferKey, episode);
        })
      );
    }

    const docRef = doc(this.firestore, `${collectionName}/${id}`);

    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) {
          return null;
        }

        return {
          id: snapshot.id,
          ...snapshot.data()
        } as LoreEpisode;
      }),
      tap(episode => this.episodeCache.set(cacheKey, episode))
    );
  }

private getEpisodeByIdServer(
  collectionName: string,
  id: string
): Observable<LoreEpisode | null> {

  const projectId = 'raquel-synths-platform';

  const safeCollection = encodeURIComponent(collectionName);
  const safeId = encodeURIComponent(id);

  const url =
    `https://firestore.googleapis.com/v1/projects/` +
    `${projectId}/databases/(default)/documents/` +
    `${safeCollection}/${safeId}`;

  return this.http.get<FirestoreRestDocument>(url).pipe(
    map(restDoc => {
      if (!restDoc?.fields) {
        return null;
      }

      return this.mapFirestoreRestDocument(restDoc, id);
    }),

    catchError(err => {
      if (err.status === 404) {
        return of(null);
      }

      console.error(
        `🔥 [SSR Firestore REST] ${collectionName}/${id}:`,
        err
      );

      throw err;
    })
  );
}
private mapFirestoreRestDocument(
  doc: FirestoreRestDocument,
  id: string
): LoreEpisode {

  const fields = doc.fields ?? {};

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(fields)) {
    result[key] = this.parseFirestoreValue(value);
  }

  return {
    id,
    ...result
  } as LoreEpisode;
}

private parseFirestoreValue(value: FirestoreRestValue): unknown {

  if ('stringValue' in value) {
    return value.stringValue;
  }

  if ('booleanValue' in value) {
    return value.booleanValue;
  }

  if ('integerValue' in value) {
    return Number(value.integerValue);
  }

  if ('doubleValue' in value) {
    return value.doubleValue;
  }

  if ('timestampValue' in value) {
    return value.timestampValue;
  }

  if ('nullValue' in value) {
    return null;
  }

  if ('arrayValue' in value) {
    return (value.arrayValue?.values ?? [])
      .map(item => this.parseFirestoreValue(item));
  }

  if ('mapValue' in value) {
    const nestedFields = value.mapValue?.fields ?? {};

    return Object.fromEntries(
      Object.entries(nestedFields)
        .map(([key, nestedValue]) => [
          key,
          this.parseFirestoreValue(nestedValue)
        ])
    );
  }

  return null;
}


  // 🌐 3. SAGAS GLOBAIS
  getGlobalSagas(mode: string = 'hybrid', id?: string): Observable<LoreEpisode[]> {
    if (this.globalSagasCache) {
      return of(this.globalSagasCache);
    }

    const collectionName = mode === 'hybrid' ? 'global-sagas' : 'lore';

    if (mode === 'hybrid' && isPlatformServer(this.platformId)) {
      const url = 'https://firestore.googleapis.com/v1/projects/raquel-synths-platform/databases/(default)/documents/global-sagas?pageSize=300';
      return this.http.get<FirestoreRestCollection>(url).pipe(
        timeout(4000),
        map(response => this.sortPublicGlobalSagas((response.documents ?? []).map(restDoc =>
          this.mapFirestoreRestDocument(restDoc, restDoc.name.split('/').pop() ?? '')
        ))),
        tap(episodes => { this.globalSagasCache = episodes; }),
        catchError(err => {
          console.error('⚠️ [ContentService] Erro ao buscar sagas globais via SSR:', err);
          return of([]);
        })
      );
    }
    const colRef = collection(this.firestore, collectionName);

    const q = query(
      colRef,
      orderBy('releaseDate', 'desc'),
      where('releaseDate', '<=', this.getHybridNowIso()),
      where('published', '==', true)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const episodes = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as LoreEpisode[];

        const sorted = this.sortPublicGlobalSagas(episodes);

        this.globalSagasCache = sorted;
        return sorted;
      }),
      catchError(err => {
        console.error(`⚠️ [ContentService] Erro ao buscar sagas globais:`, err);
        return of([]);
      })
    );
  }

  private sortPublicGlobalSagas(episodes: LoreEpisode[]): LoreEpisode[] {
    return episodes
      .filter(episode => this.isEpisodePublic(episode))
      .sort((a, b) =>
        (a.id || '').localeCompare(b.id || '', undefined, { numeric: true, sensitivity: 'base' })
      );
  }

getGlobalSagaById(
  id: string
): Observable<LoreEpisode | null> {

  if (!id) {
    return of(null);
  }

  if (this.globalSagasCache) {
    const found =
      this.globalSagasCache.find(ep => ep.id === id);

    if (found && this.isEpisodePublic(found)) {
      return of(found);
    }

    return of(null);
  }

  // SSR / VERCEL
  if (isPlatformServer(this.platformId)) {
    return this.getEpisodeByIdServer(
      'global-sagas',
      id
    ).pipe(
      map(ep => {
        if (!ep) {
          return null;
        }

        return this.isEpisodePublic(ep)
          ? ep
          : null;
      })
    );
  }

  // BROWSER
  const docRef =
    doc(this.firestore, 'global-sagas', id);

  return from(getDoc(docRef)).pipe(
    map(docSnap => {
      if (!docSnap.exists()) {
        return null;
      }

      const episode = {
        id: docSnap.id,
        ...docSnap.data()
      } as LoreEpisode;

      return this.isEpisodePublic(episode)
        ? episode
        : null;
    }),

    catchError(err => {
      console.warn(
        `⚠️ Erro ao buscar saga global ${id}:`,
        err
      );

      return of(null);
    })
  );
}

private isEpisodePublic(
  episode: LoreEpisode
): boolean {

  if (episode.published !== true) {
    return false;
  }

  if (!episode.releaseDate) {
    return false;
  }

  const releaseDate =
    this.parseHybridReleaseDate(episode.releaseDate);

  if (Number.isNaN(releaseDate.getTime())) {
    return false;
  }

  return releaseDate.getTime() <= this.getHybridNowMs();
}

  // 🛒 4. LOJA (Produtos)
  getProducts(): Observable<Product[]> {
    const colRef = collection(this.firestore, 'products');
    return from(getDocs(colRef)).pipe(
      map(snapshot => snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Product[]),
      catchError(() => of([]))
    );
  }

  // 🏪 5. DEPARTAMENTOS
  getDepartments(): Observable<Department[]> {
    const colRef = collection(this.firestore, 'departments');
    return from(getDocs(colRef)).pipe(
      map(snapshot => snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Department[]),
      catchError(() => of([]))
    );
  }

  getLatestLogs(resultLimit: number = 5): Observable<any[]> {
    const limit = Math.max(1, Math.floor(resultLimit));
    const cacheKey = `logs:${limit}`;
    const transferKey = makeStateKey<any[]>(`rqs-home-${cacheKey}`);
    const cachedLogs = this.homeContentCache.get(cacheKey);

    if (cachedLogs) {
      return of(cachedLogs);
    }

    if (this.transferState.hasKey(transferKey)) {
      const transferredLogs = this.transferState.get(transferKey, []);
      this.transferState.remove(transferKey);
      this.homeContentCache.set(cacheKey, transferredLogs);
      return of(transferredLogs);
    }

    const url =
      'https://firestore.googleapis.com/v1/projects/' +
      'raquel-synths-platform/databases/(default)/documents:runQuery';

    return this.http.post<FirestoreRunQueryResult[]>(url, {
      structuredQuery: {
        from: [{ collectionId: 'logs' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'date' },
            op: 'LESS_THAN_OR_EQUAL',
            value: { stringValue: new Date().toISOString() }
          }
        },
        orderBy: [
          {
            field: { fieldPath: 'date' },
            direction: 'DESCENDING'
          }
        ],
        limit
      }
    }).pipe(
      timeout(4000),
      map(results => results.flatMap(result => {
        const restDoc = result.document;

        if (!restDoc) {
          return [];
        }

        const id = restDoc.name.split('/').pop() ?? '';
        return [this.mapFirestoreRestDocument(restDoc, id)];
      })),
      tap(logs => {
        this.homeContentCache.set(cacheKey, logs);

        if (isPlatformServer(this.platformId)) {
          this.transferState.set(transferKey, logs);
        }
      }),
      catchError(err => {
        console.error('⚠️ [ContentService] Erro ao buscar logs limitados:', err);
        return of([]);
      })
    );
  }

  // 📜 6. LOGS (Fofocas e Bastidores)
  getLogs(): Observable<any[]> {
    const colRef = collection(this.firestore, 'logs');

    // ==========================================
    // --- 🛑 INTERRUPTOR 1: DATA DOS LOGS ---
    // ==========================================
    const q = query(
      colRef,

      // 👇 [MODO PRODUÇÃO / VERCEL]: Deixe DESCOMENTADO para o site real (filtra logs do futuro)
      where('date', '<=', new Date().toISOString()),

      // 👇 [MODO TESTE QA]: Para testar e agendar logs do futuro no localhost, comente a linha de cima e descomente a de baixo
      // where('date', '<=', '2030-01-01T00:00:00.000Z'),

      orderBy('date', 'desc')
    );

    // ==========================================
    // --- 🛑 INTERRUPTOR 2: MODO DE BUSCA ---
    // ==========================================
    // 👇 [MODO PRODUÇÃO / VERCEL - SSR SEGURO]:
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
      catchError(err => {
        console.error('⚠️ [ContentService] Erro ao buscar logs:', err);
        return of([]);
      })
    );

    // 👇 [MODO TESTE QA / LOCALHOST REALTIME]:
    /*
    return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
      take(1),
      catchError(() => of([]))
    );
    */
  }

  getLogById(id: string): Observable<any> {
    if (!id) return of(null);
    const docRef = doc(this.firestore, `logs/${id}`);

    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() };
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }
}
