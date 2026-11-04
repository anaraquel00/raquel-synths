import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface AdminSession {
  authenticated: boolean;
  csrfToken?: string;
}

interface YouTubeDiagnostic {
  configurationStatus: string;
  channelStatus: string;
  channel?: { id: string; title: string } | null;
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
  diagnostics: {
    status: 'PASS' | 'FAIL';
    checks: DryRunCheck[];
  };
  plan: DryRunStep[];
}

@Component({
  selector: 'app-radio-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './radio-admin.html',
  styleUrl: './radio-admin.scss'
})
export class RadioAdminComponent implements OnInit {
  readonly checked = signal(false);
  readonly authenticated = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly diagnostics = signal<DiagnosticResponse | null>(null);
  readonly dryRun = signal<DryRunResponse | null>(null);

  title = 'RQS RADIO // NOVEMBER 2026';
  description = 'REDBLUE TRANSMISSION — monthly RQS Radio broadcast.';
  scheduledStartLocal = '';
  visibility = 'unlisted';
  thumbnailUrl = '';
  setlistText = '';
  playlistId = '';
  autoStart = false;
  autoStop = false;

  private csrf = '';

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.restoreSession();
    } else {
      this.checked.set(true);
    }
  }

  async runDiagnostics(): Promise<void> {
    await this.execute(async () => {
      this.diagnostics.set(
        await this.call<DiagnosticResponse>({ action: 'diagnostics' })
      );
    });
  }

  async runDryRun(): Promise<void> {
    await this.execute(async () => {
      const scheduledStartTime = this.scheduledStartLocal
        ? new Date(this.scheduledStartLocal).toISOString()
        : '';

      this.dryRun.set(
        await this.call<DryRunResponse>({
          action: 'dry-run',
          transmission: {
            title: this.title,
            description: this.description,
            scheduledStartTime,
            visibility: this.visibility,
            thumbnailUrl: this.thumbnailUrl,
            setlist: this.setlistText
              .split('\n')
              .map(value => value.trim())
              .filter(Boolean),
            playlistId: this.playlistId,
            autoStart: this.autoStart,
            autoStop: this.autoStop
          }
        })
      );
    });
  }

  private async restoreSession(): Promise<void> {
    try {
      const result = await this.sessionCall();
      this.authenticated.set(Boolean(result.authenticated && result.csrfToken));
      this.csrf = result.csrfToken || '';
    } catch {
      this.authenticated.set(false);
      this.csrf = '';
    } finally {
      this.checked.set(true);
    }
  }

  private async sessionCall(): Promise<AdminSession> {
    const response = await fetch('/api/admin/system-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify({ action: 'session' })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Falha ao validar a sessão administrativa.');
    }
    return result as AdminSession;
  }

  private async call<T>(payload: object): Promise<T> {
    const response = await fetch('/api/admin/radio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RQS-CSRF': this.csrf
      },
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Falha no módulo Radio.');
    }
    return result as T;
  }

  private async execute(operation: () => Promise<void>): Promise<void> {
    if (!this.authenticated() || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await operation();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Falha no módulo Radio.');
    } finally {
      this.busy.set(false);
    }
  }
}
