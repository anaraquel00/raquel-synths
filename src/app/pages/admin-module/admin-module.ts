import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

type AdminModule = 'lore' | 'global-sagas';
type LoreSource = 'broklin' | 'jonah' | null;

interface SessionResult {
  authenticated: boolean;
}

@Component({
  selector: 'app-admin-module',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-module.html',
  styleUrl: './admin-module.scss'
})
export class AdminModuleComponent implements OnInit {
  readonly checked = signal(false);
  readonly authenticated = signal(false);
  readonly error = signal('');
  readonly module: AdminModule;
  readonly loreSource: LoreSource;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {
    this.module = this.route.snapshot.data['adminModule'] as AdminModule;
    this.loreSource = (
      this.route.snapshot.data['loreSource'] as LoreSource | undefined
    ) ?? null;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.restoreSession();
    } else {
      this.checked.set(true);
    }
  }

  private async restoreSession(): Promise<void> {
    try {
      const response = await fetch('/api/admin/system-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'session' }),
        credentials: 'same-origin',
        cache: 'no-store'
      });
      const result = await response.json() as SessionResult & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.message || 'Falha na sessão administrativa.');
      }

      this.authenticated.set(result.authenticated);

      if (!result.authenticated) {
        await this.router.navigate(['/admin']);
      }
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha na sessão administrativa.'
      );
      await this.router.navigate(['/admin']);
    } finally {
      this.checked.set(true);
    }
  }
}
