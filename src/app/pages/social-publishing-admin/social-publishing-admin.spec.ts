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
      gateMode: 'PREVIEW_PILOT',
      flagEnabled: true,
      featureEnabled: true,
      previewEnvironment: true,
      productionEnvironment: false,
      branchMatch: true,
      sourceConfigured: true,
      sourceMatch: null,
      destinationMatch: null,
      pilotSourceId: source.sourceId,
      authorizedSourceId: source.sourceId,
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

  it('prepara publicação salvando o draft antes de validar e usa o pacote persistido no dry-run', async () => {
    component.selectSource();
    component.draft!.instagramCaption = 'Legenda Instagram';
    component.draft!.facebookCaption = 'Legenda Facebook';
    component.draft!.destinations = ['instagram', 'facebook'];

    const savedPackage = {
      ...component.draft!,
      id: 'prepared-package',
      status: 'DRAFT' as const
    };

    const actions: string[] = [];
    let dryRunPackage: unknown = null;

    spyOn<any>(component, 'loadPackages').and.resolveTo();
    spyOn<any>(component, 'call').and.callFake(async (body: any) => {
      actions.push(body.action);

      if (body.action === 'save-draft') {
        return { package: savedPackage };
      }

      if (body.action === 'dry-run') {
        dryRunPackage = body.package;
        return {
          diagnostics: { status: 'PASS', checks: [] },
          dryRunToken: 'prepared-token'
        };
      }

      throw new Error(`Ação inesperada no teste: ${body.action}`);
    });

    await component.preparePublication();

    expect(actions).toEqual(['save-draft', 'dry-run']);
    expect(dryRunPackage).toBe(savedPackage);
    expect(component.draft).toBe(savedPackage);
    expect(component.dryRunToken()).toBe('prepared-token');
    expect(component.diagnostics()?.status).toBe('PASS');
    expect(component.message()).toBe(
      'Publicação preparada. Revise e aprove o pacote.'
    );
  });

  it('mantém Aprovar bloqueado quando a preparação encontra pendências', async () => {
    component.selectSource();
    component.draft!.facebookCaption = '';
    component.draft!.destinations = ['facebook'];

    const savedPackage = {
      ...component.draft!,
      id: 'invalid-prepared-package',
      status: 'DRAFT' as const
    };

    spyOn<any>(component, 'loadPackages').and.resolveTo();
    spyOn<any>(component, 'call').and.callFake(async (body: any) => {
      if (body.action === 'save-draft') {
        return { package: savedPackage };
      }

      if (body.action === 'dry-run') {
        return {
          diagnostics: {
            status: 'FAIL',
            checks: [{
              code: 'FACEBOOK_CAPTION',
              status: 'FAIL',
              message: 'Informe a legenda do Facebook.'
            }]
          },
          dryRunToken: null
        };
      }

      throw new Error(`Ação inesperada no teste: ${body.action}`);
    });

    await component.preparePublication();
    fixture.detectChanges();

    expect(component.dryRunToken()).toBeNull();
    expect(component.diagnostics()?.status).toBe('FAIL');
    expect(component.message()).toBe(
      'Rascunho salvo, mas a preparação encontrou pendências.'
    );

    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement)
        .querySelectorAll<HTMLButtonElement>('.actions button')
    );

    const approveButton = buttons.find(
      button => button.textContent?.trim() === 'Aprovar pacote'
    );

    expect(approveButton).toBeTruthy();
    expect(approveButton?.disabled).toBeTrue();
  });

  it('invalida preparação anterior quando o conteúdo do pacote é alterado', () => {
    component.selectSource();

    component.diagnostics.set({
      status: 'PASS',
      checks: []
    });
    component.dryRunToken.set('token-antigo');

    component.toggleDestination('facebook', true);

    expect(component.draft?.destinations).toContain('facebook');
    expect(component.dryRunToken()).toBeNull();
    expect(component.diagnostics()).toBeNull();
  });

  it('aprova o pacote preparado, limpa o token e informa que está pronto para publicar', async () => {
    component.selectSource();

    const draftPackage = {
      ...component.draft!,
      id: 'approved-package',
      status: 'DRAFT' as const,
      destinations: ['facebook' as const],
      facebookCaption: 'Publicação preparada.'
    };

    const approvedPackage = {
      ...draftPackage,
      status: 'APPROVED' as const,
      approvedAt: '2026-10-01T15:45:00.000Z'
    };

    component.draft = draftPackage;
    component.dryRunToken.set('valid-dry-run-token');

    spyOn<any>(component, 'loadPackages').and.resolveTo();

    const callSpy = spyOn<any>(component, 'call').and.callFake(
      async (body: any) => {
        expect(body).toEqual({
          action: 'approve',
          id: 'approved-package',
          dryRunToken: 'valid-dry-run-token'
        });

        return {
          package: approvedPackage,
          diagnostics: {
            status: 'PASS',
            checks: []
          }
        };
      }
    );

    await component.approve();

    expect(callSpy).toHaveBeenCalledTimes(1);
    expect(component.draft?.status).toBe('APPROVED');
    expect(component.dryRunToken()).toBeNull();
    expect(component.diagnostics()?.status).toBe('PASS');
    expect(component.message()).toBe(
      'Pacote aprovado. Pronto para publicar nos destinos selecionados.'
    );
  });

  it('habilita Facebook quando o destino está selecionado em pacote aprovado e fonte autorizada', () => {
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
    expect(component.canPublishFacebook).toBeTrue();
  });

  it('mantém publicação multi-destino disponível quando uma rede já foi publicada', () => {
    component.selectSource();

    const multiMeta: MetaConnectionDiagnostics = {
      ...facebookMeta,
      instagramWriteGate: {
        gateMode: 'PRODUCTION',
        flagEnabled: true,
        featureEnabled: true,
        previewEnvironment: false,
        productionEnvironment: true,
        branchMatch: null,
        sourceConfigured: true,
        sourceMatch: null,
        destinationMatch: null,
        pilotSourceId: null,
        authorizedSourceId: source.sourceId,
        configurationEnabled: true,
        enabled: false
      },
      facebookWriteGate: {
        ...facebookMeta.facebookWriteGate,
        gateMode: 'PRODUCTION',
        previewEnvironment: false,
        productionEnvironment: true,
        branchMatch: null,
        pilotSourceId: null,
        authorizedSourceId: source.sourceId,
        configurationEnabled: true
      }
    };

    component.metaDiagnostics.set(multiMeta);

    component.draft = {
      ...component.draft!,
      id: 'multi-package',
      status: 'APPROVED',
      instagramCaption: 'Instagram aprovado.',
      facebookCaption: 'Facebook aprovado.',
      destinations: ['instagram', 'facebook']
    };

    expect(component.canPublishInstagram).toBeTrue();
    expect(component.canPublishFacebook).toBeTrue();
    expect(component.pendingDestinations).toEqual([
      'instagram',
      'facebook'
    ]);
    expect(component.canPublishSelected).toBeTrue();

    component.draft = {
      ...component.draft,
      facebookDelivery: {
        status: 'PUBLISHED',
        idempotencyKey: 'facebook-key',
        remoteContainerId: null,
        remotePostId: 'facebook-post',
        attemptCount: 1,
        lastError: null,
        publishedAt: '2026-10-01T12:00:00.000Z'
      }
    };

    expect(component.canPublishFacebook).toBeFalse();
    expect(component.canPublishInstagram).toBeTrue();
    expect(component.pendingDestinations).toEqual([
      'instagram'
    ]);
    expect(component.canPublishSelected).toBeTrue();
  });

  it('publica os destinos selecionados em sequência e preserva o resultado final', async () => {
    component.selectSource();

    component.metaDiagnostics.set({
      ...facebookMeta,
      instagramWriteGate: {
        gateMode: 'PRODUCTION',
        flagEnabled: true,
        featureEnabled: true,
        previewEnvironment: false,
        productionEnvironment: true,
        branchMatch: null,
        sourceConfigured: true,
        sourceMatch: null,
        destinationMatch: null,
        pilotSourceId: null,
        authorizedSourceId: source.sourceId,
        configurationEnabled: true,
        enabled: false
      },
      facebookWriteGate: {
        ...facebookMeta.facebookWriteGate,
        gateMode: 'PRODUCTION',
        previewEnvironment: false,
        productionEnvironment: true,
        branchMatch: null,
        pilotSourceId: null,
        authorizedSourceId: source.sourceId,
        configurationEnabled: true
      }
    });

    component.draft = {
      ...component.draft!,
      id: 'multi-package-sequence',
      status: 'APPROVED',
      instagramCaption: 'Instagram aprovado.',
      facebookCaption: 'Facebook aprovado.',
      destinations: ['instagram', 'facebook']
    };

    component.publishTarget.set('selected');

    const actions: string[] = [];

    spyOn<any>(component, 'loadPackages').and.resolveTo();

    spyOn<any>(component, 'call').and.callFake(
      async (body: any) => {
        actions.push(body.action);

        if (body.action === 'publish-instagram-now') {
          return {
            package: {
              ...component.draft!,
              status: 'APPROVED',
              instagramDelivery: {
                status: 'PUBLISHED',
                idempotencyKey: 'instagram-key',
                remoteContainerId: 'container',
                remotePostId: 'instagram-post',
                attemptCount: 1,
                lastError: null,
                publishedAt: '2026-10-01T12:10:00.000Z'
              }
            }
          };
        }

        if (body.action === 'publish-facebook-now') {
          return {
            package: {
              ...component.draft!,
              status: 'PUBLISHED',
              facebookDelivery: {
                status: 'PUBLISHED',
                idempotencyKey: 'facebook-key',
                remoteContainerId: null,
                remotePostId: 'facebook-post',
                attemptCount: 1,
                lastError: null,
                publishedAt: '2026-10-01T12:11:00.000Z'
              }
            }
          };
        }

        throw new Error(`Ação inesperada: ${body.action}`);
      }
    );

    await component.publishSelectedNow();

    expect(actions).toEqual([
      'publish-instagram-now',
      'publish-facebook-now'
    ]);

    expect(component.draft?.status).toBe('PUBLISHED');
    expect(
      component.draft?.instagramDelivery?.status
    ).toBe('PUBLISHED');
    expect(
      component.draft?.facebookDelivery?.status
    ).toBe('PUBLISHED');

    expect(component.message()).toContain(
      'Publicado nos destinos selecionados'
    );
  });

  it('interrompe publicação multi-destino se a primeira rede falhar', async () => {
    component.selectSource();

    component.metaDiagnostics.set({
      ...facebookMeta,
      instagramWriteGate: {
        gateMode: 'PRODUCTION',
        flagEnabled: true,
        featureEnabled: true,
        previewEnvironment: false,
        productionEnvironment: true,
        branchMatch: null,
        sourceConfigured: true,
        sourceMatch: null,
        destinationMatch: null,
        pilotSourceId: null,
        authorizedSourceId: source.sourceId,
        configurationEnabled: true,
        enabled: false
      },
      facebookWriteGate: {
        ...facebookMeta.facebookWriteGate,
        gateMode: 'PRODUCTION',
        previewEnvironment: false,
        productionEnvironment: true,
        branchMatch: null,
        pilotSourceId: null,
        authorizedSourceId: source.sourceId,
        configurationEnabled: true
      }
    });

    component.draft = {
      ...component.draft!,
      id: 'multi-package-failure',
      status: 'APPROVED',
      instagramCaption: 'Instagram aprovado.',
      facebookCaption: 'Facebook aprovado.',
      destinations: ['instagram', 'facebook']
    };

    component.publishTarget.set('selected');

    const actions: string[] = [];

    spyOn<any>(component, 'loadPackages').and.resolveTo();

    spyOn<any>(component, 'call').and.callFake(
      async (body: any) => {
        actions.push(body.action);

        if (body.action === 'publish-instagram-now') {
          throw new Error('Falha simulada no Instagram.');
        }

        throw new Error(
          'Facebook não deveria ser chamado depois da falha.'
        );
      }
    );

    await component.publishSelectedNow();

    expect(actions).toEqual([
      'publish-instagram-now'
    ]);

    expect(component.error()).toContain(
      'Falha simulada no Instagram.'
    );
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

  it('reflete dinamicamente o estado efetivo do write gate na mensagem técnica', () => {
    component.metaDiagnostics.set(facebookMeta);
    fixture.detectChanges();

    const technicalDetails = (fixture.nativeElement as HTMLElement).querySelector('.technical-details');
    expect(technicalDetails?.textContent).toContain('publicação real habilitada somente para fluxos autorizados');
    expect(technicalDetails?.textContent).not.toContain('publicação automática permanece desabilitada');

    component.metaDiagnostics.set({ ...facebookMeta, publishingEnabled: false });
    fixture.detectChanges();
    expect(technicalDetails?.textContent).toContain('publicação automática permanece desabilitada');
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
