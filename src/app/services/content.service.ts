import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, where, doc, docData, getDoc } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of, switchMap, take } from 'rxjs'; // 🔥 Importamos o 'take' AQUI

// --- IMPORTAÇÃO DAS INTERFACES ---
import { LoreEpisode } from '../data/lore-data';
import { Product, Department } from '../data/store-data';
import { isPlatformBrowser } from '@angular/common';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  // ⚡ A PEÇA QUE FALTA: Sem isso, nada do Firebase funciona!
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  currentMode!: string;
  globalSagasCache: LoreEpisode[] | null = null;

  // 🎵 1. DISCOGRAFIA
  getDiscography(): Observable<any[]> {
    const colRef = collection(this.firestore, 'discography');
    // Envolvemos a busca original em parênteses, e conectamos o pipe POR FORA
    return (collectionData(colRef, { idField: 'id' }) as Observable<any[]>).pipe(take(1));
  }

// 🗄️ CACHE EM MEMÓRIA PARA AS SAGAS JÁ PUBLICADAS
  private episodesCache: { [mode: string]: LoreEpisode[] } = {};

  getEpisodes(mode: 'broklin' | 'jonah'): Observable<LoreEpisode[]> {
    // 🚀 Se já temos os episódios deste modo salvos em RAM, entrega instantaneamente!
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

    return collectionData(q, { idField: 'id' }).pipe(
      take(1),
      map(episodes => {
        const sorted = (episodes as LoreEpisode[]).sort((a, b) =>
          (a.id || '').localeCompare(b.id || '', undefined, { numeric: true, sensitivity: 'base' })
        );

        // 💾 Salva no cache em memória antes de retornar
        this.episodesCache[mode] = sorted;
        return sorted;
      })
    );
  }

  getEpisodeById(mode: 'broklin' | 'jonah', id: string): Observable<LoreEpisode | null> {
    if (!id) return of(null);

    // 🚀 Se já temos o array carregado no cache, busca direto nele sem tocar na rede do Firebase!
    if (this.episodesCache[mode]) {
      const found = this.episodesCache[mode].find(ep => ep.id === id);
      if (found) {
        return of(found);
      }
    }

    // Fallback: Se o usuário entrou direto via link compartilhado (Deep Link)
    const collectionName = mode === 'jonah' ? 'lore-jonah' : 'lore';
    const docRef = doc(this.firestore, `${collectionName}/${id}`);

    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as LoreEpisode;
        }
        return null;
      }),
      catchError(err => {
        console.warn(`⚠️ Erro ao buscar episódio ${id} no Firestore:`, err);
        return of(null);
      })
    );
  }

  getGlobalSagas(mode: string, id: string): Observable<LoreEpisode[]> {
    if (this.globalSagasCache) {
    return of(this.globalSagasCache); // 🚀 Retorna instantaneamente da memória RAM se já foi buscado!
  }
    // --- 🕰️ MÁQUINA DO TEMPO (QA & TESTES DE UI) ---
    //const dataFutura = new Date('2030-01-01'); // Viajamos para 2030
    //where("releasedDate", "<=", dataFutura)
    // 1. Define o nome da coleção
    const collectionName = mode === 'hybrid' ? 'global-sagas' : 'lore';

    // 2. Conecta na coleção certa
    const colRef = collection(this.firestore, collectionName);

    // 🛡️ CORREÇÃO TÁTICA: Se for 'global-sagas', buscamos ordenado por data e publicados,
    // sem exigir obrigatoriamente um campo 'mode' que pode não existir no documento.
    const q = query(
      colRef,
      orderBy('releaseDate', 'desc'),
      where('releaseDate', '<=', new Date().toISOString()),
      where('published', '==', true)
    );

    return collectionData(q, { idField: 'id' }).pipe(
    take(1),
    map(episodes => {
      const sorted = (episodes as LoreEpisode[]).sort((a, b) =>
        (a.id || '').localeCompare(b.id || '', undefined, { numeric: true, sensitivity: 'base' })
      );
      this.globalSagasCache = sorted; // Salva no cache
      return sorted;
    })
  );
  }

  // 🌐 BUSCA UM EPISÓDIO ESPECÍFICO NA COLEÇÃO GLOBAL-SAGAS PELO ID
  getGlobalSagaById(id: string): Observable<LoreEpisode | null> {
  if (!id) return of(null);

  // Se já temos a saga no cache em memória, procura direto nele sem ir à rede!
  if (this.globalSagasCache) {
    const found = this.globalSagasCache.find((ep: { id: string; }) => ep.id === id);
    if (found) return of(found);
  }

  // Fallback se o usuário entrou direto pela URL compartilhada (Deep link)
  const docRef = doc(this.firestore, 'global-sagas', id);
  return from(getDoc(docRef)).pipe(
    map(docSnap => {
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as LoreEpisode;
      }
      return null;
    }),
    take(1)
  );
}

 // 🛒 2. LOJA (Produtos)
  getProducts(): Observable<Product[]> {
    const colRef = collection(this.firestore, 'products');
    return (collectionData(colRef, { idField: 'id' }) as Observable<Product[]>).pipe(take(1));
    }

  // 🏪 3. DEPARTAMENTOS
  getDepartments(): Observable<Department[]> {
    const colRef = collection(this.firestore, 'departments');
    return (collectionData(colRef, { idField: 'id' }) as Observable<Department[]>).pipe(take(1));
  }

// 📜 4. LOGS (Fofocas e Bastidores)
  getLogs(): Observable<any[]> {
    const colRef = collection(this.firestore, 'logs');

    const q = query(
      colRef,

      // --- 🛑 INTERRUPTOR 1: DATA DOS LOGS ---
      // [PRODUÇÃO]: Deixe DESCOMENTADO para o site real (filtra o futuro)
      // [TESTE QA]: Deixe COMENTADO para ver os logs do futuro no localhost
       where('date', '<=', new Date().toISOString()),

      orderBy('date', 'desc')
    );

    const firebaseData$ = collectionData(q, { idField: 'id' }) as Observable<any[]>;

    // ==========================================
    // --- 🛑 INTERRUPTOR 2: TRAVA DO SERVIDOR ---
    // ==========================================

    // 👇 [MODO TESTE QA / LOCALHOST]
    // Descomente a linha abaixo e comente a de Produção.
    // O Firebase vai ficar "aberto" e ignorar o cache, mostrando o log novo na hora!
     //return firebaseData$;

    // 👇 [MODO PRODUÇÃO / VERCEL]
    // Descomente a linha abaixo antes de fazer o Deploy (push).
    // O take(1) fecha a conexão e salva o servidor do erro de Timeout.
    return firebaseData$.pipe(take(1));
  }

  // 📜 4.1 LOG ESPECÍFICO (O Sniper)
  getLogById(id: string): Observable<any> {

    // Conecta direto no documento específico usando o ID da URL
    const docRef = doc(this.firestore, `logs/${id}`);

    // Puxa os dados e anexa o ID junto no objeto
   return (docData(docRef) as Observable<any>).pipe(take(1));
  }
}
