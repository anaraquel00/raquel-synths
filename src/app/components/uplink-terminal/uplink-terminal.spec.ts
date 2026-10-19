import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RQS_EXTERNAL_CHANNELS } from '../../data/external-channels';
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { UplinkTerminalComponent } from './uplink-terminal';

describe('UplinkTerminalComponent channel gateway', () => {
  let fixture: ComponentFixture<UplinkTerminalComponent>;
  let component: UplinkTerminalComponent;
  let isPt: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    isPt = signal(true);

    await TestBed.configureTestingModule({
      imports: [UplinkTerminalComponent],
      providers: [
        { provide: TranslationService, useValue: { isPt } },
        { provide: ContentService, useValue: { currentMode: 'broklin' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UplinkTerminalComponent);
    component = fixture.componentInstance;
    spyOn(component, 'runHackerScript');
    component.isFinished.set(true);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });

  it('renders the four Portuguese destinations as safe external links', () => {
    const body = fixture.nativeElement.textContent as string;
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.action-buttons a') as NodeListOf<HTMLAnchorElement>
    );

    expect(body).toContain('ACESSO CONCEDIDO');
    expect(body).toContain('Escolha um canal seguro:');
    expect(body).toContain('OUVIR NO SPOTIFY');
    expect(body).toContain('ASSISTIR NO YOUTUBE');
    expect(body).toContain('OUVIR NO SOUNDCLOUD');
    expect(body).toContain('OUVIR RQS RADIO 24/7');
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      RQS_EXTERNAL_CHANNELS.spotify,
      RQS_EXTERNAL_CHANNELS.youtube,
      RQS_EXTERNAL_CHANNELS.soundcloud,
      RQS_EXTERNAL_CHANNELS.radio
    ]);
    expect(links.every(link => link.target === '_blank')).toBeTrue();
    expect(links.every(link => link.rel === 'noopener noreferrer')).toBeTrue();
    expect(body.toLowerCase()).not.toContain('discord');
  });

  it('routes music platforms through the canonical Mainframe deeplinks', () => {
    expect(RQS_EXTERNAL_CHANNELS).toEqual({
      spotify: 'https://raquelsynths.com/play/rqs-mainframe?service=spotify',
      youtube: 'https://raquelsynths.com/play/rqs-mainframe?service=youtube',
      soundcloud: 'https://raquelsynths.com/play/rqs-mainframe?service=soundcloud',
      radio: 'https://raquelsynths.com/play/rqs-cyberpunk-radio?service=youtube'
    });
  });

  it('renders the four English destinations without Portuguese CTA labels', () => {
    isPt.set(false);
    fixture.detectChanges();

    const body = fixture.nativeElement.textContent as string;
    expect(body).toContain('ACCESS GRANTED');
    expect(body).toContain('Choose a secure channel:');
    expect(body).toContain('LISTEN ON SPOTIFY');
    expect(body).toContain('WATCH ON YOUTUBE');
    expect(body).toContain('LISTEN ON SOUNDCLOUD');
    expect(body).toContain('LISTEN TO RQS RADIO 24/7');
    expect(body).not.toContain('OUVIR NO SPOTIFY');
  });

  it('closes from the Escape key', () => {
    spyOn(component.close, 'emit');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(component.close.emit).toHaveBeenCalledTimes(1);
  });
});
