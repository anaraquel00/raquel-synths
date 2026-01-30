import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip'; // Adicionei pra ficar chique
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // 🛡️ Segurança

import { TranslationService } from '../services/translation.service';
import { DISCOGRAPHY_EN, DISCOGRAPHY_PT } from '../data/app-data';
import { Album } from '../models/album.model';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-discography',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './app-discography.html', // Verifique se o nome do arquivo é esse mesmo
  styleUrl: './app-discography.scss'
})
export class DiscographyComponent {

  // --- TEXTOS RICOS (MANIFESTO SONORO) ---
  introPT = `
    Nossa discografia é um campo de batalha sonoro. De um lado, o <strong>Protocolo RQS</strong> (liderado por Broklin e Kelma) busca a perfeição melódica do <em>Synthwave e Dream Pop</em>.
    Do outro, a <strong>Rebelião de Jonah</strong> corrompe o código com <em>Industrial Metal e Glitch</em>.
    <br><br>
    Cada álbum é um arquivo de log dessa guerra. Escolha sua frequência e conecte-se.
  `;

  introEN = `
    Our discography is a sonic battlefield. On one side, the <strong>RQS Protocol</strong> (led by Broklin and Kelma) seeks the melodic perfection of <em>Synthwave and Dream Pop</em>.
    On the other, <strong>Jonah's Rebellion</strong> corrupts the code with <em>Industrial Metal and Glitch</em>.
    <br><br>
    Each album is a log file of this war. Choose your frequency and connect.
  `;

  // 🛡️ Construtor com Sanitizer (Para os iframes funcionarem)
  constructor(
    public translate: TranslationService,
    private sanitizer: DomSanitizer
  ) {}

  // --- GETTERS INTELIGENTES (A Mágica acontece aqui) ---

  // Pega os dados brutos baseados na língua
  get currentData() {
    return this.translate.isPt() ? DISCOGRAPHY_PT : DISCOGRAPHY_EN;
  }

  // Filtra apenas os 2 últimos do Broklin (Destaques)
  get featuredBroklin() {
    // Se o array já vem ordenado do mais novo pro mais velho no app-data, é só cortar
    return this.currentData.broklin.slice(0, 2);
  }

  // Filtra apenas os 2 últimos do Jonah (Destaques)
  get featuredJonah() {
    return this.currentData.jonah.slice(0, 2);
  }

  // --- FUNÇÕES UTILITÁRIAS ---

  // 🛡️ A Vacina de Segurança para Iframes
  getSafeUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return ''; // Se for undefined, retorna vazio
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  openLink(url: string | undefined) {

  // 1. Cláusula de Guarda: Se não tiver URL, para tudo.
  if (!url) {
    console.warn('Botão clicado, mas não há link configurado.');
    return;
  }

  // 2. A Lógica Original (Mantida)
  if (!url.includes('LINK_')) {
    window.open(url, '_blank');
  } else {
    Swal.fire({
      icon: 'info',
      title: this.translate.isPt() ? '🚧 LINK CRIPTOGRAFADO' : '🚧 ENCRYPTED LINK',
      text: this.translate.isPt() ? 'Em breve disponível nos canais oficiais! 😉' : 'Coming soon to official channels! 😉',
      background: '#121212',
      color: '#fff',
      confirmButtonColor: '#d33',
      confirmButtonText: 'OK'
    });
  }
}
viewFullArchive() {
  const title = this.translate.isPt() ? '🔒 ACESSO RESTRITO' : '🔒 ACCESS DENIED';
  const msg = this.translate.isPt()
    ? 'O arquivo completo está sendo descriptografado. Aguarde a próxima atualização do sistema.'
    : 'Full archive is currently being decrypted. Await next system update.';

  Swal.fire({
    icon: 'warning',
    title: title,
    text: msg,
    background: '#121212',
    color: '#fff',
    confirmButtonColor: '#d33',
    confirmButtonText: this.translate.isPt() ? 'ENTENDIDO' : 'UNDERSTOOD'
  });
}
}
