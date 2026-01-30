import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../services/translation.service';
import { VISUAL_NOVEL_PT, VISUAL_NOVEL_EN, VN_INTRO_PT, VN_INTRO_EN } from '../data/app-data';
import { Router } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { AdBannerComponent } from "../components/ad-banner/ad-banner"; // <--- IMPORTANTE: Importe o Router!
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-visual-novel',
  standalone: true,
  imports: [CommonModule, MatIconModule, AdBannerComponent, MatButtonModule],
  templateUrl: './app-visual-novel.html',
  styleUrls: ['./app-visual-novel.scss']
})
export class AppVisualNovel implements OnInit, OnDestroy {
  translate = inject(TranslationService);
  private router = inject(Router); // <--- Injeta o GPS

  // Estado do Modo (Padrão: Broklin)
  currentMode: 'broklin' | 'jonah' = 'broklin';
  private themeObserver: MutationObserver | null = null;
  introPt = VN_INTRO_PT;
  introEn = VN_INTRO_EN;
  introPT: any;
  introEN: any;

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
  }

  get text() {
    return this.translate.isPt() ?
      { title: 'VISUAL NOVEL', subtitle: 'Acompanhe as nossas histórias.' } :
      { title: 'VISUAL NOVEL', subtitle: 'Follow our stories.' };
  }

  get arcs() {
    return this.translate.isPt() ? VISUAL_NOVEL_PT : VISUAL_NOVEL_EN;
  }
  get introText() {
    return this.translate.isPt() ? this.introPt : this.introEn;
  }

  // A Função Mágica de Navegação
  navigate(link: string) {
    if (link.startsWith('/')) {
      // Se começa com barra, é interno (Lore)
      window.scrollTo(0, 0);
      this.router.navigate([link]);
    } else {
      // Se não, é externo (YouTube)
      window.open(link, '_blank');
    }
  }

  // Rola a página para o topo (onde fica o botão de tema)
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
