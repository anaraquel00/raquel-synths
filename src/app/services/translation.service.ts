import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  // Apenas guarda "true" se for PT, "false" se for EN
  isPt = signal(true);

  toggle() {
    this.isPt.update(val => !val);
  }
}
