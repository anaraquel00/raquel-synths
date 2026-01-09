import { Component } from '@angular/core';


@Component({
  selector: 'app-last-releases',
  standalone: true,
  imports: [],
  template: `
    <div class="release-widget" (click)="openLink()">
      <div class="glow-container">
        <img [src]="coverImage" alt="Cover" class="cover-art">
        <div class="info">
          <span class="status">🔥 PRE-SAVE NOW</span>
          <span class="title">NEON GUILLOTINE</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .release-widget {
      cursor: pointer;
      animation: float 4s ease-in-out infinite;
    }

    .glow-container {
      display: flex;
      align-items: center;
      gap: 10px; /* Aumentei um pouco o gap geral */
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid var(--primary-color, #00ff9d);
      padding: 10px 20px 10px 10px;
      border-radius: 65px;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 20px rgba(0, 255, 157, 0.4);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .glow-container:hover {
      box-shadow: 0 0 40px var(--primary-color, #00ff9d), inset 0 0 20px rgba(0, 255, 157, 0.2);
      transform: scale(1.1) rotate(-2deg);
      background: rgba(0, 0, 0, 0.9);
      border-color: #fff;
    }

    .cover-art {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #fff;
      box-shadow: 0 0 15px rgba(0,0,0,0.5);
      flex-shrink: 0; /* IMPEDIR QUE A FOTO SEJA ESMAGADA */
    }

    .info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.2; /* Um pouco mais de altura pra quando quebrar linha */
      overflow: hidden; /* Garante que nada vaze */
    }

    .status {
      font-size: 0.8rem; /* Ajuste fino */
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
      white-space: nowrap; /* No PC mantém numa linha só */
      text-overflow: ellipsis;
    }

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }

    /* --- CORREÇÃO MOBILE --- */
    @media (max-width: 480px) {
      .glow-container {
        padding: 8px 15px 8px 8px; /* Reduzi o padding da direita pra ganhar espaço */
        border-radius: 40px; /* Bordas menos redondas economizam espaço visual */
      }

      .cover-art {
        width: 60px;
        height: 60px;
      }

      .title {
        font-size: 0.9rem; /* Diminuí pra caber */
        white-space: normal; /* AGORA PODE QUEBRAR LINHA! */
        word-wrap: break-word; /* Garante que palavras longas quebrem se precisar */
      }

      .status {
        font-size: 0.7rem;
        letter-spacing: 1px;
      }
    }
  `]
})
export class LastReleasesComponent {
  coverImage = '/images/ep_neon_guillotine.png';
  link = 'https://distrokid.com/hyperfollow/raquelsynthsrqs/neon-guillotine';

  openLink() {
    window.open(this.link, '_blank');
  }
}
