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
    path: 'visual-novel',
    renderMode: RenderMode.Prerender // Mastiga a saga no build, 0ms de carregamento!
  },
  {
    path: 'lore-reader/:id',
    renderMode: RenderMode.Prerender // Garante que o texto da saga já chegue mastigado para o AdSense ler
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
