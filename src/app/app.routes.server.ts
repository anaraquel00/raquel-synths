import { RenderMode, ServerRoute } from '@angular/ssr';

// No seu app.routes.server.ts:
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'compliance', renderMode: RenderMode.Prerender },
  { path: 'dossier', renderMode: RenderMode.Prerender },
  { path: 'creator', renderMode: RenderMode.Prerender },
  { path: 'contato', renderMode: RenderMode.Prerender },
  { path: 'visual-novel', renderMode: RenderMode.Prerender },
  { path: 'discografia', renderMode: RenderMode.Prerender },

  // 🛡️ ROTAS DINÂMICAS VOLTAM A SER SERVER (SSR) PARA SUPORTAR ESCALA E AGENDAMENTO AUTOMÁTICO
  { path: 'lore-reader/:id', renderMode: RenderMode.Server },
  { path: 'log-reader/:id', renderMode: RenderMode.Server },

  { path: 'logs-archive', renderMode: RenderMode.Server },
  { path: 'musical-archives', renderMode: RenderMode.Server },
  { path: 'play/:id', renderMode: RenderMode.Server },
  { path: 'store', renderMode: RenderMode.Server },
  { path: 'store/:dept', renderMode: RenderMode.Server },

  { path: '**', renderMode: RenderMode.Prerender }
];
