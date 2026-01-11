import { Component, Inject, OnInit, OnDestroy, signal, effect, HostListener, inject } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../services/translation.service';
import { CONTACT_DATA, HOME_DATA } from '../../data/app-data';
import { LastReleasesComponent } from '../../components/last-releases/last-releases';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

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
  private router = inject(Router);

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

  // CONTROLE: Para mostrar o popup apenas uma vez
  private hasSeenExitPopup = false;

  // --- 1. O VIGIA (Escuta se o mouse saiu da tela) ---
  @HostListener('document:mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    // PROTEÇÃO 1: Se já viu o popup, não mostra de novo
    if (this.hasSeenExitPopup) {
      return;
    }

    // PROTEÇÃO 2: Só dispara se o mouse sair pelo TOPO (perto da barra de abas)
    // Se sair pelos lados ou por baixo, ignora.
    if (event.clientY > 20) {
      return;
    }

    // Marca como visto e dispara
    this.hasSeenExitPopup = true;
    this.triggerHomeExitPopup();
  }

  // --- 2. O POPUP (A Lógica Cyberpunk) ---
  triggerHomeExitPopup() {
    const lang = this.translate.currentLang();
    const currentMode = this.translate.currentMode();
    const isJonah = currentMode === 'jonah';

    // Cores baseadas no modo
    const modeColor = isJonah ? '#ff3300' : '#00ffff';
    const bgColor = isJonah ? '#1a0000' : '#121212';

    // TEXTOS: Foco em Newsletter / Não perder novidades
    let title, msg, btnSub, btnLeave;

    if (lang === 'pt') {
      title = isJonah ? 'JÁ VAI FUGIR? 🔥' : 'CONEXÃO PERDIDA? ⚡';
      msg = isJonah
        ? 'O caos continua nas transmissões. Assine para receber ordens.'
        : 'Mantenha a conexão ativa. Receba atualizações da banda e do sistema.';
      btnSub = 'Assinar Newsletter';
      btnLeave = 'Sair do Sistema';
    } else {
      title = isJonah ? 'RUNNING AWAY? 🔥' : 'CONNECTION LOST? ⚡';
      msg = isJonah
        ? 'The chaos continues in our transmissions. Subscribe to receive orders.'
        : 'Keep the connection alive. Get band and system updates.';
      btnSub = 'Subscribe Now';
      btnLeave = 'Log Out';
    }

    // CRIA O SWEETALERT
    Swal.fire({
      title: title,
      text: msg,
      icon: 'question', // Ícone de dúvida

      color: '#fff',
      background: bgColor,

      // Botão Principal: Assinar
      confirmButtonText: `${btnSub} 📩`,
      confirmButtonColor: 'transparent',

      // Botão Cancelar: Sair
      showCancelButton: true,
      cancelButtonText: btnLeave,
      cancelButtonColor: '#333',

      footer: `<span style="color: ${modeColor}">${lang === 'pt' ? '💡 Novidades, shows e lançamentos.' : '💡 News, gigs and releases.'}</span>`,

      customClass: {
        popup: 'cyberpunk-swal'
      },
      didOpen: (popup: { querySelector: (arg0: string) => HTMLElement; }) => {
        // Remove o foco do botão pra evitar enter acidental
        const confirmBtn = popup.querySelector('.swal2-confirm') as HTMLElement;
        if (confirmBtn) confirmBtn.blur();
      }
    }).then((result: { isConfirmed: any; }) => {

      // --- 3. A AÇÃO (Se clicar em Assinar) ---
      if (result.isConfirmed) {
        // Procura a newsletter lá no footer pelo ID
        const targetElement = document.getElementById('newsletter-target');
        const inputElement = document.getElementById('email-input');

        if (targetElement) {
          // Rola a tela até lá
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          // Foca no campo de e-mail depois de um tempinho
          setTimeout(() => {
            if (inputElement) inputElement.focus();
          }, 800);
        }
      }
    });
  }
}
