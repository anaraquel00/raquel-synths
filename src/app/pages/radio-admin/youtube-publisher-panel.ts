import { CommonModule } from '@angular/common';
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
  YoutubeOperationsConfig,
  YoutubeOperationsService,
  YoutubePublishPlan,
  YoutubeStudioChecklist
} from '../../core/youtube-operations/youtube-operations.service';

const EMPTY_STUDIO_CHECKLIST: YoutubeStudioChecklist = {
  endScreenConfigured: false,
  cardsConfigured: false,
  shortsRemixAudioOnly: false,
  automaticPlacesDisabled: false,
  automaticConceptsDisabled: false
};

@Component({
  selector: 'app-youtube-publisher-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './youtube-publisher-panel.html',
  styleUrl: './youtube-publisher-panel.scss'
})
export class YoutubePublisherPanelComponent implements OnChanges {
  @Input() plan: YoutubePublishPlan | null = null;
  @Input() expectedKind: 'weekly-video' | 'short' = 'weekly-video';
  @Output() readonly planUpdated = new EventEmitter<void>();
  @Output() readonly sessionExpired = new EventEmitter<void>();

  readonly config = signal<YoutubeOperationsConfig | null>(null);
  readonly connected = signal(false);
  readonly identity = signal('');
  readonly videoName = signal('');
  readonly thumbnailName = signal('');
  readonly progress = signal(0);
  readonly studioChecklist = signal<YoutubeStudioChecklist>({ ...EMPTY_STUDIO_CHECKLIST });
  readonly checklistBusy = signal(false);
  readonly phase = signal<'IDLE'|'CONNECTING'|'READY'|'UPLOADING'|'FINALIZING'|'COMPLETE'|'ERROR'>('IDLE');
  readonly message = signal('');

  private videoFile: File | null = null;
  private thumbnailFile: File | null = null;
  private csrf = '';

  constructor(private readonly youtube: YoutubeOperationsService) {
    void this.loadConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plan']) {
      this.resetFiles();
      this.syncChecklist();
    }
  }

  selectVideo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (file && !file.type.startsWith('video/')) {
      this.message.set('Selecione um arquivo de vídeo.');
      this.videoFile = null;
      this.videoName.set('');
      return;
    }
    this.videoFile = file;
    this.videoName.set(file?.name || '');
    this.message.set('');
  }

  selectThumbnail(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (file && !['image/jpeg', 'image/png'].includes(file.type)) {
      this.message.set('Thumbnail deve ser JPG ou PNG.');
      this.thumbnailFile = null;
      this.thumbnailName.set('');
      return;
    }
    if (file && file.size > 50 * 1024 * 1024) {
      this.message.set('Thumbnail excede 50 MB.');
      this.thumbnailFile = null;
      this.thumbnailName.set('');
      return;
    }
    this.thumbnailFile = file;
    this.thumbnailName.set(file?.name || '');
    this.message.set('');
  }

  async connect(): Promise<void> {
    const config = this.config();
    if (!config) return;
    this.phase.set('CONNECTING');
    this.message.set('');
    try {
      const identity = await this.youtube.connect(config);
      this.connected.set(true);
      this.identity.set(identity.channelTitle);
      this.phase.set('READY');
    } catch (error) {
      this.connected.set(false);
      this.phase.set('ERROR');
      this.message.set(error instanceof Error ? error.message : 'Falha no OAuth do YouTube.');
    }
  }

  disconnect(): void {
    this.youtube.disconnect();
    this.connected.set(false);
    this.identity.set('');
    this.phase.set('IDLE');
  }

  async upload(): Promise<void> {
    const plan = this.plan;
    const config = this.config();
    if (!plan || plan.kind !== this.expectedKind) {
      this.message.set('Salve e selecione um plano desta sessão antes do upload.');
      return;
    }
    if (!config?.enabled) {
      this.message.set('YouTube Operations está LOCKED neste ambiente.');
      return;
    }
    if (plan.dryRunStatus !== 'PASS') {
      this.message.set('O plano salvo precisa estar com DRY RUN PASS.');
      return;
    }
    if (!this.videoFile) {
      this.message.set('Selecione o vídeo.');
      return;
    }
    if (!this.connected()) {
      this.message.set('Conecte o YouTube Operations primeiro.');
      return;
    }
    if (!window.confirm(`Enviar "${this.videoFile.name}" para o canal ${this.identity()}?`)) return;

    this.progress.set(0);
    this.phase.set('UPLOADING');
    this.message.set('Upload direto navegador → YouTube.');

    try {
      const intent = await this.adminCall<{ plan: YoutubePublishPlan & { updateTime: string | null } }>(
        '/api/admin/radio',
        { action: 'plan-upload-intent', id: plan.id, updateTime: plan.updateTime },
        this.csrf
      );
      const result = await this.youtube.upload(
        intent.plan,
        this.videoFile,
        this.thumbnailFile,
        progress => this.progress.set(progress)
      );
      this.phase.set('FINALIZING');
      await this.recordResult(intent.plan, result);
      this.phase.set('COMPLETE');
      this.message.set(`YouTube ID ${result.videoId} · processing=${result.processingStatus} · thumbnail=${result.thumbnailStatus} · playlist=${result.playlistStatus}`);
      this.planUpdated.emit();
    } catch (error) {
      this.phase.set('ERROR');
      this.message.set(error instanceof Error ? error.message : 'Falha no upload do YouTube.');
    }
  }

  setChecklist(key: keyof YoutubeStudioChecklist, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.studioChecklist.update(value => ({ ...value, [key]: checked }));
  }

  checklistDone(): number {
    return Object.values(this.studioChecklist()).filter(Boolean).length;
  }

  async saveStudioChecklist(): Promise<void> {
    const plan = this.plan;
    if (!plan?.youtubeVideoId || !plan.updateTime) {
      this.message.set('O checklist só pode ser salvo depois do upload e da atualização do plano.');
      return;
    }
    this.checklistBusy.set(true);
    this.message.set('');
    try {
      await this.adminCall(
        '/api/admin/radio',
        { action: 'plan-studio-checklist', id: plan.id, updateTime: plan.updateTime, checklist: this.studioChecklist() },
        this.csrf
      );
      this.message.set('Checklist do YouTube Studio salvo.');
      this.planUpdated.emit();
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Falha ao salvar o checklist do Studio.');
    } finally {
      this.checklistBusy.set(false);
    }
  }

  studioUrl(): string | null {
    return this.plan?.youtubeVideoId
      ? `https://studio.youtube.com/video/${this.plan.youtubeVideoId}/edit`
      : null;
  }

  private async loadConfig(): Promise<void> {
    try {
      const session = await this.adminCall<{ authenticated: boolean; csrfToken?: string }>(
        '/api/admin/system-logs', { action: 'session' }, ''
      );
      if (!session.authenticated || !session.csrfToken) return;
      this.csrf = session.csrfToken;
      this.config.set(await this.adminCall<YoutubeOperationsConfig>(
        '/api/admin/radio', { action: 'operations-config' }, this.csrf
      ));
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Falha ao carregar YouTube Operations.');
    }
  }

  private async recordResult(plan: YoutubePublishPlan, result: {
    videoId: string;
    processingStatus: string;
    thumbnailStatus: string;
    playlistStatus: string;
    lastError?: { code: string; message: string } | null;
  }): Promise<void> {
    await this.adminCall(
      '/api/admin/radio',
      {
        action: 'plan-youtube-result', id: plan.id, updateTime: plan.updateTime,
        result: {
          videoId: result.videoId,
          uploadStatus: 'COMPLETE',
          processingStatus: result.processingStatus,
          thumbnailStatus: result.thumbnailStatus,
          playlistStatus: result.playlistStatus,
          lastError: result.lastError || null
        }
      },
      this.csrf
    );
  }

  private async adminCall<T>(url: string, payload: object, csrf: string): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrf ? { 'X-RQS-CSRF': csrf } : {})
      },
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
      this.connected.set(false);
      this.sessionExpired.emit();
      throw new Error('Sessão administrativa expirada.');
    }

    if (!response.ok) {
      throw new Error(
        (result as { message?: string }).message ||
        `Falha na API administrativa. HTTP ${response.status}.`
      );
    }

    return result as T;
  }

  private syncChecklist(): void {
    const source = this.plan?.studioChecklist || {};
    this.studioChecklist.set({
      endScreenConfigured: source.endScreenConfigured === true,
      cardsConfigured: source.cardsConfigured === true,
      shortsRemixAudioOnly: source.shortsRemixAudioOnly === true,
      automaticPlacesDisabled: source.automaticPlacesDisabled === true,
      automaticConceptsDisabled: source.automaticConceptsDisabled === true
    });
  }

  private resetFiles(): void {
    this.videoFile = null;
    this.thumbnailFile = null;
    this.videoName.set('');
    this.thumbnailName.set('');
    this.progress.set(0);
    this.message.set('');
  }
}
