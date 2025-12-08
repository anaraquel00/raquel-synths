import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  image: string;
  jonahComment?: string; // O comentário ácido do Jonah
}

@Component({
  selector: 'app-storytelling',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-storytelling.html',
  styleUrl: './app-storytelling.scss'
})
export class StorytellingComponent {

  events: TimelineEvent[] = [
    {
      date: 'Jan 2025',
      title: 'O Lançamento de "Cold War"',
      description: 'Broklin lança o álbum aclamado pela crítica, definindo o som Synthwave da RQS.',
      image: '/images/discografia.png', // Usando uma do seu blueprint
      jonahComment: 'Aclamado?? Eu escrevi essa porcaria e você levou o crédito, seu vampiro de jardim!'
    },
    {
      date: 'Jun 2025',
      title: 'A Falha no Sistema',
      description: 'Ruídos estranhos começam a aparecer nas faixas. A banda investiga uma suposta invasão hacker.',
      image: '/images/cyberpunk_industrial.png',
      jonahComment: 'Invasão hacker... era eu tentando sair do cativeiro digital! #FreeJonah'
    },
    {
      date: 'Out 2025',
      title: 'O Casamento Quântico',
      description: 'Broklin e Kelma oficializam a união em 12 dimensões com a faixa "Yours in 12 Dimensions".',
      image: '/images/broklin_universe.png',
      jonahComment: 'A única coisa boa desse dia foi o bolo. Ah, espera, eu não como bolo.'
    },
    {
      date: 'Dez 2025',
      title: 'O Herdeiro & O Futuro',
      description: 'Nasce Joninha. A RQS atinge seus primeiros lucros de streaming ($0.02) e projeta o legado de 2068.',
      image: '/images/storyteller.png',
      jonahComment: 'Meu afilhado vai ouvir metal industrial no berço. O reinado do pop acabou.'
    }
  ];
}
