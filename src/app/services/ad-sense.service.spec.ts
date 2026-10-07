import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID, WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AdSenseService } from './ad-sense.service';
import { ConsentService, ConsentState } from './consent.service';
import { MonetizationPolicyService } from './monetization-policy.service';

describe('AdSenseService consent boundaries', () => {
  let consentState: WritableSignal<ConsentState>;
  let monetizationEligible: WritableSignal<boolean>;
  let appendedScripts: HTMLScriptElement[];
  let fakeWindow: { adsbygoogle?: unknown; __tcfapi?: unknown; googlefc?: unknown };
  let fakeDocument: any;

  function createService(platformId: 'browser' | 'server' = 'browser'): AdSenseService {
    appendedScripts = [];
    fakeWindow = {};
    fakeDocument = {
      defaultView: fakeWindow,
      querySelector: jasmine.createSpy('querySelector').and.callFake(() => appendedScripts[0] ?? null),
      createElement: jasmine.createSpy('createElement').and.callFake((tagName: string) =>
        document.createElement(tagName)
      ),
      head: {
        appendChild: jasmine.createSpy('appendChild').and.callFake((script: HTMLScriptElement) => {
          appendedScripts.push(script);
          return script;
        })
      }
    };

    TestBed.configureTestingModule({
      providers: [
        AdSenseService,
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: DOCUMENT, useValue: fakeDocument },
        { provide: ConsentService, useValue: { state: consentState } },
        {
          provide: MonetizationPolicyService,
          useValue: { currentEligible: monetizationEligible }
        }
      ]
    });

    return TestBed.inject(AdSenseService);
  }

  beforeEach(() => {
    consentState = signal<ConsentState>('UNKNOWN');
    monetizationEligible = signal(false);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('bootstraps the CMP carrier with UNKNOWN consent without changing RQS or TCF state', () => {
    const service = createService();

    expect(service.ensureCmpBootstrap('ca-pub-test')).toBeTrue();

    expect(appendedScripts.length).toBe(1);
    expect(appendedScripts[0].id).toBe('rqs-adsense-cmp-bootstrap');
    expect(appendedScripts[0].async).toBeTrue();
    expect(appendedScripts[0].crossOrigin).toBe('anonymous');
    expect(appendedScripts[0].src).toBe(
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-test'
    );
    expect(consentState()).toBe('UNKNOWN');
    expect(fakeWindow.__tcfapi).toBeUndefined();
    expect(fakeWindow.googlefc).toBeUndefined();
  });

  it('does not inject the CMP carrier twice', () => {
    const service = createService();

    expect(service.ensureCmpBootstrap('ca-pub-test')).toBeTrue();
    expect(service.ensureCmpBootstrap('ca-pub-test')).toBeFalse();

    expect(appendedScripts.length).toBe(1);
  });

  it('recognizes the static head carrier by its official URL without appending another', () => {
    const service = createService();
    const staticScript = document.createElement('script');
    staticScript.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-test';
    appendedScripts.push(staticScript);

    expect(service.ensureCmpBootstrap('ca-pub-test')).toBeFalse();
    expect(service.ensureCmpBootstrap('ca-pub-test')).toBeFalse();

    expect(appendedScripts).toEqual([staticScript]);
    expect(fakeDocument.createElement).not.toHaveBeenCalled();
    expect(staticScript.id).toBe('');
  });

  it('does not touch the DOM during SSR', () => {
    const service = createService('server');

    expect(service.ensureCmpBootstrap('ca-pub-test')).toBeFalse();
    expect(fakeDocument.createElement).not.toHaveBeenCalled();
    expect(appendedScripts).toEqual([]);
  });

  for (const state of ['UNKNOWN', 'REJECTED'] as ConsentState[]) {
    it(`keeps manual ad serving disabled with ${state} consent`, () => {
      consentState.set(state);
      monetizationEligible.set(true);
      const service = createService();
      const readyCallback = jasmine.createSpy('readyCallback');

      service.ensureCmpBootstrap('ca-pub-test');
      appendedScripts[0].dispatchEvent(new Event('load'));

      expect(service.enableAdServing('ca-pub-test')).toBeFalse();
      service.runWhenReady(readyCallback);

      expect(readyCallback).not.toHaveBeenCalled();
      expect(appendedScripts.length).toBe(1);
    });
  }

  it('keeps manual ad serving disabled on an ineligible route', () => {
    consentState.set('ACCEPTED');
    const service = createService();
    const readyCallback = jasmine.createSpy('readyCallback');

    service.ensureCmpBootstrap('ca-pub-test');
    appendedScripts[0].dispatchEvent(new Event('load'));

    expect(service.enableAdServing('ca-pub-test')).toBeFalse();
    service.runWhenReady(readyCallback);

    expect(readyCallback).not.toHaveBeenCalled();
  });

  it('releases a manual ad callback only after accepted consent, eligibility, and carrier load', () => {
    consentState.set('ACCEPTED');
    monetizationEligible.set(true);
    const service = createService();
    const readyCallback = jasmine.createSpy('readyCallback');

    expect(service.enableAdServing('ca-pub-test')).toBeTrue();
    service.runWhenReady(readyCallback);
    expect(readyCallback).not.toHaveBeenCalled();

    appendedScripts[0].dispatchEvent(new Event('load'));

    expect(readyCallback).toHaveBeenCalledTimes(1);
  });

  it('never pushes an ad unit while bootstrapping the CMP carrier', () => {
    const push = jasmine.createSpy('push');
    const service = createService();
    fakeWindow.adsbygoogle = { push };

    service.ensureCmpBootstrap('ca-pub-test');

    expect(push).not.toHaveBeenCalled();
  });
});
