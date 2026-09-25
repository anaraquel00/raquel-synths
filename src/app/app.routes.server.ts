import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // --- ROTAS ESTÁTICAS E SUMÁRIOS ---
  { path: '', renderMode: RenderMode.Server },
  { path: 'compliance', renderMode: RenderMode.Server },
  { path: 'dossier', renderMode: RenderMode.Prerender },
  { path: 'creator', renderMode: RenderMode.Prerender },
  { path: 'contato', renderMode: RenderMode.Prerender },
  {
    path: 'visual-novel/:mode/:season',
    renderMode: RenderMode.Prerender,

    async getPrerenderParams() {
      return [
        { mode: 'broklin', season: 's1' },
        { mode: 'broklin', season: 's2' },
        { mode: 'jonah', season: 's1' },
        { mode: 'jonah', season: 's2' }
      ];
    }
},
  { path: 'discografia', renderMode: RenderMode.Server },
  { path: 'hybrid-saga', renderMode: RenderMode.Prerender },
  { path: 'bio', renderMode: RenderMode.Server },

  { path: 'lore/:mode/:id', renderMode: RenderMode.Server },

  // Leitores dinâmicos e áreas administrativas rodando direto no servidor SSR
  { path: 'hybrid-reader/:id', renderMode: RenderMode.Server },
  { path: 'log-reader/:id', renderMode: RenderMode.Server },

  { path: 'logs-archive', renderMode: RenderMode.Server },
  { path: 'musical-archives', renderMode: RenderMode.Server },
  { path: 'play/:id', renderMode: RenderMode.Server },
  { path: 'store', renderMode: RenderMode.Server },
  { path: 'store/:dept', renderMode: RenderMode.Server },

  // 🛡️ A CORREÇÃO: Curinga de rotas desconhecidas mapeado para SERVER.
  // Isso obriga a Vercel a consultar o servidor SSR em vez de entregar index.html com 200 OK estático!
  { path: '**', renderMode: RenderMode.Server }
];
