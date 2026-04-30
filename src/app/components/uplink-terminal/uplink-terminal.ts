import { Component, EventEmitter, OnInit, OnDestroy, Output, PLATFORM_ID, inject, signal, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-uplink-terminal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uplink-terminal.html',
  styleUrl: './uplink-terminal.scss'
})
export class UplinkTerminalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  logs = signal<string[]>([]);
  isFinished = signal<boolean>(false);
  isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | null = null;

  // 🛡️ SCRIPT BROKLIN (Sempre em Inglês - Tech Standard)
  private scriptBroklin = [
    "Establishing secure handshake...",
    "Encrypting connection (AES-256)... [OK]",
    "Bypassing Corporate Firewalls...",
    "Resolving host: raquelsynths.com.br...",
    "Authenticating user credentials...",
    "Access Level: VISITOR [ELEVATED]",
    "Retrieving contact protocols..."
  ];

  // ☣️ SCRIPT JONAH (Sempre em Inglês - Industrial Chaos)
  private scriptJonah = [
    "> Igniting Kerosene Pumps...",
    "> Locking Blast Doors... [LOCKED]",
    "> Overloading Audio Drivers...",
    "> Bypassing Safety Protocols...",
    "> Detecting User Pulse... [NERVOUS]",
    "> Injecting Rust Virus into Local Host...",
    "> Access Level: MEATBAG [ELEVATED]",
    "> Preparing for System Failure..."
  ];

  constructor(
    public translate: TranslationService,
    public contentService: ContentService
  ) {
    // 🛡️ TRAVA TÁTICA: O script hacker e a leitura do DOM iniciam APENAS após a hidratação
    afterNextRender(() => {
      this.checkMode();
      this.themeObserver = new MutationObserver(() => this.checkMode());
      this.themeObserver.observe(this.document.body, { attributes: true, attributeFilter: ['class'] });

      this.runHackerScript();
    });
  }

  ngOnInit() {}

  private checkMode() {
    if (!isPlatformBrowser(this.platformId)) return;

    const bodyHasJonah = this.document.body.classList.contains('mode-jonah');
    const serviceIsJonah = this.contentService.currentMode === 'jonah';
    const newState = bodyHasJonah || serviceIsJonah;

    this.isJonahMode.set(newState);
  }

  async runHackerScript() {
    // 👇 Agora escolhemos só pelo MODO. A língua é sempre EN no log.
    const currentScript = this.isJonahMode() ? this.scriptJonah : this.scriptBroklin;

    for (const line of currentScript) {
      const delayTime = this.isJonahMode() ? Math.random() * 200 + 50 : Math.random() * 400 + 100;
      await this.delay(delayTime);
      this.logs.update(logsArray => [...logsArray, line]);
      this.scrollToBottom();
    }

    await this.delay(500);
    this.isFinished.set(true);
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  closeTerminal() { this.close.emit(); }
  private delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

  private scrollToBottom() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
          const element = this.document.querySelector('.terminal-body');
          if (element) element.scrollTop = element.scrollHeight;
      }, 50);
    }
  }
acessarArquivosMaster() {
    window.open('https://open.spotify.com/intl-pt/artist/1yrPZaFyIcsCjj876LaHXL?si=m6xr309tQw22RRERSvF2eQ', '_blank');
  }

 acessarAlgoritmoCorporativo() {
    window.open('https://youtube.com/@RaquelSynths', '_blank');
  }

  iniciarFrequenciaPirata() {
    window.open('https://soundcloud.com/rqs_official', '_blank');
  }
  // Injeta o comando de abertura de nova aba direto na memória
  iniciarContrabando() {
    window.open('https://discord.gg/ryvhdRnQpQ', '_blank');
  }

}
