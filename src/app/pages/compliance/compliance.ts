import { Component, inject, OnInit, OnDestroy, signal, PLATFORM_ID, afterNextRender } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { COMPLIANCE_DATA } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compliance.html',
  styleUrl: './compliance.scss',
})
export class ComplianceComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private _document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);
  private themeObserver: MutationObserver | undefined;

  // 🛡️ A MÁGICA DA HIDRATAÇÃO DO ANGULAR 20:
  // Inicia FIXO no padrão do Servidor (Inglês / Broklin). O Googlebot vai amar.
  public data = signal<any>(COMPLIANCE_DATA['en']['broklin']);

  constructor() {
    // 🛡️ TRAVA TÁTICA: Tudo o que muda texto visualmente SÓ roda após o DOM estabilizar
    afterNextRender(() => {
      // 1. Atualiza a tela imediatamente para o idioma e tema do fã
      this.atualizarDados();

      // 2. Fica vigiando o botão de Jonah/Broklin
      this.themeObserver = new MutationObserver(() => {
        this.atualizarDados();
      });

      this.themeObserver.observe(this._document.body, {
        attributes: true,
        attributeFilter:['class']
      });
    });
  }

  ngOnInit() {
    // Vazio. Deixamos a inicialização de tela apenas para o afterNextRender!
  }

  ngOnDestroy() {
    this.themeObserver?.disconnect();
  }

  // 🔥 O MOTOR DE TRANSIÇÃO SEGURA
  private atualizarDados() {
    if (!this.isBrowser) return;

    // Descobre a realidade atual do navegador
    const langKey = this.translationService.isPt() ? 'pt' : 'en';
    const isJonah = this._document.body.classList.contains('mode-jonah');
    const modeKey = isJonah ? 'jonah' : 'broklin';

    // Injeta os dados corretos no Signal (Atualiza o HTML de forma limpa)
    this.data.set(COMPLIANCE_DATA[langKey][modeKey]);
  }
}
