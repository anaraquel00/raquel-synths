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
