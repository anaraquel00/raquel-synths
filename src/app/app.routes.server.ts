import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'lore-reader/:id',
    renderMode: RenderMode.Client, // 👈 Diz para o build ignorar o pré-render dessa rota
  },
  {
    path: 'store', // 👈 ADICIONE ESTA LINHA
    renderMode: RenderMode.Client,
  },
  {
    path: '', // 👈 Rota Inicial (Home)
    renderMode: RenderMode.Client, // 👈 ADICIONE ISSO AQUI!
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
