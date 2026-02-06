// src/app/models/album.model.ts

export interface Album {
  soundcloud: any;
  spotify: string|undefined;
  embedLink: any;
  spotifyUrl: any;
  soundcloudUrl: any;
  faction: string;
  title: string;
  type: string;
  cover: string;
  descriptionPT?: string;
  descriptionEN?: string;
  releaseDate?: string; // Formato: "YYYY-MM-DD"
  // Data do Streaming (Quando chega no Spotify - O Hype)
  releaseDateStreaming?: string; //
  isPreSave?: boolean;      // Para ativar a cápsula
  preSaveLink?: string;     // O link do DistroKid
  isLatest?: boolean;       // (Ou isFeatured) Para dizer que é o destaque
}
