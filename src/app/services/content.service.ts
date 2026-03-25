import { Injectable, PLATFORM_ID, inject, TransferState, makeStateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, query, orderBy, where } from '@angular/fire/firestore';
import { map, Observable, of, take, tap } from 'rxjs'; // 🔥 Adicionamos o 'tap'

// --- IMPORTAÇÃO DAS INTERFACES ---
import { LoreEpisode } from '../data/lore-data';
import { Product, Department } from '../data/store-data';

// 🔑 CHAVES DE TRANSFERÊNCIA DE ESTADO (Para o Angular "assar" os dados no HTML)
const DISCOGRAPHY_KEY = makeStateKey<any[]>('discography_state');
const PRODUCTS_KEY = makeStateKey<Product[]>('products_state');
const DEPARTMENTS_KEY = makeStateKey<Department[]>('departments_state');
const LOGS_KEY = makeStateKey<any[]>('logs_state');

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  private transferState = inject(TransferState); // ⚡ Injetamos a API de Cache do Angular
  currentMode!: string;

  // 🎵 1. DISCOGRAFIA
  getDiscography(): Observable<any[]> {
    // 1. O navegador já tem isso salvo no HTML? Se sim, devolve sem ir no Firebase!
    if (this.transferState.hasKey(DISCOGRAPHY_KEY)) {
      return of(this.transferState.get(DISCOGRAPHY_KEY,[]));
    }

    const colRef = collection(this.firestore, 'discography');
    return (collectionData(colRef, { idField: 'id' }) as Observable<any[]>).pipe(
      take(1),
      tap(data => this.transferState.set(DISCOGRAPHY_KEY, data)) // ⚡ Assa os dados no Prerender
    );
  }

  // 📖 SAGA LITERÁRIA (LORE)
  getEpisodes(mode: 'broklin' | 'jonah'): Observable<LoreEpisode[]> {
    // Criamos uma chave dinâmica baseada no modo escolhido
    const EPISODES_KEY = makeStateKey<LoreEpisode[]>(`episodes_${mode}_state`);

    if (this.transferState.hasKey(EPISODES_KEY)) {
      return of(this.transferState.get(EPISODES_KEY, [] as LoreEpisode[]));
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
        return (episodes as LoreEpisode[]).sort((a, b) => 
          (a.id || '').localeCompare(b.id || '', undefined, { numeric: true, sensitivity: 'base' })
        );
      }),
      tap(data => this.transferState.set(EPISODES_KEY, data)) // ⚡ Guarda a lore com 1000+ caracteres no HTML!
    );
  }

  // 🛒 2. LOJA (Produtos)
  getProducts(): Observable<Product[]> {
    if (this.transferState.hasKey(PRODUCTS_KEY)) {
      return of(this.transferState.get(PRODUCTS_KEY, [] as Product[]));
    }

    const colRef = collection(this.firestore, 'products');
    return (collectionData(colRef, { idField: 'id' }) as Observable<Product[]>).pipe(
      take(1),
      tap(data => this.transferState.set(PRODUCTS_KEY, data))
    );
  }

  // 🏪 3. DEPARTAMENTOS
  getDepartments(): Observable<Department[]> {
    if (this.transferState.hasKey(DEPARTMENTS_KEY)) {
      return of(this.transferState.get(DEPARTMENTS_KEY, [] as Department[]));
    }

    const colRef = collection(this.firestore, 'departments');
    return (collectionData(colRef, { idField: 'id' }) as Observable<Department[]>).pipe(
      take(1),
      tap(data => this.transferState.set(DEPARTMENTS_KEY, data))
    );
  }

  // 📜 4. LOGS (Fofocas e Bastidores)
  getLogs(): Observable<any[]> {
    if (this.transferState.hasKey(LOGS_KEY)) {
      return of(this.transferState.get(LOGS_KEY,[]));
    }

    const colRef = collection(this.firestore, 'logs');
    const q = query(colRef, orderBy('date', 'desc')); 
    return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(take(1));
  }
}