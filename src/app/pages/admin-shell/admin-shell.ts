import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SessionResult {
  authenticated: boolean;
  csrfToken?: string;
  expiresAt?: number;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss'
})
export class AdminShellComponent implements OnInit {
  readonly checked = signal(false);
  readonly authenticated = signal(false);
  readonly error = signal('');
  private csrf = '';

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.restoreSession();
    } else {
      this.checked.set(true);
    }
  }

  async login(credential: string): Promise<void> {
    if (!credential) return;

    this.error.set('');

    try {
      const result = await this.call<SessionResult>({
        action: 'login',
        credential
      }, false);
      this.apply(result);

      if (!result.authenticated) {
        this.error.set('A sessão administrativa não foi confirmada.');
      }
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha na autenticação.'
      );
    }
  }

  async logout(): Promise<void> {
    try {
      await this.call({ action: 'logout' });
      this.authenticated.set(false);
      this.csrf = '';
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha ao encerrar sessão.'
      );
    }
  }

  private async restoreSession(): Promise<void> {
    try {
      this.apply(await this.call<SessionResult>({
        action: 'session'
      }, false));
    } catch {
      this.authenticated.set(false);
    } finally {
      this.checked.set(true);
    }
  }

  private apply(result: SessionResult): void {
    this.authenticated.set(Boolean(
      result.authenticated && result.csrfToken
    ));
    this.csrf = result.csrfToken || '';
  }

  private async call<T>(body: object, csrf = true): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (csrf && this.csrf) {
      headers['X-RQS-CSRF'] = this.csrf;
    }

    const response = await fetch('/api/admin/system-logs', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'same-origin',
      cache: 'no-store'
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || 'Falha na sessão administrativa.'
      );
    }

    return result as T;
  }
}
