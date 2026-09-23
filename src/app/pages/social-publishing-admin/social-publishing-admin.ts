import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, QueryList, signal, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DryRunDiagnostics, MetaConnectionDiagnostics, NormalizedSource, SocialDestination, SocialPackageDraft, SocialSourceType } from '../../models/social-publishing.model';

interface SessionResult { authenticated: boolean; csrfToken?: string; }

@Component({
  selector: 'app-social-publishing-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './social-publishing-admin.html',
  styleUrl: './social-publishing-admin.scss'
})
export class SocialPublishingAdminComponent implements OnInit {
  readonly checked = signal(false);
  readonly busy = signal(false);
  readonly sources = signal<NormalizedSource[]>([]);
  readonly packages = signal<SocialPackageDraft[]>([]);
  readonly diagnostics = signal<DryRunDiagnostics | null>(null);
  readonly error = signal('');
  readonly message = signal('');
  readonly dryRunToken = signal<string | null>(null);
  readonly metaDiagnostics = signal<MetaConnectionDiagnostics | null>(null);
  readonly packageSources = signal<Record<string, NormalizedSource>>({});
  readonly publishConfirmationOpen = signal(false);

  @ViewChildren('sourceOption') private readonly sourceOptions?: QueryList<ElementRef<HTMLButtonElement>>;

  sourceType: SocialSourceType = 'system_log';
  language: 'pt-BR' | 'en-US' = 'pt-BR';
  sourceId = '';
  sourceQuery = '';
  sourcePickerOpen = false;
  activeSourceIndex = -1;
  draft: SocialPackageDraft | null = null;
  private csrf = '';

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) void this.restoreSession();
  }

  get selectedSource(): NormalizedSource | undefined {
    return this.sources().find(source => source.sourceId === this.sourceId);
  }

  get filteredSources(): NormalizedSource[] {
    const query = this.normalizeSearch(this.sourceQuery);
    const list = this.sources();
    if (!query) return list.slice(0, 40);

    return list
      .filter(source => this.normalizeSearch(`${this.sourceLabel(source)} ${source.sourceId}`).includes(query))
      .slice(0, 40);
  }

  get canPublishInstagram(): boolean {
    const packageValue = this.draft;
    const meta = this.metaDiagnostics();
    const delivery = packageValue?.instagramDelivery;
    if (!packageValue || !meta) return false;
    let assetValid = false;
    try { assetValid = new URL(packageValue.socialAssetUrl).protocol === 'https:'; }
    catch { assetValid = false; }
    return packageValue.sourceType === 'music_release' &&
      packageValue.sourceId === 'discography/ep-the-blueprint-sessions-v022' &&
      packageValue.status === 'APPROVED' &&
      packageValue.destinations.length === 1 &&
      packageValue.destinations[0] === 'instagram' &&
      packageValue.socialAssetType === 'IMAGE' &&
      assetValid &&
      Boolean(packageValue.instagramCaption) &&
      packageValue.sourceStale !== true &&
      meta.token.valid &&
      meta.token.appIdMatches &&
      meta.instagram.status === 'READY' &&
      meta.instagram.capabilities.feed &&
      meta.relationship.status === 'MATCH' &&
      !delivery;
  }

  async changeSourceType(): Promise<void> {
    this.sourceId = '';
    this.sourceQuery = '';
    this.sourcePickerOpen = false;
    this.activeSourceIndex = -1;
    this.draft = null;
    this.diagnostics.set(null);
    this.dryRunToken.set(null);
    this.error.set('');
    try { await this.loadSources(); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'Falha ao carregar fontes.'); }
  }

  onSourceQueryChange(value: string): void {
    this.sourceQuery = value;
    this.sourcePickerOpen = true;
    this.activeSourceIndex = this.filteredSources.length ? 0 : -1;

    const selected = this.selectedSource;
    if (selected && value !== this.sourceLabel(selected)) {
      this.sourceId = '';
      this.draft = null;
      this.diagnostics.set(null);
      this.dryRunToken.set(null);
    }
  }

  chooseSource(source: NormalizedSource): void {
    this.sourceId = source.sourceId;
    this.sourceQuery = this.sourceLabel(source);
    this.sourcePickerOpen = false;
    this.activeSourceIndex = -1;
    this.selectSource();
  }

  openSourcePicker(): void {
    this.sourcePickerOpen = true;
    const selectedIndex = this.filteredSources.findIndex(source => source.sourceId === this.sourceId);
    this.activeSourceIndex = selectedIndex >= 0 ? selectedIndex : (this.filteredSources.length ? 0 : -1);
  }

  closeSourcePicker(): void {
    setTimeout(() => { this.sourcePickerOpen = false; }, 0);
  }

  onSourcePickerKeydown(event: KeyboardEvent): void {
    const sources = this.filteredSources;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.sourcePickerOpen = false;
      this.activeSourceIndex = -1;
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.sourcePickerOpen = true;
      if (!sources.length) return;
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const initial = this.activeSourceIndex < 0 ? (direction > 0 ? -1 : 0) : this.activeSourceIndex;
      this.activeSourceIndex = (initial + direction + sources.length) % sources.length;
      this.scrollActiveSourceIntoView();
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      if (!sources.length) return;
      this.sourcePickerOpen = true;
      this.activeSourceIndex = event.key === 'Home' ? 0 : sources.length - 1;
      this.scrollActiveSourceIntoView();
      return;
    }

    if (event.key === 'Enter' && this.sourcePickerOpen) {
      event.preventDefault();
      const source = sources[this.activeSourceIndex >= 0 ? this.activeSourceIndex : 0];
      if (source) this.chooseSource(source);
    }
  }

  selectSource(): void {
    const source = this.selectedSource;
    this.diagnostics.set(null);
    this.dryRunToken.set(null);
    if (!source) { this.draft = null; return; }
    this.draft = {
      sourceType: source.sourceType,
      sourceId: source.sourceId,
      sourceUrl: source.sourceUrl,
      sourceRevision: source.sourceRevision,
      language: source.language,
      socialAssetUrl: source.primaryImage || '',
      socialAssetType: 'IMAGE',
      instagramCaption: '',
      facebookCaption: '',
      cta: '',
      destinationUrl: source.musicDeepLinkUrl || source.canonicalUrl,
      utmCampaign: '',
      utmContent: '',
      destinations: []
    };
  }

  sourceLabel(source: NormalizedSource): string {
    if (source.sourceType === 'system_log') return `System Log · ${source.title}`;
    if (source.sourceType === 'music_release') return `${source.releaseType || 'Release'} · ${source.title}`;

    const family = source.team === 'jonah' || source.sourceId.startsWith('lore-jonah/')
      ? 'Jonah'
      : source.team === 'broklin' || source.sourceId.startsWith('lore/')
        ? 'Broklin'
        : source.team === 'hybrid' || source.sourceId.startsWith('global-sagas/')
          ? 'Saga Global'
          : 'Saga';

    const episode = source.season && source.episode
      ? `S${source.season}E${String(source.episode).padStart(2, '0')}`
      : '';

    return [family, episode, source.title].filter(Boolean).join(' · ');
  }

  sourceTypeLabel(type: SocialSourceType): string {
    if (type === 'system_log') return 'System Log';
    if (type === 'saga_episode') return 'Saga';
    return 'Discografia';
  }

  statusLabel(status?: string): string {
    const labels: Record<string, string> = {
      DRAFT: 'Rascunho',
      APPROVED: 'Aprovado',
      SCHEDULED: 'Agendado',
      PUBLISHING: 'Publicando',
      PUBLISHED: 'Publicado',
      FAILED: 'Falhou',
      CANCELED: 'Cancelado'
    };
    return labels[status || 'DRAFT'] || status || 'Rascunho';
  }

  metaStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      READY: 'Pronto',
      NOT_CONFIGURED: 'Não configurado',
      NOT_CHECKED: 'Não verificado',
      ERROR: 'Erro'
    };
    return labels[status || 'NOT_CHECKED'] || status || 'Não verificado';
  }

  packageTitle(item: SocialPackageDraft): string {
    const source = this.packageSource(item);
    if (source) return source.title;
    if (item.sourceType === 'music_release') return 'Publicação de discografia';
    if (item.sourceType === 'saga_episode') return 'Publicação de saga';
    return 'Publicação de System Log';
  }

  packageSource(item: SocialPackageDraft): NormalizedSource | undefined {
    return this.packageSources()[this.packageSourceKey(item.sourceId, item.language)];
  }

  configurationLabel(value: string): string {
    const labels: Record<string, string> = {
      META_APP_ID: 'Aplicativo Meta',
      META_APP_SECRET: 'Credencial do aplicativo',
      META_FACEBOOK_PAGE_ID: 'Página do Facebook',
      META_FACEBOOK_PAGE_ACCESS_TOKEN: 'Acesso da Página',
      META_IG_USER_ID: 'Conta profissional do Instagram'
    };
    return labels[value] || 'Configuração da integração';
  }

  startAnother(): void {
    this.selectSource();
    this.message.set('Novo pacote criado para a mesma fonte.');
  }

  toggleDestination(destination: SocialDestination, checked: boolean): void {
    if (!this.draft) return;
    const previous = this.draft.destinations.filter(item => item !== destination);
    this.draft.destinations = checked ? [...previous, destination] : previous;
    this.invalidateDryRun();
  }

  invalidateDryRun(): void {
    this.diagnostics.set(null);
    this.dryRunToken.set(null);
  }

  async saveDraft(): Promise<void> {
    if (!this.draft) return;
    await this.run(async () => {
      const result = await this.call<{ package: SocialPackageDraft }>({ action: 'save-draft', package: this.draft });
      this.draft = result.package;
      this.invalidateDryRun();
      this.message.set('Rascunho salvo.');
      await this.loadPackages();
    });
  }

  async dryRun(): Promise<void> {
    if (!this.draft) return;
    await this.run(async () => {
      const result = await this.call<{ diagnostics: DryRunDiagnostics; dryRunToken: string | null }>({ action: 'dry-run', package: this.draft });
      this.diagnostics.set(result.diagnostics);
      this.dryRunToken.set(result.dryRunToken);
      this.message.set(result.diagnostics.status === 'PASS' ? 'Validação concluída sem pendências.' : 'A validação encontrou pendências.');
    });
  }

  async approve(): Promise<void> {
    if (!this.draft?.id || this.draft.status !== 'DRAFT' || !this.dryRunToken()) return;
    await this.run(async () => {
      const result = await this.call<{ package: SocialPackageDraft; diagnostics: DryRunDiagnostics }>({ action: 'approve', id: this.draft?.id, dryRunToken: this.dryRunToken() });
      this.draft = result.package;
      this.dryRunToken.set(null);
      this.diagnostics.set(result.diagnostics);
      this.message.set('Pacote aprovado. Nenhuma publicação foi enviada.');
      await this.loadPackages();
    });
  }

  async cancel(): Promise<void> {
    if (!this.draft?.id || !['DRAFT', 'APPROVED'].includes(this.draft.status || '')) return;
    await this.run(async () => {
      const result = await this.call<{ package: SocialPackageDraft }>({ action: 'cancel', id: this.draft?.id });
      this.draft = result.package;
      this.message.set('Pacote cancelado.');
      await this.loadPackages();
    });
  }

  requestPublishInstagram(): void {
    if (this.canPublishInstagram && !this.busy()) this.publishConfirmationOpen.set(true);
  }

  closePublishConfirmation(): void {
    if (!this.busy()) this.publishConfirmationOpen.set(false);
  }

  async publishInstagramNow(): Promise<void> {
    if (!this.draft?.id || !this.canPublishInstagram) return;
    this.publishConfirmationOpen.set(false);
    await this.run(async () => {
      const result = await this.call<{ package: SocialPackageDraft }>({
        action: 'publish-instagram-now', id: this.draft?.id
      });
      this.draft = result.package;
      this.message.set('Publicado no Instagram. O ID remoto e o horário foram registrados.');
      await this.loadPackages();
    });
  }

  async refreshMetaDiagnostics(): Promise<void> {
    await this.run(async () => {
      await this.loadMetaDiagnostics();
      this.message.set('Diagnóstico Meta atualizado. Nenhum conteúdo foi enviado.');
    });
  }

  openPackage(item: SocialPackageDraft): void {
    this.sourceType = item.sourceType;
    this.language = item.language;
    this.draft = { ...item, destinations: [...item.destinations] };
    this.sourceId = item.sourceId;
    this.sourceQuery = '';
    this.sourcePickerOpen = false;
    this.diagnostics.set(null);
    this.dryRunToken.set(null);
    this.publishConfirmationOpen.set(false);

    void this.loadSources()
      .then(() => {
        const source = this.selectedSource;
        if (source) this.sourceQuery = this.sourceLabel(source);
      })
      .catch(error => {
        this.error.set(error instanceof Error ? error.message : 'Falha ao carregar fontes.');
      });
  }

  private normalizeSearch(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }

  private scrollActiveSourceIntoView(): void {
    setTimeout(() => this.sourceOptions?.get(this.activeSourceIndex)?.nativeElement.scrollIntoView({ block: 'nearest' }), 0);
  }

  private packageSourceKey(sourceId: string, language: string): string {
    return `${language}:${sourceId}`;
  }

  private async restoreSession(): Promise<void> {
    try {
      const response = await fetch('/api/admin/system-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'session' }), credentials: 'same-origin', cache: 'no-store'
      });
      const session = await response.json() as SessionResult;
      if (!response.ok || !session.authenticated || !session.csrfToken) {
        await this.router.navigate(['/admin']);
        return;
      }
      this.csrf = session.csrfToken;
    } catch {
      await this.router.navigate(['/admin']);
    } finally {
      this.checked.set(true);
    }
    if (this.csrf) {
      try { await Promise.all([this.loadSources(), this.loadPackages(), this.loadMetaDiagnostics()]); }
      catch (error) { this.error.set(error instanceof Error ? error.message : 'Falha ao carregar o módulo.'); }
    }
  }

  private async loadSources(): Promise<void> {
    const result = await this.call<{ sources: NormalizedSource[] }>({
      action: 'list-sources', sourceType: this.sourceType, language: this.language
    });
    this.sources.set(result.sources);
  }

  private async loadPackages(): Promise<void> {
    const result = await this.call<{ packages: SocialPackageDraft[] }>({ action: 'list-packages' });
    this.packages.set(result.packages);
    await this.loadPackageSources(result.packages);
  }

  private async loadPackageSources(packages: SocialPackageDraft[]): Promise<void> {
    const groups = new Map<string, { sourceType: SocialSourceType; language: 'pt-BR' | 'en-US' }>();
    for (const item of packages) groups.set(`${item.sourceType}:${item.language}`, { sourceType: item.sourceType, language: item.language });

    const responses = await Promise.all([...groups.values()].map(group =>
      this.call<{ sources: NormalizedSource[] }>({ action: 'list-sources', ...group })
    ));
    const entries = responses.flatMap(response => response.sources.map(source =>
      [this.packageSourceKey(source.sourceId, source.language), source] as const
    ));
    this.packageSources.set(Object.fromEntries(entries));
  }

  private async loadMetaDiagnostics(): Promise<void> {
    this.metaDiagnostics.set(await this.call<MetaConnectionDiagnostics>({ action: 'meta-diagnostics' }));
  }

  private async call<T>(body: object): Promise<T> {
    const response = await fetch('/api/admin/social-publishing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-RQS-CSRF': this.csrf },
      credentials: 'same-origin', cache: 'no-store', body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) void this.router.navigate(['/admin']);
      if (result.diagnostics) this.diagnostics.set(result.diagnostics);
      throw new Error(result.message || 'Operação recusada pelo Social Publishing.');
    }
    return result as T;
  }

  private async run(operation: () => Promise<void>): Promise<void> {
    this.error.set('');
    this.message.set('');
    this.busy.set(true);
    try { await operation(); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'Falha inesperada.'); }
    finally { this.busy.set(false); }
  }
}
