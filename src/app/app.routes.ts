import { Routes } from '@angular/router';

export const routes: Routes = [
  // 🏠 ROTA 1: A Vitrine (Landing Page)
  // Continua igual! Aqui dentro, o componente <app-system-logs>
  // vai ter um @Input() [limit]="5" para mostrar só os recentes.
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing-page').then(m => m.LandingPage)
  },

  // 📜 ROTA 2: O Arquivo de Logs (A "Memória Infinita")
  // NOVA ROTA! Quando clicar em "Leia Mais" na Home, vem pra cá.
  {
    path: 'logs-archive',
    loadComponent: () => import('./pages/logs-archive/logs-archive').then(m => m.LogsArchiveComponent)
  },

 // ✨ NOVA ROTA 3: O Catálogo (A página que acabamos de criar)
  // É aqui que o usuário escolhe qual episódio ler!
  {
    path: 'visual-novel',
    loadComponent: () => import('./pages/visual-novel/visual-novel').then(m => m.VisualNovelComponent),
    title: 'RaQuel Synths | Episódios' // Bom pra SEO!
  },

  // 📖 ROTA 4: O Leitor (Texto Puro)
  // Essas rotas continuam existindo para carregar o conteúdo específico
  {
    path: 'lore/broklin',
    loadComponent: () => import('./pages/lore-reader/lore-reader').then(m => m.LoreReaderComponent)
  },
  {
  // O ":id" avisa ao Angular: "O que vier aqui depois da barra é variável!"
  path: 'lore-reader/:id',
  loadComponent: () => import('./pages/lore-reader/lore-reader').then(m => m.LoreReaderComponent)
 },

  // 👩‍💻 ROTA 4: O Hub da Criadora (Blog Técnico/Portfólio)
  {
    path: 'creator',
    // Aqui dentro você usa a mesma lógica: Blocos empilhados
    // Se clicar num artigo, pode levar para 'creator/artigo-id'
    loadComponent: () => import('./pages/creator/creator').then(m => m.Creator)
  },

  {
    path: 'compliance',
    loadComponent: () => import('./pages/compliance/compliance').then(m => m.ComplianceComponent)
  },

  {
    path: 'store',
    loadComponent: () => import('./pages/store/store').then(m => m.StoreComponent)
  },

  { path: '**', redirectTo: '' }
];
