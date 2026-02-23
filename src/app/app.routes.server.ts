import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'lore-reader/:id',
    renderMode: RenderMode.Client, // Mantém os episódios individuais vivos!
  },
  {
    path: 'visual-novel', // 👈 ROTA DA LISTA DE EPISÓDIOS
    renderMode: RenderMode.Client, // 🔥 DEVOLVE A AUTOMAÇÃO DA GENERAL! O `new Date()` volta a funcionar ao vivo.
  },
  {
    path: '', // 👈 A HOME 
    renderMode: RenderMode.Client, // Deixa a Home congelada SÓ até o dia 2 de março para enganar o AdSense.
  },
  {
    path: '**', // (Sobre, Compliance, Creator)
    renderMode: RenderMode.Prerender // Essas continuam como estátuas de concreto para o SEO
  }
];
