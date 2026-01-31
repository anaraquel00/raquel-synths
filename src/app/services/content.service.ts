import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

// --- IMPORTAÇÃO DAS INTERFACES ---
import { LoreEpisode } from '../data/lore-data';
import { Product, Department } from '../data/store-data';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  getDiscography(): Observable<any[]> {
    const colRef = collection(this.firestore, 'discography');
    // Retorna o Observable para quem quiser ouvir (subscribe)
    return collectionData(colRef, { idField: 'id' }) as Observable<any[]>;
  }
 // 📚 CORREÇÃO FINAL: Mapeamento de Campos e Remoção do OrderBy quebrado
// 📚 VERSÃO LIMPA (Sem traduções, apenas Ordenação)
  getEpisodes(mode: 'broklin' | 'jonah'): Observable<LoreEpisode[]> {
    const colRef = collection(this.firestore, 'lore');

    // Query básica
    const q = query(
      colRef,
      where('mode', '==', mode),
      where('published', '==', true)
    );

    // Retorna os dados puros, apenas ordenando pelo ID no final
    return collectionData(q, { idField: 'id' }).pipe(
      map(episodes => {
        // Ordenação manual (alfabética: s1-e1, s1-e10, s1-e2...)
        // Dica: Para ordenar numericamente s1-e1, s1-e2, s1-e10 precisa de lógica extra,
        // mas por enquanto alfabética resolve se usar s1-e01, s1-e02.
        return episodes.sort((a, b) => a['id'].localeCompare(b['id'])) as LoreEpisode[];
      })
    );
  }

  // ✅ INJEÇÃO PURA: O Angular resolve a instância configurada no app.config.ts
  private firestore = inject(Firestore);
/*
   // 📚 1. LORE (Visual Novel)
  getEpisodes(mode: 'broklin' | 'jonah', lang: 'pt' | 'en'): Observable<LoreEpisode[]> {
    const colRef = collection(this.firestore, 'episodes');
    const q = query(
      colRef,
      where('mode', '==', mode),
      where('lang', '==', lang),
      where('published', '==', true),
      orderBy('id')
    );
    return collectionData(q, { idField: 'firebaseId' }) as Observable<LoreEpisode[]>;
  } */

  // 🛒 2. LOJA (Produtos)
  getProducts(): Observable<Product[]> {
    const colRef = collection(this.firestore, 'products');
    return collectionData(colRef, { idField: 'id' }) as Observable<Product[]>;
  }

  // 🏪 3. DEPARTAMENTOS
  getDepartments(): Observable<Department[]> {
    const colRef = collection(this.firestore, 'departments');
    return collectionData(colRef, { idField: 'id' }) as Observable<Department[]>;
  }

  // 📜 4. LOGS (Fofocas e Bastidores)
  getLogs(): Observable<any[]> {
    const colRef = collection(this.firestore, 'logs');
    // ⚠️ NOTA: O campo 'orderDate' no Firebase deve ser do tipo Timestamp
    const q = query(colRef, orderBy('orderDate', 'desc'));
    return collectionData(colRef, { idField: 'id' }) as Observable<any[]>;
  }
}
