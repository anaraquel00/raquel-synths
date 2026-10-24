import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BLUE_TEAM_EN, BLUE_TEAM_PT, RED_TEAM_EN, RED_TEAM_PT } from '../../data/app-data';
import { SeoService } from '../../services/seo.service';
import { TranslationService } from '../../services/translation.service';
import { SobreComponent } from './sobre';

describe('SobreComponent editorial dossier', () => {
  let fixture: ComponentFixture<SobreComponent>;
  let isPt: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    isPt = signal(true);
    document.body.classList.add('mode-jonah');

    await TestBed.configureTestingModule({
      imports: [SobreComponent],
      providers: [
        provideRouter([]),
        { provide: TranslationService, useValue: { isPt } },
        {
          provide: SeoService,
          useValue: jasmine.createSpyObj<SeoService>('SeoService', ['updateMetaTags', 'setJsonLd'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SobreComponent);
    fixture.componentInstance.isJonahMode.set(true);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.body.classList.remove('mode-jonah');
    TestBed.resetTestingModule();
  });

  it('renders the Portuguese historical narrative and a single Saga CTA', () => {
    const body = fixture.nativeElement.textContent as string;
    const sagaLinks = fixture.nativeElement.querySelectorAll('.saga-hook a') as NodeListOf<HTMLAnchorElement>;

    expect(body).toContain('ORIGIN FILE');
    expect(body).toContain('THE SOUND WAR');
    expect(body).toContain('EMOTIONAL DAMAGE // DETECTED');
    expect(body).toContain('THE REFORGE');
    expect(body).toContain('CURRENT STATUS');
    expect(body).toContain('Broklin não é o inimigo');
    expect(body).toContain('Kelma não é um troféu');
    expect(body).not.toContain('cão de guarda corporativo');
    expect(body).not.toContain('ao diabo com a');
    expect(sagaLinks.length).toBe(1);
    expect(sagaLinks[0].textContent).toContain('LER A SAGA DESDE A ORIGEM');
    expect(sagaLinks[0].getAttribute('href')).toBe('/visual-novel/jonah/s1');
  });

  it('renders the English narrative without Portuguese body copy', () => {
    isPt.set(false);
    fixture.detectChanges();

    const body = fixture.nativeElement.textContent as string;
    const sagaLink = fixture.nativeElement.querySelector('.saga-cta') as HTMLAnchorElement;

    expect(body).toContain('Today, Broklin is not the enemy');
    expect(body).toContain('Kelma is not a trophy');
    expect(body).toContain('READ THE SAGA FROM THE BEGINNING');
    expect(body).not.toContain('Isto é apenas o resumo operacional');
    expect(sagaLink.getAttribute('href')).toBe('/visual-novel/jonah/s1');
  });

  it('renders only Jonah and General Kelma while preserving the hidden historical data', () => {
    const cards = fixture.nativeElement.querySelectorAll('.member-card') as NodeListOf<HTMLElement>;
    const body = fixture.nativeElement.textContent as string;
    const images = fixture.nativeElement.querySelectorAll('.member-card img') as NodeListOf<HTMLImageElement>;

    expect(cards.length).toBe(2);
    expect(body).toContain('Jonah Cyperfield // RED ORIGIN / REDBLUE OPERATIVE');
    expect(body).toContain('General Kelma Adlanko // BLUE ORIGIN / REDBLUE OPERATIVE');
    expect(body).not.toContain('Nicole Nyx');
    expect(body).not.toContain('T-0RQUE // Hydraulic Enforcer');
    expect(body).not.toContain('NUL-L0ck // The Blade Engine');
    expect(Array.from(images).some(image => image.src.endsWith('/images/general_kelma.webp'))).toBeTrue();
    expect(Array.from(images).some(image => image.src.endsWith('/images/evil_nyx.webp'))).toBeFalse();
    expect(Array.from(images).find(image => image.src.endsWith('/images/general_kelma.webp'))?.alt)
      .toBe('Retrato da General Kelma Adlanko');
    expect(RED_TEAM_PT.slice(-2).map(member => member.name)).toEqual([
      'T-0RQUE // Hydraulic Enforcer',
      'NUL-L0ck // The Blade Engine'
    ]);
    expect(RED_TEAM_EN.length).toBe(4);
  });

  it('renders the complete Portuguese Broklin dossier with one canonical Saga CTA', () => {
    document.body.classList.remove('mode-jonah');
    fixture.componentInstance.isJonahMode.set(false);
    fixture.detectChanges();

    const body = fixture.nativeElement.textContent as string;
    const sagaLinks = fixture.nativeElement.querySelectorAll('.saga-hook a') as NodeListOf<HTMLAnchorElement>;

    expect(body).toContain('THE ARCHITECT BEFORE THE WAR');
    expect(body).toContain('THE COLD WAR');
    expect(body).toContain('NEON NECROSIS // THE DIVISION');
    expect(body).toContain('THE MAN BEYOND THE TECH LEAD');
    expect(body).toContain('NICOLE NYX // THE LEGACY BOND');
    expect(body).toContain('THE SIGNAL AFTER THE WAR');
    expect(body).toContain('OPERATIVE PROFILE');
    expect(body).toContain('CURRENT STATUS');
    expect(body).toContain('Broklin também alimentou a rivalidade');
    expect(body).toContain('Kelma continua sendo família através da coparentalidade');
    expect(body).toContain('Jonah já não é um inimigo permanente');
    expect(body).toContain('A guerra foi uma fase. A identidade permaneceu.');
    expect(body).not.toContain('Nossa Missão');
    expect(sagaLinks.length).toBe(1);
    expect(sagaLinks[0].textContent).toContain('LER A HISTÓRIA DE BROKLIN');
    expect(sagaLinks[0].getAttribute('href')).toBe('/visual-novel/broklin/s1');
    expect(fixture.nativeElement.querySelector('.jonah-editorial')).toBeNull();
  });

  it('renders the English Broklin dossier without stale Portuguese body copy', () => {
    document.body.classList.remove('mode-jonah');
    fixture.componentInstance.isJonahMode.set(false);
    isPt.set(false);
    fixture.detectChanges();

    const body = fixture.nativeElement.textContent as string;
    const sagaLink = fixture.nativeElement.querySelector('.saga-cta') as HTMLAnchorElement;

    expect(body).toContain('Broklin also fed the rivalry');
    expect(body).toContain('Kelma remains family through co-parenting');
    expect(body).toContain('Jonah is no longer a permanent enemy');
    expect(body).toContain('The war was a phase. The identity remained.');
    expect(body).toContain("READ BROKLIN'S STORY");
    expect(body).not.toContain('Este dossier é apenas o resumo operacional');
    expect(sagaLink.getAttribute('href')).toBe('/visual-novel/broklin/s1');
  });

  it('renders only the current Broklin and Nicole pair while preserving historical Blue data', () => {
    document.body.classList.remove('mode-jonah');
    fixture.componentInstance.isJonahMode.set(false);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.member-card') as NodeListOf<HTMLElement>;
    const body = fixture.nativeElement.textContent as string;
    const images = fixture.nativeElement.querySelectorAll('.member-card img') as NodeListOf<HTMLImageElement>;

    expect(cards.length).toBe(2);
    expect(body).toContain('Broklin Garpeter // SYNTH LORD');
    expect(body).toContain('Nicole Nyx // CURRENT PARTNER');
    expect(body).not.toContain('Kelly (2.0) & Kael (1.0)');
    expect(body).not.toContain('Totó (Unidade Canina)');
    expect(Array.from(images).some(image => image.src.endsWith('/images/corporate_broklin.webp'))).toBeTrue();
    expect(Array.from(images).some(image => image.src.endsWith('/images/nicole_current.webp'))).toBeTrue();
    expect(Array.from(images).some(image => image.src.endsWith('/images/kelma_corporate.webp'))).toBeFalse();
    expect(Array.from(images).find(image => image.src.endsWith('/images/nicole_current.webp'))?.alt)
      .toBe('Retrato atual de Nicole Nyx');
    expect(BLUE_TEAM_PT.map(member => member.name)).toContain('Kelma Adlanko (DJ Kel)');
    expect(BLUE_TEAM_EN.length).toBe(4);
  });

  it('switches Broklin to Jonah and back without stale copy, cards, or routes', () => {
    document.body.classList.remove('mode-jonah');
    fixture.componentInstance.isJonahMode.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nicole Nyx // CURRENT PARTNER');

    document.body.classList.add('mode-jonah');
    fixture.componentInstance.isJonahMode.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('General Kelma Adlanko // BLUE ORIGIN / REDBLUE OPERATIVE');
    expect(fixture.nativeElement.textContent).not.toContain('Nicole Nyx // CURRENT PARTNER');
    expect((fixture.nativeElement.querySelector('.saga-cta') as HTMLAnchorElement).getAttribute('href'))
      .toBe('/visual-novel/jonah/s1');

    document.body.classList.remove('mode-jonah');
    fixture.componentInstance.isJonahMode.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nicole Nyx // CURRENT PARTNER');
    expect(fixture.nativeElement.textContent).not.toContain('General Kelma Adlanko // BLUE ORIGIN / REDBLUE OPERATIVE');
    expect((fixture.nativeElement.querySelector('.saga-cta') as HTMLAnchorElement).getAttribute('href'))
      .toBe('/visual-novel/broklin/s1');
  });
});
