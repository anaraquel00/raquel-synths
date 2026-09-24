import { PLATFORM_ID, WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { Router } from '@angular/router';
import { AdSenseService } from './ad-sense.service';
import { ConsentService, ConsentState } from './consent.service';
import { MonetizationPolicyService } from './monetization-policy.service';
import {
  OptionalServicesService,
  SPEED_INSIGHTS_INITIALIZER
} from './optional-services.service';
import { SeoService } from './seo.service';
import { TrackingService } from './tracking.service';

describe('OptionalServicesService privacy policy route hardening', () => {
  let consentState: WritableSignal<ConsentState>;
  let speedInsights: jasmine.Spy;
  let tracking: jasmine.SpyObj<TrackingService>;
  let seo: jasmine.SpyObj<SeoService>;
  let service: OptionalServicesService;
  let monetization: MonetizationPolicyService;
  let adsense: AdSenseService;

  beforeEach(() => {
    consentState = signal<ConsentState>('UNKNOWN');
    speedInsights = jasmine.createSpy('injectSpeedInsights');
    tracking = jasmine.createSpyObj<TrackingService>('TrackingService', [
      'initLazyTracking',
      'initMetaPixel'
    ]);
    seo = jasmine.createSpyObj<SeoService>('SeoService', ['initAhrefs']);

    TestBed.configureTestingModule({
      providers: [
        OptionalServicesService,
        MonetizationPolicyService,
        AdSenseService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ConsentService, useValue: { state: consentState } },
        { provide: TrackingService, useValue: tracking },
        { provide: SeoService, useValue: seo },
        { provide: SPEED_INSIGHTS_INITIALIZER, useValue: speedInsights },
        { provide: Router, useValue: { events: EMPTY, url: '/compliance' } }
      ]
    });

    service = TestBed.inject(OptionalServicesService);
    monetization = TestBed.inject(MonetizationPolicyService);
    adsense = TestBed.inject(AdSenseService);
  });

  afterEach(() => {
    document.head
      .querySelectorAll('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')
      .forEach(script => script.remove());
  });

  function expectNoOptionalInitialization(): void {
    expect(speedInsights).not.toHaveBeenCalled();
    expect(tracking.initLazyTracking).not.toHaveBeenCalled();
    expect(tracking.initMetaPixel).not.toHaveBeenCalled();
    expect(seo.initAhrefs).not.toHaveBeenCalled();
  }

  for (const state of ['UNKNOWN', 'REJECTED'] as ConsentState[]) {
    it(`does not initialize Meta on an allowed route with ${state} consent`, () => {
      consentState.set(state);

      expect(service.initializeForRoute('/discografia')).toBeFalse();

      expectNoOptionalInitialization();
    });
  }

  for (const state of ['UNKNOWN', 'ACCEPTED', 'REJECTED'] as ConsentState[]) {
    it(`does not initialize optional services on direct /compliance with ${state} consent`, () => {
      consentState.set(state);

      expect(service.initializeForRoute('/compliance')).toBeFalse();

      expectNoOptionalInitialization();
      expect(consentState()).toBe(state);
    });
  }

  it('preserves normal optional-service initialization with accepted consent', () => {
    consentState.set('ACCEPTED');

    expect(service.initializeForRoute('/discografia')).toBeTrue();

    expect(speedInsights).toHaveBeenCalledTimes(1);
    expect(tracking.initLazyTracking).toHaveBeenCalledOnceWith('GTM-P3KFK5T5');
    expect(tracking.initMetaPixel).toHaveBeenCalledOnceWith('1317873437179152');
    expect(seo.initAhrefs).toHaveBeenCalledTimes(1);
  });

  it('initializes exactly once after navigating from /compliance to an allowed route', () => {
    consentState.set('ACCEPTED');

    expect(service.initializeForRoute('/compliance')).toBeFalse();
    expect(service.initializeForRoute('/musical-archives')).toBeTrue();
    expect(service.initializeForRoute('/discografia')).toBeFalse();

    expect(speedInsights).toHaveBeenCalledTimes(1);
    expect(tracking.initLazyTracking).toHaveBeenCalledTimes(1);
    expect(tracking.initMetaPixel).toHaveBeenCalledTimes(1);
    expect(seo.initAhrefs).toHaveBeenCalledTimes(1);
  });

  it('does not duplicate or tear down services when navigating to /compliance later', () => {
    consentState.set('ACCEPTED');

    expect(service.initializeForRoute('/discografia')).toBeTrue();
    expect(service.initializeForRoute('/compliance')).toBeFalse();

    expect(speedInsights).toHaveBeenCalledTimes(1);
    expect(tracking.initLazyTracking).toHaveBeenCalledTimes(1);
    expect(tracking.initMetaPixel).toHaveBeenCalledTimes(1);
    expect(seo.initAhrefs).toHaveBeenCalledTimes(1);
  });

  it('keeps /compliance ineligible for all manual AdSense paths', () => {
    consentState.set('ACCEPTED');
    monetization.updateCurrent('/compliance');
    const readyCallback = jasmine.createSpy('readyCallback');

    adsense.initLazyLoad('ca-pub-5619990751602183');
    adsense.runWhenReady(readyCallback);

    expect(monetization.currentBannerEligible()).toBeFalse();
    expect(monetization.currentArticleEligible()).toBeFalse();
    expect(readyCallback).not.toHaveBeenCalled();
    expect(
      document.head.querySelectorAll(
        'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
      ).length
    ).toBe(0);
    expect(document.querySelectorAll('ins.adsbygoogle').length).toBe(0);
  });

  it('preserves the existing eligible monetization routes', () => {
    expect(monetization.isBannerEligible('/')).toBeTrue();
    expect(monetization.isBannerEligible('/discografia')).toBeTrue();
    expect(monetization.isArticleEligible('/musical-archives')).toBeTrue();
    expect(monetization.isArticleEligible('/log-reader/system-archive')).toBeTrue();
    expect(monetization.isArticleEligible('/lore/broklin/example')).toBeTrue();
    expect(monetization.isArticleEligible('/hybrid-reader/example')).toBeTrue();
  });
});
