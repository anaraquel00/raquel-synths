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
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
