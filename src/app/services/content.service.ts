import { Injectable, inject, PLATFORM_ID } from '@angular/core';
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
import { map, catchError, take } from 'rxjs/operators';
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
@Injectable({
  providedIn: 'root'
})

export class ContentService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  // 🎭 DUAL MODE ENGINE (Restaurado para o Uplink Terminal e componentes visuais)
  public currentMode: 'broklin' | 'jonah' = 'broklin';

  private episodesCache: { [mode: string]: LoreEpisode[] } = {};
  private globalSagasCache: LoreEpisode[] | null = null;


  // 🎵 1. DISCOGRAFIA (One-Shot SSR)
  getDiscography(): Observable<any[]> {
    const colRef = collection(this.firestore, 'discography');
    return from(getDocs(colRef)).pipe(
      map(snapshot => snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))),
      catchError(err => {
        console.error('⚠️ [ContentService] Erro ao buscar discografia:', err);
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
    const colRef = collection(this.firestore, collectionName);

    const q = query(
      colRef,
      where('mode', '==', mode),
      orderBy('releaseDate', 'desc'),
      where('releaseDate', '<=', new Date().toISOString()),
      where('published', '==', true)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const episodes = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as LoreEpisode[];

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

  if (!id) {
    return of(null);
  }

  if (this.episodesCache[mode]) {
    const found = this.episodesCache[mode].find(ep => ep.id === id);

    if (found) {
      return of(found);
    }
  }

  const collectionName =
    mode === 'jonah' ? 'lore-jonah' : 'lore';

  // SSR / PRERENDER
  if (isPlatformServer(this.platformId)) {
    return this.getEpisodeByIdServer(collectionName, id);
  }

  // BROWSER
  const docRef = doc(
    this.firestore,
    `${collectionName}/${id}`
  );

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
    catchError(err => {
      console.warn(
        `⚠️ Erro ao buscar episódio ${id} no Firestore:`,
        err
      );

      return of(null);
    })
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

      return of(null);
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
    const colRef = collection(this.firestore, collectionName);

    const q = query(
      colRef,
      orderBy('releaseDate', 'desc'),
      where('releaseDate', '<=', new Date().toISOString()),
      where('published', '==', true)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const episodes = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as LoreEpisode[];

        const sorted = episodes.sort((a, b) =>
          (a.id || '').localeCompare(b.id || '', undefined, { numeric: true, sensitivity: 'base' })
        );

        this.globalSagasCache = sorted;
        return sorted;
      }),
      catchError(err => {
        console.error(`⚠️ [ContentService] Erro ao buscar sagas globais:`, err);
        return of([]);
      })
    );
  }

  getGlobalSagaById(id: string): Observable<LoreEpisode | null> {
    if (!id) return of(null);

    if (this.globalSagasCache) {
      const found = this.globalSagasCache.find((ep: { id: string }) => ep.id === id);
      if (found) return of(found);
    }

    const docRef = doc(this.firestore, 'global-sagas', id);

    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as LoreEpisode;
        }
        return null;
      }),
      catchError(err => {
        console.warn(`⚠️ Erro ao buscar saga global ${id}:`, err);
        return of(null);
      })
    );
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
