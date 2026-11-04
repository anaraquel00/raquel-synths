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

type MediaPlanStatus =
  | 'DRAFT'
  | 'READY'
  | 'SCHEDULED'
  | 'LIVE'
  | 'COMPLETE'
  | 'CANCELLED'
  | 'ERROR';

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
  dryRunToken?: string;

  diagnostics: {
    status: 'PASS' | 'FAIL';
    checks: DryRunCheck[];
  };

  plan: DryRunStep[];
}

interface MediaPlan {
  id: string;
  updateTime: string | null;
  kind: MediaSection;
  status: MediaPlanStatus;
  title: string;
  description: string;
  scheduledStartTime: string;
  visibility: string;
  thumbnailUrl: string;
  playlistId: string;
  setlist: string[];
  autoStart: boolean;
  autoStop: boolean;
  dryRunStatus:
    | 'NOT_RUN'
    | 'PASS'
    | 'FAIL';
  dryRunAt: string | null;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

interface PlansResponse {
  collection: 'media-plans';
  queue: MediaPlan[];
  history: MediaPlan[];
  total: number;
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

  readonly queueBusy =
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

  readonly queue =
    signal<MediaPlan[]>([]);

  readonly history =
    signal<MediaPlan[]>([]);

  readonly selectedPlanId =
    signal<string | null>(
      null
    );

  readonly selectedPlanRevision =
    signal<number | null>(
      null
    );

  private selectedUpdateTime:
    string | null = null;

  private dryRunToken = '';

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

    this.selectedPlanId.set(
      null
    );

    this.selectedPlanRevision.set(
      null
    );

    this.selectedUpdateTime =
      null;

    this.clearValidation();
  }

  newPlan(): void {
    this.selectedPlanId.set(
      null
    );

    this.selectedPlanRevision.set(
      null
    );

    this.selectedUpdateTime =
      null;

    this.clearValidation();
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
        const result =
          await this.call<
            DryRunResponse
          >({
            action:
              'dry-run',

            transmission:
              this
                .monthlyRadioContent()
          });

        this.setDryRun(
          result
        );
      }
    );
  }

  async runWeeklyPlan():
  Promise<void> {
    await this.runContentPlan(
      'weekly-video',
      this.weeklyContent()
    );
  }

  async runShortPlan():
  Promise<void> {
    await this.runContentPlan(
      'short',
      this.shortContent()
    );
  }

  async runEventPlan():
  Promise<void> {
    await this.runContentPlan(
      'special-stream',
      this.eventContent()
    );
  }

  async saveCurrentPlan():
  Promise<void> {
    await this.execute(
      async () => {
        const result =
          await this.call<{
            plan: MediaPlan;
          }>({
            action:
              'plan-save',

            plan: {
              id:
                this
                  .selectedPlanId(),

              updateTime:
                this
                  .selectedUpdateTime,

              kind:
                this
                  .activeSection(),

              content:
                this
                  .activeContent(),

              dryRunToken:
                this
                  .dryRunToken ||
                null
            }
          });

        this.selectedPlanId.set(
          result.plan.id
        );

        this.selectedPlanRevision.set(
          result.plan.revision
        );

        this.selectedUpdateTime =
          result
            .plan
            .updateTime;

        await this.loadPlans();

        this.error.set('');
      }
    );
  }

  editPlan(
    plan: MediaPlan
  ): void {
    this.activeSection.set(
      plan.kind
    );

    this.selectedPlanId.set(
      plan.id
    );

    this.selectedPlanRevision.set(
      plan.revision
    );

    this.selectedUpdateTime =
      plan.updateTime;

    this.clearValidation();

    if (
      plan.kind ===
      'monthly-radio'
    ) {
      this.title =
        plan.title;

      this.description =
        plan.description;

      this.scheduledStartLocal =
        this.toLocalInput(
          plan
            .scheduledStartTime
        );

      this.visibility =
        plan.visibility;

      this.thumbnailUrl =
        plan.thumbnailUrl;

      this.playlistId =
        plan.playlistId;

      this.setlistText =
        plan.setlist
          .join('\n');

      this.autoStart =
        plan.autoStart;

      this.autoStop =
        plan.autoStop;

      return;
    }

    if (
      plan.kind ===
      'weekly-video'
    ) {
      this.weeklyTitle =
        plan.title;

      this.weeklyDescription =
        plan.description;

      this.weeklyScheduledLocal =
        this.toLocalInput(
          plan
            .scheduledStartTime
        );

      this.weeklyVisibility =
        plan.visibility;

      this.weeklyThumbnailUrl =
        plan.thumbnailUrl;

      this.weeklyPlaylistId =
        plan.playlistId;

      return;
    }

    if (
      plan.kind ===
      'short'
    ) {
      this.shortHook =
        plan.title;

      this.shortCaption =
        plan.description;

      this.shortScheduledLocal =
        this.toLocalInput(
          plan
            .scheduledStartTime
        );

      this.shortVisibility =
        plan.visibility;

      this.shortThumbnailUrl =
        plan.thumbnailUrl;

      this.shortPlaylistId =
        plan.playlistId;

      return;
    }

    this.eventTitle =
      plan.title;

    this.eventDescription =
      plan.description;

    this.eventScheduledLocal =
      this.toLocalInput(
        plan
          .scheduledStartTime
      );

    this.eventVisibility =
      plan.visibility;

    this.eventThumbnailUrl =
      plan.thumbnailUrl;

    this.eventPlaylistId =
      plan.playlistId;

    this.eventSetlistText =
      plan.setlist
        .join('\n');

    this.eventAutoStart =
      plan.autoStart;

    this.eventAutoStop =
      plan.autoStop;
  }

  async cancelPlan(
    plan: MediaPlan
  ): Promise<void> {
    if (
      isPlatformBrowser(
        this.platformId
      ) &&
      !window.confirm(
        `Cancelar "${plan.title}"?`
      )
    ) {
      return;
    }

    await this.execute(
      async () => {
        await this.call({
          action:
            'plan-cancel',

          id:
            plan.id,

          updateTime:
            plan.updateTime
        });

        if (
          this
            .selectedPlanId() ===
          plan.id
        ) {
          this.newPlan();
        }

        await this.loadPlans();
      }
    );
  }

  async deletePlan(
    plan: MediaPlan
  ): Promise<void> {
    if (
      ![
        'DRAFT',
        'CANCELLED'
      ].includes(
        plan.status
      )
    ) {
      return;
    }

    if (
      isPlatformBrowser(
        this.platformId
      ) &&
      !window.confirm(
        `Excluir permanentemente "${plan.title}"?`
      )
    ) {
      return;
    }

    await this.execute(
      async () => {
        await this.call({
          action:
            'plan-delete',

          id:
            plan.id,

          updateTime:
            plan.updateTime
        });

        if (
          this
            .selectedPlanId() ===
          plan.id
        ) {
          this.newPlan();
        }

        await this.loadPlans();
      }
    );
  }

  planDate(
    plan: MediaPlan
  ): string {
    if (
      !plan
        .scheduledStartTime
    ) {
      return 'SEM DATA';
    }

    const date =
      new Date(
        plan
          .scheduledStartTime
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'DATA INVÁLIDA';
    }

    return new Intl
      .DateTimeFormat(
        'pt-BR',
        {
          day:
            '2-digit',
          month:
            'short',
          hour:
            '2-digit',
          minute:
            '2-digit'
        }
      )
      .format(date);
  }

  planKindLabel(
    kind: MediaSection
  ): string {
    return {
      'monthly-radio':
        'MONTHLY RADIO',
      'weekly-video':
        'WEEKLY VIDEO',
      short:
        'SHORT',
      'special-stream':
        'SPECIAL STREAM'
    }[kind];
  }

  private async runContentPlan(
    kind: PlannedKind,
    content: object
  ): Promise<void> {
    await this.execute(
      async () => {
        const result =
          await this.call<
            DryRunResponse
          >({
            action:
              'content-plan',

            content: {
              kind,
              ...content
            }
          });

        this.setDryRun(
          result
        );
      }
    );
  }

  private setDryRun(
    result: DryRunResponse
  ): void {
    this.dryRun.set(
      result
    );

    this.dryRunToken =
      result
        .dryRunToken ||
      '';
  }

  private clearValidation():
  void {
    this.dryRun.set(null);
    this.dryRunToken = '';
    this.error.set('');
  }

  private activeContent():
  object {
    const kind =
      this.activeSection();

    if (
      kind ===
      'monthly-radio'
    ) {
      return this
        .monthlyRadioContent();
    }

    if (
      kind ===
      'weekly-video'
    ) {
      return this
        .weeklyContent();
    }

    if (
      kind ===
      'short'
    ) {
      return this
        .shortContent();
    }

    return this
      .eventContent();
  }

  private monthlyRadioContent():
  object {
    return {
      title:
        this.title,

      description:
        this.description,

      scheduledStartTime:
        this.toIso(
          this
            .scheduledStartLocal
        ),

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
    };
  }

  private weeklyContent():
  object {
    return {
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
    };
  }

  private shortContent():
  object {
    return {
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
    };
  }

  private eventContent():
  object {
    return {
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
    };
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

  private toLocalInput(
    value: string
  ): string {
    if (!value) return '';

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '';
    }

    const offset =
      date
        .getTimezoneOffset();

    const local =
      new Date(
        date.getTime() -
        offset * 60_000
      );

    return local
      .toISOString()
      .slice(0, 16);
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

      if (
        this.authenticated()
      ) {
        try {
          await this.loadPlans();
        } catch (error) {
          this.error.set(
            error instanceof Error
              ? error.message
              : 'Falha ao carregar a Publishing Queue.'
          );
        }
      }
    } catch {
      this.authenticated.set(false);
      this.csrf = '';
    } finally {
      this.checked.set(true);
    }
  }

  private async loadPlans():
  Promise<void> {
    if (!this.csrf) return;

    this.queueBusy.set(true);

    try {
      const result =
        await this.call<
          PlansResponse
        >({
          action:
            'plans-list'
        });

      this.queue.set(
        result.queue
      );

      this.history.set(
        result.history
      );
    } finally {
      this.queueBusy.set(false);
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
