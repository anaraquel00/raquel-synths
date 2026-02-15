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

  // ⚡ A PEÇA QUE FALTA: Sem isso, nada do Firebase funciona!
  private firestore = inject(Firestore);
  currentMode!: string;

  getDiscography(): Observable<any[]> {
    const colRef = collection(this.firestore, 'discography');
    return collectionData(colRef, { idField: 'id' }) as Observable<any[]>;
  }

  getEpisodes(mode: 'broklin' | 'jonah'): Observable<LoreEpisode[]> {
    const colRef = collection(this.firestore, 'lore');
    const q = query(
      colRef,
      where('mode', '==', mode),
      where('releaseDate', '<=', new Date().toISOString()), // 🔥 O PULO DO GATO: Só traz se a data já passou!
      where('published', '==', true), 
      orderBy('releaseDate', 'desc') // Ordena do mais novo pro mais antigo     
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(episodes => {
        // Ordena por ID (s1-e1, s1-e2...) para não vir bagunçado
        return (episodes as LoreEpisode[]).sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      })
    );
  }

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
    const q = query(colRef, orderBy('orderDate', 'desc'));
    return collectionData(colRef, { idField: 'id' }) as Observable<any[]>;
  }
}
