import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // --- ROTAS ESTÁTICAS E SUMÁRIOS ---
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'compliance', renderMode: RenderMode.Prerender },
  { path: 'dossier', renderMode: RenderMode.Prerender },
  { path: 'creator', renderMode: RenderMode.Prerender },
  { path: 'contato', renderMode: RenderMode.Prerender },
  { path: 'visual-novel', renderMode: RenderMode.Prerender },
  { path: 'discografia', renderMode: RenderMode.Prerender },
  { path: 'hybrid-saga', renderMode: RenderMode.Prerender },

  // --- 🚀 PRERENDER ESTÁTICO PARA AS SAGAS CONCLUÍDAS (Broklin & Jonah) ---
  // Como os episódios já estão finalizados, geramos todos eles direto na CDN da Vercel!
  {
    path: 'lore-reader/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      // Lista exata de todos os IDs das temporadas concluídas para o Prerender gerar no build
      // (Você pode adicionar os IDs da Temporada 1 e Temporada 2 de ambas as facções aqui)
      const episodeIds = [
        's1-e1', 's1-e2', 's1-e3', 's1-e4', 's1-e5', 's1-e6', 's1-e7', 's1-e8', 's1-e9', 's1-e10',
        's2-e1', 's2-e2', 's2-e3', 's2-e4', 's2-e5', 's2-e6', 's2-e7', 's2-e8', 's2-e9', 's2-e10', 's2-e11'
      ];
      return episodeIds.map(id => ({ id }));
    }
  },

  // O leitor híbrido continua em Server por enquanto (já que o Ep 1 estreia em 1 de setembro)
  { path: 'hybrid-reader/:id', renderMode: RenderMode.Server },
  { path: 'log-reader/:id', renderMode: RenderMode.Server },

  { path: 'logs-archive', renderMode: RenderMode.Server },
  { path: 'musical-archives', renderMode: RenderMode.Server },
  { path: 'play/:id', renderMode: RenderMode.Server },
  { path: 'store', renderMode: RenderMode.Server },
  { path: 'store/:dept', renderMode: RenderMode.Server },

  { path: '**', renderMode: RenderMode.Prerender }
];
