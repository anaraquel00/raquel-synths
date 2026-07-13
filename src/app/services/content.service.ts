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

  // 🎵 1. DISCOGRAFIA
  getDiscography(): Observable<any[]> {
    const colRef = collection(this.firestore, 'discography');
    // Envolvemos a busca original em parênteses, e conectamos o pipe POR FORA
    return (collectionData(colRef, { idField: 'id' }) as Observable<any[]>).pipe(take(1));
  }

  getEpisodes(mode: 'broklin' | 'jonah'): Observable<LoreEpisode[]> {
    // --- 🕰️ MÁQUINA DO TEMPO (QA & TESTES DE UI) ---
     //const dataFutura = new Date('2030-01-01'); // Viajamos para 2030
     //where("releasedDate", "<=", dataFutura)

    // 1. DECIDE QUAL COLEÇÃO USAR BASEADO NO MODO
    const collectionName = mode === 'jonah' ? 'lore-jonah' : 'lore';

    // 2. CONECTA NA COLEÇÃO CERTA
    const colRef = collection(this.firestore, collectionName);
    const q = query(
      colRef,
      where('mode', '==', mode),
      orderBy('releaseDate', 'desc'),
      where('releaseDate', '<=', new Date().toISOString()), // Em prod, só traz se a data já passou!
      where('published', '==', true)
    );

    return collectionData(q, { idField: 'id' }).pipe(
      take(1), // 🔥 A TRAVA DO PAGESPEED: Ouve 1 vez, entrega os dados e desliga a rede.
      map(episodes => {
        // A MÁGICA ESTÁ AQUI: { numeric: true }
        return (episodes as LoreEpisode[]).sort((a, b) =>
          (a.id || '').localeCompare(b.id || '', undefined, { numeric: true, sensitivity: 'base' })
        );
      })
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
