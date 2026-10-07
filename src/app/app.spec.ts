import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { App } from './app';
import { AdSenseService } from './services/ad-sense.service';
import { ConsentService, ConsentState } from './services/consent.service';
import { MonetizationPolicyService } from './services/monetization-policy.service';
import { OptionalServicesService } from './services/optional-services.service';
import { SeoService } from './services/seo.service';
import { TranslationService } from './services/translation.service';

describe('App consent bootstrap boundary', () => {
  let fixture: ComponentFixture<App>;
  let routerEvents: Subject<unknown>;
  let consentState: ReturnType<typeof signal<ConsentState>>;
  let consent: jasmine.SpyObj<ConsentService> & { state: typeof consentState };
  let adSense: jasmine.SpyObj<AdSenseService>;
  let optionalServices: jasmine.SpyObj<OptionalServicesService>;

  beforeEach(async () => {
    routerEvents = new Subject<unknown>();
    consentState = signal<ConsentState>('UNKNOWN');
    consent = jasmine.createSpyObj<ConsentService>('ConsentService', ['accept', 'reject'], {
      state: consentState
    }) as jasmine.SpyObj<ConsentService> & { state: typeof consentState };
    consent.accept.and.callFake(() => consentState.set('ACCEPTED'));
    consent.reject.and.callFake(() => consentState.set('REJECTED'));
    adSense = jasmine.createSpyObj<AdSenseService>('AdSenseService', [
      'ensureCmpBootstrap',
      'enableAdServing'
    ]);
    optionalServices = jasmine.createSpyObj<OptionalServicesService>('OptionalServicesService', [
      'initializeForRoute'
    ]);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: DOCUMENT, useValue: document },
        { provide: ConsentService, useValue: consent },
        { provide: AdSenseService, useValue: adSense },
        { provide: OptionalServicesService, useValue: optionalServices },
        {
          provide: MonetizationPolicyService,
          useValue: {
            currentEligible: signal(false),
            currentBannerEligible: signal(false),
            updateCurrent: jasmine.createSpy('updateCurrent')
          }
        },
        {
          provide: TranslationService,
          useValue: {
            currentLang: signal<'pt' | 'en'>('pt'),
            isPt: () => true
          }
        },
        { provide: SeoService, useValue: { updateMetaTags: jasmine.createSpy('updateMetaTags') } },
        {
          provide: Router,
          useValue: { events: routerEvents.asObservable(), url: '/' }
        },
        {
          provide: ActivatedRoute,
          useValue: { firstChild: null, outlet: 'primary', data: of({}) }
        }
      ]
    })
      .overrideComponent(App, { set: { imports: [], template: '' } })
      .compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });

  it('initializes the CMP carrier after render while local consent remains UNKNOWN', fakeAsync(() => {
    fixture = TestBed.createComponent(App);

    fixture.detectChanges();
    tick();

    expect(adSense.ensureCmpBootstrap).toHaveBeenCalledOnceWith('ca-pub-5619990751602183');
    expect(consentState()).toBe('UNKNOWN');
    expect(adSense.enableAdServing).not.toHaveBeenCalled();
  }));

  it('keeps route-level ad serving behind the AdSenseService gate', fakeAsync(() => {
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    tick();

    routerEvents.next(new NavigationEnd(1, '/', '/'));

    expect(adSense.enableAdServing).toHaveBeenCalledOnceWith('ca-pub-5619990751602183');
    expect(consentState()).toBe('UNKNOWN');
  }));

  it('accepts only local RQS consent before requesting manual ad serving', fakeAsync(() => {
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    tick();

    fixture.componentInstance.acceptCookies();

    expect(consent.accept).toHaveBeenCalledTimes(1);
    expect(consentState()).toBe('ACCEPTED');
    expect(optionalServices.initializeForRoute).toHaveBeenCalled();
    expect(adSense.enableAdServing).toHaveBeenCalledOnceWith('ca-pub-5619990751602183');
  }));
});
