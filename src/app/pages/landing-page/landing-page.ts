import { Component, DOCUMENT, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DiscographyComponent } from '../../app-discography/app-discography';
import { StorytellingComponent } from '../../app-storytelling/app-storytelling';
import { Home } from '../home/home';
import { AdBannerComponent } from '../../components/ad-banner/ad-banner';
import { SeoService } from '../../services/seo.service';
import { TrackingService } from '../../services/tracking.service';
import { TranslationService } from '../../services/translation.service';
import { ContentService } from '../../services/content.service';

type TransmitterStatus = 'idle' | 'submitting' | 'success' | 'empty' | 'invalid' | 'consent' | 'error';

interface LatestSignalLog {
  id: string;
  isArchiveLink?: boolean;
  date?: string;
  image?: string;
  pt?: { title?: string; description?: string };
  en?: { title?: string; description?: string };
}

@Component({
  selector: 'app-landing-page',
  imports: [
    CommonModule,
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
  private contentService = inject(ContentService);

  emailInputValue = '';
  transmitterConsent = false;
  transmitterStatus = signal<TransmitterStatus>('idle');

  private readonly homeLogs = toSignal(this.contentService.getLatestLogs(5), {
    initialValue: [] as LatestSignalLog[]
  });
  private readonly publishedLogs = computed(() =>
    [...this.homeLogs()]
      .filter(log => !log.isArchiveLink)
      .sort((a, b) =>
        (Date.parse(b.date ?? '') || 0) - (Date.parse(a.date ?? '') || 0)
      ) as LatestSignalLog[]
  );

  readonly latestSignal = computed<LatestSignalLog | null>(() => {
    const logs = this.publishedLogs();
    return logs.find(log => Boolean(log.image)) ?? logs[0] ?? null;
  });
  readonly systemLogs = computed<LatestSignalLog[]>(() => {
    const featuredLog = this.latestSignal();
    return this.publishedLogs()
      .filter(log => log.id !== featuredLog?.id)
      .slice(0, 3);
  });

  getLogContent(log: LatestSignalLog) {
    return this.translate.isPt() ? log.pt : log.en;
  }


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
