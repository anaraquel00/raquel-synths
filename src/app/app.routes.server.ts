import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender // A vitrine blindada e super rápida
  },
  {
    path: 'compliance',
    renderMode: RenderMode.Prerender // O túnel VIP pro compliance legal
  },
  {
    path: 'dossier',
    renderMode: RenderMode.Prerender // Página estática, ideal para pré-render
  },
  {
    path: 'creator',
    renderMode: RenderMode.Prerender // Página estática, ideal para pré-render
  },
  {
    path: 'contato',
    renderMode: RenderMode.Prerender // Formulário estático, ideal para pré-render
  },
  {
    path: 'log-reader/:id',
    renderMode: RenderMode.Server //  Renderiza no servidor para o Google ler os textões.
  },
  {
    path: 'visual-novel',
    renderMode: RenderMode.Prerender // Mastiga a saga no build, 0ms de carregamento!
  },
  {
    path: 'lore-reader/:id',
    renderMode: RenderMode.Server // Garante que o texto da saga já chegue mastigado para o AdSense ler
  },
  {
    path: 'discografia',
    renderMode: RenderMode.Server // A vitrine blindada e super rápida
  },
   {
    path:'logs-archive',
    renderMode: RenderMode.Server
   },
  {
    path: 'musical-archives',
    renderMode: RenderMode.Server // Protege a paginação dinâmica contra pre-render vazio
  },
  {
    path: 'store',
    renderMode: RenderMode.Server // Renderização dinâmica do e-commerce
  },
  {
    path: 'store/:dept',
    renderMode: RenderMode.Server // Rastreio de catálogo específico via SSR
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
