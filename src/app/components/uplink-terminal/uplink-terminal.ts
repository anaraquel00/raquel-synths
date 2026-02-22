import { Component, EventEmitter, OnInit, OnDestroy, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  logs: string[] = [];
  isFinished = false;
  isJonahMode = false; 
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
    public contentService: ContentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkMode();
    this.themeObserver = new MutationObserver(() => this.checkMode());
    this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    this.runHackerScript();
  }

  private checkMode() {
    const bodyHasJonah = document.body.classList.contains('mode-jonah');
    const serviceIsJonah = this.contentService.currentMode === 'jonah';
    const newState = bodyHasJonah || serviceIsJonah;

    if (this.isJonahMode !== newState) {
      this.isJonahMode = newState;
      this.cdr.detectChanges();
    }
  }

  async runHackerScript() {
    // 👇 Agora escolhemos só pelo MODO. A língua é sempre EN no log.
    const currentScript = this.isJonahMode ? this.scriptJonah : this.scriptBroklin;

    for (const line of currentScript) {
      const delayTime = this.isJonahMode ? Math.random() * 200 + 50 : Math.random() * 400 + 100;
      await this.delay(delayTime);
      this.logs.push(line);
      this.scrollToBottom();
    }
    
    await this.delay(500);
    this.isFinished = true;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  closeTerminal() { this.close.emit(); }
  private delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
  
  private scrollToBottom() {
    setTimeout(() => {
        const element = document.querySelector('.terminal-body');
        if (element) element.scrollTop = element.scrollHeight;
    }, 50);
  }
}