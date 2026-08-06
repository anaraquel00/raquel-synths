import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-spotify-playlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spotify-playlist.html',
  styleUrl: './spotify-playlist.scss'
})
export class SpotifyPlaylistComponent {
  public translate = inject(TranslationService);

  @Input() public mode: 'broklin' | 'jonah' = 'broklin';
  @Input() public playlistUrl: string = 'https://raquelsynths.com/play/spotify-blueteam-playlist?service=spotify';
  @Input() public playlistTitlePt: string = 'Playlist Oficial — Blue Team';
  @Input() public playlistTitleEn: string = 'Official Playlist — Blue Team';

  public trackSpotifyClick(): void {
    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('trackCustom', 'SpotifyPlaylistRedirect');
    }
  }
}
