import { Component, Input, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-last-releases',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="currentTrack"
         class="release-card"
         [class.jonah-mode]="isJonahMode"
         (click)="openLink()">

      <img [src]="currentTrack.cover" alt="Album Cover" class="cover-art">

      <div class="info">
        <span class="badge">
          {{ isPreSave ? t[lang].badgePre : t[lang].badgeNew }}
        </span>

        <h3>{{ currentTrack.title }}</h3>

        <span class="date" *ngIf="currentTrack.releaseDateStreaming">
           {{ isPreSave ? t[lang].drops + currentTrack.releaseDateStreaming : t[lang].outNow }}
        </span>

        <button class="pre-save-btn">
          <i [class]="isPreSave ? 'fas fa-stopwatch' : 'fab fa-spotify'"></i>
          {{ isPreSave ? t[lang].btnPre : t[lang].btnListen }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* --- MANTER O MESMO CSS DO ARQUIVO ANTERIOR --- */
    /* (O CSS não muda, pode manter exatamente o que te passei antes) */
    .release-card {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid var(--neon-primary, #00ff9d);
      border-radius: 12px;
      padding: 15px;
      width: 100%;
      max-width: 320px;
      display: flex;
      align-items: center;
      gap: 15px;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 15px rgba(0, 255, 157, 0.2);
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      margin: 0 auto;
      animation: slideIn 0.8s ease-out;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 0 25px rgba(0, 255, 157, 0.5);

        .pre-save-btn {
          background: var(--neon-primary, #00ff9d);
          color: #000;
          box-shadow: 0 0 15px rgba(0, 255, 157, 0.8);
        }
      }
    }

    .jonah-mode.release-card {
      border-color: #ff3300;
      background: rgba(20, 0, 0, 0.9);
      box-shadow: 0 0 15px rgba(255, 50, 0, 0.3);
      border-radius: 1px;

      &:hover {
        box-shadow: 0 0 30px rgba(255, 50, 0, 0.6);
        .pre-save-btn {
          background: #ff3300;
          color: #fff;
          border-color: #ff3300;
          border-radius: 1px;
          box-shadow: 0 0 15px rgba(255, 50, 0, 0.8);
        }
      }

      .badge { color: #ff3300; }
      .pre-save-btn { border-color: #ff3300;
         color: #ff3300;
        border-radius: 1px; 
      }
    }

    .cover-art {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;

      .badge {
        font-size: 0.7rem;
        color: #00ff9d;
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
        text-shadow: 0 0 5px rgba(0,0,0,0.8);
      }

      h3 {
        margin: 0;
        font-size: 1rem;
        color: #fff;
        font-family: 'Orbitron', sans-serif;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .date {
        font-size: 0.75rem;
        color: #aaa;
        font-style: italic;
      }
    }

    .pre-save-btn {
      margin-top: 8px;
      background: transparent;
      border: 1px solid var(--neon-primary, #00ff9d);
      color: var(--neon-primary, #00ff9d);
      font-size: 0.7rem;
      padding: 6px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
      transition: all 0.3s;
      text-align: center;
      width: fit-content;
      cursor: pointer;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(50px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class LastReleasesComponent implements OnInit, OnDestroy {
  // Recebe o idioma do componente pai (ex: 'en' ou 'pt')
  // Se não informar nada, o padrão agora é INGLÊS ('en')
  @Input() lang: 'pt' | 'en' = 'en';

  private contentService = inject(ContentService);
  private cdr = inject(ChangeDetectorRef);

  currentTrack: any = null;
  isPreSave = false;
  isJonahMode = false;

  private observer: MutationObserver | null = null;
  private sub: Subscription | null = null;
  private allMusic: any[] = [];

  // Dicionário de Traduções
  t = {
    en: {
      badgePre: '🔥 PRE-SAVE NOW',
      badgeNew: '🚀 NEW DROP',
      drops: 'Arrives in: ',
      outNow: 'Out Now',
      btnPre: 'PRE-SAVE NOW',
      btnListen: 'LISTEN NOW'
    },
    pt: {
      badgePre: '🔥 PRÉ-SAVE JÁ',
      badgeNew: '🚀 LANÇAMENTO',
      drops: 'Chega em: ',
      outNow: 'Já Disponível',
      btnPre: 'FAZER PRE-SAVE',
      btnListen: 'OUVIR AGORA'
    }
  };

  ngOnInit() {
    this.checkMode();
    this.sub = this.contentService.getDiscography().subscribe(data => {
      this.allMusic = data;
      this.updateCapsule();
    });

    this.observer = new MutationObserver(() => {
      this.checkMode();
      this.updateCapsule();
    });

    this.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
    if (this.sub) this.sub.unsubscribe();
  }

  checkMode() {
    this.isJonahMode = document.body.classList.contains('mode-jonah');
    this.cdr.detectChanges();
  }

  updateCapsule() {
    if (!this.allMusic || this.allMusic.length === 0) return;

    const faction = this.isJonahMode ? 'jonah' : 'broklin';
    const factionTracks = this.allMusic.filter(t =>
  t.faction === faction || t.faction === 'hybrid'
 );

    const targetTrack = factionTracks.find(t => t.isPreSave === true)
                     || factionTracks.find(t => t.isLatest === true)
                     || factionTracks[0];

    if (targetTrack) {
      this.currentTrack = targetTrack;
      this.isPreSave = !!targetTrack.isPreSave;
      this.cdr.detectChanges();
    }
  }

  openLink() {
    if (!this.currentTrack) return;
    let url = '';
    if (this.isPreSave) {
      url = this.currentTrack.preSaveLink || this.currentTrack.distrokid || this.currentTrack.spotify;
    } else {
      url = this.currentTrack.spotify || this.currentTrack.soundcloud;
    }
    if (url) window.open(url, '_blank');
  }
}
