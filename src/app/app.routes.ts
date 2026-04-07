import { Routes } from '@angular/router';
import { StoreComponent } from './pages/store/store';

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
// 🛡️ ROTA 2: Acesso ao Banco de Dados dos Criadores
  {
    path: 'dossier', // 💻 Substituímos 'about' por 'dossier' (funciona perfeitamente em PT e EN)
    loadComponent: () => import('./pages/sobre/sobre').then(m => m.SobreComponent),
    data: { 
      seo: { 
        title: {
          pt: 'Dossiê Operativo | Arquitetos da RQS',
          en: 'Operative Dossier | RQS Architects'
        },
        description: {
          pt: 'Acesso restrito: decripte os perfis operativos da Blue Team. Conheça Broklin, a General Kelma e as mentes que programam a saga cyberpunk RQS.',
          en: 'Restricted access: decrypt the Blue Team operative profiles. Meet Broklin, General Kelma, and the minds coding the RQS cyberpunk saga.'
        }
      }
    }    
  },
  // 📖 ROTA 3: O Leitor de Logs (O "Diário de Bordo" da Saga)
  {
  path: 'log-reader/:id',
  loadComponent: () => import('./pages/log-reader/log-reader').then(m => m.LogReaderComponent)
  },

  // 📜 ROTA 4: O Arquivo de Logs (A "Memória Infinita")
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

  // ✨ NOVA ROTA 5: O Arquivo Musical (Discografia Completa)
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
 // 📖 ROTA 6: O Banner da Saga

 {
  path: 'saga', loadComponent: () => import('./app-visual-novel/app-visual-novel').then(m => m.AppVisualNovel),
 data: { 
   seo: { 
     title: { 
       pt: 'Ecos da RQS', 
       en: 'RQS Echoes' 
     },
     description: { 
       pt: 'O resumo visual da guerra entre Broklin e Jonah. A história em um banner épico.', 
       en: 'The visual summary of the war between Broklin and Jonah. The story in an epic banner.' 
     }
   }

 }} ,

  // ✨ NOVA ROTA 7: O Catálogo (Episódios da Saga)
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

  // 📖 ROTA 8: O Leitor (Texto Puro)
  {
    path: 'lore/broklin',
    loadComponent: () => import('./pages/lore-reader/lore-reader').then(m => m.LoreReaderComponent)
  },
  {
    path: 'lore-reader/:id',
    loadComponent: () => import('./pages/lore-reader/lore-reader').then(m => m.LoreReaderComponent)
  },

  // 👩‍💻 ROTA 9: O Hub da Criadora (Blog Técnico/Portfólio)
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

  // 🛡️ ROTA 10: Compliance
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

  // 🛒 ROTA 11: A Loja (Neon Store)
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
 { 
    path: 'store/:dept', 
    component: StoreComponent,
    data: {
      seo: { 
        title: { 
          pt: 'Neon Store | Setores Classificados', 
          en: 'Neon Store | Classified Sectors' 
        },
        description: { 
          pt: 'Explore os 5 setores da Neon Store: Tech Lead, Synth General, Sonic Arsenal, Rust Riot e Neon Witch. O arsenal de hardware e o merch oficial dos operativos da RQS.', 
          en: 'Explore the 5 sectors of the Neon Store: Tech Lead, Synth General, Sonic Arsenal, Rust Riot, and Neon Witch. The hardware arsenal and official merch for RQS operatives.' 
        }
      }
    }
  }, 

  // 📡 ROTA 12: O Terminal de Comunicação (Contato/Uplink)
  {
    path: 'contato',
    loadComponent: () => import('./pages/contato/contato').then(m => m.ContatoComponent),
    data: {
      seo: { 
        title: { 
          pt: 'Uplink | Contato', 
          en: 'Uplink | Contact' 
        },
        description: { 
          pt: 'Estabeleça conexão direta com a base da RQS.', 
          en: 'Establish a direct connection with the RQS base.' 
        }
      }
    }
  },

  // 💿 ROTA 13: A Central de Áudio (Discografia)
  {
    path: 'discografia',
    loadComponent: () => import('./app-discography/app-discography').then(m => m.DiscographyComponent),
    data: {
      seo: { 
        title: { 
          pt: 'Discografia | RQS', 
          en: 'Discography | RQS' 
        },
        description: { 
          pt: 'Acesse o banco de áudio mestre da Raquel Synths.', 
          en: 'Access the master audio bank of Raquel Synths.' 
        }
      }
    }
  },

  { path: '**', redirectTo: '' }
];