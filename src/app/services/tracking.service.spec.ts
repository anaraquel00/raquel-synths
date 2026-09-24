import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID, WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConsentService, ConsentState } from './consent.service';
import {
  TrackingService,
  isMetaTelemetryAllowed
} from './tracking.service';

type TestFbq = jasmine.Spy & { queue?: IArguments[] };

describe('TrackingService Meta Pixel', () => {
  let consentState: WritableSignal<ConsentState>;
  let fakeWindow: any;
  let fakeDocument: any;
  let appendedScripts: any[];

  function createService(hostname = 'raquelsynths.com'): TrackingService {
    appendedScripts = [];
    fakeWindow = {
      location: { hostname },
      localStorage: { getItem: jasmine.createSpy('getItem').and.returnValue(null) }
    };
    fakeDocument = {
      defaultView: fakeWindow,
      getElementById: jasmine.createSpy('getElementById').and.returnValue(null),
      createElement: jasmine.createSpy('createElement').and.callFake(() => ({})),
      head: { appendChild: jasmine.createSpy('appendChild').and.callFake(script => appendedScripts.push(script)) }
    };

    TestBed.configureTestingModule({
      providers: [
        TrackingService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: DOCUMENT, useValue: fakeDocument },
        { provide: ConsentService, useValue: { state: consentState } }
      ]
    });

    return TestBed.inject(TrackingService);
  }

  beforeEach(() => {
    consentState = signal<ConsentState>('UNKNOWN');
  });

  afterEach(() => TestBed.resetTestingModule());

  for (const state of ['UNKNOWN', 'REJECTED'] as ConsentState[]) {
    it(`does not define fbq or load fbevents.js with ${state} consent`, () => {
      consentState.set(state);
      const service = createService();

      expect(service.initMetaPixel('1317873437179152')).toBeFalse();

      expect(fakeWindow.fbq).toBeUndefined();
      expect(appendedScripts).toEqual([]);
    });
  }

  it('loads the async script and sends one init and one PageView after accepted consent', () => {
    consentState.set('ACCEPTED');
    const service = createService();

    expect(service.initMetaPixel('1317873437179152')).toBeTrue();
    expect(service.initMetaPixel('1317873437179152')).toBeFalse();

    expect(typeof fakeWindow.fbq).toBe('function');
    expect(appendedScripts.length).toBe(1);
    expect(appendedScripts[0]).toEqual(jasmine.objectContaining({
      id: 'rqs-meta-pixel',
      async: true,
      src: 'https://connect.facebook.net/en_US/fbevents.js'
    }));

    const commands = fakeWindow.fbq.queue.map((entry: IArguments) => Array.from(entry));
    expect(commands.filter((entry: unknown[]) => entry[0] === 'init')).toEqual([
      ['init', '1317873437179152']
    ]);
    expect(commands.filter((entry: unknown[]) => entry[0] === 'track' && entry[1] === 'PageView').length).toBe(1);
  });

  it('uses an existing fbq without replacing it', () => {
    consentState.set('ACCEPTED');
    const service = createService();
    const existingFbq = jasmine.createSpy('fbq') as TestFbq;
    fakeWindow.fbq = existingFbq;

    expect(service.initMetaPixel('1317873437179152')).toBeTrue();

    expect(fakeWindow.fbq).toBe(existingFbq);
    expect(existingFbq).toHaveBeenCalledWith('init', '1317873437179152');
    expect(existingFbq).toHaveBeenCalledWith('track', 'PageView');
  });

  it('does not initialize an already marked RQS Pixel', () => {
    consentState.set('ACCEPTED');
    const service = createService();
    const existingFbq = jasmine.createSpy('fbq') as TestFbq;
    fakeWindow.fbq = existingFbq;
    fakeWindow.__rqsMetaPixelIds = { '1317873437179152': true };

    expect(service.initMetaPixel('1317873437179152')).toBeFalse();

    expect(fakeWindow.fbq).toBe(existingFbq);
    expect(existingFbq).not.toHaveBeenCalled();
    expect(appendedScripts).toEqual([]);
  });

  it('keeps custom Meta events as safe no-ops before consent', () => {
    const service = createService();
    const fbq = jasmine.createSpy('fbq');
    fakeWindow.fbq = fbq;

    service.trackSpotifyClick('Album');
    service.trackSoundcloudClick('Album');
    service.trackAffiliateClick('Synth', 'Store');

    expect(fbq).not.toHaveBeenCalled();
  });

  it('preserves the existing custom Meta event names after initialization', () => {
    consentState.set('ACCEPTED');
    const service = createService();
    const fbq = jasmine.createSpy('fbq');
    fakeWindow.fbq = fbq;
    service.initMetaPixel('1317873437179152');
    fbq.calls.reset();

    service.trackSpotifyClick('Album');
    service.trackSoundcloudClick('Album');
    service.trackAffiliateClick('Synth', 'Store');

    expect(fbq).toHaveBeenCalledWith('trackCustom', 'SpotifyClick', jasmine.any(Object));
    expect(fbq).toHaveBeenCalledWith('trackCustom', 'SoundcloudClick', jasmine.any(Object));
    expect(fbq).toHaveBeenCalledWith('track', 'ViewContent', jasmine.any(Object));
  });

  it('suppresses Meta on local and Preview hostnames and in production dev mode', () => {
    expect(isMetaTelemetryAllowed('localhost', false)).toBeFalse();
    expect(isMetaTelemetryAllowed('127.0.0.1', false)).toBeFalse();
    expect(isMetaTelemetryAllowed('feature.vercel.app', false)).toBeFalse();
    expect(isMetaTelemetryAllowed('raquelsynths.com', true)).toBeFalse();
    expect(isMetaTelemetryAllowed('www.raquelsynths.com', true)).toBeFalse();
    expect(isMetaTelemetryAllowed('raquelsynths.com', false)).toBeTrue();
  });
});
