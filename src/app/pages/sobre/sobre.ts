import { Component, effect, inject, PLATFORM_ID, signal, OnInit, OnDestroy, afterNextRender } from '@angular/core';
import { MEMBERS_PT, MEMBERS_EN, MANIFESTO_PT, MANIFESTO_EN, MANIFESTO_JONAH_EN, MANIFESTO_JONAH_PT } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './sobre.html',
  styleUrl: './sobre.scss',
  // 🛡️ O ESCUDO TOTAL: Desativa a hidratação no HOST do componente
  host: {
    'ngSkipHydration': 'true'
  }
})
export class SobreComponent implements OnInit, OnDestroy {

  manifestoPt = MANIFESTO_PT;
  manifestoEn = MANIFESTO_EN;
  manifesto_jonah_pt = MANIFESTO_JONAH_PT;
  manifesto_jonah_en = MANIFESTO_JONAH_EN;
  // Começa com PT
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | null = null;
members: any;


  constructor(public translate: TranslationService) {
    // 🛡️ TRAVA TÁTICA: O Observer e a leitura do DOM nascem apenas pós-hidratação
    afterNextRender(() => {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });
    });

    effect(() => {
      if (this.translate.isPt()) {
        this.members = MEMBERS_PT;
      } else {
        this.members = MEMBERS_EN;
      }
    });
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }
  ngOnInit() {
  }
    // A MÁGICA: Sempre que o idioma mudar, ele troca o array inteiro!
// 👇 FUNÇÃO MÁGICA DE INTERCEPTAÇÃO
  handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Se o elemento clicado (ou o pai dele) tiver a classe 'human-link'
    if (target.classList.contains('human-link')) {
      console.log('🔗 Link da Criadora detectado via Texto!');
      this.router.navigate(['/creator']); // Navega sem recarregar!
    }
  }
  }
