import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdSenseService } from '../../services/ad-sense.service';
import { ConsentService, ConsentState } from '../../services/consent.service';
import { MonetizationPolicyService } from '../../services/monetization-policy.service';
import { TranslationService } from '../../services/translation.service';
import { AdBannerComponent } from './ad-banner';

describe('AdBannerComponent consent gate', () => {
  let consentState: WritableSignal<ConsentState>;
  let bannerEligible: WritableSignal<boolean>;
  let adSense: jasmine.SpyObj<AdSenseService>;
  let fixture: ComponentFixture<AdBannerComponent>;

  beforeEach(async () => {
    consentState = signal<ConsentState>('UNKNOWN');
    bannerEligible = signal(true);
    adSense = jasmine.createSpyObj<AdSenseService>('AdSenseService', ['runWhenReady']);

    await TestBed.configureTestingModule({
      imports: [AdBannerComponent],
      providers: [
        { provide: ConsentService, useValue: { state: consentState } },
        {
          provide: MonetizationPolicyService,
          useValue: { currentBannerEligible: bannerEligible }
        },
        { provide: AdSenseService, useValue: adSense },
        { provide: TranslationService, useValue: { isPt: () => true } },
        { provide: Router, useValue: {} }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    delete (window as any).adsbygoogle;
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  for (const state of ['UNKNOWN', 'REJECTED'] as ConsentState[]) {
    it(`does not render or push a banner ad with ${state} consent`, fakeAsync(() => {
      consentState.set(state);
      fixture = TestBed.createComponent(AdBannerComponent);

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('ins.adsbygoogle')).toBeNull();
      expect(adSense.runWhenReady).not.toHaveBeenCalled();
    }));
  }

  it('pushes once only after accepted consent and eligible route', fakeAsync(() => {
    const push = jasmine.createSpy('push');
    (window as any).adsbygoogle = { push };
    consentState.set('ACCEPTED');
    adSense.runWhenReady.and.callFake(callback => callback());
    fixture = TestBed.createComponent(AdBannerComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    expect(fixture.nativeElement.querySelector('ins.adsbygoogle')).not.toBeNull();
    expect(adSense.runWhenReady).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledTimes(1);
  }));
});
