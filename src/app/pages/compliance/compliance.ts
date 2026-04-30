import { Component, inject, OnInit, OnDestroy, signal, computed, Inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { COMPLIANCE_DATA } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compliance.html',
  styleUrl: './compliance.scss'
})
export class ComplianceComponent implements OnInit, OnDestroy {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // 🛡️ TRAVA TÁTICA: A leitura do DOM para o tema só ocorre após a hidratação completa
    afterNextRender(() => {
      this.themeObserver = new MutationObserver(() => {
        this.checkMode();
      });

      this.themeObserver.observe(this._document.body, {
        attributes: true,
        attributeFilter: ['class']
      });

      // Checagem inicial
      this.checkMode();
    });
  }
  isBrowser: boolean;
  // Injetamos o serviço de tradução

  private translationService = inject(TranslationService);
  // Injetamos o DOCUMENT para vigiar o corpo da página
  private _document = inject(DOCUMENT);

  // 1. TRADUÇÃO: Convertemos o boolean do serviço para string ('pt' ou 'en')
  lang = computed(() => this.translationService.isPt() ? 'pt' : 'en');

  // 2. MODO CAOS: Detectamos manualmente, já que o serviço é burro
  isJonah = signal(false);
  private themeObserver: MutationObserver | undefined;

  // 🛡️ ADSENSE SENTINEL: Variáveis órfãs (currentModeClass, complianceData) expurgadas.

  ngOnInit() {
    // Lógica movida para o afterNextRender no construtor
  }

  ngOnDestroy() {
    // Desliga o vigia ao sair
    this.themeObserver?.disconnect();
  }

  private checkMode() {
    // 🛡️ BLINDAGEM SSR: Trava de plataforma interna obrigatória
    if (this.isBrowser) {
      this.isJonah.set(this._document.body.classList.contains('mode-jonah'));
    }
  }

  // 3. O GETTER DE DADOS (Blindado)
  get data() {
    const langKey = this.lang(); // 'pt' ou 'en'
    const modeKey = this.isJonah() ? 'jonah' : 'broklin';

    // Retorna o texto correto do arquivo de dados
    return COMPLIANCE_DATA[langKey][modeKey];
  }
}
