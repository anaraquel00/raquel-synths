import { Component } from '@angular/core';

@Component({
  selector: 'app-app-theme-switcher',
  imports: [],
  templateUrl: './app-theme-switcher.html',
  styleUrl: './app-theme-switcher.scss'
})
export class AppThemeSwitcher {
  playIndustrialNoise: any;
  playSynthChord: any;
switchMode(mode: 'broklin' | 'jonah') {
  document.body.classList.remove('mode-broklin', 'mode-jonah');
  document.body.classList.add(`mode-${mode}`);

  // Opcional: Tocar um som quando trocar!
  if (mode === 'jonah') this.playIndustrialNoise();
  if (mode === 'broklin') this.playSynthChord();
}
}
