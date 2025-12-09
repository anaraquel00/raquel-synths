import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-discography',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './app-discography.html',
  styleUrl: './app-discography.scss'
})
export class DiscographyComponent {

  // Lançamentos do Universo Broklin (Ordem)
  broklinReleases = [
    {
      title: 'COLD WAR',
      type: 'Álbum (2025)',
      cover: '/images/album_cold-war.jpg', // Use a imagem que você subiu!
      spotify: 'LINK_SPOTIFY',
      soundcloud: 'LINK_SOUNDCLOUD'
    },
    {
      title: 'NEON TEARS',
      type: 'Single',
      cover: '/images/discografia.png',
      spotify: 'LINK_SPOTIFY',
      soundcloud: 'LINK_SOUNDCLOUD'
    }
  ];

  // Lançamentos do Universo Jonah (Caos)
  jonahReleases = [
    {
      title: 'CIVIL WAR',
      type: 'EP Industrial',
      cover: '/images/civil-war.png',
      spotify: 'LINK_SPOTIFY',
      soundcloud: 'LINK_SOUNDCLOUD'
    },
    {
      title: 'SYSTEM FAILURE',
      type: 'Single (ft. Nyx)',
      cover: '/images/industrial_archive.png',
      spotify: 'LINK_SPOTIFY',
      soundcloud: 'LINK_SOUNDCLOUD'
    }
  ];

  openLink(url: string) {
    if(url && url !== 'LINK_SPOTIFY' && url !== 'LINK_SOUNDCLOUD') {
        window.open(url, '_blank');
    } else {
        alert('Link em breve! (Ainda estamos masterizando...) 😉');
    }
  }
}
