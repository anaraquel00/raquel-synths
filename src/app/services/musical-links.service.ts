import { inject, Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { collection, getDocs, query, orderBy, where } from '@angular/fire/firestore';
import { signal } from '@angular/core';
export interface MusicalLinkData {
  id: string;
  title: string;

  // PERFIS / STREAMING
  spotify?: string;
  spotifyUrl?: string;
  spotifyUriScheme?: string;

  soundcloud?: string;
  soundCloudWebUrl?: string;
  soundCloudUriScheme?: string;

  youtube?: string;
  youtubeUrl?: string;

  appleMusic?: string;
  appleMusicUrl?: string;

  deezer?: string;
  tidal?: string;
  amazonMusic?: string;
  bandcamp?: string;
  beatport?: string;

  // REDES SOCIAIS
  instagram?: string;
  tiktok?: string;
  bluesky?: string;
  x?: string;

  // SITE
  website?: string;
  siteUrl?: string;

  // METADADOS
  artist?: string;
  coverUrl?: string;

  primaryService?:
    | 'spotify'
    | 'soundcloud'
    | 'youtube'
    | 'applemusic'
    | 'deezer'
    | 'tidal'
    | 'amazonmusic'
    | 'bandcamp'
    | 'beatport';

  isFeatured?: boolean;
  order?: number;
  releaseDate?: string;
  linkType?: 'content' | 'profile';
}

@Injectable({
  providedIn: 'root'
})
export class MusicalLinksService {
  private firestore = inject(Firestore);
  private bioCache = signal<MusicalLinkData[] | null>(null);

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
getAllBioLinks(): Observable<MusicalLinkData[]> {
  const deeplinksRef = collection(this.firestore, 'deeplinks');
  // Ordena por data de lançamento ou ordem predefinida
  const q = query(deeplinksRef, orderBy('order', 'asc'));

  return from(getDocs(q)).pipe(
    map(snapshot => {
      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as MusicalLinkData));
    }),
    catchError(err => {
      console.error('❌ [FIREBASE] Erro ao carregar coleção da Bio:', err);
      return of([]);
    })
  );
}

}
