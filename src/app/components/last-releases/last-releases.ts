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
          <span class="title">SYNTH THE FLOOR</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .release-widget {
      cursor: pointer;
      animation: float 4s ease-in-out infinite; /* Deixei mais lento pra parecer mais pesado/importante */
    }

    .glow-container {
      display: flex;
      align-items: center;
      gap: 20px; /* Mais espaço entre a capa e o texto */
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid var(--primary-color, #00ff9d); /* Borda mais grossa */

      /* PADDING MONSTRO: Espaço pra respirar */
      padding: 15px 30px 15px 15px;

      border-radius: 80px; /* Cápsula gigante */
      backdrop-filter: blur(10px);
      box-shadow: 0 0 20px rgba(0, 255, 157, 0.4); /* Sombra base mais forte */
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Efeito elástico no hover */
    }

    .glow-container:hover {
      box-shadow: 0 0 40px var(--primary-color, #00ff9d), inset 0 0 20px rgba(0, 255, 157, 0.2);
      transform: scale(1.1) rotate(-2deg); /* Dá uma inclinadinha estilosa quando passa o mouse */
      background: rgba(0, 0, 0, 0.9);
      border-color: #fff;
    }

    .cover-art {
      width: 80px;  /* DOBREI O TAMANHO (era 40px) */
      height: 80px; /* DOBREI O TAMANHO */
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #fff; /* Borda da foto mais grossa */
      box-shadow: 0 0 15px rgba(0,0,0,0.5);
    }

    .info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.1;
    }

    .status {
      font-size: 0.9rem; /* Bem legível agora */
      color: var(--accent-color, #ff00ff);
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 5px;
      text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);
    }

    .title {
      font-size: 1.5rem; /* TÍTULO DE RESPEITO (era 0.8rem) */
      color: #fff;
      font-weight: 900;
      font-family: 'Orbitron', sans-serif; /* Garante que a fonte Cyberpunk apareça */
      text-shadow: 2px 2px 0px #000;
      white-space: nowrap; /* Não deixa quebrar linha */
    }

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); } /* Flutua mais alto também */
      100% { transform: translateY(0px); }
    }

    /* Ajuste pra celular não quebrar */
    @media (max-width: 480px) {
      .glow-container {
        padding: 10px 20px 10px 10px;
      }
      .cover-art { width: 60px; height: 60px; }
      .title { font-size: 1.1rem; }
    }
  `]
})
export class LastReleasesComponent {
  coverImage = '/images/ep-synth_the_floor.png'; // ⚠️ USE A CAPA DO SYNTH THE FLOOR AQUI
  link = 'https://distrokid.com/hyperfollow/raquelsynthsrqs/synth-the-floor'; // ⚠️ COLE O LINK DA DISTROKID

  openLink() {
    window.open(this.link, '_blank');
  }
}
