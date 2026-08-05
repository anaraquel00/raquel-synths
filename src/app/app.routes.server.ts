import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // --- ROTAS ESTÁTICAS (Prerender instantâneo na borda da CDN) ---
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'compliance', renderMode: RenderMode.Prerender },
  { path: 'dossier', renderMode: RenderMode.Prerender },
  { path: 'creator', renderMode: RenderMode.Prerender },
  { path: 'contato', renderMode: RenderMode.Prerender },
  { path: 'visual-novel', renderMode: RenderMode.Prerender },
  { path: 'discografia', renderMode: RenderMode.Prerender },
  { path: 'hybrid-saga', renderMode: RenderMode.Prerender }, // 🚀 O sumário híbrido é estático e voa na CDN!

  // --- ROTAS DINÂMICAS DE LEITURA (SSR otimizado para dados do Firebase) ---
  { path: 'lore-reader/:id', renderMode: RenderMode.Server },
  { path: 'hybrid-reader/:id', renderMode: RenderMode.Server }, // 🚀 Leitor híbrido blindado em SSR!
  { path: 'log-reader/:id', renderMode: RenderMode.Server },

  { path: 'logs-archive', renderMode: RenderMode.Server },
  { path: 'musical-archives', renderMode: RenderMode.Server },
  { path: 'play/:id', renderMode: RenderMode.Server },
  { path: 'store', renderMode: RenderMode.Server },
  { path: 'store/:dept', renderMode: RenderMode.Server },

  { path: '**', renderMode: RenderMode.Prerender }
];
