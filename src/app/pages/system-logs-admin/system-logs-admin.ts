import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface TechContentDiagnostic {
  sourceFormat: 'HTML' | 'PLAIN_TEXT';
  htmlValidation: 'PASS' | 'FAIL';
  allowedTagsOnly: 'PASS' | 'FAIL';
  renderableContent: 'PASS' | 'FAIL';
  publishAllowed: 'YES' | 'NO';
}

interface LogLanguage {
  title: string;
  description: string;
  techContent: string;
  techContentDiagnostic?: TechContentDiagnostic;
  jonahComment: string;
}

interface LogPayload {
  date: string;
  image: string;
  pt: LogLanguage;
  en: LogLanguage;
}

interface DriveDocument {
  documentId: string;
  name: string;
  modifiedTime?: string;
}

interface SessionResult {
  authenticated: boolean;
  csrfToken?: string;
  expiresAt?: number;
}

interface DryRunResult {
  checks: {
    documentId: string;
    sourceDocument: string;
    date: string;
    scheduleStatus: string;
    image: string;
    pt: { techContent: TechContentDiagnostic };
    en: { techContent: TechContentDiagnostic };
  };
  firestore: string;
  dryRunToken: string | null;
  preview: { pt: string; en: string };
  payload: LogPayload;
  source: { documentId: string; modifiedTime: string };
}

@Component({
  selector: 'app-system-logs-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './system-logs-admin.html',
  styleUrl: './system-logs-admin.scss'
})
export class SystemLogsAdminComponent implements OnInit {
  readonly authenticated = signal(false);
  readonly checked = signal(false);
  readonly documents = signal<DriveDocument[]>([]);
  readonly selected = signal<DriveDocument | null>(null);
  readonly parsed = signal<LogPayload | null>(null);
  readonly dryRun = signal<DryRunResult | null>(null);
  readonly preview = signal<'pt' | 'en' | null>(null);
  readonly error = signal('');
  readonly message = signal('');
  private csrf = '';

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) void this.session();
  }

  async logout(): Promise<void> {
    try {
      await this.call({ action: 'logout' });
      this.authenticated.set(false);
      this.documents.set([]);
      this.parsed.set(null);
      await this.router.navigate(['/admin']);
    } catch (error) {
      this.fail(error);
    }
  }

  async refresh(): Promise<void> {
    if (!this.authenticated()) return;

    try {
      const result = await this.call<{ documents: DriveDocument[] }>({
        action: 'list'
      });
      this.documents.set(result.documents);
    } catch (error) {
      this.fail(error);
    }
  }

  async load(document: DriveDocument): Promise<void> {
    this.selected.set(document);
    this.parsed.set(null);
    this.dryRun.set(null);
    this.preview.set(null);

    try {
      const result = await this.call<{
        parsed: LogPayload;
        modifiedTime: string;
      }>({
        action: 'load',
        documentId: document.documentId
      });
      this.selected.set({ ...document, modifiedTime: result.modifiedTime });
      this.parsed.set(result.parsed);
    } catch (error) {
      this.fail(error);
    }
  }

  selectDocument(documentId: string): void {
    const document = this.documents().find(
      item => item.documentId === documentId
    );
    if (document) void this.load(document);
  }

  async runDryRun(): Promise<void> {
    const parsed = this.parsed();
    const source = this.selected();
    if (!parsed || !source?.modifiedTime) return;

    try {
      this.dryRun.set(await this.call<DryRunResult>({
        action: 'dry-run',
        payload: parsed,
        sourceDocument: source.name,
        sourceDocumentId: source.documentId,
        sourceModifiedTime: source.modifiedTime
      }));
    } catch (error) {
      this.fail(error);
    }
  }

  async create(): Promise<void> {
    const result = this.dryRun();
    if (!result?.dryRunToken || result.firestore !== 'WOULD CREATE') return;
    if (!this.document.defaultView?.confirm(
      `Criar logs/${result.checks.documentId}?`
    )) return;

    try {
      const created = await this.call<{ documentId: string }>({
        action: 'create',
        payload: result.payload,
        dryRunToken: result.dryRunToken,
        source: result.source
      });
      this.message.set(`CREATED: logs/${created.documentId}`);
      this.dryRun.set(null);
    } catch (error) {
      this.fail(error);
      this.dryRun.set(null);
    }
  }

  viewPreview(language: 'pt' | 'en'): void {
    this.preview.set(this.preview() === language ? null : language);
  }

  private async session(): Promise<void> {
    try {
      this.applySession(await this.call<SessionResult>({
        action: 'session'
      }, false));
      if (this.authenticated()) {
        await this.refresh();
      } else {
        await this.router.navigate(['/admin']);
      }
    } catch {
      this.authenticated.set(false);
      await this.router.navigate(['/admin']);
    } finally {
      this.checked.set(true);
    }
  }

  private applySession(result: SessionResult): void {
    this.authenticated.set(Boolean(
      result.authenticated && result.csrfToken
    ));
    this.csrf = result.csrfToken || '';
  }

  private async call<T>(body: object, csrf = true): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (csrf && this.csrf) headers['X-RQS-CSRF'] = this.csrf;

    const response = await fetch('/api/admin/system-logs', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
      credentials: 'same-origin'
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Falha no módulo Logs do Sistema.');
    }
    return result as T;
  }

  private fail(error: unknown): void {
    this.error.set(
      error instanceof Error ? error.message : 'Falha inesperada.'
    );
  }
}
