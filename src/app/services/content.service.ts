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
    //const dataFutura = new Date('2030-01-01'); // Viajamos para 2030
    //where("releasedDate", "<=", dataFutura)
    // 1. DECIDE QUAL COLEÇÃO USAR BASEADO NO MODO
    // Se for 'jonah', vai na 'lore-jonah'. Se for 'broklin', vai na 'lore' (ou 'lore-broklin' se você tiver separado também)
    const collectionName = mode === 'jonah' ? 'lore-jonah' : 'lore'; 
    
    // 2. CONECTA NA COLEÇÃO CERTA
    const colRef = collection(this.firestore, collectionName);
    const q = query(
      colRef,
      where('mode', '==', mode),
      orderBy('releaseDate', 'desc'), // Ordena do mais novo pro mais antigo 
      where('releaseDate', '<=', new Date().toISOString()), // 🔥 O PULO DO GATO: Só traz se a data já passou!
      where('published', '==', true),
                
    );

    return collectionData(q, { idField: 'id' }).pipe(
   map(episodes => {
    // A MÁGICA ESTÁ AQUI: { numeric: true }
    // Isso diz: "Compare 10 como maior que 2, por favor."
    return (episodes as LoreEpisode[]).sort((a, b) => 
      (a.id || '').localeCompare(b.id || '', undefined, { numeric: true, sensitivity: 'base' })
    );
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
