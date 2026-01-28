import { Component, inject, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs'; // 👈 Importações Novas!

@Component({
  selector: 'app-visual-novel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './visual-novel.html',
  styleUrl: './visual-novel.scss'
})
export class VisualNovelComponent implements OnInit, OnDestroy {

  private contentService = inject(ContentService);
  public translate = inject(TranslationService);

  // 1. Variável Pública para o HTML ler (Simples e direta)
  public currentMode: 'broklin' | 'jonah' = 'broklin';

  private modeSubject = new BehaviorSubject<string>('broklin');
  episodes$: Observable<any[]>;
  private themeObserver: MutationObserver | null = null;
  isBrowser: boolean;
  constructor(@Inject(PLATFORM_ID ) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.episodes$ = combineLatest([
      this.contentService.getLoreEpisodes(),
      this.modeSubject.asObservable()
    ]).pipe(
      map(([episodes, currentMode]) => {
        return episodes.filter(ep =>
          !ep.mode || ep.mode.toLowerCase() === currentMode.toLowerCase()
        );
      })
    );
  }

  ngOnInit() {
    // 2. SÓ EXECUTA SE FOR NO NAVEGADOR!
    if (this.isBrowser) {
      this.checkTheme();

      this.themeObserver = new MutationObserver(() => {
        this.checkTheme();
      });

      this.themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  private checkTheme() {
    if (!this.isBrowser) return;
    const isJonah = document.body.classList.contains('mode-jonah');
    const newMode = isJonah ? 'jonah' : 'broklin';

    // 2. Atualizamos a variável pública aqui!
    this.currentMode = newMode;

    if (this.modeSubject.value !== newMode) {
      this.modeSubject.next(newMode);
    }
  }
}
