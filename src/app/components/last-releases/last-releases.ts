import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service'; // Ajuste o caminho se necessário
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-last-releases',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="currentTrack"
         class="release-widget"
         [class.jonah-mode]="isJonahMode"
         (click)="openLink()">

      <div class="glow-container">
        <img [src]="currentTrack.cover" alt="Cover" class="cover-art">

        <div class="info">
          <span class="status">
            {{ isPreSave ? '🔥 PRE-SAVE NOW' : '🎧 NEW RELEASE' }}
          </span>

          <span class="title">{{ currentTrack.title }}</span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .release-widget {
      cursor: pointer;
      animation: float 4s ease-in-out infinite;
      transition: all 0.5s ease;
    }

    .glow-container {
      display: flex;
      align-items: center;
      gap: 10px;
      /* ESTILO PADRÃO (BROKLIN) */
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid var(--primary-color, #00ff9d);
      padding: 10px 20px 10px 10px;
      border-radius: 65px;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 20px rgba(0, 255, 157, 0.4);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* --- ESTILO MODO JONAH (Adicionado) --- */
    .jonah-mode .glow-container {
      border-color: #ff3300; /* Laranja Fogo */
      background: rgba(20, 0, 0, 0.9);
      box-shadow: 0 0 25px rgba(255, 50, 0, 0.6);
    }

    .jonah-mode .status {
      color: #ff3300 !important;
      text-shadow: 0 0 8px rgba(255, 60, 0, 0.8);
    }

    .glow-container:hover {
      transform: scale(1.05);
      background: rgba(0, 0, 0, 0.95);
      border-color: #fff;
    }

    .cover-art {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #fff;
      box-shadow: 0 0 15px rgba(0,0,0,0.5);
      flex-shrink: 0;
    }

    .info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.2;
      overflow: hidden;
      max-width: 200px; /* Limite pra não estourar */
    }

    .status {
      font-size: 0.8rem;
      color: var(--accent-color, #ff00ff);
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 3px;
      text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);
    }

    .title {
      font-size: 1rem;
      color: #fff;
      font-weight: 900;
      font-family: 'Orbitron', sans-serif;
      text-shadow: 2px 2px 0px #000;
      display: -webkit-box;
      -webkit-line-clamp: 2; /* Máximo 2 linhas */
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }

    @media (max-width: 480px) {
      .glow-container { padding: 8px 15px 8px 8px; border-radius: 40px; }
      .cover-art { width: 60px; height: 60px; }
      .title { font-size: 0.9rem; }
      .status { font-size: 0.7rem; }
    }
  `]
})
export class LastReleasesComponent implements OnInit, OnDestroy {
  private contentService = inject(ContentService);
  private cdr = inject(ChangeDetectorRef);

  currentTrack: any = null;
  isPreSave = false;
  isJonahMode = false;

  private observer: MutationObserver | null = null;
  private sub: Subscription | null = null;
  private allMusic: any[] = [];

  ngOnInit() {
    // 1. Define modo inicial
    this.checkMode();
    // 2. Baixa dados do Firebase
    this.sub = this.contentService.getDiscography().subscribe(data => {
      this.allMusic = data;
      this.updateCapsule();
    });
    // 3. Vigia mudança de tema no Body
    this.observer = new MutationObserver(() => {
      this.checkMode();
      this.updateCapsule();
    });
    this.observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
    if (this.sub) this.sub.unsubscribe();
  }

  checkMode() {
    this.isJonahMode = document.body.classList.contains('mode-jonah');
  }

  updateCapsule() {
    if (!this.allMusic.length) return;

    const faction = this.isJonahMode ? 'jonah' : 'broklin';

    // 1. Filtra músicas da facção atual
    const factionTracks = this.allMusic.filter(t => t.faction === faction);

    // 2. A HIERARQUIA DO HYPE:
    // Prioridade 1: É Pre-Save? (Futuro)
    // Prioridade 2: É Lançamento Recente? (Marcado com isLatest: true)
    // Prioridade 3: Pega o primeiro da lista (Fallback)
    const targetTrack = factionTracks.find(t => t.isPreSave === true)
                     || factionTracks.find(t => t.isLatest === true)
                     || factionTracks[0];

    if (targetTrack) {
      this.currentTrack = targetTrack;
      this.isPreSave = !!targetTrack.isPreSave; // Se for Pre-Save, muda o botão
      this.cdr.detectChanges();
    }
  }

  openLink() {
    if (this.currentTrack) {
      // Prioriza link Spotify, senão Soundcloud
      const url = this.currentTrack.spotify || this.currentTrack.soundcloud;
      if (url) window.open(url, '_blank');
    }
  }
}
