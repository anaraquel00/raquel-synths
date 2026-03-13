import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';

// Services & Models
import { TranslationService } from '../services/translation.service';
import { ContentService } from '../services/content.service';
import { Album } from '../models/album.model';
import { AdBannerComponent } from "../components/ad-banner/ad-banner";
import { LastReleasesComponent } from "../components/last-releases/last-releases";

@Component({
  selector: 'app-discography',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterModule, AdBannerComponent, LastReleasesComponent],
  templateUrl:'./app-discography.html',
  styleUrl: './app-discography.scss'
})
export class DiscographyComponent implements OnInit {
  private router = inject(Router);
  private contentService = inject(ContentService);
  public translate = inject(TranslationService);
  private sanitizer = inject(DomSanitizer);

  // Variáveis para os Textos da Intro
// --- VARIÁVEIS DE INTRODUÇÃO (MODO BROKLIN / MODO RQS) ---
introBroklinPT = `
  <strong>[Transmissão ao vivo do Estúdio RQS]</strong><br>
  Enquanto a General Kelma ajusta a captação de voz no microfone condensador, eu calibro a distorção dos sintetizadores para compilar a verdadeira trilha sonora da saga 
  <span class="text-highlight">'Ecos da RQS'</span>. O que você encontra aqui não são apenas músicas; são arquivos de áudio extraídos diretamente da nossa vivência no Apartamento 14 e dos nossos altos e baixos no percorrer da história. 
  Frequências puras, sem interferências externas. Escolha o seu terminal abaixo e inicie a imersão sonora.
`;

introBroklinEN = `
  <strong>[Live Broadcast from RQS Studio]</strong><br>
  While General Kelma tunes her vocal capture on the condenser mic, I calibrate the synth distortion to compile the true soundtrack of the 
  <span class="text-highlight">'Echoes of RQS'</span> saga. What you find here aren't just songs; they are audio files extracted directly from our life in Apartment 14 and our highs and lows throughout the story. 
  Pure frequencies, no external interference. Choose your terminal below and initiate the sonic immersion.
`;

// --- VARIÁVEIS DE INTRODUÇÃO (MODO JONAH / CORRUPTO) ---
introJonahPT = `
  <strong><span class="hazard-text">[Sinal Interceptado // Servidor Corrompido]</span></strong><br>
  Frequências puras? Sem interferências? <em>[Risadas distorcidas na linha]</em>. O 'Arquiteto' e a sua General acham que podem blindar esse servidor contra a minha ferrugem. A verdade é que o caos não pede senha de acesso, e o que eles chamam de 'altos e baixos', eu chamo de realidade. 
  Acessem os meus arquivos abaixo e ouçam o som do sistema deles sangrando.
`;

introJonahEN = `
  <strong><span class="hazard-text">[Signal Intercepted // Corrupted Server]</span></strong><br>
  Pure frequencies? No interference? <em>[Distorted laughter on the line]</em>. The 'Architect' and his General think they can shield this server from my rust. The truth is, chaos doesn't ask for a password, and what they call 'highs and lows', I call reality. 
  Access my files below and listen to the sound of their system bleeding.
`;

  // O Banco de Dados Completo
  allAlbums: Album[] = [];
  isLoading = true;
 last: any;

// O componente lê o barramento global em tempo real
get isJonahMode(): boolean {
  // Troque 'jonah-theme' pelo nome exato da classe que o seu botão global adiciona no body
  return document.body.classList.contains('jonah-theme'); 
}
 

  ngOnInit() {
    this.getDiscography();
  }

  getDiscography() {
    this.contentService.getDiscography().subscribe({
      next: (data: any[]) => {
        // Guarda TUDO na variável mestre
        this.allAlbums = data as Album[];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar álbuns:', err);
        this.isLoading = false;
      }
    });
  }

  // --- GETTERS (A Mágica que conserta o HTML) ---

 // --- HELPER: O CALENDÁRIO INTELIGENTE ---
  // Verifica se a data do álbum é do Mês e Ano atuais
  isCurrentMonth(dateString: string | undefined): boolean {
    if (!dateString) return false;

    // Tenta converter a string "2026-02-03" em Data
    // O trunque do "T00:00:00" é pra evitar problemas de fuso horário voltando um dia
    const releaseDate = new Date(dateString + 'T12:00:00');
    const today = new Date();

    return releaseDate.getMonth() === today.getMonth() &&
    releaseDate.getFullYear() === today.getFullYear();
  }

  // --- GETTERS CORRIGIDOS ---
// ✅ BROKLIN: Mostra TUDO de 2026 (Janeiro, Fev, Março...)
  get featuredBroklin(): Album[] {
    return this.allAlbums
      .filter(a => a.faction === 'broklin' || a.faction === 'hybrid')
      // 👇 FILTRO DE ANO: Se tiver "2026" na data, fica na Home.
      .filter(a => a.releaseDate && a.releaseDate.includes('2026'))
      .sort((a, b) => {
         const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
         const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
         return dateB - dateA;
      });
  }

  // ✅ JONAH: Mostra TUDO de 2026
  get featuredJonah(): Album[] {
    return this.allAlbums
      .filter(a => a.faction === 'jonah' || a.faction === 'hybrid')
      // 👇 FILTRO DE ANO
      .filter(a => a.releaseDate && a.releaseDate.includes('2026'))
      .sort((a, b) => {
         const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
         const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
         return dateB - dateA;
      });
  }

  // --- FUNÇÕES DO HTML ---

  getSafeUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  openLink(url: string | undefined) {
    if (url) window.open(url, '_blank');
  }

  // Função que o seu HTML pediu no final
  GoHome() {
    // Se isso for a Landing Page, talvez você queira ir para o Arquivo
    // Se for o Arquivo, volta pra Home.
    // Como está "Back to Home", vou mandar pra raiz:
    this.router.navigate(['/']);
  }

  // Caso queira o botão de arquivo separado
  navigateFullArchive() {
    this.router.navigate(['/musical-archives']);
  }
}
