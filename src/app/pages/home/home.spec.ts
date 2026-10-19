import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { ContentService } from '../../services/content.service';
import { TrackingService } from '../../services/tracking.service';
import { TranslationService } from '../../services/translation.service';
import { Home } from './home';

describe('Home editorial hero', () => {
  let fixture: ComponentFixture<Home>;
  let isPt: ReturnType<typeof signal<boolean>>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(async () => {
    isPt = signal(true);
    trackingService = jasmine.createSpyObj<TrackingService>('TrackingService', ['trackCustomEvent']);

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: TranslationService, useValue: { isPt } },
        { provide: ContentService, useValue: { currentMode: 'broklin' } },
        {
          provide: SeoService,
          useValue: jasmine.createSpyObj<SeoService>('SeoService', ['updateMetaTags', 'setJsonLdGraph'])
        },
        { provide: TrackingService, useValue: trackingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });

  it('renders only the final Portuguese Terminal and universe hero CTAs', () => {
    const actions = fixture.nativeElement.querySelector('.hero-actions') as HTMLElement;

    expect(actions.textContent).toContain('ACESSAR TERMINAL RQS');
    expect(actions.textContent).toContain('EXPLORAR O UNIVERSO');
    expect(actions.textContent).not.toContain('OUVIR AGORA');
    expect(actions.querySelectorAll('a, button').length).toBe(2);
  });

  it('renders the approved English hero CTAs without Portuguese labels', () => {
    isPt.set(false);
    fixture.detectChanges();

    const actions = fixture.nativeElement.querySelector('.hero-actions') as HTMLElement;
    expect(actions.textContent).toContain('ACCESS RQS TERMINAL');
    expect(actions.textContent).toContain('EXPLORE THE UNIVERSE');
    expect(actions.textContent).not.toContain('ACESSAR TERMINAL RQS');
  });

  it('opens the Terminal through the primary CTA and tracks the action', () => {
    const terminalButton = fixture.nativeElement.querySelector('.hero-cta-primary') as HTMLButtonElement;
    const previousBodyOverflow = document.body.style.overflow;
    terminalButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-uplink-terminal')).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    expect(trackingService.trackCustomEvent).toHaveBeenCalledWith(
      'HOME_TERMINAL_OPEN',
      { location: 'home_hero' }
    );

    fixture.componentInstance.closeUplink();
    fixture.detectChanges();

    expect(document.body.style.overflow).toBe(previousBodyOverflow);
    expect(document.activeElement).toBe(terminalButton);
  });
});
