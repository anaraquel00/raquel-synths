import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

type MediaSection =
  | 'monthly-radio'
  | 'weekly-video'
  | 'short'
  | 'special-stream';

type PlannedKind =
  | 'weekly-video'
  | 'short'
  | 'special-stream';

interface AdminSession {
  authenticated: boolean;
  csrfToken?: string;
}

interface YouTubeDiagnostic {
  configurationStatus: string;
  channelStatus: string;

  channel?: {
    id: string;
    title: string;
  } | null;

  reusableStream?: {
    id: string;
    title: string;
    streamStatus: string;
    healthStatus: string;
    isReusable: boolean;
  } | null;

  missingConfiguration?: string[];

  diagnostic?: {
    category?: string;
    httpStatus?: number | null;
    reason?: string | null;
  };
}

interface DiagnosticResponse {
  mode: string;
  writesEnabled: boolean;
  youtube: YouTubeDiagnostic;
}

interface DryRunCheck {
  code: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

interface DryRunStep {
  step: string;
  status: string;
  detail: string;
}

interface DryRunResponse {
  mode: string;
  writesEnabled: boolean;
  contentType?: string;

  diagnostics: {
    status: 'PASS' | 'FAIL';
    checks: DryRunCheck[];
  };

  plan: DryRunStep[];
}

@Component({
  selector: 'app-radio-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl:
    './radio-admin.html',
  styleUrl:
    './radio-admin.scss'
})
export class RadioAdminComponent
implements OnInit {
  readonly checked =
    signal(false);

  readonly authenticated =
    signal(false);

  readonly busy =
    signal(false);

  readonly error =
    signal('');

  readonly activeSection =
    signal<MediaSection>(
      'monthly-radio'
    );

  readonly diagnostics =
    signal<DiagnosticResponse | null>(
      null
    );

  readonly dryRun =
    signal<DryRunResponse | null>(
      null
    );

  readonly pendingCount =
    signal(0);

  title =
    'RQS RADIO // NOVEMBER 2026';

  description =
    'REDBLUE TRANSMISSION — monthly RQS Radio broadcast.';

  scheduledStartLocal = '';
  visibility = 'unlisted';
  thumbnailUrl = '';
  setlistText = '';
  playlistId = '';
  autoStart = false;
  autoStop = false;

  weeklyTitle =
    'RQS // Weekly Update';

  weeklyDescription =
    'Atualizações do ecossistema, bastidores e próximos passos da RQS.';

  weeklyScheduledLocal = '';
  weeklyVisibility =
    'unlisted';

  weeklyThumbnailUrl = '';
  weeklyPlaylistId = '';

  shortHook =
    'O próximo sinal já está no ar';

  shortCaption =
    'Bastidores, contexto e o que vem por aí na RQS. #RQS';

  shortScheduledLocal = '';
  shortVisibility =
    'public';

  shortThumbnailUrl = '';
  shortPlaylistId = '';

  eventTitle =
    'RQS // Special Transmission';

  eventDescription =
    'Transmissão especial da RQS — música, conversa e comunidade.';

  eventScheduledLocal = '';
  eventVisibility =
    'unlisted';

  eventThumbnailUrl = '';
  eventSetlistText = '';
  eventPlaylistId = '';
  eventAutoStart = false;
  eventAutoStop = false;

  private csrf = '';

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId:
      object
  ) {}

  ngOnInit(): void {
    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {
      void this.restoreSession();
    } else {
      this.checked.set(true);
    }
  }

  selectSection(
    section: MediaSection
  ): void {
    this.activeSection.set(
      section
    );

    this.dryRun.set(null);
    this.error.set('');
  }

  async runDiagnostics():
  Promise<void> {
    await this.execute(
      async () => {
        this.diagnostics.set(
          await this.call<
            DiagnosticResponse
          >({
            action:
              'diagnostics'
          })
        );
      }
    );
  }

  async runRadioDryRun():
  Promise<void> {
    await this.execute(
      async () => {
        const scheduledStartTime =
          this.toIso(
            this
              .scheduledStartLocal
          );

        this.dryRun.set(
          await this.call<
            DryRunResponse
          >({
            action: 'dry-run',

            transmission: {
              title:
                this.title,
              description:
                this.description,
              scheduledStartTime,
              visibility:
                this.visibility,
              thumbnailUrl:
                this.thumbnailUrl,
              setlist:
                this.lines(
                  this
                    .setlistText
                ),
              playlistId:
                this.playlistId,
              autoStart:
                this.autoStart,
              autoStop:
                this.autoStop
            }
          })
        );
      }
    );
  }

  async runWeeklyPlan():
  Promise<void> {
    await this.runContentPlan(
      'weekly-video',
      {
        title:
          this.weeklyTitle,
        description:
          this
            .weeklyDescription,
        scheduledStartTime:
          this.toIso(
            this
              .weeklyScheduledLocal
          ),
        visibility:
          this.weeklyVisibility,
        thumbnailUrl:
          this
            .weeklyThumbnailUrl,
        playlistId:
          this.weeklyPlaylistId
      }
    );
  }

  async runShortPlan():
  Promise<void> {
    await this.runContentPlan(
      'short',
      {
        title:
          this.shortHook,
        description:
          this.shortCaption,
        scheduledStartTime:
          this.toIso(
            this
              .shortScheduledLocal
          ),
        visibility:
          this.shortVisibility,
        thumbnailUrl:
          this
            .shortThumbnailUrl,
        playlistId:
          this.shortPlaylistId
      }
    );
  }

  async runEventPlan():
  Promise<void> {
    await this.runContentPlan(
      'special-stream',
      {
        title:
          this.eventTitle,
        description:
          this
            .eventDescription,
        scheduledStartTime:
          this.toIso(
            this
              .eventScheduledLocal
          ),
        visibility:
          this.eventVisibility,
        thumbnailUrl:
          this
            .eventThumbnailUrl,
        setlist:
          this.lines(
            this
              .eventSetlistText
          ),
        playlistId:
          this.eventPlaylistId,
        autoStart:
          this.eventAutoStart,
        autoStop:
          this.eventAutoStop
      }
    );
  }

  private async runContentPlan(
    kind: PlannedKind,
    content: object
  ): Promise<void> {
    await this.execute(
      async () => {
        this.dryRun.set(
          await this.call<
            DryRunResponse
          >({
            action:
              'content-plan',

            content: {
              kind,
              ...content
            }
          })
        );
      }
    );
  }

  private lines(
    value: string
  ): string[] {
    return value
      .split('\n')
      .map(item =>
        item.trim()
      )
      .filter(Boolean);
  }

  private toIso(
    value: string
  ): string {
    if (!value) return '';

    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime()
    )
      ? ''
      : date.toISOString();
  }

  private async restoreSession():
  Promise<void> {
    try {
      const result =
        await this.sessionCall();

      this.authenticated.set(
        Boolean(
          result.authenticated &&
          result.csrfToken
        )
      );

      this.csrf =
        result.csrfToken || '';
    } catch {
      this.authenticated.set(false);
      this.csrf = '';
    } finally {
      this.checked.set(true);
    }
  }

  private async sessionCall():
  Promise<AdminSession> {
    const response =
      await fetch(
        '/api/admin/system-logs',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          credentials:
            'same-origin',

          cache:
            'no-store',

          body:
            JSON.stringify({
              action:
                'session'
            })
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        'Falha ao validar a sessão administrativa.'
      );
    }

    return result as AdminSession;
  }

  private async call<T>(
    payload: object
  ): Promise<T> {
    const response =
      await fetch(
        '/api/admin/radio',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            'X-RQS-CSRF':
              this.csrf
          },

          credentials:
            'same-origin',

          cache:
            'no-store',

          body:
            JSON.stringify(
              payload
            )
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        'Falha no Media Control Plane.'
      );
    }

    return result as T;
  }

  private async execute(
    operation:
      () => Promise<void>
  ): Promise<void> {
    if (
      !this.authenticated() ||
      this.busy()
    ) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      await operation();
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha no Media Control Plane.'
      );
    } finally {
      this.busy.set(false);
    }
  }
}
