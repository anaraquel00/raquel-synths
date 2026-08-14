import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  effect,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule,
  DOCUMENT,
  isPlatformBrowser
} from '@angular/common';

import { FormsModule } from '@angular/forms';

import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service';


@Component({
  selector: 'app-bio-link',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './bio-link.html',
  styleUrls: ['./bio-link.scss']
})
export class BioLinkComponent implements OnInit {

  protected translate =
    inject(TranslationService);

  private seo =
    inject(SeoService);

  private platformId =
    inject(PLATFORM_ID);

  @Inject(DOCUMENT)
  private document!: Document;


  emailInputValue = '';

  subscribed =
    signal<boolean>(false);


  ngOnInit(): void {

    // SEO da página /bio
    this.setupSeo();
  }
  private seoLanguageEffect = effect(() => {

  // Registra currentLang como dependência reativa
  this.translate.currentLang();

  // Atualiza Title, Description, OG,
  // Twitter e JSON-LD
  this.setupSeo();
});

  /* =====================================================
     SEO
     ===================================================== */

  private setupSeo(): void {

    const isPt =
      this.translate.currentLang() === 'pt';


    const title = isPt
      ? 'Música, Redes Sociais & Collabs'
      : 'Music, Social Media & Collabs';


    const description = isPt
      ? 'Hub oficial da RaQuel Synths. Ouça e siga RaQuel Synths nas redes sociais, Spotify, SoundCloud, YouTube, Apple Music, Bandcamp, Beatport e outras plataformas. Conheça também colaborações e comunidades de música independente.'
      : 'Official RaQuel Synths artist hub. Listen and follow RaQuel Synths on social media, Spotify, SoundCloud, YouTube, Apple Music, Bandcamp, Beatport and more. Discover collaborations and independent music communities.';


    this.seo.updateMetaTags({
      title,
      description,
      image:
        'https://raquelsynths.com/images/banner-seo-global.jpg',
      url:
        'https://raquelsynths.com/bio',
      type:
        'profile'
    });


    this.seo.setJsonLd({
      '@context':
        'https://schema.org',

      '@type':
        'MusicGroup',

      name:
        'RaQuel Synths',

      alternateName:
        'RQS',

      url:
        'https://raquelsynths.com',

      image:
        'https://raquelsynths.com/icons/icon-512x512.png',

      description: isPt
        ? 'Projeto de produção musical híbrida que combina criação humana e inteligência artificial, música eletrônica e narrativa audiovisual.'
        : 'Hybrid music production project combining human creation and artificial intelligence, electronic music and audiovisual storytelling.',

      genre: [
        'Electronic',
        'Drum and Bass',
        'Progressive House',
        'Trance',
        'Hard Techno',
        'Techno',
        'Synthwave'
      ],

      sameAs: [
        'https://soundcloud.com/rqs_official',

        'https://open.spotify.com/intl-pt/artist/1yrPZaFyIcsCjj876LaHXL?si=T02LL1yrTr-dxeRCkO_3BQ',

        'https://www.youtube.com/@RaQuelSynths',

        'https://music.apple.com/br/artist/raquel-synths-rqs/1834796110',

        'https://www.deezer.com/pt/artist/342268891',

        'https://music.amazon.fr/artists/B0FN8RKWV5',

        'https://tidal.com/artist/65764006',

        'https://www.beatport.com/pt/artist/raquel-synths-rqs/2408454',

        'https://www.instagram.com/rqs_official/',

        'https://www.tiktok.com/raquel_holanda_',

        'https://bsky.app/profile/raquelsynths.com',

        'https://x.com/anaraquel00',

        'https://raquelsynths.bandcamp.com/'
      ]
    });
  }


  /* =====================================================
     AVATAR
     ===================================================== */

  get avatarLogo(): string {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {
      return 'icons/icon-128x128.png';
    }


    const isJonahMode =
      this.document
        .documentElement
        .classList
        .contains('mode-jonah') ||

      this.document
        .body
        .classList
        .contains('mode-jonah');


    return isJonahMode
      ? 'images/rqs-logo-redteam.webp'
      : 'icons/icon-128x128.png';
  }


  /* =====================================================
     LINKS
     ===================================================== */

  openLink(
    url: string
  ): void {

    if (
      !url ||
      !isPlatformBrowser(
        this.platformId
      )
    ) {
      return;
    }

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }


  /* =====================================================
     NEWSLETTER
     ===================================================== */

  async subscribeNewsletter(): Promise<void> {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {
      return;
    }


    const email =
      this.emailInputValue
        .trim();


    if (!email) {
      return;
    }


    try {

      const response =
        await fetch(
          '/api/subscribe',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({
                email
              })
          }
        );


      const result =
        await response.json();


      if (
        response.ok &&
        result.success
      ) {

        this.subscribed.set(
          true
        );

        this.emailInputValue =
          '';

      } else {

        console.error(
          '❌ [BREVO ERROR]:',
          result.error
        );
      }

    } catch (error) {

      console.error(
        '❌ [NETWORK ERROR]:',
        error
      );
    }
  }
}
