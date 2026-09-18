import {
  CommonModule,
  DOCUMENT,
  isPlatformBrowser
} from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

interface ResolvedRelease {
  title: string;
  descriptionEN: string;
  cover: string;
  releaseDate: string;
  soundcloud: string;
  typeSuggestion: ReleaseType | '';
}

type Faction = 'broklin' | 'hybrid' | 'jonah';
type ReleaseType = 'EP' | 'Album' | 'Single';
type BusyAction =
  | 'login'
  | 'logout'
  | 'resolve'
  | 'dry-run'
  | 'import'
  | null;

interface ImportRelease {
  documentId: string;
  title: string;
  descriptionPT: string;
  descriptionEN: string;
  cover: string;
  releaseDate: string;
  soundcloud: string;
  faction: Faction | '';
  type: ReleaseType | '';
}

interface DryRunChecks {
  documentId: string;
  title: string;
  cover: string;
  descriptionEN: string;
  descriptionPT: string;
  releaseDate: string;
  soundcloud: string;
  faction: string;
  type: string;
}

interface DryRunResult {
  operationId: string;
  checks: DryRunChecks;
  missingFields: string[];
  firestore: 'BLOCKED' | 'WOULD CREATE';
  existingDocument: boolean;
  dryRunToken: string | null;
}

interface ApiError {
  message?: string;
}

interface SessionResult {
  authenticated: boolean;
  csrfToken?: string;
  expiresAt?: number;
}

@Component({
  selector: 'app-soundcloud-importer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './soundcloud-importer.html',
  styleUrl: './soundcloud-importer.scss'
})
export class SoundcloudImporterComponent
implements OnInit, OnDestroy {
  readonly loginForm = new FormGroup({
    credential: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  readonly resolveForm = new FormGroup({
    soundcloudUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  readonly detailsForm = new FormGroup({
    descriptionPT: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    faction: new FormControl<Faction | ''>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    type: new FormControl<ReleaseType | ''>('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  readonly release = signal<ResolvedRelease | null>(null);
  readonly dryRun = signal<DryRunResult | null>(null);
  readonly busyAction = signal<BusyAction>(null);
  readonly sessionChecked = signal(false);
  readonly authenticated = signal(false);
  readonly sessionExpiresAt = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  private csrfToken = '';

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly meta: Meta,
    private readonly title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('RQS SoundCloud Importer');
    this.meta.updateTag({
      name: 'robots',
      content: 'noindex, nofollow, noarchive'
    });

    if (isPlatformBrowser(this.platformId)) {
      void this.restoreSession();
    }
  }

  ngOnDestroy(): void {
    this.meta.removeTag("name='robots'");
  }

  get documentId(): string {
    const release = this.release();
    const type = this.detailsForm.controls.type.value;

    return release && type
      ? this.createDocumentId(release.title, type)
      : '';
  }

  async login(): Promise<void> {
    if (this.loginForm.invalid || this.busyAction()) return;

    this.startAction('login');
    const credential = this.loginForm.controls.credential.value;
    const request = this.callApi<SessionResult>({
      action: 'login',
      credential
    }, false);

    this.loginForm.reset({ credential: '' });

    try {
      const result = await request;
      this.applySession(result);
    } catch (error) {
      this.clearSessionState();
      this.handleError(error);
    } finally {
      this.busyAction.set(null);
    }
  }

  async logout(): Promise<void> {
    if (!this.authenticated() || this.busyAction()) return;

    this.startAction('logout');

    try {
      await this.callApi<SessionResult>({ action: 'logout' });
      this.clearSessionState();
      this.resetImporter();
    } catch (error) {
      this.handleError(error);
    } finally {
      this.busyAction.set(null);
    }
  }

  async resolve(): Promise<void> {
    if (
      !this.authenticated() ||
      this.resolveForm.invalid ||
      this.busyAction()
    ) {
      return;
    }

    this.startAction('resolve');
    this.release.set(null);
    this.detailsForm.reset({
      descriptionPT: '',
      faction: '',
      type: ''
    });

    try {
      const result = await this.callApi<{
        release: ResolvedRelease;
      }>({
        action: 'resolve',
        url: this.resolveForm.controls.soundcloudUrl.value
      });

      this.release.set(result.release);
      this.detailsForm.controls.type.setValue(
        result.release.typeSuggestion
      );
    } catch (error) {
      this.handleError(error);
    } finally {
      this.busyAction.set(null);
    }
  }

  async runDryRun(): Promise<void> {
    if (
      !this.authenticated() ||
      !this.release() ||
      this.busyAction()
    ) {
      return;
    }

    this.startAction('dry-run');

    try {
      const result = await this.callApi<DryRunResult>({
        action: 'dry-run',
        release: this.buildReleasePayload()
      });

      this.dryRun.set(result);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.busyAction.set(null);
    }
  }

  async importRelease(): Promise<void> {
    const dryRun = this.dryRun();

    if (
      !dryRun?.dryRunToken ||
      dryRun.firestore !== 'WOULD CREATE' ||
      !this.authenticated() ||
      this.busyAction()
    ) {
      return;
    }

    const confirmed = this.document.defaultView?.confirm(
      `Criar discography/${this.documentId}?`
    );

    if (!confirmed) return;

    this.startAction('import');

    try {
      const result = await this.callApi<{
        operationId: string;
        documentId: string;
        firestore: 'CREATED';
      }>({
        action: 'import',
        release: this.buildReleasePayload(),
        dryRunToken: dryRun.dryRunToken
      });

      this.successMessage.set(
        `CREATED: discography/${result.documentId} ` +
        `(operationId: ${result.operationId})`
      );
      this.dryRun.set(null);
    } catch (error) {
      this.handleError(error);
      this.dryRun.set(null);
    } finally {
      this.busyAction.set(null);
    }
  }

  invalidateDryRun(): void {
    this.dryRun.set(null);
    this.successMessage.set('');
  }

  private startAction(action: BusyAction): void {
    this.busyAction.set(action);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (action !== 'import') {
      this.dryRun.set(null);
    }
  }

  private async restoreSession(): Promise<void> {
    try {
      const result = await this.callApi<SessionResult>({
        action: 'session'
      }, false);
      this.applySession(result);
    } catch {
      this.clearSessionState();
    } finally {
      this.sessionChecked.set(true);
    }
  }

  private applySession(result: SessionResult): void {
    if (
      !result.authenticated ||
      !result.csrfToken ||
      !result.expiresAt
    ) {
      this.clearSessionState();
      return;
    }

    this.csrfToken = result.csrfToken;
    this.sessionExpiresAt.set(result.expiresAt);
    this.authenticated.set(true);
    this.sessionChecked.set(true);
  }

  private clearSessionState(): void {
    this.csrfToken = '';
    this.sessionExpiresAt.set(null);
    this.authenticated.set(false);
  }

  private resetImporter(): void {
    this.release.set(null);
    this.dryRun.set(null);
    this.resolveForm.reset({ soundcloudUrl: '' });
    this.detailsForm.reset({
      descriptionPT: '',
      faction: '',
      type: ''
    });
  }

  private buildReleasePayload(): ImportRelease {
    const release = this.release();

    if (!release) {
      throw new Error('Resolva uma URL do SoundCloud primeiro.');
    }

    return {
      documentId: this.documentId,
      title: release.title,
      descriptionPT:
        this.detailsForm.controls.descriptionPT.value,
      descriptionEN: release.descriptionEN,
      cover: release.cover,
      releaseDate: release.releaseDate,
      soundcloud: release.soundcloud,
      faction: this.detailsForm.controls.faction.value,
      type: this.detailsForm.controls.type.value
    };
  }

  private async callApi<T>(
    body: object,
    includeCsrf = true
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (includeCsrf && this.csrfToken) {
      headers['X-RQS-CSRF'] = this.csrfToken;
    }

    const response = await fetch('/api/soundcloud-importer', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
      credentials: 'same-origin'
    });

    const result = await response.json() as T & ApiError;

    if (!response.ok) {
      const requestError = new Error(
        result.message ||
        'O RQS SoundCloud Importer recusou a operação.'
      );

      Object.assign(requestError, { status: response.status });
      throw requestError;
    }

    return result;
  }

  private handleError(error: unknown): void {
    if (
      error instanceof Error &&
      'status' in error &&
      error.status === 401
    ) {
      this.clearSessionState();
      this.resetImporter();
    }

    this.errorMessage.set(
      error instanceof Error
        ? error.message
        : 'Falha inesperada no importer.'
    );
  }

  private createDocumentId(
    title: string,
    type: ReleaseType
  ): string {
    const baseTitle = title
      .split(/\s+[—–]\s+/u, 1)[0]
      .replace(/\bvol(?:ume)?\.?\s*(\d+)/giu, 'v$1')
      .replace(/\bv\.?\s*(\d+)/giu, 'v$1')
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 180)
      .replace(/-+$/g, '');

    return baseTitle
      ? `${type.toLowerCase()}-${baseTitle}`
      : '';
  }
}
