import { Component, OnInit, OnDestroy, AfterViewChecked, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { AdBannerComponent } from "../../components/ad-banner/ad-banner";
import { ContentService } from '../../services/content.service';
import { Observable } from 'rxjs';
import { SplitContentPipe } from "../../components/pipes/content-splitter.pipe";
import { LoreEpisode } from '../../data/lore-data';

@Component({
  selector: 'app-lore-reader',
  standalone: true,
  imports: [CommonModule, AdBannerComponent, SplitContentPipe],
  templateUrl: './lore-reader.html',
  styleUrls: ['./lore-reader.scss']
})
export class LoreReaderComponent implements OnInit, OnDestroy, AfterViewChecked {
  private contentService = inject(ContentService);
  public translate = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentMode: 'broklin' | 'jonah' = 'broklin';
  episodes$!: Observable<LoreEpisode[]>; // 👈 Usando a interface certa

  private targetId: string | null = null;
  private scrollDone = false;
  private themeObserver: MutationObserver | null = null;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkTheme();
      this.loadEpisodes(); // 🚀 LIGA O FIREBASE AQUI

      this.targetId = this.route.snapshot.paramMap.get('id');

      this.themeObserver = new MutationObserver(() => {
        this.checkTheme();
        this.loadEpisodes(); // Recarrega se trocar de Broklin para Jonah
      });
      this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
  }

  loadEpisodes() {
    // 🔌 Conecta o cano no lugar certo
    this.episodes$ = this.contentService.getEpisodes(this.currentMode);
  }

  ngAfterViewChecked() {
    // 🔍 O ELEMENTO SÓ EXISTE DEPOIS QUE O FIREBASE CARREGA
    if (this.isBrowser && this.targetId && !this.scrollDone) {
      const element = document.getElementById(this.targetId);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        this.scrollDone = true;
      }
    }
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  private checkTheme() {
    if (!this.isBrowser) return;
    const isJonah = document.body.classList.contains('mode-jonah');
    this.currentMode = isJonah ? 'jonah' : 'broklin';
  }

  goBack() {
    this.router.navigate(['/visual-novel']);
  }
}
