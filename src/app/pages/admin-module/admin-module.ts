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
type WriteAction = 'CREATE' | 'MERGE_PT' | 'MERGE_EN' | 'UNCHANGED' |
  'CONFLICT' | 'BLOCKED';

interface DriveDocument {
  documentId: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
  sourceLocation: string;
  support: { status: 'SUPPORTED' | 'BLOCKED'; message: string };
  languageHint?: SagaLanguage | '';
  collection?: string;
  size?: number;
}

interface LoreDraftFields {
  title: string;
  title_en: string;
  category: string;
  category_en: string;
  content: string;
  content_en: string;
  description: string;
  description_en: string;
  image: string;
  mode: 'broklin' | 'jonah';
  published: true;
  releaseDate: string;
}

interface LoreDraftDocument {
  id: string;
  collection: string;
  fields: LoreDraftFields;
}

interface LorePreviewResult {
  mode: Exclude<LoreSource, null>;
  collection: string;
  sourceLocation: string;
  validation: {
    status: 'PASS' | 'BLOCKED';
    blocked: string[];
    warnings: string[];
  };
  pairing: {
    status: 'PASS' | 'BLOCKED';
    documents: LoreDraftDocument[];
  };
  firestoreWrites: 0;
  sourceMutated: false;
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
  catalog: string;
  publicationApproved: true;
  initialPublicState: 'published = true';
  publicReleaseGate: 'releaseDate';
  firestoreWrites: 0;
  writePlan: Array<{
    id: string;
    action: WriteAction;
    language: SagaLanguage;
    fields: string[];
    issues: string[];
  }>;
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

  readonly loreDocuments = signal<DriveDocument[]>([]);
  readonly lorePtDocumentId = signal('');
  readonly loreEnDocumentId = signal('');
  readonly lorePreview = signal<LorePreviewResult | null>(null);
  readonly loreLoading = signal(false);

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

  async refreshLoreDocuments(): Promise<void> {
    const mode = this.loreSource;
    if (!this.authenticated() || !mode || this.loreLoading()) return;

    this.loreLoading.set(true);
    this.error.set('');

    try {
      const result = await this.callLore<{
        documents: DriveDocument[];
      }>({
        action: 'list',
        mode
      });

      this.loreDocuments.set(result.documents);

      const ptDocuments = this.loreDocumentsFor('pt-BR');
      const enDocuments = this.loreDocumentsFor('en-US');
      const currentPt = this.lorePtDocumentId();
      const currentEn = this.loreEnDocumentId();

      this.lorePtDocumentId.set(
        ptDocuments.some(item => item.documentId === currentPt)
          ? currentPt
          : ptDocuments.length === 1
            ? ptDocuments[0].documentId
            : ''
      );

      this.loreEnDocumentId.set(
        enDocuments.some(item => item.documentId === currentEn)
          ? currentEn
          : enDocuments.length === 1
            ? enDocuments[0].documentId
            : ''
      );

      this.lorePreview.set(null);
    } catch (error) {
      this.fail(error);
    } finally {
      this.loreLoading.set(false);
    }
  }

  setLoreDocument(language: SagaLanguage, documentId: string): void {
    if (language === 'pt-BR') {
      this.lorePtDocumentId.set(documentId);
    } else {
      this.loreEnDocumentId.set(documentId);
    }

    this.lorePreview.set(null);
    this.error.set('');
  }

  async runLorePreview(): Promise<void> {
    const mode = this.loreSource;
    const ptDocumentId = this.lorePtDocumentId();
    const enDocumentId = this.loreEnDocumentId();

    if (
      !mode ||
      !ptDocumentId ||
      !enDocumentId ||
      ptDocumentId === enDocumentId ||
      this.loreLoading()
    ) {
      return;
    }

    this.loreLoading.set(true);
    this.error.set('');
    this.lorePreview.set(null);

    try {
      const result = await this.callLore<LorePreviewResult>({
        action: 'preview',
        mode,
        ptDocumentId,
        enDocumentId
      });

      this.lorePreview.set(result);
    } catch (error) {
      this.fail(error);
    } finally {
      this.loreLoading.set(false);
    }
  }

  loreDocumentsFor(language: SagaLanguage): DriveDocument[] {
    return this.loreDocuments().filter(
      document => this.loreLanguageOf(document) === language
    );
  }

  formatLoreDate(value: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
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

  async importEpisodes(): Promise<void> {
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
        documentIds: string[];
        writtenDocumentIds: string[];
        episodeCount: number;
        catalogStatus: string;
        publicationApproved: true;
        initialPublicState: 'published = true';
        publicReleaseGate: 'releaseDate';
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
        `${result.episodeCount} episódios importados em global-sagas. ` +
        `APROVADO PARA PUBLICAÇÃO = ${result.publicationApproved ? 'SIM' : 'NÃO'}. ` +
        `LIBERAÇÃO PÚBLICA = ${result.publicReleaseGate}.`
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

  private loreLanguageOf(document: DriveDocument): SagaLanguage | '' {
    if (
      document.languageHint === 'pt-BR' ||
      document.languageHint === 'en-US'
    ) {
      return document.languageHint;
    }

    if (/PT[-_ ]?BR/i.test(document.name)) return 'pt-BR';
    if (/EN[-_ ]?US/i.test(document.name)) return 'en-US';

    return '';
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

  private async callLore<T>(body: object): Promise<T> {
    const response = await fetch('/api/admin/lore', {
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
      throw new Error(result.message || 'Falha na leitura da Lore.');
    }
    return result as T;
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
      } else if (this.module === 'lore' && this.loreSource) {
        await this.refreshLoreDocuments();
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
