import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Services & Models
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { Album } from '../../models/album.model';
import { AdArticleComponent } from "../../components/ad-article/ad-article";
import { NgOptimizedImage } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-musical-archives',
  standalone: true,
  imports: [CommonModule, RouterModule, AdArticleComponent, NgOptimizedImage], // Imports corretos
  templateUrl: './musical-archives.html',
  styleUrl: './musical-archives.scss',
})
export class MusicalArchives implements OnInit {
  private router = inject(Router);
  private contentService = inject(ContentService);
  public translate = inject(TranslationService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  legacyReleases: Album[] = [];
  isLoading = true;
  featuredJonah: any;
  featuredBroklin: any;
  introEN: any;
  introPT: any;
  isLast: any;
 
  ngOnInit() {
    this.getArchives();
  }

getArchives() {
    this.contentService.getDiscography().subscribe({
      next: (data: any[]) => {
        const albums = data as Album[];

        // 1. Ordena o banco de dados COMPLETO do mais novo pro mais velho
        const sortedData = albums.sort((a, b) => {
           const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
           const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
           return dateB - dateA;
        });

        // 2. Filtra todos os EPs de cada facção
        const broklinFull = sortedData.filter(album => album.faction === 'broklin' || album.faction === 'hybrid');
        const jonahFull = sortedData.filter(album => album.faction === 'jonah' || album.faction === 'hybrid');

        // 🛡️ 3. O GOLPE DE MISERICÓRDIA: .slice(5)
        // Isso diz ao Angular: "Pule os 5 primeiros (que já estão na Home) e me dê todo o resto!"
        this.featuredBroklin = broklinFull.slice(5);
        this.featuredJonah = jonahFull.slice(5);

        // Se você usar a variável legacyReleases globalmente, aplique o corte nela também:
        this.legacyReleases = sortedData.slice(5); 
        
        this.isLoading = false;
      }
    });
  }

  // Configurações de Paginação
pageSize = 5; // Mostra 5 álbuns por vez (ajuste se quiser mais ou menos)
currentPageBroklin = 1;
currentPageJonah = 1;

private scrollToId(id: string) {
    // 🛡️ BLINDAGEM SSR
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

// --- LÓGICA DO BROKLIN (Getters para fatiar o array automaticamente) ---
get paginatedBroklin() {
  // 🛡️ BLINDAGEM SSR: Se o array não existir ainda no servidor, retorna vazio.
  if (!this.featuredBroklin) {
    return [];
  }
  const startIndex = (this.currentPageBroklin - 1) * this.pageSize;
  return this.featuredBroklin.slice(startIndex, startIndex + this.pageSize);
}

get totalPagesBroklin() {
  // 🛡️ BLINDAGEM SSR: Protege o cálculo do '.length' contra undefined.
  if (!this.featuredBroklin) {
    return 0;
  }
  return Math.ceil(this.featuredBroklin.length / this.pageSize);
}

// Controles Broklin
nextBroklin() {
  if (this.currentPageBroklin < this.totalPagesBroklin) {
    this.currentPageBroklin++;
    this.scrollToId('broklin-top');
  }
}

prevBroklin() {
  if (this.currentPageBroklin > 1) {
    this.currentPageBroklin--;
    this.scrollToId('broklin-top');
  }
}

// --- LÓGICA DO JONAH (Independente) ---
get paginatedJonah() {
  if (!this.featuredJonah) {
    return [];
  }
  const startIndex = (this.currentPageJonah - 1) * this.pageSize;
  return this.featuredJonah.slice(startIndex, startIndex + this.pageSize);
}

get totalPagesJonah() {
  // 🛡️ BLINDAGEM SSR: Protege o cálculo do '.length' contra undefined.
  if (!this.featuredJonah) {
    return 0;
  }
  return Math.ceil(this.featuredJonah.length / this.pageSize);
}

// Controles Jonah
nextJonah() {
  if (this.currentPageJonah < this.totalPagesJonah) {
    this.currentPageJonah++;
    this.scrollToId('jonah-top');
  }
}

prevJonah() {
  if (this.currentPageJonah > 1) {
    this.currentPageJonah--;
    this.scrollToId('jonah-top');
  }
}

  GoHome() {
    this.router.navigate(['/']);
  }

  // Link Externo (SoundCloud/Spotify)
  openLink(url: string | undefined) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  getSafeUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
