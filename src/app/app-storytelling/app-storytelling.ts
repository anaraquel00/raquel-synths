import { Component, inject, input, signal, OnDestroy, afterNextRender } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { TranslationService } from '../services/translation.service';
import { SafeHtmlPipe } from '../components/pipes/safe-html.pipe';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-storytelling',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe, NgOptimizedImage],
  templateUrl: './app-storytelling.html',
  styleUrls: ['./app-storytelling.scss']
})
export class StorytellingComponent implements OnDestroy {

  private router = inject(Router);
  public translate = inject(TranslationService);
  private document = inject(DOCUMENT);

  readonly logs = input<any[]>([]);
  public isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | undefined;

  constructor() {
    // 🛡️ TRAVA TÁTICA: Sincroniza o estado do tema e inicializa o observador apenas após a hidratação (DOM Estável)
    afterNextRender(() => {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));

      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });

      this.themeObserver.observe(this.document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  }

  ngOnDestroy() {
    this.themeObserver?.disconnect();
  }

  getEventContent(event: any) {
    let content = this.translate.isPt() ? event.pt : event.en;
    if (!content || !content.description) return content;

    let processedContent = { ...content };

    // 🛡️ MOTOR DE DESTRUIÇÃO FÍSICA: Remove as notas se não for o caos, erradicando o cloaking.
    if (!this.isJonahMode()) {
      // A expressão limpa fisicamente tags <div>, <p> ou <span> que possuam 'jonah-note' em suas classes.
      processedContent.description = processedContent.description.replace(/<(div|p|span)[^>]*class=["']?[^"']*jonah-note[^"']*["']?[^>]*>[\s\S]*?<\/\1>/gi, '');
    }

    return processedContent;
  }

  toggleLog(event: any) {
    event.isExpanded = !event.isExpanded;
  }

  navigateToArchive() {
    this.router.navigate(['/logs-archive']);
  }
}
