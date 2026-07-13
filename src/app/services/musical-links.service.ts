import { inject, Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

export interface MusicalLinkData {
  spotifyUrl: any;
  spotify: any;
  id: string;
  title?: string; // Adicionado para dar suporte ao nome da track
  spotifyWebUrl: string;
  spotifyUriScheme: string;
  soundCloudWebUrl: string;
  soundCloudUriScheme: string;
  primaryService: 'spotify' | 'soundcloud';
}

@Injectable({
  providedIn: 'root'
})
export class MusicalLinksService {
  private firestore = inject(Firestore);

  /**
   * Busca os metadados do deep-link varrendo a discografia ou os links promocionais
   */
  getLinkData(id: string): Observable<MusicalLinkData | null> {
  console.log('📡 [FIREBASE] Iniciando varredura para o ID:', id);
  const docDiscographyRef = doc(this.firestore, `discography/${id}`);

  return from(getDoc(docDiscographyRef)).pipe(
    switchMap(docSnap => {
      if (docSnap.exists()) {
        console.log('🟩 [FIREBASE] Documento localizado na Discografia!');
        return of({ id: docSnap.id, ...docSnap.data() } as MusicalLinkData);
      }

      console.log('⚠️ [FIREBASE] Não encontrado na Discografia. Pulando para DEEPLINKS...');
      const docDeepLinkRef = doc(this.firestore, `deeplinks/${id}`);

      return from(getDoc(docDeepLinkRef)).pipe(
        map(deepSnap => {
          if (deepSnap.exists()) {
            console.log('🟩 [FIREBASE] Documento localizado em DEEPLINKS!', deepSnap.data());
            return { id: deepSnap.id, ...deepSnap.data() } as MusicalLinkData;
          }
          console.log('🟥 [FIREBASE] ID não encontrado em NENHUMA coleção.');
          return null;
        }),
        catchError((err) => {
          console.error('❌ [FIREBASE] Erro na coleção deeplinks:', err);
          return of(null);
        })
      );
    }),
    catchError((err) => {
      console.error('❌ [FIREBASE] Erro na coleção discography:', err);
      return of(null);
    })
  );
}
}
