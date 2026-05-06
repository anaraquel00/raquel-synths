import { Component, inject, OnInit, OnDestroy, signal, afterNextRender } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { COMPLIANCE_DATA } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compliance.html',
  styleUrls: ['./compliance.scss']
})
export class ComplianceComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private _document = inject(DOCUMENT);

  // 🛡️ O PADRÃO OURO DE SSR (ANGULAR 20)
  // Iniciamos o Signal FIXO com o valor que o Servidor (Vercel) renderiza.
  // O Googlebot lê isso, vê que o HTML e o Dado são iguais (Inglês) e dá OK!
  public data = signal<any>(COMPLIANCE_DATA['en']['broklin']);

  private themeObserver: MutationObserver | undefined;

  constructor() {
    // 🛡️ A MÁGICA: Só atualiza para o Português (ou modo Jonah)
    // DEPOIS que o Angular terminou a hidratação e o DOM está estável!
    afterNextRender(() => {
      this.atualizarDados();

      this.themeObserver = new MutationObserver(() => {
        this.atualizarDados();
      });

      this.themeObserver.observe(this._document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.themeObserver?.disconnect();
  }

  private atualizarDados() {
    const langKey = this.translationService.isPt() ? 'pt' : 'en';
    const modeKey = this._document.body.classList.contains('mode-jonah') ? 'jonah' : 'broklin';

    // Atualiza o texto na tela de forma limpa e segura
    this.data.set(COMPLIANCE_DATA[langKey][modeKey]);
  }
}
