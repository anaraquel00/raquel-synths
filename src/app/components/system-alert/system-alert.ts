import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-system-alert',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './system-alert.html',
  styleUrl: './system-alert.scss'
})
export class SystemAlert implements OnInit, OnDestroy {
scrollToDiscord() {
const contatoSection = document.getElementById('contato');
  
  if (contatoSection) {
    // O behavior: 'smooth' cria o efeito de rolagem cinematográfica
    contatoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    console.warn('Alvo não encontrado. O sistema de navegação falhou.');
  }
}
  
  isJonah = false; // Variável local que controla o template
  private themeObserver: MutationObserver | null = null;

  constructor(
    public translate: TranslationService,
    public contentService: ContentService,
    private cdr: ChangeDetectorRef // 👇 Ferramenta para forçar a atualização
  ) {}

  ngOnInit() {
    // 1. Checagem Inicial (Quando a página carrega)
    this.checkMode();

    // 2. O VIGIA 🕵️‍♂️: Fica olhando se a classe do <body> muda
    this.themeObserver = new MutationObserver(() => {
      this.checkMode();
    });

    // Começa a vigiar o <body> procurando mudanças na classe
    this.themeObserver.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
  }

  // Função que atualiza o status
  private checkMode() {
    // Verifica se o body tem a classe do Jonah OU se o serviço diz que é Jonah
    const bodyHasJonah = document.body.classList.contains('mode-jonah');
    const serviceIsJonah = this.contentService.currentMode === 'jonah';

    // A verdade é o que estiver no Body (visual) ou no Serviço (lógico)
    const newState = bodyHasJonah || serviceIsJonah;

    // Só atualiza se mudou de verdade (evita loops)
    if (this.isJonah !== newState) {
      this.isJonah = newState;
      this.cdr.detectChanges(); // 🚨 ORDEM SUPREMA: "Angular, atualize a tela AGORA!"
    }
  }

  ngOnDestroy() {
    // Desliga o vigia quando sair da tela pra não gastar memória
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }
}