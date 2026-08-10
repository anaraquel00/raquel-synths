import { RenderMode, ServerRoute, PrerenderFallback } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // --- ROTAS ESTÁTICAS E SUMÁRIOS ---
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'compliance', renderMode: RenderMode.Prerender },
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
  { path: 'discografia', renderMode: RenderMode.Prerender },
  { path: 'hybrid-saga', renderMode: RenderMode.Prerender },
  { path: 'bio', renderMode: RenderMode.Prerender },

  // --- 🚀 PRERENDER ESTÁTICO PARA AS SAGAS CONCLUÍDAS (Broklin & Jonah) ---
  {
  path: 'lore/:mode/:id',
  renderMode: RenderMode.Prerender,
  fallback: PrerenderFallback.Server,

  async getPrerenderParams() {
    const broklinIds = [
      's1-e1',
      's1-e2',
      's1-e3',
      's1-e4',
      's1-e5',
      's1-e6',
      's1-e7',
      's1-e8',
      's1-e9',
      's1-e10',

      's2-e1',
      's2-e2',
      's2-e3',
      's2-e4',
      's2-e5',
      's2-e6',
      's2-e7',
      's2-e8',
      's2-e9',
      's2-e10'
    ];

    const jonahIds = [
      's1-e1',
      's1-e2',
      's1-e3',
      's1-e4',
      's1-e5',
      's1-e6',
      's1-e7',
      's1-e8',
      's1-e9',
      's1-e10',

      's2-e1',
      's2-e2',
      's2-e3',
      's2-e4',
      's2-e5',
      's2-e6',
      's2-e7',
      's2-e8',
      's2-e9',
      's2-e10',
      's2-e11'
    ];

    return [
      ...broklinIds.map(id => ({
        mode: 'broklin',
        id
      })),

      ...jonahIds.map(id => ({
        mode: 'jonah',
        id
      }))
    ];
  }
},

  // Leitores dinâmicos e áreas administrativas rodando direto no servidor SSR
  { path: 'hybrid-reader/:id', renderMode: RenderMode.Server },
  {
    path: 'log-reader/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,

  async getPrerenderParams() {
    const logIds = [
      '2025-12-08-log',
      '2025-12-14-log',
      '2025-12-15-log',
      '2025-12-20-log',
      '2025-12-24-log',
      '2026-01-16-log',
      '2026-01-17-log',
      '2026-01-29-log',
      '2026-02-02-log',
      '2026-02-09-log',
      '2026-02-16-log',
      '2026-02-23-log',
      '2026-03-02-log',
      '2026-03-09-log',
      '2026-03-16-log',
      '2026-03-24-log',
      '2026-03-30-log',
      '2026-04-03-log',
      '2026-04-06-log',
      '2026-04-14-log',
      '2026-04-20-log',
      '2026-04-27-log',
      '2026-05-04-log',
      '2026-05-11-log',
      '2026-05-18-log',
      '2026-05-25-log',
      '2026-06-01-log',
      '2026-06-03-log',
      '2026-06-08-log',
      '2026-06-10-log',
      '2026-06-15-log',
      '2026-06-22-log',
      '2026-06-29-log',
      '2026-07-13-log'
    ];

    return logIds.map(id => ({ id }));
  }
},

  { path: 'logs-archive', renderMode: RenderMode.Server },
  { path: 'musical-archives', renderMode: RenderMode.Server },
  { path: 'play/:id', renderMode: RenderMode.Server },
  { path: 'store', renderMode: RenderMode.Server },
  { path: 'store/:dept', renderMode: RenderMode.Server },

  // 🛡️ A CORREÇÃO: Curinga de rotas desconhecidas mapeado para SERVER.
  // Isso obriga a Vercel a consultar o servidor SSR em vez de entregar index.html com 200 OK estático!
  { path: '**', renderMode: RenderMode.Server }
];
