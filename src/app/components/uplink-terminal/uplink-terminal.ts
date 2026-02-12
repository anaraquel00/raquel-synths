import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
// 👇 IMPORTANTE: Importe o seu serviço de tradução (ajuste o caminho se precisar)
import { TranslationService } from '../../services/translation.service'; 


@Component({
  selector: 'app-uplink-terminal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uplink-terminal.html',
  styleUrl: './uplink-terminal.scss'
})
export class UplinkTerminalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  logs: string[] = [];
  isFinished = false;

  private script = [
    "Establishing secure handshake...",
    "Encrypting connection (AES-256)... [OK]",
    "Bypassing Corporate Firewalls...",
    "Resolving host: raquelsynths.com.br...",
    "Authenticating user credentials...",
    "Access Level: VISITOR [ELEVATED]",
    "Retrieving contact protocols..."
  ];

  // 👇 INJEÇÃO DO SERVIÇO
  constructor(public translate: TranslationService) {}

  ngOnInit() {
    this.runHackerScript();
  }

  async runHackerScript() {
    for (const line of this.script) {
      await this.delay(Math.random() * 400 + 100); // Dei uma acelerada pra não ficar chato
      this.logs.push(line);
      this.scrollToBottom();
    }
    
    await this.delay(500);
    this.isFinished = true;
    this.scrollToBottom();
  }

  closeTerminal() {
    this.close.emit();
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private scrollToBottom() {
    setTimeout(() => {
        const element = document.querySelector('.terminal-body');
        if (element) element.scrollTop = element.scrollHeight;
    }, 50);
  }
}