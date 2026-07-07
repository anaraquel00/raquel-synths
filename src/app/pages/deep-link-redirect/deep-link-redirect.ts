import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicalLinksService, MusicalLinkData } from '../../services/musical-links.service';
import { TranslationService } from '../../services/translation.service'; // 🛰️ INJEÇÃO DO REDIRECT BILINGUE
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-deep-link-redirect',
  standalone: true,
  template: `
    <div class="terminal-redirect">
      <div class="matrix-box">
        <!-- Título Dinâmico do Terminal -->
        <p class="blink">
          {{ translate.isPt() ? '[ UPLINK RQS // REDIRECIONANDO COORDENADAS SONORAS ]' : '[ UPLINK RQS // REDIRECTING SONIC COORDINATES ]' }}
        </p>

        <!-- Estados do Barramento de Roteamento -->
        @if (loading()) {
          <p class="status">
            {{ translate.isPt() ? 'Acessando banco de dados do Mainframe...' : 'Accessing Mainframe database...' }}
          </p>
        } @else if (error()) {
          <p class="error">
            {{ translate.isPt() ? 'ERRO 404: Link não encontrado na base de dados.' : 'ERROR 404: Link not found in the database.' }}
          </p>
        } @else {
          <p class="success">
            {{ translate.isPt() ? 'Sinal de aplicativo nativo disparado. Aguardando handshake...' : 'Native app signal fired. Awaiting handshake...' }}
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    .terminal-redirect { background: #050505; color: #00ff66; font-family: 'Courier New', monospace; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; }
    .matrix-box { border: 1px solid #00ff66; padding: 2rem; box-shadow: 0 0 15px rgba(0, 255, 102, 0.2); }
    .blink { animation: blinker 1.5s linear infinite; font-weight: bold; }
    .error { color: #ff3333; }
    .status { color: #888; }
    @keyframes blinker { 50% { opacity: 0; } }
  `]
})
export class DeepLinkRedirectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private linkService = inject(MusicalLinksService);
  private platformId = inject(PLATFORM_ID);

  // Mudado para protected para o template HTML herdar o escopo do serviço
  protected translate = inject(TranslationService);

  loading = signal<boolean>(true);
  error = signal<boolean>(false);
  private fallbackTimeoutId: any = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.handleError();
      return;
    }

    this.linkService.getLinkData(id).pipe(first()).subscribe({
      next: (data) => {
        if (data) {
          this.loading.set(false);
          this.executeDeepLinkProtocol(data);
        } else {
          this.handleError();
        }
      },
      error: () => this.handleError()
    });
  }

  private executeDeepLinkProtocol(data: any): void {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);

    const clickedService = this.route.snapshot.queryParamMap.get('service');
    const targetService = (clickedService === 'spotify' || clickedService === 'soundcloud')
      ? clickedService
      : 'soundcloud';

    let webUrl = '';
    let uriScheme = '';

    if (targetService === 'spotify') {
      const spotifyLink = data.spotifyUrl || data.spotify;
      webUrl = spotifyLink;

      if (spotifyLink && spotifyLink.includes('/track/')) {
        const urlParts = spotifyLink.split('/track/');
        const trackId = urlParts[1]?.split('?')[0];
        uriScheme = `spotify:track:${trackId}`;
      }
    } else {
      webUrl = data.soundcloud;
      uriScheme = data.soundcloudUriScheme;
    }

    if (!isMobile) {
      if (webUrl) window.location.href = webUrl;
      return;
    }

    this.setupVisibilityListeners();

    this.fallbackTimeoutId = setTimeout(() => {
      if (webUrl) window.location.href = webUrl;
    }, 1500);

    if (uriScheme) window.location.href = uriScheme;
  }

  private setupVisibilityListeners(): void {
    const clearFallback = () => {
      if (this.fallbackTimeoutId) {
        clearTimeout(this.fallbackTimeoutId);
        this.fallbackTimeoutId = null;
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearFallback();
    });

    window.addEventListener('pagehide', clearFallback);
  }

  private handleError(): void {
    this.loading.set(false);
    this.error.set(true);
  }
}
