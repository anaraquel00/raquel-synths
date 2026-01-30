// src/app/models/album.model.ts

export interface Album {
  title: string;
  type: string;
  cover: string;
  spotify?: string;      // Opcional
  soundcloud?: string;   // Opcional

  // 👇 Os campos novos que estavam dando erro
  description?: string;     // Texto em PT
  embedLink?: string;       // Link do Iframe
}
