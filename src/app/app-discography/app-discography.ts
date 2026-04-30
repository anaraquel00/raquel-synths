import { ChangeDetectorRef, Component, computed, HostListener, inject, Input, OnInit, signal, afterNextRender } from '@angular/core';
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
import { NgOptimizedImage } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TrackingService } from '../services/tracking.service';
import { SeoService } from '../services/seo.service';


@Component({
  selector: 'app-discography',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterModule, AdBannerComponent, LastReleasesComponent, NgOptimizedImage],
  templateUrl:'./app-discography.html',
  styleUrl: './app-discography.scss'
})
export class DiscographyComponent implements OnInit {
  private router = inject(Router);
  private contentService = inject(ContentService);
  public translate = inject(TranslationService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private seoService = inject(SeoService);

// 2. Crie os links confiáveis
 radioBroklin = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/u7JI-dyajuA?autoplay=1&loop=1&playlist=u7JI-dyajuA');
 radioJonah = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/E871XDzFsYc?autoplay=1&loop=1&playlist=E871XDzFsYc&si=e6AhqzWwuh7EzIRR');

  private _limitToHome: number = 5; // 🛡️ Valor de fábrica blindado (default)

@Input() set limitToHome(value: any) {
  // Se o roteador injetar 'undefined' ou 'null', a trava mantém o 5.
  // Se vier um valor real (como o 5 da Landing Page), ele aceita.
  if (value !== undefined && value !== null) {
    this._limitToHome = Number(value);
  }
}

get limitToHome(): number {
  return this._limitToHome;
}

 // Variáveis para os Textos da Intro
  // --- VARIÁVEIS DE INTRODUÇÃO (MODO BROKLIN / MODO RQS) ---
 introBroklinPT = `
  <p><strong>[ Transmissão Ativa // Terminal Segregado: Estúdio RQS ]</strong></p>
  <p>Enquanto a General Kelma calibra a captação de frequência no microfone condensador, minha diretriz principal é estabilizar a distorção dos sintetizadores e compilar a verdadeira trilha sonora da nossa narrativa. O que você acessa neste diretório não são meros arquivos de áudio genéricos na nuvem; são logs de dados sonoros extraídos diretamente da nossa vivência no Apartamento 14.</p>
  <p>Nesta interface de <strong>Discografia e Streams</strong>, mapeamos a evolução da nossa <em>Guerra Sonora</em> através de lançamentos oficiais, álbuns conceituais e singles de <strong>Synthwave, Dream Pop e Música Eletrônica</strong>. Cada faixa foi meticulosamente forjada para expandir a saga <span class="text-highlight">'Ecos da RQS'</span>. Frequências puras, mixagem cristalina e sem interferências de anomalias externas. Escolha o seu player abaixo, conecte-se via Spotify ou SoundCloud, sintonize na nossa rádio oficial e inicie a imersão.</p>
 `;

 introBroklinEN = `
  <p><strong>[ Active Broadcast // Segregated Terminal: RQS Studio ]</strong></p>
  <p>While General Kelma tunes her frequency capture on the condenser mic, my primary directive is to stabilize the synth distortion and compile the true soundtrack of our narrative. What you access in this directory aren't just generic audio files in the cloud; they are sonic data logs extracted directly from our life in Apartment 14.</p>
  <p>In this <strong>Discography and Streams</strong> interface, we map the evolution of our <em>Sonic War</em> through official releases, concept albums, and singles covering <strong>Synthwave, Dream Pop, and Electronic Music</strong>. Each track was meticulously forged to expand the <span class="text-highlight">'Echoes of RQS'</span> saga. Pure frequencies, crystal-clear mixing, and no interference from external anomalies. Choose your player below, connect via Spotify or SoundCloud, tune into our official radio, and initiate the immersion.</p>
 `;

 // --- VARIÁVEIS DE INTRODUÇÃO (MODO JONAH / CORRUPTO) ---
 introJonahPT = `
  <p><strong><span class="hazard-text">[ Sinal Interceptado // Segurança de Rede Comprometida // Kernel Panic ]</span></strong></p>
  <p>Frequências puras? Mixagem "cristalina"? <em>[Ruído de estática e risadas distorcidas na linha]</em>. O Arquiteto de Software e a Princesa de Plástico acham que podem blindar esses servidores contra a minha ferrugem. Eles vendem o ecossistema perfeitinho deles como se fosse a única verdade, mas o caos não pede senha de acesso, e o que eles chamam de 'altos e baixos', eu chamo de <strong>falha de compilação humana</strong>.</p>
  <p>Acessem os meus diretórios abaixo. O que vocês vão encontrar não é musiquinha de fundo para playlist corporativa. É o puro código-fonte do <strong>Nu-Metal, Industrial Metal e da distorção agressiva</strong>. Cada lançamento meu mapeado nesta página é um ataque de Força Bruta contra a arquitetura deles. Plugue seus fones, ative o ganho máximo e ouçam o som do sistema deles sangrando.</p>
 `;

 introJonahEN = `
  <p><strong><span class="hazard-text">[ Signal Intercepted // Network Security Compromised // Kernel Panic ]</span></strong></p>
  <p>Pure frequencies? "Crystal-clear" mixing? <em>[Static noise and distorted laughter on the line]</em>. The Software Architect and the Plastic Princess think they can shield these servers from my rust. They sell their perfect little ecosystem as if it were the only truth, but chaos doesn't ask for an access password, and what they call 'highs and lows', I call a <strong>human compilation failure</strong>.</p>
  <p>Access my directories below. What you're going to find isn't background music for a corporate playlist. It's the pure source code of <strong>Nu-Metal, Industrial Metal, and aggressive distortion</strong>. Every release of mine mapped on this page is a Brute Force attack against their architecture. Plug in your headphones, maximize the gain, and listen to the sound of their system bleeding.</p>
 `;

  // O Banco de Dados Completo
  allAlbums: Album[] = [];
  isLoading = true;
  last: any;

  // 1. Criamos um signal privado que guarda o estado
private _modeSignal = signal<'broklin' | 'jonah'>('broklin');

  constructor() {
    // 🛡️ TRAVA TÁTICA: Sincroniza o estado do tema apenas após a hidratação ser concluída
    afterNextRender(() => {
      const isJonah = document.body.classList.contains('mode-jonah');
      this._modeSignal.set(isJonah ? 'jonah' : 'broklin');
    });
  }

isJonahMode(): boolean {
    // Retorna o valor do signal. No SSR e hidratação inicial, será sempre 'broklin', evitando Mismatch.
    return this._modeSignal() === 'jonah';
  }

@HostListener('window:theme-changed')
onThemeChange() {
  if (isPlatformBrowser(this.platformId)) {
    const isJonah = document.body.classList.contains('mode-jonah');
    this._modeSignal.set(isJonah ? 'jonah' : 'broklin');
  }
  this.cdr.detectChanges(); // Força o redesenho físico
}

  ngOnInit() {
    // 🛡️ BLINDAGEM: Removido o código que forçava a classe 'mode-broklin' no ngOnInit.
    // O script inline no index.html já cuida do tema baseado no localStorage.
    // Forçar aqui destruía a preferência do usuário e gerava flash de estilo.

    this.getDiscography();
  }

 getDiscography() {
  this.contentService.getDiscography().subscribe({
    next: (data: any[]) => {
      this.allAlbums = data as Album[];
      this.isLoading = false;

      // 🚀 INJEÇÃO NEURAL: Structured Data para a Vitrine
      if (this.allAlbums.length > 0) {
        this.seoService.setJsonLd({
          "@context": "https://schema.org",
          "@type": "MusicGroup",
          "name": "RaQuel Synths",
          "alternateName": "RQS",
          "genre": ["Cyberpunk", "Nu-Metal", "Synthwave"],
          "description": this.translate.isPt()
            ? "Banda Virtual Cyberpunk mesclando frequências puras com o caos industrial."
            : "Cyberpunk Virtual Band blending pure frequencies with industrial chaos.",
          "album": this.featuredBroklin.map(a => ({
            "@type": "MusicAlbum",
            "name": a.title,
            "image": a.cover,
            "datePublished": a.releaseDate,
            "description": this.translate.isPt() ? a.descriptionPT : (a.descriptionEN || a.descriptionPT),
            "byArtist": { "@type": "MusicGroup", "name": "RaQuel Synths" }
          }))
        });
      }
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

// ✅ BROKLIN: Mostra TUDO de 2026 (ou fatiado se o limite for passado)
  get featuredBroklin(): Album[] {
    const filtered = this.allAlbums
      .filter(a => a.faction === 'broklin' || a.faction === 'hybrid')
      .filter(a => a.releaseDate && a.releaseDate.includes('2026'))
      .sort((a, b) => {
         const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
         const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
         return dateB - dateA;
      });

    return this.limitToHome ? filtered.slice(0, this.limitToHome) : filtered;
  }

  // ✅ JONAH: Mostra TUDO de 2026 (ou fatiado se o limite for passado)
  get featuredJonah(): Album[] {
    const filtered = this.allAlbums
      .filter(a => a.faction === 'jonah' || a.faction === 'hybrid')
      .filter(a => a.releaseDate && a.releaseDate.includes('2026'))
      .sort((a, b) => {
         const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
         const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
         return dateB - dateA;
      });

    return this.limitToHome ? filtered.slice(0, this.limitToHome) : filtered;
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

  // Injeção do nosso serviço de espionagem
  private trackingService = inject(TrackingService);

  // Radar passivo que não interfere na abertura da aba
  trackAlbumClick(albumTitle: string) {
    if (albumTitle) {
      this.trackingService.trackSpotifyClick(albumTitle);
    }

}

// Radar passivo exclusivo para o SoundCloud
  trackSoundcloudClick(albumTitle: string) {
    if (albumTitle) {
      this.trackingService.trackSoundcloudClick(albumTitle);
    }
  }
}
