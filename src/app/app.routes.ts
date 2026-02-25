import { Routes } from '@angular/router';

export const routes: Routes = [
  // 🏠 ROTA 1: A Vitrine (Landing Page)
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing-page').then(m => m.LandingPage),
    data: { 
      seo: { 
        title: {
          pt: 'Cyberpunk Sagas & Virtual Band',
          en: 'Cyberpunk Sagas & Virtual Band'
        },
        description: {
          pt: 'A guerra digital entre a precisão técnica e o caos. Uma Saga Literária Cyberpunk e experimento musical transmídia.',
          en: 'Broklin\'s Tech vs. Jonah\'s Chaos. A Cyberpunk Literary Saga & Musical Experiment. The story has begun.'
        }
      } 
    }
  },

  // 📜 ROTA 2: O Arquivo de Logs (A "Memória Infinita")
  {
    path: 'logs-archive', 
    loadComponent: () => import('./pages/logs-archive/logs-archive').then(m => m.LogsArchiveComponent),
    data: { 
      seo: { 
        title: { 
          pt: 'Arquivo de Logs', 
          en: 'Logs Archive' 
        },
        description: { 
          pt: 'Os bastidores da narrativa transmídia e DevNotes da RQS.', 
          en: 'The behind-the-scenes of the transmedia narrative and RQS DevNotes.' 
        }
      } 
    }
  },

  // ✨ NOVA ROTA 2: O Arquivo Musical (Discografia Completa)
  {
    path:'musical-archives', 
    loadComponent: () => import('./pages/musical-archives/musical-archives').then(m => m.MusicalArchives),
    data: { 
      seo: { 
        title: { 
          pt: 'Arquivo Musical', 
          en: 'Musical Archives' 
        },
        description: { 
          pt: 'A discografia completa, com detalhes de cada faixa e processo criativo.', 
          en: 'The complete musical archive, with details of each track and creative process.' 
        }
      } 
    }
  },

  // ✨ NOVA ROTA 3: O Catálogo (Episódios da Saga)
  {
    path: 'visual-novel',
    loadComponent: () => import('./pages/visual-novel/visual-novel').then(m => m.VisualNovelComponent),
    data: { 
      seo: { 
        title: { 
          pt: 'Ecos da RQS | Episódios', 
          en: 'RQS Echoes | Episodes' 
        },
        description: { 
          pt: 'Mergulhe na saga. Broklin\'s Tech vs. Jonah\'s Chaos. O registro histórico da nossa jornada.', 
          en: 'Dive into the saga. Broklin\'s Tech vs. Jonah\'s Chaos. The historical record of our journey.' 
        }
      } 
    }
  },

  // 📖 ROTA 4: O Leitor (Texto Puro)
  {
    path: 'lore/broklin',
    loadComponent: () => import('./pages/lore-reader/lore-reader').then(m => m.LoreReaderComponent)
  },
  {
    path: 'lore-reader/:id',
    loadComponent: () => import('./pages/lore-reader/lore-reader').then(m => m.LoreReaderComponent)
  },

  // 👩‍💻 ROTA 5: O Hub da Criadora (Blog Técnico/Portfólio)
  {
    path: 'creator',
    loadComponent: () => import('./pages/creator/creator').then(m => m.Creator),
    data: {
      seo: { 
        title: { 
          pt: 'A Criadora', 
          en: 'The Creator' 
        },
        description: { 
          pt: 'A mente por trás do código. Engenharia Musical fundindo Angular, IA e a alma humana.', 
          en: 'The mind behind the code. Musical Engineering fusing Angular, AI, and the human soul.' 
        }
      }
    }
  },

  // 🛡️ ROTA 6: Compliance
  {
    path: 'compliance',
    loadComponent: () => import('./pages/compliance/compliance').then(m => m.ComplianceComponent),
    data: {
      seo: { 
        title: { 
          pt: 'Compliance', 
          en: 'Compliance' 
        },
        description: { 
          pt: 'Protocolos de Sistema: Transparência, afiliações e as regras do nosso universo digital.', 
          en: 'System Protocols: Transparency, affiliations, and the rules of our digital universe.' 
        }
      }
    }
  },

  // 🛒 ROTA 7: A Loja (Neon Store)
  {
    path: 'store',
    loadComponent: () => import('./pages/store/store').then(m => m.StoreComponent),
    data: {
      seo: { 
        title: { 
          pt: 'Neon Store | Merch Oficial', 
          en: 'Neon Store | Official Merch' 
        },
        description: { 
          pt: 'Equipamentos, vestuário e hardware. Escolha sua facção: Blue Team ou Red Team na Neon Store.', 
          en: 'Gear, apparel, and hardware. Choose your faction: Blue Team or Red Team at the Neon Store.' 
        }
      }
    }
  },

  { path: '**', redirectTo: '' }
];