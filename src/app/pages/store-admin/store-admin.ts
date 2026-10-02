import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';
import {
  Meta,
  Title
} from '@angular/platform-browser';
import {
  Router,
  RouterLink
} from '@angular/router';

import {
  StoreAdminOverviewResponse,
  StoreAdminProduct
} from '../../models/store-admin.model';

interface SessionResult {
  authenticated: boolean;
  csrfToken?: string;
}

@Component({
  selector: 'app-store-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './store-admin.html',
  styleUrl: './store-admin.scss'
})
export class StoreAdminComponent implements OnInit, OnDestroy {
  readonly checked = signal(false);
  readonly loading = signal(false);
  readonly overview = signal<StoreAdminOverviewResponse | null>(null);
  readonly error = signal('');
  readonly message = signal('');

  private csrf = '';

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly meta: Meta,
    private readonly title: Title,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.title.setTitle('RQS Admin // Neon Store');

    this.meta.updateTag({
      name: 'robots',
      content: 'noindex, nofollow, noarchive'
    });

    if (isPlatformBrowser(this.platformId)) {
      void this.restoreSession();
    } else {
      this.checked.set(true);
    }
  }

  ngOnDestroy(): void {
    this.meta.removeTag("name='robots'");
  }

  productName(product: StoreAdminProduct): string {
    return product.content.pt.name ||
      product.content.en.name ||
      product.id;
  }

  async refresh(): Promise<void> {
    if (!this.csrf || this.loading()) return;

    this.loading.set(true);
    this.error.set('');
    this.message.set('');

    try {
      const result = await this.call<StoreAdminOverviewResponse>({
        action: 'overview'
      });

      this.overview.set(result);
      this.message.set(
        `Catálogo lido em modo seguro: ${result.summary.totalProducts} produtos.`
      );
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Falha ao ler o catálogo da Neon Store.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  private async restoreSession(): Promise<void> {
    try {
      const response = await fetch('/api/admin/system-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'session'
        }),
        credentials: 'same-origin',
        cache: 'no-store'
      });

      const session = await response.json() as SessionResult & {
        message?: string;
      };

      if (
        !response.ok ||
        !session.authenticated ||
        !session.csrfToken
      ) {
        await this.router.navigate(['/admin']);
        return;
      }

      this.csrf = session.csrfToken;
      await this.refresh();
    } catch {
      await this.router.navigate(['/admin']);
    } finally {
      this.checked.set(true);
    }
  }

  private async call<T>(body: object): Promise<T> {
    const response = await fetch('/api/admin/store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RQS-CSRF': this.csrf
      },
      body: JSON.stringify(body),
      credentials: 'same-origin',
      cache: 'no-store'
    });

    const result = await response.json() as T & {
      message?: string;
    };

    if (!response.ok) {
      if (response.status === 401) {
        void this.router.navigate(['/admin']);
      }

      throw new Error(
        result.message ||
        'Operação recusada pelo módulo Neon Store.'
      );
    }

    return result;
  }
}
