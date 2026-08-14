import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicalLinksService, MusicalLinkData } from '../../services/musical-links.service';
import { TranslationService } from '../../services/translation.service'; // 🛰️ INJEÇÃO DO REDIRECT BILINGUE
import { first } from 'rxjs/operators';
import { Meta } from '@angular/platform-browser';

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
  private meta = inject(Meta);
  // Mudado para protected para o template HTML herdar o escopo do serviço
  protected translate = inject(TranslationService);

  loading = signal<boolean>(true);
  error = signal<boolean>(false);
  private fallbackTimeoutId: any = null;


ngOnInit(): void {

  this.meta.updateTag({
    name: 'robots',
    content: 'noindex, nofollow'
  });

  if (!isPlatformBrowser(this.platformId)) {
    return;
  }

  this.meta.addTag({
    name: 'robots',
    content: 'noindex, nofollow'
  });


  // =================================================
  // TELEMETRIA DE ROTA
  // =================================================

  console.log(
    '--- SCANNER DE ROTA LOCAL ---'
  );

  console.log(
    'URL Completa detectada:',
    window.location.href
  );

  console.log(
    'ParamMap completo:',
    this.route.snapshot.paramMap.keys
  );

  console.log(
    'ID isolado por paramMap:',
    this.route.snapshot.paramMap.get('id')
  );

  console.log(
    'ID isolado por queryParamMap:',
    this.route.snapshot.queryParamMap.get('id')
  );


  // =================================================
  // META RADAR
  // =================================================

  if (
    (window as any).acionarRadarMeta
  ) {

    (window as any).acionarRadarMeta();
  }


  // =================================================
  // ID DA ROTA
  // =================================================

  const id =
    this.route.snapshot.paramMap.get('id');

  if (!id) {
    this.handleError();
    return;
  }


  // =================================================
  // FIRESTORE
  // =================================================

  this.linkService
    .getLinkData(id)
    .pipe(first())
    .subscribe({

      next: (data) => {

        if (!data) {
          this.handleError();
          return;
        }

        this.loading.set(false);

        // =============================================
        // PROFILE DEEP LINK
        // =============================================

        if (
          data.linkType === 'profile'
        ) {

          this.executeProfileDeepLinkProtocol(
            data
          );

          return;
        }


        // =============================================
        // TRACK / VIDEO / CONTENT DEEP LINK
        // =============================================

        this.executeDeepLinkProtocol(
          data
        );
      },


      error: () => {

        this.handleError();
      }
    });
}

private executeDeepLinkProtocol(
  data: MusicalLinkData
): void {

  // =================================================
  // TELEMETRIA
  // =================================================

  const clickedService =
    this.route.snapshot.queryParamMap.get('service');

  const contentId =
    this.route.snapshot.paramMap.get('id');

  if (
    typeof (window as any).fbq !== 'undefined'
  ) {
    (window as any).fbq(
      'track',
      'ViewContent',
      {
        content_name:
          data.title || 'Música',

        content_category:
          'DeepLink Redirect',

        content_ids:
          contentId
            ? [contentId]
            : [],

        content_type:
          'product',

        status:
          clickedService
      }
    );
  }


  // =================================================
  // DISPOSITIVO
  // =================================================

  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    (window as any).opera ||
    '';

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(
      userAgent
    );


  // =================================================
  // SERVIÇOS DE CONTEÚDO
  // =================================================

  type ContentService =
    | 'spotify'
    | 'soundcloud'
    | 'youtube'
    | 'site';


  const validServices =
    new Set<ContentService>([
      'spotify',
      'soundcloud',
      'youtube',
      'site'
    ]);


  const targetService: ContentService =
    clickedService &&
    validServices.has(
      clickedService as ContentService
    )
      ? clickedService as ContentService
      : 'soundcloud';


  let webUrl = '';
  let uriScheme = '';


  // =================================================
  // SPOTIFY — TRACK
  // =================================================

  if (
    targetService === 'spotify'
  ) {

    const spotifyLink =
      data.spotify ||
      data.spotifyUrl ||
      '';

    webUrl =
      spotifyLink;


    /*
     * Aqui tratamos conteúdo musical específico.
     *
     * Perfil de artista NÃO pertence a esta função.
     */
    if (
      spotifyLink.includes('/track/')
    ) {

      const trackId =
        spotifyLink
          .split('/track/')[1]
          ?.split('?')[0];


      if (trackId) {
        uriScheme =
          `spotify:track:${trackId}`;
      }

    } else if (
      data.spotifyUriScheme
    ) {

      uriScheme =
        data.spotifyUriScheme;
    }
  }


  // =================================================
  // YOUTUBE — VÍDEO
  // =================================================

  else if (
    targetService === 'youtube'
  ) {

    const youtubeLink =
      data.youtubeUrl ||
      data.youtube ||
      '';

    webUrl =
      youtubeLink;


    if (
      youtubeLink.includes('watch?v=')
    ) {

      const videoId =
        youtubeLink
          .split('v=')[1]
          ?.split('&')[0];


      if (videoId) {
        uriScheme =
          `vnd.youtube:${videoId}`;
      }

    } else if (
      youtubeLink.includes('youtu.be/')
    ) {

      const videoId =
        youtubeLink
          .split('youtu.be/')[1]
          ?.split('?')[0];


      if (videoId) {
        uriScheme =
          `vnd.youtube:${videoId}`;
      }
    }
  }


  // =================================================
  // SOUNDCLOUD — TRACK / RELEASE
  // =================================================

  else if (
    targetService === 'soundcloud'
  ) {

    webUrl =
      data.soundcloud ||
      data.soundCloudWebUrl ||
      '';

    uriScheme =
      data.soundCloudUriScheme ||
      '';
  }


  // =================================================
  // SITE / LORE / LOG / HYBRID
  // =================================================

  else if (
    targetService === 'site'
  ) {

    const id =
      contentId;


    let siteLink =
      data.siteUrl ||
      '';


    /*
     * Caso não exista URL explícita,
     * reconstrói a rota interna.
     */
    if (
      !siteLink &&
      id
    ) {

      const contentType =
        (data as any).contentType ||
        'lore';


      if (
        contentType === 'hybrid'
      ) {

        siteLink =
          `https://raquelsynths.com/hybrid-reader/${id}`;

      } else if (
        contentType === 'log'
      ) {

        siteLink =
          `https://raquelsynths.com/log-reader/${id}`;

      } else {

        const mode =
          (data as any).mode === 'jonah'
            ? 'jonah'
            : 'broklin';


        siteLink =
          `https://raquelsynths.com/lore/${mode}/${id}`;
      }
    }


    webUrl =
      siteLink;


    /*
     * No Android podemos tentar abrir
     * diretamente com o navegador associado.
     */
    if (
      isMobile &&
      siteLink &&
      userAgent.includes('Android')
    ) {

      const cleanUrl =
        siteLink
          .replace('https://', '')
          .replace('http://', '');


      uriScheme =
        `intent://${cleanUrl}` +
        `#Intent;scheme=https;` +
        `package=com.android.chrome;end`;
    }
  }


  // =================================================
  // URL INVÁLIDA / AUSENTE
  // =================================================

  if (!webUrl) {

    console.warn(
      '[RQS DEEPLINK] URL de conteúdo não encontrada:',
      {
        service:
          targetService,

        id:
          contentId
      }
    );

    this.handleError();

    return;
  }


  // =================================================
  // DESKTOP
  // =================================================

  if (!isMobile) {

    window.location.href =
      webUrl;

    return;
  }


  // =================================================
  // MOBILE — FALLBACK
  // =================================================

  this.setupVisibilityListeners();


  this.fallbackTimeoutId =
    setTimeout(
      () => {

        if (webUrl) {
          window.location.href =
            webUrl;
        }

      },
      1500
    );


  /*
   * Se houver URI nativa,
   * tenta abrir o aplicativo.
   *
   * Caso contrário,
   * utiliza diretamente HTTPS.
   */
  if (uriScheme) {

    window.location.href =
      uriScheme;

  } else {

    window.location.href =
      webUrl;
  }
}

private executeProfileDeepLinkProtocol(
  data: MusicalLinkData
): void {

  // =================================================
  // IDENTIFICAÇÃO DO SERVIÇO
  // =================================================

  type ProfileService =
  | 'spotify'
  | 'soundcloud'
  | 'youtube'
  | 'applemusic'
  | 'deezer'
  | 'tidal'
  | 'amazonmusic'
  | 'bandcamp'
  | 'beatport'
  | 'instagram'
  | 'tiktok'
  | 'bluesky'
  | 'x'
  | 'site';


  const clickedService =
    this.route.snapshot.queryParamMap.get('service');


  const validServices =
    new Set<ProfileService>([
      'spotify',
      'soundcloud',
      'youtube',
      'applemusic',
      'deezer',
      'tidal',
      'amazonmusic',
      'bandcamp',
      'beatport',
      'instagram',
      'tiktok',
      'bluesky',
      'x',
      'site'
    ]);


  if (
    !clickedService ||
    !validServices.has(
      clickedService as ProfileService
    )
  ) {

    console.warn(
      '[RQS PROFILE LINK] Serviço inválido:',
      clickedService
    );

    this.handleError();

    return;
  }


  const targetService =
    clickedService as ProfileService;


  // =================================================
  // TELEMETRIA
  // =================================================

  const profileId =
    this.route.snapshot.paramMap.get('id');


  if (
    typeof (window as any).fbq !== 'undefined'
  ) {

    (window as any).fbq(
      'track',
      'ViewContent',
      {
        content_name:
          data.title ||
          'RQS Mainframe',

        content_category:
          'Profile DeepLink',

        content_ids:
          profileId
            ? [profileId]
            : [],

        content_type:
          'profile',

        status:
          targetService
      }
    );
  }


  // =================================================
  // MAPA DE PERFIS
  // =================================================

  const profileUrls:
    Partial<
      Record<
        ProfileService,
        string
      >
    > = {

      spotify:
        data.spotify ||
        data.spotifyUrl,

      soundcloud:
        data.soundcloud ||
        data.soundCloudWebUrl,

      youtube:
        data.youtube ||
        data.youtubeUrl,

      applemusic:
        data.appleMusic ||
        data.appleMusicUrl,

      deezer:
        data.deezer,

      tidal:
        data.tidal,

      amazonmusic:
        data.amazonMusic,

      bandcamp:
        data.bandcamp,

      beatport:
        data.beatport,

      instagram:
        data.instagram,

      tiktok:
        data.tiktok,

      bluesky:
        data.bluesky,

      x:
        data.x,

      site:
        data.website ||
        data.siteUrl
    };


  const webUrl =
    profileUrls[
      targetService
    ] || '';


  // =================================================
  // PERFIL NÃO CADASTRADO
  // =================================================

  if (!webUrl) {

    console.warn(
      '[RQS PROFILE LINK] Perfil não cadastrado:',
      targetService
    );

    this.handleError();

    return;
  }


  // =================================================
  // DISPOSITIVO
  // =================================================

  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    (window as any).opera ||
    '';

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(
      userAgent
    );


  let uriScheme = '';


  // =================================================
  // SPOTIFY — PERFIL DE ARTISTA
  // =================================================

  if (
    targetService === 'spotify' &&
    webUrl.includes('/artist/')
  ) {

    const artistId =
      webUrl
        .split('/artist/')[1]
        ?.split('?')[0];


    if (artistId) {

      uriScheme =
        `spotify:artist:${artistId}`;
    }
  }


  // =================================================
  // SOUNDCLOUD
  // =================================================

  else if (
    targetService === 'soundcloud' &&
    data.soundCloudUriScheme
  ) {

    uriScheme =
      data.soundCloudUriScheme;
  }


  /*
   * YouTube Channel, Instagram, TikTok,
   * Bluesky, Bandcamp, Deezer etc.
   *
   * Preferimos HTTPS/universal link.
   *
   * Não inventamos URI schemes
   * não garantidos pelas plataformas.
   */


  // =================================================
  // DESKTOP
  // =================================================

  if (!isMobile) {

    window.location.href =
      webUrl;

    return;
  }


  // =================================================
  // MOBILE
  // =================================================

  if (!uriScheme) {

    /*
     * Para plataformas baseadas em
     * Universal/App Links, HTTPS já é
     * o mecanismo correto.
     */
    window.location.href =
      webUrl;

    return;
  }


  // =================================================
  // MOBILE COM URI NATIVA + FALLBACK
  // =================================================

  this.setupVisibilityListeners();


  this.fallbackTimeoutId =
    setTimeout(
      () => {

        window.location.href =
          webUrl;

      },
      1500
    );


  window.location.href =
    uriScheme;
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
