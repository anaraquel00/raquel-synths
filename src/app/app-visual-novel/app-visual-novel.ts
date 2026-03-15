import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/translation.service';
import { VISUAL_NOVEL_PT, VISUAL_NOVEL_EN, VN_INTRO_PT, VN_INTRO_EN, VN_INTRO_JONAH_PT, VN_INTRO_JONAH_EN } from '../data/app-data';
import { Router } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { AdBannerComponent } from "../components/ad-banner/ad-banner";
import { MatButtonModule } from '@angular/material/button';
import { ContentService } from '../services/content.service'; // 👈 IMPORTANTE
import { Observable, BehaviorSubject, switchMap } from 'rxjs'; // 👈 IMPORTANTE
import { LoreEpisode } from '../data/lore-data';
import { SystemAlert } from "../components/system-alert/system-alert";

@Component({
  selector: 'app-visual-novel',
  standalone: true,
  imports: [CommonModule, MatIconModule, AdBannerComponent, MatButtonModule, SystemAlert],
  templateUrl: './app-visual-novel.html',
  styleUrls: ['./app-visual-novel.scss']
})
export class AppVisualNovel implements OnInit, OnDestroy {
  // --- INJEÇÕES ---
  translate = inject(TranslationService);
  private router = inject(Router);
  private contentService = inject(ContentService); // 👈 INJETE O SERVIÇO AQUI

  // --- ESTADO REATIVO ---
  private modeSubject = new BehaviorSubject<'broklin' | 'jonah'>('broklin');
  currentMode: 'broklin' | 'jonah' = 'broklin';

  // Esse Observable vai buscar os episódios do Firebase toda vez que o modo mudar
  episodes$: Observable<LoreEpisode[]> = this.modeSubject.asObservable().pipe(
    switchMap(mode => this.contentService.getEpisodes(mode))
  );

  private themeObserver: MutationObserver | null = null;
  introPt = VN_INTRO_PT;
  introEn = VN_INTRO_EN;
  introJonahPt = VN_INTRO_JONAH_PT;
  introJonahEn = VN_INTRO_JONAH_EN;
  isJonahMode:any;
 

  ngOnInit() {
    this.checkTheme();

    // Vigia o body para mudanças de classe (tema)
    this.themeObserver = new MutationObserver(() => {
      this.checkTheme();
    });
    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  private checkTheme() {
    const isJonah = document.body.classList.contains('mode-jonah');
    this.currentMode = isJonah ? 'jonah' : 'broklin';
    // Avisa o Observable para buscar novos dados no Firebase
    this.modeSubject.next(this.currentMode);
  }

  get text() {
    return this.translate.isPt() ?
      { title: 'SAGAS LITERÁRIAS', subtitle: 'Acompanhe as nossas histórias.' } :
      { title: 'LITERARY SAGAS', subtitle: 'Follow our stories.' };
  }

  // Mantém os arcos estáticos se você ainda usa eles para o menu
  get arcs() {
    return this.translate.isPt() ? VISUAL_NOVEL_PT : VISUAL_NOVEL_EN;
  }

   get introGeneral(): string {
    return this.translate.isPt() ? VN_INTRO_PT : VN_INTRO_EN;
  }

  get introJonah(): string {
    return this.translate.isPt() ? VN_INTRO_JONAH_PT : VN_INTRO_JONAH_EN;
  }

 /*  get introText() {
    return this.translate.isPt() ? this.introPt : this.introEn;
  } */

  // Getter inteligente que escuta as mudanças de estado
  get introText(): string {
    // Se o Rust & Lord tomou o controle do sistema
    if (this.isJonahMode) {
      return this.translate.isPt() ? VN_INTRO_JONAH_PT : VN_INTRO_JONAH_EN;
    }
    
    // Se a General está no comando (Padrão)
    return this.translate.isPt() ? VN_INTRO_PT : VN_INTRO_EN;
  }

  navigate(link: string) {
    if (link.startsWith('/')) {
      window.scrollTo(0, 0);
      this.router.navigate([link]);
    } else {
      window.open(link, '_blank');
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
