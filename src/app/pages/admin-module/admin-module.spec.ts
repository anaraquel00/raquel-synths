import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { AdminModuleComponent } from './admin-module';

describe('AdminModuleComponent / Sagas Globais', () => {
  let fixture: ComponentFixture<AdminModuleComponent>;
  let component: AdminModuleComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminModuleComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { adminModule: 'global-sagas' }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.authenticated.set(true);
    fixture.detectChanges();
  });

  it('exibe o estado acionável sem contrato de publicação', () => {
    const text = fixture.nativeElement.textContent as string;
    const button = fixture.nativeElement.querySelector('.primary-action') as HTMLButtonElement;

    expect(text).toContain('READY FOR SOURCE');
    expect(text).toContain('NO PUBLICATION');
    expect(text).not.toContain('Published');
    expect(button.textContent).toContain('ADICIONAR DOCUMENTO');
  });

  function renderDryRun(
    status: 'VALID' | 'WARNING' | 'BLOCKED',
    warnings: string[] = [],
    blocked: string[] = []
  ): void {
    component.selected.set({
      documentId: 'drive_document_123',
      name: 'jonah-season-2-pt-BR.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      modifiedTime: '2026-09-29T10:00:00.000Z',
      webViewLink: '',
      sourceLocation: 'RQS Editorial / Global Sagas',
      support: { status: 'SUPPORTED', message: '' }
    });
    const parsed = {
      saga: 'GLITCH IN THE MATRIX',
      season: 2,
      edition: "JONAH'S LEGACY",
      language: 'pt-BR' as const,
      canonicalKey: 'glitch-in-the-matrix-s2-jonahs-legacy',
      preamble: [{
        type: 'body' as const,
        content: 'Conteúdo editorial anterior preservado.'
      }],
      episodes: Array.from({ length: 8 }, (_, index) => ({
        number: index + 1,
        slug: `s2-e${index + 1}`,
        title: index === 0 ? 'O Primeiro Ruído' : `Episódio ${index + 1}`,
        subtitle: index === 0 ? 'Um eco na infraestrutura' : '',
        blocks: index === 0
          ? [
              { type: 'body' as const, content: 'Corpo editorial preservado.' },
              { type: 'dialogue' as const, content: 'DIÁLOGO: Ainda existe sinal?' },
              { type: 'system-log' as const, content: 'SYSTEM LOG: integridade 42%' }
            ]
          : [{ type: 'body' as const, content: `Conteúdo do episódio ${index + 1}.` }]
      }))
    };
    component.parsedSaga.set(parsed);
    component.dryRun.set({
      source: component.selected()!,
      parsed,
      validation: { status, blocked, warnings },
      pairing: { 'pt-BR': 'MISSING', 'en-US': 'MISSING' },
      dryRunToken: 'signed-token',
      catalog: 'WOULD WRITE 8 EPISODES TO global-sagas',
      publication: 'NO',
      initialPublicState: 'published = false',
      firestoreWrites: 0,
      writePlan: Array.from({ length: 8 }, (_, index) => ({
        id: `s2-e${index + 1}`,
        action: 'CREATE',
        language: 'pt-BR',
        fields: [
          'title', 'category', 'description', 'content',
          'image', 'releaseDate', 'mode', 'published'
        ],
        issues: []
      }))
    });
    fixture.detectChanges();
  }

  it('apresenta VALID e WARNING como auditoria completa com observação neutra', () => {
    renderDryRun('VALID');
    expect(fixture.nativeElement.textContent).toContain('AUDITORIA COMPLETA');

    renderDryRun('WARNING', [
      'Conteúdo editorial anterior ao primeiro episódio foi preservado como preâmbulo.'
    ]);

    const text = fixture.nativeElement.textContent as string;
    const observation = fixture.nativeElement.querySelector(
      '.non-blocking-observation'
    ) as HTMLElement;
    const chip = fixture.nativeElement.querySelector(
      '.validation-chip.observation'
    ) as HTMLElement;

    expect(text).toContain('AUDITORIA COMPLETA');
    expect(text).toContain('OBSERVAÇÃO NÃO BLOQUEANTE');
    expect(text).toContain('1 OBSERVAÇÃO');
    expect(observation.textContent).toContain('preservado como preâmbulo');
    expect(chip).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.validation-list.warning')).toBeNull();
  });

  it('prioriza o conteúdo e mantém oito entradas no plano técnico recolhido', () => {
    renderDryRun('WARNING', [
      'Conteúdo editorial anterior ao primeiro episódio foi preservado como preâmbulo.'
    ]);

    const text = fixture.nativeElement.textContent as string;
    const details = fixture.nativeElement.querySelector(
      'details.write-plan'
    ) as HTMLDetailsElement;
    const planItems = details.querySelectorAll('li');

    expect(text).toContain('GLITCH IN THE MATRIX');
    expect(text).toContain('PREÂMBULO PRESERVADO');
    expect(text).toContain('O Primeiro Ruído');
    expect(text).toContain('Episódio 8');
    expect(text).toContain('CORPO EDITORIAL');
    expect(text).toContain('DIÁLOGO');
    expect(text).toContain('SYSTEM LOG');
    expect(text.indexOf('GLITCH IN THE MATRIX')).toBeLessThan(text.indexOf('PREÂMBULO PRESERVADO'));
    expect(text.indexOf('PREÂMBULO PRESERVADO')).toBeLessThan(text.indexOf('O Primeiro Ruído'));
    expect(text.indexOf('Episódio 8')).toBeLessThan(text.indexOf('DESTINO'));
    expect(details.open).toBeFalse();
    expect(details.querySelector('summary')?.textContent).toContain(
      'FIRESTORE WRITE PLAN — 8 DOCUMENTOS'
    );
    expect(planItems.length).toBe(8);
    expect(planItems[0].textContent).toContain('s2-e1');
    expect(planItems[0].textContent).toContain('CREATE pt-BR');
  });

  it('resume a importação e preserva confirmação, botão e zero writes no Dry Run', () => {
    renderDryRun('VALID');

    const text = fixture.nativeElement.textContent as string;
    const confirmation = fixture.nativeElement.querySelector(
      '.owner-confirmation'
    ) as HTMLLabelElement;
    const checkbox = confirmation.querySelector('input') as HTMLInputElement;
    const button = fixture.nativeElement.querySelector('.import-action') as HTMLButtonElement;

    expect(text).toContain('DESTINO global-sagas');
    expect(text).toContain('EPISÓDIOS 8');
    expect(text).toContain('PUBLICAÇÃO NÃO');
    expect(text).toContain('published = false');
    expect(text).toContain('releaseDate preservadas dos documentos');
    expect(text).toContain('DRY RUN FIRESTORE WRITES 0');
    expect(text).toContain('SOURCE MUTATION NO');
    expect(confirmation.textContent).toContain(
      'Os episódios permanecerão não publicados até autorização.'
    );
    expect(button.textContent).toContain('IMPORTAR EPISÓDIOS PARA GLOBAL-SAGAS');
    expect(button.disabled).toBeTrue();

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.importConfirmed()).toBeTrue();
    expect(button.disabled).toBeFalse();
    expect(text).not.toContain(['PRIVATE', 'DRAFT'].join(' '));
    expect(text).not.toContain(['Rascunho', 'privado'].join(' '));
  });

  it('mantém conflitos em estado explicitamente bloqueado', () => {
    renderDryRun('BLOCKED', [], ['s2-e1: CONFLICT — image compartilhado diverge da fonte.']);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('AUDITORIA BLOQUEADA');
    expect(text).toContain('CONFLICT');
    expect(fixture.nativeElement.querySelector('.validation-chip.blocked')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.owner-confirmation')).toBeNull();
    expect(fixture.nativeElement.querySelector('.import-action')).toBeNull();
  });
});
