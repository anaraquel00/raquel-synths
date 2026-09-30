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

  it('mantém o preview editorial privado separado por blocos', () => {
    component.selected.set({
      documentId: 'drive_document_123',
      name: 'jonah-season-2-pt-BR.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      modifiedTime: '2026-09-29T10:00:00.000Z',
      webViewLink: '',
      sourceLocation: 'RQS Editorial / Global Sagas',
      support: { status: 'SUPPORTED', message: '' }
    });
    component.parsedSaga.set({
      saga: 'GLITCH IN THE MATRIX',
      season: 2,
      edition: "JONAH'S LEGACY",
      language: 'pt-BR',
      canonicalKey: 'glitch-in-the-matrix-s2-jonahs-legacy',
      preamble: [],
      episodes: [{
        number: 1,
        slug: 's2-e1',
        title: 'O Primeiro Ruído',
        subtitle: 'Um eco na infraestrutura',
        blocks: [
          { type: 'body', content: 'Corpo editorial preservado.' },
          { type: 'dialogue', content: 'DIÁLOGO: Ainda existe sinal?' },
          { type: 'system-log', content: 'SYSTEM LOG: integridade 42%' }
        ]
      }]
    });
    component.dryRun.set({
      source: component.selected()!,
      parsed: component.parsedSaga(),
      validation: { status: 'VALID', blocked: [], warnings: [] },
      pairing: { 'pt-BR': 'MISSING', 'en-US': 'MISSING' },
      dryRunToken: 'signed-token',
      catalog: 'WOULD WRITE 8 EPISODES TO global-sagas',
      publication: 'NO',
      initialPublicState: 'published = false',
      firestoreWrites: 0,
      writePlan: [{
        id: 's2-e1',
        action: 'CREATE',
        language: 'pt-BR',
        fields: [
          'title', 'category', 'description', 'content',
          'image', 'releaseDate', 'mode', 'published'
        ],
        issues: []
      }]
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('VALIDATION');
    expect(text).toContain('GLITCH IN THE MATRIX');
    expect(text).toContain('O Primeiro Ruído');
    expect(text).toContain('CORPO EDITORIAL');
    expect(text).toContain('DIÁLOGO');
    expect(text).toContain('SYSTEM LOG');
    expect(text).toContain('s2-e1');
    expect(text).toContain('CREATE pt-BR');
    expect(text).toContain('published = false');
    expect(text).toContain('global-sagas');
    expect(text).toContain('DRY RUN FIRESTORE WRITES 0');
    expect(text).toContain('PUBLICATION NO');
    expect(text).not.toContain(['PRIVATE', 'DRAFT'].join(' '));
    expect(text).not.toContain(['Rascunho', 'privado'].join(' '));
  });
});
