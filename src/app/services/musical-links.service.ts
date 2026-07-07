import { inject, Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MusicalLinkData {
  id: string;
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
  // Injeção do SDK do Firestore configurado na aplicação
  private firestore = inject(Firestore);

  /**
   * Busca os metadados do deep-link pelo ID do documento no chassi do Firestore
   */
  getLinkData(id: string): Observable<MusicalLinkData | null> {
    const docRef = doc(this.firestore, `discography/${id}`);

    // Convertendo a Promise nativa do Firebase em um Observable RxJS padrão
    return from(getDoc(docRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as MusicalLinkData;
        }
        return null;
      })
    );
  }
}
