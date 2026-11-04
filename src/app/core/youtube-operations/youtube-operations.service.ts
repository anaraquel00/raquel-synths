import { Injectable } from '@angular/core';

export interface YoutubeOperationsConfig {
  enabled: boolean;
  configured: boolean;
  clientId: string | null;
  expectedChannelId: string | null;
  scope: string;
}

export interface YoutubeOperationsIdentity {
  channelId: string;
  channelTitle: string;
}

export interface YoutubeStudioChecklist {
  endScreenConfigured: boolean;
  cardsConfigured: boolean;
  shortsRemixAudioOnly: boolean;
  automaticPlacesDisabled: boolean;
  automaticConceptsDisabled: boolean;
}

export interface YoutubePublishPlan {
  id: string;
  updateTime: string | null;
  kind:
    | 'monthly-radio'
    | 'weekly-video'
    | 'short'
    | 'special-stream';
  dryRunStatus: 'NOT_RUN' | 'PASS' | 'FAIL';
  title: string;
  description: string;
  scheduledStartTime: string;
  visibility: string;
  playlistId: string;
  tags?: string[];
  youtubeVideoId?: string | null;
  youtubeUrl?: string | null;
  studioChecklist?: Partial<YoutubeStudioChecklist>;
}

export interface YoutubeReusableLiveStream {
  id: string;
  title: string;
  streamStatus: string;
  healthStatus: string;
  isReusable: boolean;
}

export interface YoutubeLivePlan extends YoutubePublishPlan {
  kind: 'monthly-radio' | 'special-stream';
  autoStart?: boolean;
  autoStop?: boolean;
}

export interface YoutubeLiveOperationalStatus {
  broadcastId: string;
  streamId: string;
  broadcastStatus: string;
  streamStatus: string;
  healthStatus: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
}

export interface YoutubeUploadResult {
  videoId: string;
  processingStatus: string;
  thumbnailStatus:
    | 'NOT_CONFIGURED'
    | 'APPLIED'
    | 'WAITING_PROCESSING'
    | 'ERROR';
  playlistStatus:
    | 'NOT_CONFIGURED'
    | 'ADDED'
    | 'ERROR';
  lastError?: {
    code: string;
    message: string;
  } | null;
}

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken(options?: { prompt?: string }): void;
}

interface GoogleAccountsOAuth2 {
  initTokenClient(options: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
  }): GoogleTokenClient;
  revoke?(token: string, done?: () => void): void;
}

interface GoogleIdentityWindow extends Window {
  google?: {
    accounts?: {
      oauth2?: GoogleAccountsOAuth2;
    };
  };
}

const GOOGLE_IDENTITY_SCRIPT =
  'https://accounts.google.com/gsi/client';

const RQS_DEFAULT_TAGS = Object.freeze([
  'DJ mix',
  'RQS',
  'RaQuel Synths',
  'RaQuelSynths',
  'Raquel Synths',
  'Red Blue Sessions',
  'RedBlue Sessions'
]);

@Injectable({
  providedIn: 'root'
})
export class YoutubeOperationsService {
  private accessToken = '';
  private expiresAt = 0;

  async connect(
    config: YoutubeOperationsConfig
  ): Promise<YoutubeOperationsIdentity> {
    if (
      !config.enabled ||
      !config.configured ||
      !config.clientId ||
      !config.expectedChannelId
    ) {
      throw new Error(
        'YouTube Operations está bloqueado ou não configurado.'
      );
    }

    await this.ensureGoogleIdentity();

    const token = await this.requestToken(
      config.clientId,
      config.scope
    );

    this.accessToken = token.accessToken;
    this.expiresAt =
      Date.now() + token.expiresIn * 1000 - 30_000;

    const identity = await this.resolveChannel();

    if (identity.channelId !== config.expectedChannelId) {
      this.clearToken();
      throw new Error(
        `Canal OAuth incorreto. Esperado ${config.expectedChannelId}; recebido ${identity.channelId}.`
      );
    }

    return identity;
  }

  disconnect(): void {
    const token =
      this.accessToken;

    const tokenIsCurrent =
      Boolean(
        token &&
        Date.now() <
          this.expiresAt
      );

    this.clearToken();

    const oauth2 =
      (window as GoogleIdentityWindow)
        .google?.accounts?.oauth2;

    if (
      tokenIsCurrent &&
      oauth2?.revoke
    ) {
      oauth2.revoke(token);
    }
  }

  isConnected(): boolean {
    return Boolean(
      this.accessToken &&
      Date.now() < this.expiresAt
    );
  }

  async upload(
    plan: YoutubePublishPlan,
    videoFile: File,
    thumbnailFile: File | null,
    onProgress: (progress: number) => void
  ): Promise<YoutubeUploadResult> {
    this.requireToken();

    if (!['weekly-video', 'short'].includes(plan.kind)) {
      throw new Error(
        'Apenas Weekly Videos e Shorts usam upload direto.'
      );
    }

    if (plan.dryRunStatus !== 'PASS') {
      throw new Error(
        'Execute e salve um Dry Run PASS antes do upload.'
      );
    }

    const resource = buildYoutubeVideoResource(plan);

    const videoId = await this.uploadVideoResumable(
      videoFile,
      resource,
      onProgress
    );

    let playlistStatus: YoutubeUploadResult['playlistStatus'] =
      plan.playlistId ? 'ERROR' : 'NOT_CONFIGURED';

    let thumbnailStatus: YoutubeUploadResult['thumbnailStatus'] =
      thumbnailFile ? 'ERROR' : 'NOT_CONFIGURED';

    let lastError: YoutubeUploadResult['lastError'] = null;

    if (plan.playlistId) {
      try {
        await this.addToPlaylist(
          videoId,
          plan.playlistId
        );
        playlistStatus = 'ADDED';
      } catch (error) {
        lastError = safeClientError(
          'PLAYLIST_FAILED',
          error
        );
      }
    }

    let processingStatus = 'processing';

    if (plan.kind === 'short') {
      processingStatus = await this.waitForProcessing(
        videoId,
        24,
        5_000
      );
    } else {
      processingStatus = await this.processingStatus(videoId);
    }

    if (thumbnailFile) {
      if (
        plan.kind === 'short' &&
        processingStatus !== 'succeeded'
      ) {
        thumbnailStatus = 'WAITING_PROCESSING';
      } else {
        try {
          await this.setThumbnail(videoId, thumbnailFile);
          thumbnailStatus = 'APPLIED';
        } catch (error) {
          thumbnailStatus = 'ERROR';
          lastError = safeClientError(
            'THUMBNAIL_FAILED',
            error
          );
        }
      }
    }

    return {
      videoId,
      processingStatus,
      thumbnailStatus,
      playlistStatus,
      lastError
    };
  }

  async listReusableLiveStreams():
  Promise<YoutubeReusableLiveStream[]> {
    const token =
      this.requireToken();

    const url =
      new URL(
        'https://www.googleapis.com/youtube/v3/liveStreams'
      );

    url.search =
      new URLSearchParams({
        part:
          'id,snippet,status,contentDetails',
        mine:
          'true',
        maxResults:
          '50'
      }).toString();

    const response =
      await fetch(
        url,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if (!response.ok) {
      throw new Error(
        `liveStreams.list HTTP ${response.status}.`
      );
    }

    const payload =
      await response.json();

    return (
      payload?.items || []
    )
      .filter(
        (item: any) =>
          item?.contentDetails
            ?.isReusable ===
          true
      )
      .map(
        (item: any) => ({
          id:
            String(
              item?.id || ''
            ),
          title:
            String(
              item?.snippet
                ?.title || ''
            ),
          streamStatus:
            String(
              item?.status
                ?.streamStatus ||
              ''
            ),
          healthStatus:
            String(
              item?.status
                ?.healthStatus
                ?.status ||
              'noData'
            ),
          isReusable:
            true
        })
      )
      .filter(
        (
          item:
          YoutubeReusableLiveStream
        ) =>
          Boolean(item.id)
      );
  }

  async createLiveBroadcast(
    plan: YoutubeLivePlan
  ): Promise<{
    broadcastId: string;
    broadcastStatus: string;
  }> {
    const token =
      this.requireToken();

    if (
      ![
        'monthly-radio',
        'special-stream'
      ].includes(plan.kind)
    ) {
      throw new Error(
        'Apenas Monthly Radio e Special Streams usam Live Operations.'
      );
    }

    if (
      plan.dryRunStatus !==
      'PASS'
    ) {
      throw new Error(
        'Execute e salve um Dry Run PASS antes de criar a live.'
      );
    }

    const url =
      new URL(
        'https://www.googleapis.com/youtube/v3/liveBroadcasts'
      );

    url.search =
      new URLSearchParams({
        part:
          'id,snippet,status,contentDetails'
      }).toString();

    const response =
      await fetch(
        url,
        {
          method:
            'POST',

          headers: {
            Authorization:
              `Bearer ${token}`,
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(
              buildYoutubeLiveBroadcastResource(
                plan
              )
            )
        }
      );

    if (!response.ok) {
      throw new Error(
        `liveBroadcasts.insert HTTP ${response.status}.`
      );
    }

    const payload =
      await response.json();

    const broadcastId =
      String(
        payload?.id || ''
      );

    if (!broadcastId) {
      throw new Error(
        'YouTube não retornou broadcastId.'
      );
    }

    await this
      .applySyntheticDisclosureToVideo(
        broadcastId
      );

    return {
      broadcastId,
      broadcastStatus:
        String(
          payload?.status
            ?.lifeCycleStatus ||
          'created'
        )
    };
  }

  async bindLiveBroadcast(
    broadcastId: string,
    streamId: string
  ): Promise<string> {
    const token =
      this.requireToken();

    const url =
      new URL(
        'https://www.googleapis.com/youtube/v3/liveBroadcasts/bind'
      );

    url.search =
      new URLSearchParams({
        id:
          broadcastId,
        streamId,
        part:
          'id,snippet,status,contentDetails'
      }).toString();

    const response =
      await fetch(
        url,
        {
          method:
            'POST',

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if (!response.ok) {
      throw new Error(
        `liveBroadcasts.bind HTTP ${response.status}.`
      );
    }

    const payload =
      await response.json();

    return String(
      payload?.status
        ?.lifeCycleStatus ||
      'ready'
    );
  }

  async liveOperationalStatus(
    broadcastId: string,
    streamId: string
  ): Promise<YoutubeLiveOperationalStatus> {
    const token =
      this.requireToken();

    const broadcastUrl =
      new URL(
        'https://www.googleapis.com/youtube/v3/liveBroadcasts'
      );

    broadcastUrl.search =
      new URLSearchParams({
        part:
          'id,snippet,status,contentDetails',
        id:
          broadcastId
      }).toString();

    const streamUrl =
      new URL(
        'https://www.googleapis.com/youtube/v3/liveStreams'
      );

    streamUrl.search =
      new URLSearchParams({
        part:
          'id,snippet,status,contentDetails',
        id:
          streamId
      }).toString();

    const [
      broadcastResponse,
      streamResponse
    ] =
      await Promise.all([
        fetch(
          broadcastUrl,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        ),
        fetch(
          streamUrl,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        )
      ]);

    if (
      !broadcastResponse.ok
    ) {
      throw new Error(
        `liveBroadcasts.list HTTP ${broadcastResponse.status}.`
      );
    }

    if (!streamResponse.ok) {
      throw new Error(
        `liveStreams.list HTTP ${streamResponse.status}.`
      );
    }

    const broadcastPayload =
      await broadcastResponse
        .json();

    const streamPayload =
      await streamResponse
        .json();

    const broadcast =
      broadcastPayload
        ?.items
        ?.[0];

    const stream =
      streamPayload
        ?.items
        ?.[0];

    if (!broadcast?.id) {
      throw new Error(
        'Broadcast não encontrado no YouTube.'
      );
    }

    if (!stream?.id) {
      throw new Error(
        'Reusable stream não encontrado no YouTube.'
      );
    }

    return {
      broadcastId:
        String(
          broadcast.id
        ),

      streamId:
        String(
          stream.id
        ),

      broadcastStatus:
        String(
          broadcast
            ?.status
            ?.lifeCycleStatus ||
          'unknown'
        ),

      streamStatus:
        String(
          stream
            ?.status
            ?.streamStatus ||
          'unknown'
        ),

      healthStatus:
        String(
          stream
            ?.status
            ?.healthStatus
            ?.status ||
          'noData'
        ),

      actualStartTime:
        broadcast
          ?.snippet
          ?.actualStartTime ||
        null,

      actualEndTime:
        broadcast
          ?.snippet
          ?.actualEndTime ||
        null
    };
  }

  async transitionLiveBroadcast(
    broadcastId: string,
    target:
      'live' | 'complete'
  ): Promise<string> {
    const token =
      this.requireToken();

    const url =
      new URL(
        'https://www.googleapis.com/youtube/v3/liveBroadcasts/transition'
      );

    url.search =
      new URLSearchParams({
        broadcastStatus:
          target,
        id:
          broadcastId,
        part:
          'id,snippet,status,contentDetails'
      }).toString();

    const response =
      await fetch(
        url,
        {
          method:
            'POST',

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if (!response.ok) {
      throw new Error(
        `liveBroadcasts.transition(${target}) HTTP ${response.status}.`
      );
    }

    const payload =
      await response.json();

    return String(
      payload?.status
        ?.lifeCycleStatus ||
      target
    );
  }

  async deleteLiveBroadcast(
    broadcastId: string
  ): Promise<void> {
    const token =
      this.requireToken();

    const url =
      new URL(
        'https://www.googleapis.com/youtube/v3/liveBroadcasts'
      );

    url.search =
      new URLSearchParams({
        id:
          broadcastId
      }).toString();

    const response =
      await fetch(
        url,
        {
          method:
            'DELETE',

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if (!response.ok) {
      throw new Error(
        `liveBroadcasts.delete HTTP ${response.status}.`
      );
    }
  }

  async setLiveThumbnail(
    broadcastId: string,
    file: File
  ): Promise<void> {
    await this
      .setThumbnail(
        broadcastId,
        file
      );
  }

  async addLiveVodToPlaylist(
    broadcastId: string,
    playlistId: string
  ): Promise<void> {
    await this
      .addToPlaylist(
        broadcastId,
        playlistId
      );
  }

  private async applySyntheticDisclosureToVideo(
    videoId: string
  ): Promise<void> {
    const token =
      this.requireToken();

    const readUrl =
      new URL(
        'https://www.googleapis.com/youtube/v3/videos'
      );

    readUrl.search =
      new URLSearchParams({
        part:
          'status',
        id:
          videoId
      }).toString();

    const read =
      await fetch(
        readUrl,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if (!read.ok) {
      throw new Error(
        `videos.list live defaults HTTP ${read.status}.`
      );
    }

    const payload =
      await read.json();

    const current =
      payload
        ?.items
        ?.[0]
        ?.status;

    if (!current) {
      throw new Error(
        'Status do vídeo da live não encontrado.'
      );
    }

    const status: Record<
      string,
      unknown
    > = {
      privacyStatus:
        current
          .privacyStatus ||
        'private',
      embeddable:
        current
          .embeddable !==
        false,
      license:
        current
          .license ||
        'youtube',
      publicStatsViewable:
        current
          .publicStatsViewable !==
        false,
      selfDeclaredMadeForKids:
        false,
      containsSyntheticMedia:
        true
    };

    if (
      current.publishAt
    ) {
      status['publishAt'] =
        current.publishAt;
    }

    const updateUrl =
      new URL(
        'https://www.googleapis.com/youtube/v3/videos'
      );

    updateUrl.search =
      new URLSearchParams({
        part:
          'status'
      }).toString();

    const update =
      await fetch(
        updateUrl,
        {
          method:
            'PUT',

          headers: {
            Authorization:
              `Bearer ${token}`,
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify({
              id:
                videoId,
              status
            })
        }
      );

    if (!update.ok) {
      throw new Error(
        `videos.update synthetic disclosure HTTP ${update.status}.`
      );
    }
  }

  async processingStatus(
    videoId: string
  ): Promise<string> {
    const token = this.requireToken();

    const url = new URL(
      'https://www.googleapis.com/youtube/v3/videos'
    );

    url.search = new URLSearchParams({
      part: 'processingDetails,status',
      id: videoId
    }).toString();

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(
        `YouTube processing status HTTP ${response.status}.`
      );
    }

    const payload = await response.json();

    return String(
      payload?.items?.[0]
        ?.processingDetails
        ?.processingStatus || 'unknown'
    );
  }

  private async waitForProcessing(
    videoId: string,
    attempts: number,
    delayMs: number
  ): Promise<string> {
    let status = 'processing';

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      status = await this.processingStatus(videoId);

      if (
        status === 'succeeded' ||
        status === 'failed' ||
        status === 'terminated'
      ) {
        return status;
      }

      await delay(delayMs);
    }

    return status;
  }

  private async resolveChannel():
  Promise<YoutubeOperationsIdentity> {
    const token = this.requireToken();

    const url = new URL(
      'https://www.googleapis.com/youtube/v3/channels'
    );

    url.search = new URLSearchParams({
      part: 'id,snippet',
      mine: 'true'
    }).toString();

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(
        `Falha ao validar o canal no YouTube: HTTP ${response.status}.`
      );
    }

    const payload = await response.json();
    const item = payload?.items?.[0];

    if (!item?.id) {
      throw new Error(
        'O OAuth não retornou um canal do YouTube.'
      );
    }

    return {
      channelId: String(item.id),
      channelTitle: String(item?.snippet?.title || '')
    };
  }

  private async uploadVideoResumable(
    file: File,
    resource: object,
    onProgress: (progress: number) => void
  ): Promise<string> {
    const token = this.requireToken();

    const url = new URL(
      'https://www.googleapis.com/upload/youtube/v3/videos'
    );

    url.search = new URLSearchParams({
      uploadType: 'resumable',
      part: 'snippet,status',
      notifySubscribers: 'true'
    }).toString();

    const session = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Length': String(file.size),
        'X-Upload-Content-Type':
          file.type || 'application/octet-stream'
      },
      body: JSON.stringify(resource)
    });

    if (!session.ok) {
      throw new Error(
        `YouTube recusou a sessão de upload: HTTP ${session.status}.`
      );
    }

    const uploadUrl = session.headers.get('Location');

    if (!uploadUrl) {
      throw new Error(
        'YouTube não retornou a URL da sessão resumable.'
      );
    }

    return this.putFile(
      uploadUrl,
      file,
      token,
      onProgress
    );
  }

  private putFile(
    uploadUrl: string,
    file: File,
    token: string,
    onProgress: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('PUT', uploadUrl, true);

      xhr.setRequestHeader(
        'Authorization',
        `Bearer ${token}`
      );

      xhr.setRequestHeader(
        'Content-Type',
        file.type || 'application/octet-stream'
      );

      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          onProgress(
            Math.min(
              100,
              Math.round(
                (event.loaded / event.total) * 100
              )
            )
          );
        }
      };

      xhr.onerror = () =>
        reject(
          new Error(
            'Falha de rede durante o upload direto ao YouTube.'
          )
        );

      xhr.onload = () => {
        if (xhr.status !== 200 && xhr.status !== 201) {
          reject(
            new Error(
              `Upload YouTube HTTP ${xhr.status}.`
            )
          );
          return;
        }

        try {
          const payload = JSON.parse(xhr.responseText);

          if (!payload?.id) {
            throw new Error(
              'Resposta do YouTube não contém videoId.'
            );
          }

          onProgress(100);
          resolve(String(payload.id));
        } catch (error) {
          reject(error);
        }
      };

      xhr.send(file);
    });
  }

  private async addToPlaylist(
    videoId: string,
    playlistId: string
  ): Promise<void> {
    const token = this.requireToken();

    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snippet: {
            playlistId: playlistId.trim(),
            resourceId: {
              kind: 'youtube#video',
              videoId
            }
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(
        `Playlist HTTP ${response.status}.`
      );
    }
  }

  private setThumbnail(
    videoId: string,
    file: File
  ): Promise<void> {
    const token = this.requireToken();

    const url = new URL(
      'https://www.googleapis.com/upload/youtube/v3/thumbnails/set'
    );

    url.search = new URLSearchParams({
      videoId,
      uploadType: 'media'
    }).toString();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', url.toString(), true);

      xhr.setRequestHeader(
        'Authorization',
        `Bearer ${token}`
      );

      xhr.setRequestHeader(
        'Content-Type',
        file.type || 'application/octet-stream'
      );

      xhr.onerror = () =>
        reject(
          new Error(
            'Falha de rede ao enviar thumbnail.'
          )
        );

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(
            new Error(
              `Thumbnail HTTP ${xhr.status}.`
            )
          );
        }
      };

      xhr.send(file);
    });
  }

  private requireToken(): string {
    if (!this.isConnected()) {
      this.clearToken();
      throw new Error(
        'Conecte novamente o YouTube Operations.'
      );
    }

    return this.accessToken;
  }

  private clearToken(): void {
    this.accessToken = '';
    this.expiresAt = 0;
  }

  private async ensureGoogleIdentity():
  Promise<void> {
    const globalWindow =
      window as GoogleIdentityWindow;

    if (
      globalWindow
        .google
        ?.accounts
        ?.oauth2
    ) {
      return;
    }

    const existing =
      document
        .querySelector<HTMLScriptElement>(
          `script[src="${GOOGLE_IDENTITY_SCRIPT}"]`
        );

    if (existing) {
      await waitFor(
        () =>
          Boolean(
            (window as GoogleIdentityWindow)
              .google
              ?.accounts
              ?.oauth2
          ),
        10_000
      );
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const script =
        document.createElement('script');

      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(
          new Error(
            'Falha ao carregar Google Identity Services.'
          )
        );

      document.head.appendChild(script);
    });
  }

  private requestToken(
    clientId: string,
    scope: string
  ): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    const oauth2 =
      (window as GoogleIdentityWindow)
        .google
        ?.accounts
        ?.oauth2;

    if (!oauth2) {
      throw new Error(
        'Google Identity Services indisponível.'
      );
    }

    return new Promise((resolve, reject) => {
      const client =
        oauth2.initTokenClient({
          client_id: clientId,
          scope,
          callback: response => {
            if (
              response.error ||
              !response.access_token
            ) {
              reject(
                new Error(
                  response.error_description ||
                  response.error ||
                  'OAuth YouTube recusado.'
                )
              );
              return;
            }

            resolve({
              accessToken: response.access_token,
              expiresIn:
                Number(response.expires_in) || 3600
            });
          }
        });

      client.requestAccessToken({
        prompt: 'select_account consent'
      });
    });
  }
}

export function buildYoutubeLiveBroadcastResource(
  plan: YoutubeLivePlan
): object {
  const scheduled =
    Date.parse(
      plan
        .scheduledStartTime ||
      ''
    );

  if (
    !Number.isFinite(
      scheduled
    )
  ) {
    throw new Error(
      'Scheduled Start inválido para a live.'
    );
  }

  return {
    snippet: {
      title:
        plan.title,
      description:
        plan.description,
      categoryId:
        '10',
      scheduledStartTime:
        new Date(
          scheduled
        )
          .toISOString()
    },

    status: {
      privacyStatus:
        normalizePrivacy(
          plan.visibility
        ),
      selfDeclaredMadeForKids:
        false
    },

    contentDetails: {
      enableAutoStart:
        plan.autoStart ===
        true,
      enableAutoStop:
        plan.autoStop ===
        true,
      enableDvr:
        true,
      enableEmbed:
        true,
      recordFromStart:
        true,
      monitorStream: {
        enableMonitorStream:
          false
      }
    }
  };
}

export function buildYoutubeVideoResource(
  plan: YoutubePublishPlan,
  now = Date.now()
): object {
  const scheduled = Date.parse(
    plan.scheduledStartTime || ''
  );

  const scheduledPublic =
    plan.visibility === 'public' &&
    Number.isFinite(scheduled) &&
    scheduled > now;

  const privacyStatus =
    scheduledPublic
      ? 'private'
      : normalizePrivacy(plan.visibility);

  return {
    snippet: {
      title: plan.title,
      description: plan.description,
      tags:
        plan.tags?.length
          ? [...plan.tags]
          : [...RQS_DEFAULT_TAGS],
      categoryId: '10',
      defaultLanguage: 'pt-BR'
    },
    status: {
      privacyStatus,
      ...(scheduledPublic
        ? {
            publishAt:
              new Date(scheduled).toISOString()
          }
        : {}),
      embeddable: true,
      license: 'youtube',
      selfDeclaredMadeForKids: false,
      containsSyntheticMedia: true
    }
  };
}

function normalizePrivacy(
  value: string
): 'private' | 'unlisted' | 'public' {
  if (value === 'public' || value === 'unlisted') {
    return value;
  }

  return 'private';
}

function safeClientError(
  code: string,
  error: unknown
): {
  code: string;
  message: string;
} {
  return {
    code,
    message:
      error instanceof Error
        ? error.message.slice(0, 240)
        : 'Unknown client error'
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve =>
    window.setTimeout(resolve, ms)
  );
}

async function waitFor(
  predicate: () => boolean,
  timeoutMs: number
): Promise<void> {
  const started = Date.now();

  while (!predicate()) {
    if (Date.now() - started > timeoutMs) {
      throw new Error(
        'Google Identity Services não inicializou.'
      );
    }

    await delay(50);
  }
}
