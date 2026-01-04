import { Routes } from '@angular/router';

export const routes: Routes = [
  // ROTA 1: A Página Principal (Landing Page)
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing-page').then(m => m.LandingPage)
  },

  // ROTA 2: A Página da História (Lore)
  {
    path: 'lore/broklin',
    loadComponent: () => import('./pages/lore-reader/lore-reader').then(m => m.LoreReaderComponent)
  },

  {
      path: 'creator',
      loadComponent: () => import('./pages/creator/creator').then(m => m.Creator)
  },

  {
    path: 'compliance',
    loadComponent: () => import('./pages/compliance/compliance').then(m => m.ComplianceComponent)
  },

  // Rota de Erro (Volta pra Home)
  { path: '**', redirectTo: '' }
];
