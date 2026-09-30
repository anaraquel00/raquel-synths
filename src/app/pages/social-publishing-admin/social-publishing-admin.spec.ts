import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MetaConnectionDiagnostics, NormalizedSource, SocialPackageStatus } from '../../models/social-publishing.model';
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
  const facebookMeta: MetaConnectionDiagnostics = {
    graphApiVersion: 'v26.0',
    checkedAt: '2026-09-30T12:00:00.000Z',
    publishingEnabled: true,
    writeGate: { flagEnabled: false, previewEnvironment: true, branchMatch: false, enabled: false },
    facebookWriteGate: {
      flagEnabled: true,
      featureEnabled: true,
      previewEnvironment: true,
      branchMatch: true,
      sourceConfigured: true,
      sourceMatch: null,
      destinationMatch: null,
      pilotSourceId: source.sourceId,
      configurationEnabled: true,
      enabled: false
    },
    facebook: {
      platform: 'facebook',
      status: 'READY',
      missingConfiguration: [],
      requiredPermissions: ['pages_manage_posts'],
      missingPermissions: [],
      identity: { id: '2222222222', name: 'RQS Page' },
      capabilities: { feed: true, reels: true, stories: false },
      checks: []
    },
    instagram: {
      platform: 'instagram',
      status: 'READY',
      missingConfiguration: [],
      requiredPermissions: ['instagram_content_publish'],
      missingPermissions: [],
      identity: { id: '3333333333', username: 'rqs_synths' },
      capabilities: { feed: true, reels: true, stories: false },
      checks: []
    },
    relationship: { status: 'MATCH' },
    token: { valid: true, appIdMatches: true, expiresAt: null, dataAccessExpiresAt: null }
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

  it('habilita o piloto Facebook apenas para pacote aprovado Facebook-only e fonte autorizada', () => {
    component.selectSource();
    component.metaDiagnostics.set(facebookMeta);
    component.draft = {
      ...component.draft!,
      id: 'facebook-pilot-package',
      status: 'APPROVED',
      facebookCaption: 'Publicação controlada no Facebook.',
      destinations: ['facebook']
    };

    expect(component.canPublishFacebook).toBeTrue();

    component.draft.destinations = ['facebook', 'instagram'];
    expect(component.canPublishFacebook).toBeFalse();
  });

  it('mostra confirmação explícita e específica antes do POST real no Facebook', () => {
    component.selectSource();
    component.metaDiagnostics.set(facebookMeta);
    component.draft = {
      ...component.draft!,
      id: 'facebook-pilot-package',
      status: 'APPROVED',
      facebookCaption: 'Publicação controlada no Facebook.',
      destinations: ['facebook']
    };

    component.requestPublishFacebook();
    fixture.detectChanges();

    expect(component.publishConfirmationOpen()).toBeTrue();
    expect(component.publishTarget()).toBe('facebook');
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('.publish-dialog');
    expect(dialog?.textContent).toContain('publicação real na Facebook Page configurada');
    expect(dialog?.textContent).toContain('Publicar no Facebook');
    expect(dialog?.textContent).not.toContain('@rqs_synths');
  });

  it('exibe remotePostId e publishedAt da delivery Facebook publicada', () => {
    component.selectSource();
    component.draft = {
      ...component.draft!,
      status: 'PUBLISHED',
      destinations: ['facebook'],
      facebookDelivery: {
        status: 'PUBLISHED',
        idempotencyKey: 'facebook-key',
        remoteContainerId: null,
        remotePostId: '2222222222_9999999999',
        attemptCount: 1,
        lastError: null,
        publishedAt: '2026-09-30T12:34:56.000Z'
      }
    };
    fixture.detectChanges();

    const result = (fixture.nativeElement as HTMLElement).querySelector('.publication-result');
    expect(result?.textContent).toContain('Publicado no Facebook');
    expect(result?.textContent).toContain('2222222222_9999999999');
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
