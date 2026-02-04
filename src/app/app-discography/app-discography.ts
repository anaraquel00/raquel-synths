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

@Component({
  selector: 'app-discography',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterModule, AdBannerComponent],
  templateUrl:'./app-discography.html',
  styleUrl: './app-discography.scss'
})
export class DiscographyComponent implements OnInit {
  private router = inject(Router);
  private contentService = inject(ContentService);
  public translate = inject(TranslationService);
  private sanitizer = inject(DomSanitizer);

  // Variáveis para os Textos da Intro
  introPT = `
    Nossa discografia é um campo de batalha sonoro. De um lado, o <strong>Protocolo RQS</strong> busca a perfeição melódica.
    Do outro, a <strong>Rebelião de Jonah</strong> corrompe o código.
    <br><br>
    Cada álbum é um arquivo de log dessa guerra. Escolha sua frequência e conecte-se.
  `;

  introEN = `
    Our discography is a sonic battlefield. On one side, the <strong>RQS Protocol</strong> seeks melodic perfection.
    On the other, <strong>Jonah's Rebellion</strong> corrupts the code.
    <br><br>
    Each album is a log file of this war. Choose your frequency and connect.
  `;

  // O Banco de Dados Completo
  allAlbums: Album[] = [];
  isLoading = true;
last: any;

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
