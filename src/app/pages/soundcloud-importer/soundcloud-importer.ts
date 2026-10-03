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
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ContentService } from '../../services/content.service';

interface ResolvedRelease {
  title: string;
  descriptionEN: string;
  cover: string;
  releaseDate: string;
  soundcloud: string;
  typeSuggestion: ReleaseType | '';
}

interface DiscographyReleaseOption {
  id: string;
  title: string;
  type: string;
  releaseDate: string;
  soundcloud: string;
  spotify: string;
  spotifyUrl: string;
}

type Faction = 'broklin' | 'hybrid' | 'jonah';
type ReleaseType = 'EP' | 'Album' | 'Single';
type BusyAction =
  | 'logout'
  | 'resolve'
  | 'dry-run'
  | 'import'
  | 'spotify-dry-run'
  | 'link-spotify'
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

interface DescriptionDryRunCheck {
  raw: 'FOUND' | 'MISSING';
  htmlNormalization: 'PASS' | 'BLOCKED';
  renderedPreview: 'AVAILABLE' | 'UNAVAILABLE';
}

interface DryRunChecks {
  documentId: string;
  title: string;
  cover: string;
  descriptionEN: DescriptionDryRunCheck;
  descriptionPT: DescriptionDryRunCheck;
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
  preview: {
    descriptionEN: string;
    descriptionPT: string;
  };
}

interface SpotifyDryRunResult {
  operationId: string;
  documentId: string;
  title: string;
  type: string;
  soundcloud: string;
  currentSpotifyUrl: string;
  currentSpotifyField: 'spotifyUrl' | 'spotify' | null;
  spotifyUrl: string;
  firestore: 'WOULD UPDATE' | 'UNCHANGED';
  fields: string[];
  firestoreWrites: 0;
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
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './soundcloud-importer.html',
  styleUrl: './soundcloud-importer.scss'
})
export class SoundcloudImporterComponent
implements OnInit, OnDestroy {
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

  readonly spotifyForm = new FormGroup({
    documentId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    spotifyUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  readonly release = signal<ResolvedRelease | null>(null);
  readonly dryRun = signal<DryRunResult | null>(null);
  readonly spotifyDryRun =
    signal<SpotifyDryRunResult | null>(null);
  readonly linkedSpotifyUrl = signal('');
  readonly discographyReleases =
    signal<DiscographyReleaseOption[]>([]);
  readonly catalogLoading = signal(false);
  readonly catalogError = signal('');
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
    private readonly contentService: ContentService,
    private readonly meta: Meta,
    private readonly title: Title,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.title.setTitle('RQS Importador de Streaming');
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

  get trackSlug(): string {
    return this.documentId.replace(/^(?:ep|album|single)-/, '');
  }

  get selectedSpotifyRelease():
    DiscographyReleaseOption | null {
    const documentId =
      this.spotifyForm.controls.documentId.value;

    return (
      this.discographyReleases()
        .find(release =>
          release.id === documentId
        ) || null
    );
  }

  async logout(): Promise<void> {
    if (!this.authenticated() || this.busyAction()) return;

    this.startAction('logout');

    try {
      await this.callApi<SessionResult>({ action: 'logout' });
      this.clearSessionState();
      this.resetImporter();
      await this.router.navigate(['/admin']);
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
      await this.loadDiscography();
    } catch (error) {
      this.handleError(error);
      this.dryRun.set(null);
    } finally {
      this.busyAction.set(null);
    }
  }

  async runSpotifyDryRun(): Promise<void> {
    if (
      !this.authenticated() ||
      this.spotifyForm.invalid ||
      this.busyAction()
    ) {
      return;
    }

    this.startAction(
      'spotify-dry-run'
    );

    try {
      const result =
        await this.callApi<
          SpotifyDryRunResult
        >({
          action: 'spotify-dry-run',
          documentId:
            this.spotifyForm.controls
              .documentId.value,
          spotifyUrl:
            this.spotifyForm.controls
              .spotifyUrl.value
        });

      this.spotifyDryRun.set(result);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.busyAction.set(null);
    }
  }

  async linkSpotify(): Promise<void> {
    const dryRun =
      this.spotifyDryRun();

    if (
      !dryRun?.dryRunToken ||
      dryRun.firestore !==
        'WOULD UPDATE' ||
      !this.authenticated() ||
      this.busyAction()
    ) {
      return;
    }

    const confirmed =
      this.document.defaultView?.confirm(
        `Associar Spotify a discography/${this.spotifyForm.controls.documentId.value}? ` +
        'Somente o campo spotify será alterado.'
      );

    if (!confirmed) return;

    this.startAction('link-spotify');

    try {
      const result =
        await this.callApi<{
          operationId: string;
          documentId: string;
          title: string;
          spotifyUrl: string;
          field: 'spotify';
          firestore: 'UPDATED';
        }>({
          action: 'link-spotify',
          documentId:
            this.spotifyForm.controls
              .documentId.value,
          spotifyUrl:
            this.spotifyForm.controls
              .spotifyUrl.value,
          dryRunToken:
            dryRun.dryRunToken
        });

      this.linkedSpotifyUrl.set(
        result.spotifyUrl
      );
      this.discographyReleases.update(
        releases =>
          releases.filter(
            release =>
              release.id !== result.documentId
          )
      );
      this.spotifyForm.reset({
        documentId: '',
        spotifyUrl: ''
      });
      this.linkedSpotifyUrl.set('');
      this.successMessage.set(
        `UPDATED: discography/${result.documentId} ` +
        `(${result.field})`
      );
      this.spotifyDryRun.set(null);
    } catch (error) {
      this.handleError(error);
      this.spotifyDryRun.set(null);
    } finally {
      this.busyAction.set(null);
    }
  }

  invalidateDryRun(): void {
    this.dryRun.set(null);
    this.successMessage.set('');
  }

  invalidateSpotifyDryRun(): void {
    this.spotifyDryRun.set(null);
    const release =
      this.selectedSpotifyRelease;
    this.linkedSpotifyUrl.set(
      release?.spotify ||
      release?.spotifyUrl ||
      ''
    );
    this.successMessage.set('');
  }

  onSpotifyReleaseChange(): void {
    this.spotifyForm.controls.spotifyUrl.setValue('');
    this.spotifyDryRun.set(null);

    const release =
      this.selectedSpotifyRelease;

    this.linkedSpotifyUrl.set(
      release?.spotify ||
      release?.spotifyUrl ||
      ''
    );
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  async loadDiscography(): Promise<void> {
    if (
      !this.authenticated() ||
      this.catalogLoading()
    ) {
      return;
    }

    this.catalogLoading.set(true);
    this.catalogError.set('');

    try {
      const rawReleases =
        await firstValueFrom(
          this.contentService.getDiscography()
        );

      const releases =
        (rawReleases || [])
          .map((value: any) => ({
            id:
              typeof value?.id === 'string'
                ? value.id
                : '',
            title:
              typeof value?.title === 'string'
                ? value.title
                : '',
            type:
              typeof value?.type === 'string'
                ? value.type
                : '',
            releaseDate:
              typeof value?.releaseDate === 'string'
                ? value.releaseDate
                : '',
            soundcloud:
              typeof value?.soundcloud === 'string'
                ? value.soundcloud
                : '',
            spotify:
              typeof value?.spotify === 'string'
                ? value.spotify
                : '',
            spotifyUrl:
              typeof value?.spotifyUrl === 'string'
                ? value.spotifyUrl
                : ''
          }))
          .filter(release =>
            Boolean(
              release.id &&
              release.title &&
              !release.spotify.trim() &&
              !release.spotifyUrl.trim()
            )
          )
          .sort((left, right) =>
            right.releaseDate.localeCompare(
              left.releaseDate
            ) ||
            left.title.localeCompare(
              right.title,
              undefined,
              {
                sensitivity: 'base',
                numeric: true
              }
            )
          );

      this.discographyReleases.set(
        releases
      );
    } catch {
      this.catalogError.set(
        'Não foi possível carregar discography.'
      );
    } finally {
      this.catalogLoading.set(false);
    }
  }

  private startAction(action: BusyAction): void {
    this.busyAction.set(action);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (action !== 'import') {
      this.dryRun.set(null);
    }

    if (
      action !== 'link-spotify' &&
      action !== 'spotify-dry-run'
    ) {
      this.spotifyDryRun.set(null);
    }
  }

  private async restoreSession(): Promise<void> {
    try {
      const result = await this.callApi<SessionResult>({
        action: 'session'
      }, false);
      this.applySession(result);
      if (!this.authenticated()) {
        await this.router.navigate(['/admin']);
        return;
      }

      await this.loadDiscography();
    } catch {
      this.clearSessionState();
      await this.router.navigate(['/admin']);
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
    this.spotifyForm.reset({
      documentId: '',
      spotifyUrl: ''
    });
    this.spotifyDryRun.set(null);
    this.linkedSpotifyUrl.set('');
    this.discographyReleases.set([]);
    this.catalogError.set('');
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
        'O Importador SoundCloud da RQS recusou a operação.'
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
      void this.router.navigate(['/admin']);
    }

    this.errorMessage.set(
      error instanceof Error
        ? error.message
        : 'Falha inesperada no importador.'
    );
  }

  private createDocumentId(
    title: string,
    type: ReleaseType
  ): string {
    const blueprintTitle = title.match(
      /^\s*(the\s+blueprint\s+sessions)\s+vol(?:ume)?\.?\s*(\d+)\b/iu
    );
    const canonicalTitle = blueprintTitle
      ? `${blueprintTitle[1]} v${blueprintTitle[2]}`
      : title.split(/\s+[—–]\s+/u, 1)[0];
    const baseTitle = canonicalTitle
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
