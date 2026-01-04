import { Component, Inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../services/translation.service';
import { CONTACT_DATA, HOME_DATA } from '../../data/app-data';
import { LastReleasesComponent } from '../../components/last-releases/last-releases';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, LastReleasesComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {

  // Armazena os dados atuais (Reativo)
  private homeSignal = signal<any>({});
  private contactSignal = signal<any>({});

  // O Vigia do Body
  private themeObserver: MutationObserver | undefined;

  constructor(
    public translate: TranslationService,
    @Inject(DOCUMENT) private document: Document
  ) {
    // 1. Reage se o idioma mudar
    effect(() => {
      this.updateContent();
    });
  }

  // 👇 INICIALIZAÇÃO: Onde ligamos o Vigia
  ngOnInit() {
    this.themeObserver = new MutationObserver(() => {
      this.updateContent(); // Se a classe do body mudar, atualiza o texto
    });

    // Começa a vigiar o <body> procurando mudanças na 'class'
    this.themeObserver.observe(this.document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Primeira carga
    this.updateContent();
  }

  // 👇 LIMPEZA: Desliga o Vigia quando sair da página
  ngOnDestroy() {
    this.themeObserver?.disconnect();
  }

  // 👇 A MÁGICA: Decide qual texto mostrar
  updateContent() {
    const lang = this.translate.isPt() ? 'pt' : 'en';
    const rawHome = HOME_DATA[lang];

    // Verifica se o modo CAOS está ativado
    const isJonahMode = this.document.body.classList.contains('mode-jonah');

    // Define os dados da Home (Normal ou Jonah)
    this.homeSignal.set({
      title: rawHome.title,
      // Se for Jonah, tenta pegar o subtitleJonah. Se não, usa o normal.
      subtitle: isJonahMode ? (rawHome as any).subtitleJonah || rawHome.subtitle : rawHome.subtitle,
      cta: isJonahMode ? (rawHome as any).ctaJonah || rawHome.cta : rawHome.cta
    });

    // Define os dados de contato
    this.contactSignal.set(CONTACT_DATA[lang]);
  }

  // 👇 GETTERS: Para o seu HTML continuar funcionando igual ({{ navText.title }})
  get navText() {
    return this.homeSignal();
  }

  get contactText() {
    return this.contactSignal();
  }

  // Mantive sua função de scroll original
  scrollTo(elementId: string): void {
    const element = this.document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn(`ALERTA: Elemento '${elementId}' não encontrado.`);
    }
  }
}
