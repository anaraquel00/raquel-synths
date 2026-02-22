import { Component, inject, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { Observable, BehaviorSubject, switchMap } from 'rxjs'; // 👈 Importamos o switchMap

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

  public currentMode: 'broklin' | 'jonah' = 'broklin';
  private modeSubject = new BehaviorSubject<'broklin' | 'jonah'>('broklin');

  // 🚀 A MÁGICA: Sempre que o modo mudar, o switchMap pede novos episódios ao Firebase
  episodes$: Observable<any[]> = this.modeSubject.asObservable().pipe(
    switchMap(mode => this.contentService.getEpisodes(mode))
  );

  private themeObserver: MutationObserver | null = null;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Removemos a lógica complexa do constructor e colocamos direto na variável episodes$
  }

  ngOnInit() {
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
    const newMode: 'broklin' | 'jonah' = isJonah ? 'jonah' : 'broklin';

    this.currentMode = newMode;

    if (this.modeSubject.value !== newMode) {
      this.modeSubject.next(newMode);
    }
  }
}
