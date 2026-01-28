import { Component, inject, OnInit, OnDestroy, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
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
currentModeClass: string|string[]|Set<string>|{ [klass: string]: any; }|null|undefined;
complianceData: any;

  ngOnInit() {
    if (this.isBrowser) {
    // O Vigia: Se a classe 'mode-jonah' aparecer no body, a gente muda o texto
    this.themeObserver = new MutationObserver(() => {
      this.checkMode();
    });

    this.themeObserver.observe(this._document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Checagem inicial
    this.checkMode();
  }
}

  ngOnDestroy() {
    // Desliga o vigia ao sair
    this.themeObserver?.disconnect();
  }

  private checkMode() {
    // A verdade está no HTML, não no serviço
    this.isJonah.set(this._document.body.classList.contains('mode-jonah'));
  }

  // 3. O GETTER DE DADOS (Blindado)
  get data() {
    const langKey = this.lang(); // 'pt' ou 'en'
    const modeKey = this.isJonah() ? 'jonah' : 'broklin';

    // Retorna o texto correto do arquivo de dados
    return COMPLIANCE_DATA[langKey][modeKey];
  }
}
