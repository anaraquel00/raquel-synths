import { Component, OnInit, OnDestroy, AfterViewChecked, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';
import { Observable } from 'rxjs';
import { SplitContentPipe } from "../../components/pipes/content-splitter.pipe";
import { LoreEpisode } from '../../data/lore-data';
import { AdArticleComponent } from "../../components/ad-article/ad-article";

@Component({
  selector: 'app-lore-reader',
  standalone: true,
  imports: [CommonModule, SplitContentPipe, AdArticleComponent],
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

// Variável de controle para não entrar em loop eterno
  // Mude de boolean para number para contar as tentativas
  private scrollAttempts = 0; 

  ngAfterViewChecked() {
    // 🔍 O ELEMENTO SÓ EXISTE DEPOIS QUE O FIREBASE CARREGA
    if (this.isBrowser && this.targetId && this.scrollAttempts < 3) {
      
      const element = document.getElementById(this.targetId);
      
      if (element) {
        // TÁTICA "DOUBLE TAP" 🔫
        
        // 1. Scroll Imediato (Assim que o elemento nasce no DOM)
        this.scrollToTarget(element);
        this.scrollAttempts++; // Conta 1

        // 2. Scroll de Correção (500ms depois - Imagens leves carregaram)
        setTimeout(() => {
          this.scrollToTarget(element);
        }, 500);

        // 3. Scroll Final (1.5s depois - Garantia total contra internet lenta)
        setTimeout(() => {
          this.scrollToTarget(element);
        }, 1500);
      }
    }
  }

  scrollToTarget(element: HTMLElement) {
    // Como usamos o CSS 'scroll-margin-top', o método nativo funciona melhor!
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' // Alinha o topo do elemento com o topo da janela (respeitando o margin css)
    });
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
