import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConsentService } from './consent.service';

describe('ConsentService local RQS consent', () => {
  let getItem: jasmine.Spy;
  let setItem: jasmine.Spy;

  beforeEach(() => {
    getItem = spyOn(window.localStorage, 'getItem').and.returnValue(null);
    setItem = spyOn(window.localStorage, 'setItem');
  });

  afterEach(() => TestBed.resetTestingModule());

  function createService(platformId: 'browser' | 'server' = 'browser'): ConsentService {
    TestBed.configureTestingModule({
      providers: [
        ConsentService,
        { provide: PLATFORM_ID, useValue: platformId }
      ]
    });
    return TestBed.inject(ConsentService);
  }

  it('starts UNKNOWN when no valid local decision exists', () => {
    getItem.and.returnValue('INVALID');

    const service = createService();

    expect(service.state()).toBe('UNKNOWN');
    expect(getItem).toHaveBeenCalledOnceWith('rqs_consent_v2');
  });

  it('persists only the local RQS acceptance decision', () => {
    const service = createService();

    service.accept();

    expect(service.state()).toBe('ACCEPTED');
    expect(setItem).toHaveBeenCalledOnceWith('rqs_consent_v2', 'ACCEPTED');
  });

  it('persists only the local RQS rejection decision', () => {
    const service = createService();

    service.reject();

    expect(service.state()).toBe('REJECTED');
    expect(setItem).toHaveBeenCalledOnceWith('rqs_consent_v2', 'REJECTED');
  });

  it('does not access browser storage during SSR', () => {
    const service = createService('server');

    expect(service.state()).toBe('UNKNOWN');
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });
});
