import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

type AdminModule = 'lore' | 'global-sagas';
type LoreSource = 'broklin' | 'jonah' | null;

interface SessionResult {
  authenticated: boolean;
  csrfToken?: string;
}

type SagaLanguage = 'pt-BR' | 'en-US';
type ValidationStatus = 'VALID' | 'WARNING' | 'BLOCKED';

interface DriveDocument {
  documentId: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
  sourceLocation: string;
  support: { status: 'SUPPORTED' | 'BLOCKED'; message: string };
}

interface EditorialBlock {
  type: 'body' | 'dialogue' | 'system-log' | 'image' | 'credits';
  content: string;
}

interface EditorialEpisode {
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  blocks: EditorialBlock[];
}

interface ParsedSaga {
  saga: string;
  season: number;
  edition: string;
  language: SagaLanguage | '';
  canonicalKey: string;
  preamble: EditorialBlock[];
  episodes: EditorialEpisode[];
}

interface ValidationResult {
  status: ValidationStatus;
  blocked: string[];
  warnings: string[];
}

interface PairingStatus {
  'pt-BR': 'CONNECTED' | 'MISSING';
  'en-US': 'CONNECTED' | 'MISSING';
}

interface SourceResult {
  source: DriveDocument;
  parsed: ParsedSaga | null;
  validation: ValidationResult;
  pairing: PairingStatus;
}

interface DryRunResult extends SourceResult {
  dryRunToken: string | null;
  catalog: 'BLOCKED' | 'WOULD CREATE PRIVATE DRAFT';
  publication: 'NO';
}

@Component({
  selector: 'app-admin-module',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-module.html',
  styleUrl: './admin-module.scss'
})
export class AdminModuleComponent implements OnInit {
  readonly checked = signal(false);
  readonly authenticated = signal(false);
  readonly error = signal('');
  readonly module: AdminModule;
  readonly loreSource: LoreSource;
  readonly sourceOpen = signal(false);
  readonly loading = signal(false);
  readonly documents = signal<DriveDocument[]>([]);
  readonly selected = signal<DriveDocument | null>(null);
  readonly parsedSaga = signal<ParsedSaga | null>(null);
  readonly sourceValidation = signal<ValidationResult | null>(null);
  readonly pairing = signal<PairingStatus>({
    'pt-BR': 'MISSING',
    'en-US': 'MISSING'
  });
  readonly confirmedLanguage = signal<SagaLanguage>('pt-BR');
  readonly dryRun = signal<DryRunResult | null>(null);
  readonly importConfirmed = signal(false);
  readonly catalogStatus = signal('');
  readonly message = signal('');
  private csrf = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {
    this.module = this.route.snapshot.data['adminModule'] as AdminModule;
    this.loreSource = (
      this.route.snapshot.data['loreSource'] as LoreSource | undefined
    ) ?? null;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.restoreSession();
    } else {
      this.checked.set(true);
    }
  }

  async openSourceSelector(): Promise<void> {
    this.sourceOpen.set(true);
    await this.refreshDocuments();
  }

  async refreshDocuments(): Promise<void> {
    if (!this.authenticated() || this.loading()) return;
    this.beginRequest();
    try {
      const result = await this.call<{ documents: DriveDocument[] }>({
        action: 'list'
      });
      this.documents.set(result.documents);
    } catch (error) {
      this.fail(error);
    } finally {
      this.loading.set(false);
    }
  }

  async selectDocument(documentId: string): Promise<void> {
    const document = this.documents().find(
      item => item.documentId === documentId
    );
    if (!document || this.loading()) return;

    this.selected.set(document);
    this.parsedSaga.set(null);
    this.sourceValidation.set(null);
    this.dryRun.set(null);
    this.importConfirmed.set(false);
    this.catalogStatus.set('');
    this.message.set('');
    this.beginRequest();
    try {
      const result = await this.call<SourceResult>({
        action: 'load',
        documentId
      });
      this.selected.set(result.source);
      this.parsedSaga.set(result.parsed);
      this.sourceValidation.set(result.validation);
      this.pairing.set(result.pairing);
      if (result.parsed?.language) {
        this.confirmedLanguage.set(result.parsed.language);
      }
    } catch (error) {
      this.fail(error);
    } finally {
      this.loading.set(false);
    }
  }

  confirmLanguage(language: string): void {
    if (language !== 'pt-BR' && language !== 'en-US') return;
    this.confirmedLanguage.set(language);
    this.dryRun.set(null);
    this.importConfirmed.set(false);
    this.catalogStatus.set('');
  }

  async runDryRun(): Promise<void> {
    const source = this.selected();
    if (!source || this.loading()) return;
    this.beginRequest();
    this.dryRun.set(null);
    this.importConfirmed.set(false);
    this.catalogStatus.set('');
    try {
      const result = await this.call<DryRunResult>({
        action: 'dry-run',
        documentId: source.documentId,
        language: this.confirmedLanguage()
      });
      this.selected.set(result.source);
      this.parsedSaga.set(result.parsed);
      this.sourceValidation.set(result.validation);
      this.pairing.set(result.pairing);
      this.dryRun.set(result);
    } catch (error) {
      this.fail(error);
    } finally {
      this.loading.set(false);
    }
  }

  setImportConfirmed(confirmed: boolean): void {
    this.importConfirmed.set(confirmed);
  }

  async importDraft(): Promise<void> {
    const source = this.selected();
    const dryRun = this.dryRun();
    if (
      !source ||
      !dryRun?.dryRunToken ||
      dryRun.validation.status === 'BLOCKED' ||
      !this.importConfirmed() ||
      this.loading()
    ) return;

    this.beginRequest();
    try {
      const result = await this.call<{
        documentId: string;
        catalogStatus: string;
        publication: 'NO';
        sourceMutated: false;
        pairing: PairingStatus;
      }>({
        action: 'import',
        documentId: source.documentId,
        language: this.confirmedLanguage(),
        dryRunToken: dryRun.dryRunToken
      });
      this.pairing.set(result.pairing);
      this.catalogStatus.set(result.catalogStatus);
      this.message.set(
        `Rascunho privado criado: ${result.documentId}. PUBLICATION = ${result.publication}.`
      );
      this.importConfirmed.set(false);
      this.dryRun.set(null);
    } catch (error) {
      this.fail(error);
    } finally {
      this.loading.set(false);
    }
  }

  blockLabel(type: EditorialBlock['type']): string {
    return ({
      body: 'CORPO EDITORIAL',
      dialogue: 'DIÁLOGO',
      'system-log': 'SYSTEM LOG',
      image: 'IMAGEM / PLACEHOLDER',
      credits: 'CRÉDITOS'
    } as const)[type];
  }

  private beginRequest(): void {
    this.loading.set(true);
    this.error.set('');
  }

  private fail(error: unknown): void {
    this.error.set(
      error instanceof Error ? error.message : 'Falha inesperada no importador.'
    );
  }

  private async call<T>(body: object): Promise<T> {
    const response = await fetch('/api/admin/global-sagas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RQS-CSRF': this.csrf
      },
      body: JSON.stringify(body),
      credentials: 'same-origin',
      cache: 'no-store'
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        result.message || 'Falha no importador de Sagas Globais.'
      );
    }
    return result as T;
  }

  private async restoreSession(): Promise<void> {
    try {
      const response = await fetch('/api/admin/system-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'session' }),
        credentials: 'same-origin',
        cache: 'no-store'
      });
      const result = await response.json() as SessionResult & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.message || 'Falha na sessão administrativa.');
      }

      this.authenticated.set(result.authenticated);
      this.csrf = result.csrfToken || '';

      if (!result.authenticated || !this.csrf) {
        this.authenticated.set(false);
        await this.router.navigate(['/admin']);
      }
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha na sessão administrativa.'
      );
      await this.router.navigate(['/admin']);
    } finally {
      this.checked.set(true);
    }
  }
}
