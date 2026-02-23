import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'lore-reader/:id',
    renderMode: RenderMode.Client, // Mantemos CSR aqui, pois rotas dinâmicas com ID são complexas no Firebase Hosting
  },
  {
    path: 'store', 
    renderMode: RenderMode.Client, // Loja pode ficar dinâmica
  },
  {
    path: '', // 👈 A NOSSA VITRINE PRINCIPAL (Home)
    renderMode: RenderMode.Prerender, // 🔥 PATCH: Força o Angular a gerar o HTML completo com os Logs!
  },
  {
    path: '**', // 👈 Qualquer outra página (Sobre, Contato, etc)
    renderMode: RenderMode.Prerender // 🔥 PATCH: Tudo será HTML estático para o AdSense ler.
  }
];
