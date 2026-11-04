import {
  CommonModule
} from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal
} from '@angular/core';

import {
  YoutubeLiveOperationalStatus,
  YoutubeLivePlan,
  YoutubeOperationsConfig,
  YoutubeOperationsService,
  YoutubeReusableLiveStream
} from '../../core/youtube-operations/youtube-operations.service';

type LiveKind =
  | 'monthly-radio'
  | 'special-stream';

type PersistedLivePlan =
  YoutubeLivePlan & {
    updateTime: string | null;
    youtubeBroadcastId?: string | null;
    youtubeStreamId?: string | null;
    youtubeBroadcastStatus?: string | null;
    youtubeStreamStatus?: string | null;
    youtubeHealthStatus?: string | null;
    thumbnailStatus?: string;
    playlistStatus?: string;
    liveProvisioningStage?: string;
    status?: string;
  };

@Component({
  selector:
    'app-youtube-live-operations-panel',

  standalone:
    true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './youtube-live-operations-panel.html',

  styleUrl:
    './youtube-live-operations-panel.scss'
})
export class YoutubeLiveOperationsPanelComponent
implements OnChanges {
  @Input()
  plan:
    PersistedLivePlan | null =
      null;

  @Input()
  expectedKind:
    LiveKind =
      'monthly-radio';

  @Output()
  readonly planUpdated =
    new EventEmitter<void>();

  @Output()
  readonly sessionExpired =
    new EventEmitter<void>();

  readonly config =
    signal<YoutubeOperationsConfig | null>(
      null
    );

  readonly connected =
    signal(false);

  readonly identity =
    signal('');

  readonly streams =
    signal<YoutubeReusableLiveStream[]>(
      []
    );

  readonly selectedStreamId =
    signal('');

  readonly liveStatus =
    signal<YoutubeLiveOperationalStatus | null>(
      null
    );

  readonly thumbnailName =
    signal('');

  readonly busy =
    signal(false);

  readonly message =
    signal('');

  readonly error =
    signal('');

  private thumbnailFile:
    File | null = null;

  private csrf = '';

  constructor(
    private readonly youtube:
      YoutubeOperationsService
  ) {
    void this.loadConfig();
  }

  ngOnChanges(
    changes: SimpleChanges
  ): void {
    if (
      changes['plan']
    ) {
      this.liveStatus.set(null);
      this.message.set('');
      this.error.set('');

      if (
        this.plan
          ?.youtubeStreamId
      ) {
        this.selectedStreamId.set(
          this.plan
            .youtubeStreamId
        );
      }
    }
  }

  selectStream(
    event: Event
  ): void {
    this.selectedStreamId.set(
      (
        event.target as
        HTMLSelectElement
      ).value
    );
  }

  selectThumbnail(
    event: Event
  ): void {
    const input =
      event.target as
        HTMLInputElement;

    const file =
      input.files?.[0] ||
      null;

    if (
      file &&
      ![
        'image/jpeg',
        'image/png'
      ].includes(
        file.type
      )
    ) {
      this.thumbnailFile = null;
      this.thumbnailName.set('');
      this.error.set(
        'Thumbnail deve ser JPG ou PNG.'
      );
      return;
    }

    if (
      file &&
      file.size >
        50 * 1024 * 1024
    ) {
      this.thumbnailFile = null;
      this.thumbnailName.set('');
      this.error.set(
        'Thumbnail excede 50 MB.'
      );
      return;
    }

    this.thumbnailFile =
      file;

    this.thumbnailName.set(
      file?.name || ''
    );

    this.error.set('');
  }

  async connect():
  Promise<void> {
    const config =
      this.config();

    if (!config) return;

    this.busy.set(true);
    this.error.set('');

    try {
      const identity =
        await this.youtube
          .connect(
            config
          );

      this.connected.set(
        true
      );

      this.identity.set(
        identity.channelTitle
      );

      await this.loadStreams();

      if (
        this.plan
          ?.youtubeBroadcastId &&
        this.plan
          ?.youtubeStreamId
      ) {
        await this.refreshStatus();
      }
    } catch (error) {
      this.connected.set(
        false
      );

      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha no OAuth do YouTube.'
      );
    } finally {
      this.busy.set(false);
    }
  }

  disconnect(): void {
    this.youtube.disconnect();
    this.connected.set(false);
    this.identity.set('');
    this.streams.set([]);
    this.liveStatus.set(null);
  }

  async createAndBind():
  Promise<void> {
    const plan =
      this.plan;

    const streamId =
      this.selectedStreamId();

    if (
      !plan ||
      plan.kind !==
        this.expectedKind
    ) {
      this.error.set(
        'Salve e selecione um plano desta sessão.'
      );
      return;
    }

    if (
      plan.dryRunStatus !==
      'PASS'
    ) {
      this.error.set(
        'A live precisa estar salva com Dry Run PASS.'
      );
      return;
    }

    if (!streamId) {
      this.error.set(
        'Selecione um reusable stream já configurado no OBS.'
      );
      return;
    }

    if (
      !this.connected()
    ) {
      this.error.set(
        'Conecte YouTube Operations primeiro.'
      );
      return;
    }

    if (
      !window.confirm(
        `Criar e agendar "${plan.title}" no canal ${this.identity()}?`
      )
    ) {
      return;
    }

    this.busy.set(true);
    this.error.set('');
    this.message.set(
      'Provisionando broadcast…'
    );

    let persisted:
      PersistedLivePlan | null =
        null;

    try {
      const intent =
        await this.adminCall<{
          plan:
            PersistedLivePlan;
        }>({
          action:
            'plan-live-intent',
          id:
            plan.id,
          updateTime:
            plan.updateTime
        }, this.csrf);

      persisted =
        intent.plan;

      const created =
        await this.youtube
          .createLiveBroadcast(
            persisted
          );

      persisted =
        await this
          .recordProgress(
            persisted,
            {
              status:
                'SCHEDULED',
              liveProvisioningStage:
                'BROADCAST_CREATED',
              youtubeBroadcastId:
                created.broadcastId,
              youtubeBroadcastStatus:
                created.broadcastStatus,
              youtubeStreamId:
                streamId
            }
          );

      const boundStatus =
        await this.youtube
          .bindLiveBroadcast(
            created.broadcastId,
            streamId
          );

      let thumbnailStatus =
        this.thumbnailFile
          ? 'PENDING'
          : 'NOT_CONFIGURED';

      if (
        this.thumbnailFile
      ) {
        await this.youtube
          .setLiveThumbnail(
            created.broadcastId,
            this.thumbnailFile
          );

        thumbnailStatus =
          'APPLIED';
      }

      persisted =
        await this
          .recordProgress(
            persisted,
            {
              status:
                'SCHEDULED',
              liveProvisioningStage:
                'BOUND',
              youtubeBroadcastId:
                created.broadcastId,
              youtubeStreamId:
                streamId,
              youtubeBroadcastStatus:
                boundStatus,
              youtubeStreamStatus:
                'inactive',
              youtubeHealthStatus:
                'noData',
              thumbnailStatus
            }
          );

      this.message.set(
        'Broadcast criado e vinculado. Inicie o OBS quando chegar a hora.'
      );

      this.planUpdated.emit();

      this.plan =
        persisted;

      await this.refreshStatus();
    } catch (error) {
      if (persisted) {
        try {
          persisted =
            await this
              .recordProgress(
                persisted,
                {
                  status:
                    'ERROR',
                  liveProvisioningStage:
                    'RECOVERY_REQUIRED',
                  lastError: {
                    code:
                      'LIVE_PROVISION_FAILED',
                    message:
                      error instanceof Error
                        ? error.message
                        : 'Live provisioning failed'
                  }
                }
              );

          this.plan =
            persisted;

          this.planUpdated.emit();
        } catch {
          // Preserve original error.
        }
      }

      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha ao criar a live.'
      );
    } finally {
      this.busy.set(false);
    }
  }

  async refreshStatus():
  Promise<void> {
    const plan =
      this.plan;

    if (
      !plan
        ?.youtubeBroadcastId ||
      !plan
        ?.youtubeStreamId ||
      !this.connected()
    ) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      const status =
        await this.youtube
          .liveOperationalStatus(
            plan.youtubeBroadcastId,
            plan.youtubeStreamId
          );

      this.liveStatus.set(
        status
      );

      const operationalStatus =
        status.broadcastStatus ===
          'live'
          ? 'LIVE'
          : status.broadcastStatus ===
              'complete'
            ? 'COMPLETE'
            : 'SCHEDULED';

      const stage =
        status.broadcastStatus ===
          'live'
          ? 'LIVE'
          : status.broadcastStatus ===
              'complete'
            ? 'COMPLETE'
            : status.streamStatus ===
                'active'
              ? 'SIGNAL_ACTIVE'
              : 'WAITING_FOR_SIGNAL';

      const updated =
        await this
          .recordProgress(
            plan,
            {
              status:
                operationalStatus,
              liveProvisioningStage:
                stage,
              youtubeBroadcastId:
                status.broadcastId,
              youtubeStreamId:
                status.streamId,
              youtubeBroadcastStatus:
                status.broadcastStatus,
              youtubeStreamStatus:
                status.streamStatus,
              youtubeHealthStatus:
                status.healthStatus,
              actualStartTime:
                status.actualStartTime,
              actualEndTime:
                status.actualEndTime
            }
          );

      this.plan =
        updated;

      this.planUpdated.emit();
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha ao atualizar status da live.'
      );
    } finally {
      this.busy.set(false);
    }
  }

  canGoLive(): boolean {
    const status =
      this.liveStatus();

    return Boolean(
      this.connected() &&
      status &&
      status.streamStatus ===
        'active' &&
      [
        'ready',
        'testing'
      ].includes(
        status.broadcastStatus
      )
    );
  }

  async goLive():
  Promise<void> {
    const plan =
      this.plan;

    if (
      !plan
        ?.youtubeBroadcastId ||
      !this.canGoLive()
    ) {
      this.error.set(
        'GO LIVE exige OBS SIGNAL ACTIVE e broadcast READY.'
      );
      return;
    }

    if (
      !window.confirm(
        `Colocar "${plan.title}" AO VIVO agora?`
      )
    ) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      const status =
        await this.youtube
          .transitionLiveBroadcast(
            plan.youtubeBroadcastId,
            'live'
          );

      const updated =
        await this
          .recordProgress(
            plan,
            {
              status:
                'LIVE',
              liveProvisioningStage:
                'LIVE',
              youtubeBroadcastStatus:
                status,
              actualStartTime:
                new Date()
                  .toISOString()
            }
          );

      this.plan =
        updated;

      this.message.set(
        'Broadcast em LIVE.'
      );

      this.planUpdated.emit();

      await this.refreshStatus();
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha ao iniciar a live.'
      );
    } finally {
      this.busy.set(false);
    }
  }

  async endBroadcast():
  Promise<void> {
    const plan =
      this.plan;

    if (
      !plan
        ?.youtubeBroadcastId
    ) {
      return;
    }

    if (
      !window.confirm(
        `ENCERRAR "${plan.title}"? Esta ação finaliza o broadcast no YouTube.`
      )
    ) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      const status =
        await this.youtube
          .transitionLiveBroadcast(
            plan.youtubeBroadcastId,
            'complete'
          );

      let playlistStatus =
        plan.playlistId
          ? 'PENDING'
          : 'NOT_CONFIGURED';

      if (
        plan.playlistId
      ) {
        try {
          await this.youtube
            .addLiveVodToPlaylist(
              plan.youtubeBroadcastId,
              plan.playlistId
            );

          playlistStatus =
            'ADDED';
        } catch {
          playlistStatus =
            'PENDING';
        }
      }

      const updated =
        await this
          .recordProgress(
            plan,
            {
              status:
                'COMPLETE',
              liveProvisioningStage:
                'COMPLETE',
              youtubeBroadcastStatus:
                status,
              actualEndTime:
                new Date()
                  .toISOString(),
              playlistStatus
            }
          );

      this.plan =
        updated;

      this.message.set(
        playlistStatus ===
          'ADDED'
          ? 'Broadcast encerrado e VOD adicionado à playlist.'
          : 'Broadcast encerrado. O VOD pode precisar de processamento antes da playlist.'
      );

      this.planUpdated.emit();
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha ao encerrar a live.'
      );
    } finally {
      this.busy.set(false);
    }
  }

  async syncVodPlaylist():
  Promise<void> {
    const plan =
      this.plan;

    if (
      !plan
        ?.youtubeBroadcastId ||
      !plan
        ?.playlistId
    ) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      await this.youtube
        .addLiveVodToPlaylist(
          plan.youtubeBroadcastId,
          plan.playlistId
        );

      const updated =
        await this
          .recordProgress(
            plan,
            {
              status:
                'COMPLETE',
              liveProvisioningStage:
                'COMPLETE',
              playlistStatus:
                'ADDED'
            }
          );

      this.plan =
        updated;

      this.message.set(
        'VOD adicionado à playlist.'
      );

      this.planUpdated.emit();
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'VOD ainda não está pronto para a playlist.'
      );
    } finally {
      this.busy.set(false);
    }
  }

  async cancelYoutubeLive():
  Promise<void> {
    const plan =
      this.plan;

    if (
      !plan
        ?.youtubeBroadcastId
    ) {
      return;
    }

    const status =
      this.liveStatus()
        ?.broadcastStatus ||
      plan
        .youtubeBroadcastStatus ||
      '';

    if (
      [
        'live',
        'complete'
      ].includes(status)
    ) {
      this.error.set(
        'Uma live ativa/concluída não pode ser cancelada por exclusão.'
      );
      return;
    }

    if (
      !window.confirm(
        `Excluir a live agendada "${plan.title}" do YouTube?`
      )
    ) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      await this.youtube
        .deleteLiveBroadcast(
          plan.youtubeBroadcastId
        );

      const updated =
        await this
          .recordProgress(
            plan,
            {
              status:
                'CANCELLED',
              liveProvisioningStage:
                'CANCELLED',
              youtubeBroadcastStatus:
                'deleted'
            }
          );

      this.plan =
        updated;

      this.message.set(
        'Live agendada removida do YouTube.'
      );

      this.planUpdated.emit();
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha ao cancelar a live.'
      );
    } finally {
      this.busy.set(false);
    }
  }

  youtubeUrl():
  string | null {
    const id =
      this.plan
        ?.youtubeBroadcastId;

    return id
      ? `https://youtu.be/${id}`
      : null;
  }

  studioUrl():
  string | null {
    const id =
      this.plan
        ?.youtubeBroadcastId;

    return id
      ? `https://studio.youtube.com/video/${id}/livestreaming`
      : null;
  }

  private async loadStreams():
  Promise<void> {
    const streams =
      await this.youtube
        .listReusableLiveStreams();

    this.streams.set(
      streams
    );

    if (
      !this.selectedStreamId() &&
      streams.length
    ) {
      this.selectedStreamId.set(
        streams[0].id
      );
    }
  }

  private async loadConfig():
  Promise<void> {
    try {
      const session =
        await this.adminCall<{
          authenticated:
            boolean;
          csrfToken?:
            string;
        }>(
          {
            action:
              'session'
          },
          '',
          '/api/admin/system-logs'
        );

      if (
        !session.authenticated ||
        !session.csrfToken
      ) {
        return;
      }

      this.csrf =
        session.csrfToken;

      const config =
        await this.adminCall<
          YoutubeOperationsConfig
        >(
          {
            action:
              'operations-config'
          },
          this.csrf
        );

      this.config.set(
        config
      );
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha ao carregar YouTube Operations.'
      );
    }
  }

  private async recordProgress(
    plan: PersistedLivePlan,
    progress: object
  ): Promise<PersistedLivePlan> {
    const result =
      await this.adminCall<{
        plan:
          PersistedLivePlan;
      }>({
        action:
          'plan-live-progress',
        id:
          plan.id,
        updateTime:
          plan.updateTime,
        progress
      }, this.csrf);

    return result.plan;
  }

  private async adminCall<T>(
    payload: object,
    csrf: string,
    url =
      '/api/admin/radio'
  ): Promise<T> {
    const response =
      await fetch(
        url,
        {
          method:
            'POST',
          headers: {
            'Content-Type':
              'application/json',
            ...(
              csrf
                ? {
                    'X-RQS-CSRF':
                      csrf
                  }
                : {}
            )
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
      await response
        .json()
        .catch(
          () => ({})
        );

    if (
      response.status ===
      401
    ) {
      this.connected.set(
        false
      );

      this.sessionExpired.emit();

      throw new Error(
        'Sessão administrativa expirada.'
      );
    }

    if (!response.ok) {
      throw new Error(
        (
          result as {
            message?: string;
          }
        ).message ||
        `Falha na API administrativa. HTTP ${response.status}.`
      );
    }

    return result as T;
  }
}
