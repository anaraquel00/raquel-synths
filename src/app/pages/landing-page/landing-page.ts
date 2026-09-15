import { Component, DOCUMENT, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DiscographyComponent } from '../../app-discography/app-discography';
import { StorytellingComponent } from '../../app-storytelling/app-storytelling';
import { Home } from '../home/home';
import { AdBannerComponent } from '../../components/ad-banner/ad-banner';
import { SeoService } from '../../services/seo.service';
import { TrackingService } from '../../services/tracking.service';
import { TranslationService } from '../../services/translation.service';

type TransmitterStatus = 'idle' | 'submitting' | 'success' | 'empty' | 'invalid' | 'consent' | 'error';

interface LatestSignalPreview {
  label: string;
  title_pt: string;
  title_en: string;
  summary_pt: string;
  summary_en: string;
  optional_frequency?: string;
  cta_pt: string;
  cta_en: string;
  target_route_or_url: string;
  date?: string;
  status: 'PREVIEW';
}

@Component({
  selector: 'app-landing-page',
  imports: [
    FormsModule,
    RouterLink,
    DiscographyComponent,
    StorytellingComponent,
    Home,
    AdBannerComponent
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  public translate = inject(TranslationService);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private seoService = inject(SeoService);
  private trackingService = inject(TrackingService);

  emailInputValue = '';
  transmitterConsent = false;
  transmitterStatus = signal<TransmitterStatus>('idle');

  // PREVIEW ONLY: replace this local placeholder before approving a production signal.
  readonly latestSignal: LatestSignalPreview = {
    label: 'LATEST SIGNAL // PREVIEW',
    title_pt: 'Próximo sinal em calibração',
    title_en: 'Next signal in calibration',
    summary_pt: 'Este espaço está preparado para o próximo lançamento, capítulo ou transmissão oficial. O conteúdo final ainda depende de aprovação da Owner.',
    summary_en: 'This space is ready for the next official release, chapter, or transmission. Final content still requires Owner approval.',
    optional_frequency: 'FREQUENCY // PENDING',
    cta_pt: 'EXPLORAR SYSTEM_LOGS',
    cta_en: 'EXPLORE SYSTEM_LOGS',
    target_route_or_url: '/logs-archive',
    status: 'PREVIEW'
  };

  ngOnInit() {
    const isPt = this.translate.isPt();
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

    // Soberania da Landing Page: mantém a arquitetura SEO existente.
    this.seoService.updateMetaTags({
      title: isPt ? 'Sagas Cyberpunk & Banda Virtual' : 'Cyberpunk Sagas & Virtual Band',
      description: isPt
        ? 'Sagas cyberpunk, música eletrônica e personagens da RaQuel Synths. Explore Blue Team, Red Team e as histórias do universo RQS.'
        : 'Cyberpunk sagas, electronic music, and RaQuel Synths characters. Explore Blue Team, Red Team, and the stories of the RQS universe.',
      ogDescription: isPt
        ? 'Explore as sagas cyberpunk, personagens e música do universo RaQuel Synths.'
        : 'Explore the cyberpunk sagas, characters, and music of the RaQuel Synths universe.',
      twitterDescription: isPt
        ? 'Explore as sagas cyberpunk, personagens e música do universo RaQuel Synths.'
        : 'Explore the cyberpunk sagas, characters, and music of the RaQuel Synths universe.',
      imageAlt: isPt
        ? 'Broklin Garpeter e Jonah Cyperfield representando Blue Team e Red Team no universo cyberpunk RaQuel Synths.'
        : 'Broklin Garpeter and Jonah Cyperfield representing Blue Team and Red Team in the RaQuel Synths cyberpunk universe.',
      url: 'https://raquelsynths.com/'
    });
  }

  trackHomeAction(
    eventName:
      | 'HOME_LISTEN_CLICK'
      | 'HOME_UNIVERSE_CLICK'
      | 'HOME_LATEST_SIGNAL_CLICK'
      | 'HOME_ARCHIVE_CLICK'
      | 'HOME_TRANSMITTER_SUBMIT'
      | 'HOME_CREATOR_CLICK',
    target: string
  ): void {
    this.trackingService.trackCustomEvent(eventName, {
      location: 'homepage',
      target
    });
  }

  async subscribeNewsletter(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.transmitterStatus() === 'submitting') {
      return;
    }

    const email = this.emailInputValue.trim();

    if (!email) {
      this.transmitterStatus.set('empty');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.transmitterStatus.set('invalid');
      return;
    }

    if (!this.transmitterConsent) {
      this.transmitterStatus.set('consent');
      return;
    }

    this.transmitterStatus.set('submitting');
    this.trackHomeAction('HOME_TRANSMITTER_SUBMIT', 'rqs_transmitter');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        this.emailInputValue = '';
        this.transmitterConsent = false;
        this.transmitterStatus.set('success');
        return;
      }

      this.transmitterStatus.set('error');
    } catch {
      this.transmitterStatus.set('error');
    }
  }
}
