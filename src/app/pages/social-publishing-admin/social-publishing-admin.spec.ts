import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NormalizedSource, SocialPackageStatus } from '../../models/social-publishing.model';
import { SocialPublishingAdminComponent } from './social-publishing-admin';

describe('SocialPublishingAdminComponent / draft editability', () => {
  let fixture: ComponentFixture<SocialPublishingAdminComponent>;
  let component: SocialPublishingAdminComponent;

  const source: NormalizedSource = {
    sourceType: 'music_release',
    sourceId: 'discography/ep-the-blueprint-sessions-v022',
    sourceUrl: 'firestore://discography/ep-the-blueprint-sessions-v022',
    title: 'THE BLUEPRINT SESSIONS Vol.022',
    summary: 'Release publicado.',
    canonicalUrl: 'https://raquelsynths.com/discografia',
    primaryImage: 'https://raquelsynths.com/assets/cover.webp',
    publishedAt: '2026-09-23T12:00:00.000Z',
    language: 'pt-BR',
    sourceRevision: 'revision-1',
    musicDeepLinkUrl: 'https://raquelsynths.com/play/ep-the-blueprint-sessions-v022'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialPublishingAdminComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SocialPublishingAdminComponent);
    component = fixture.componentInstance;
    component.checked.set(true);
    component.sources.set([source]);
    component.sourceId = source.sourceId;
  });

  it('cria uma nova fonte como DRAFT e habilita o formulário editorial', () => {
    component.selectSource();
    fixture.detectChanges();

    expect(component.draft?.status).toBe('DRAFT');
    expectEditableForm(true);
  });

  it('startAnother cria um novo DRAFT editável para a mesma fonte', () => {
    component.selectSource();
    component.draft!.instagramCaption = 'Conteúdo anterior';
    component.draft!.destinations = ['instagram'];

    component.startAnother();
    fixture.detectChanges();

    expect(component.draft?.status).toBe('DRAFT');
    expect(component.draft?.instagramCaption).toBe('');
    expect(component.draft?.destinations).toEqual([]);
    expectEditableForm(true);
  });

  it('preserva DRAFT editável e mantém os demais status somente leitura', async () => {
    component.selectSource();

    const statuses: SocialPackageStatus[] = [
      'DRAFT',
      'APPROVED',
      'CANCELED',
      'SCHEDULED',
      'PUBLISHING',
      'PUBLISHED',
      'FAILED'
    ];
    for (const status of statuses) {
      component.draft = { ...component.draft!, status };
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expectEditableForm(status === 'DRAFT');
    }
  });

  function expectEditableForm(editable: boolean): void {
    const element = fixture.nativeElement as HTMLElement;
    const fields = Array.from(element.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      '.package-fields input, .package-fields select, .package-fields textarea'
    ));
    const destinations = element.querySelector('fieldset.destinations') as HTMLFieldSetElement;
    const checkboxes = Array.from(destinations.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
    const saveButton = element.querySelector('.actions .button-primary') as HTMLButtonElement;

    expect(fields.length).toBe(8);
    expect(fields.every(field => field.disabled === !editable)).toBeTrue();
    expect(destinations.disabled).toBe(!editable);
    expect(checkboxes.length).toBe(2);
    expect(checkboxes.every(checkbox => checkbox.matches(':disabled') === !editable)).toBeTrue();
    expect(saveButton.disabled).toBe(!editable);
  }
});
