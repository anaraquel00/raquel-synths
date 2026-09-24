import { InjectionToken, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { ConsentService } from './consent.service';
import { SeoService } from './seo.service';
import { TrackingService } from './tracking.service';

export const SPEED_INSIGHTS_INITIALIZER = new InjectionToken<() => void>(
  'SPEED_INSIGHTS_INITIALIZER',
  { providedIn: 'root', factory: () => injectSpeedInsights }
);

@Injectable({ providedIn: 'root' })
export class OptionalServicesService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly consent = inject(ConsentService);
  private readonly tracking = inject(TrackingService);
  private readonly seo = inject(SeoService);
  private readonly initializeSpeedInsights = inject(SPEED_INSIGHTS_INITIALIZER);
  private initialized = false;

  initializeForRoute(url: string): boolean {
    if (
      this.initialized ||
      !isPlatformBrowser(this.platformId) ||
      this.consent.state() !== 'ACCEPTED' ||
      !this.isRouteAllowed(url)
    ) {
      return false;
    }

    this.initialized = true;
    this.initializeSpeedInsights();
    this.tracking.initLazyTracking('GTM-P3KFK5T5');
    this.tracking.initMetaPixel('1317873437179152');
    this.seo.initAhrefs();
    return true;
  }

  private isRouteAllowed(url: string): boolean {
    const path = (url.split(/[?#]/)[0] || '/').replace(/\/$/, '') || '/';
    return path !== '/compliance';
  }
}
