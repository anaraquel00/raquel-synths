import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
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
  sourceType: SocialSourceType = 'system_log';
  language: 'pt-BR' | 'en-US' = 'pt-BR';
  sourceId = '';
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

  async changeSourceType(): Promise<void> {
    this.sourceId = '';
    this.draft = null;
    this.diagnostics.set(null);
    this.dryRunToken.set(null);
    this.error.set('');
    try { await this.loadSources(); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'Falha ao carregar fontes.'); }
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

  startAnother(): void {
    this.selectSource();
    this.message.set('Novo package para a mesma fonte.');
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
      this.message.set('Draft salvo.');
      await this.loadPackages();
    });
  }

  async dryRun(): Promise<void> {
    if (!this.draft) return;
    await this.run(async () => {
      const result = await this.call<{ diagnostics: DryRunDiagnostics; dryRunToken: string | null }>({ action: 'dry-run', package: this.draft });
      this.diagnostics.set(result.diagnostics);
      this.dryRunToken.set(result.dryRunToken);
      this.message.set(`Dry run: ${result.diagnostics.status}`);
    });
  }

  async approve(): Promise<void> {
    if (!this.draft?.id || this.draft.status !== 'DRAFT' || !this.dryRunToken()) return;
    await this.run(async () => {
      const result = await this.call<{ package: SocialPackageDraft; diagnostics: DryRunDiagnostics }>({ action: 'approve', id: this.draft?.id, dryRunToken: this.dryRunToken() });
      this.draft = result.package;
      this.dryRunToken.set(null);
      this.diagnostics.set(result.diagnostics);
      this.message.set('Package aprovado. Nenhuma publicação foi enviada.');
      await this.loadPackages();
    });
  }

  async cancel(): Promise<void> {
    if (!this.draft?.id || !['DRAFT', 'APPROVED'].includes(this.draft.status || '')) return;
    await this.run(async () => {
      const result = await this.call<{ package: SocialPackageDraft }>({ action: 'cancel', id: this.draft?.id });
      this.draft = result.package;
      this.message.set('Package cancelado.');
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
    this.diagnostics.set(null);
    this.dryRunToken.set(null);
    void this.loadSources().catch(error => {
      this.error.set(error instanceof Error ? error.message : 'Falha ao carregar fontes.');
    });
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
