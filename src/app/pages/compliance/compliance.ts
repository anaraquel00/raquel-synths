import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COMPLIANCE_DATA } from '../../data/app-data'; // Verifique se o caminho está certo
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compliance.html',
  styleUrl: './compliance.scss'
})
export class ComplianceComponent {
mode(): string|string[]|Set<string>|{ [klass: string]: any; }|null|undefined {
throw new Error('Method not implemented.');
}
  private translationService = inject(TranslationService);

  // Mapeamos os sinais do serviço oficial
  lang = this.translationService.currentLang; // 'pt' | 'en'
  isJonah = this.translationService.isJonahMode; // boolean

  /**
   * get data()
   * Forçamos a tipagem das chaves para satisfazer o compilador.
   */
  get data() {
    // Definimos explicitamente que a chave de idioma é 'pt' ou 'en'
    const langKey = this.lang() as 'pt' | 'en';

    // Mapeamos o modo e forçamos o tipo literal 'broklin' ou 'jonah'
    const modeKey = (this.isJonah() ? 'jonah' : 'broklin') as 'broklin' | 'jonah';

    // Agora o TypeScript sabe que essas chaves existem no COMPLIANCE_DATA
    return COMPLIANCE_DATA[langKey][modeKey];
  }

  get currentModeClass() {
    return this.isJonah() ? 'jonah-mode' : 'broklin-mode';
  }
}
