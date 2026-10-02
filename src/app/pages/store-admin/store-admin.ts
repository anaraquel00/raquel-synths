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
  FormsModule
} from '@angular/forms';
import {
  Meta,
  Title
} from '@angular/platform-browser';
import {
  Router,
  RouterLink
} from '@angular/router';

import {
  STORE_ADMIN_FACTIONS,
  STORE_ADMIN_ORIGIN_TYPES,
  STORE_ADMIN_STATUSES,
  StoreAdminOverviewResponse,
  StoreAdminProduct,
  StoreAdminProductDraft,
  StoreAdminProductDryRun,
  StoreAdminProductOperation,
  StoreAdminProductStatus,
  StoreProductOrigin,
  StoreProductOriginType
} from '../../models/store-admin.model';

import {
  StoreCampaignsPanelComponent
} from './store-campaigns-panel';

interface SessionResult {
  authenticated: boolean;
  csrfToken?: string;
}

interface ProductMutationResult {
  firestore:
    | 'CREATED'
    | 'UPDATED'
    | 'ARCHIVED';
  product: StoreAdminProduct;
}

type EditorMode =
  | 'create'
  | 'edit'
  | null;

@Component({
  selector: 'app-store-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    StoreCampaignsPanelComponent
  ],
  templateUrl: './store-admin.html',
  styleUrl: './store-admin.scss'
})
export class StoreAdminComponent
implements OnInit, OnDestroy {
  readonly checked = signal(false);
  readonly loading = signal(false);
  readonly overview =
    signal<StoreAdminOverviewResponse | null>(
      null
    );

  readonly editorMode =
    signal<EditorMode>(null);

  readonly productDryRun =
    signal<StoreAdminProductDryRun | null>(
      null
    );

  readonly ownerConfirmed =
    signal(false);

  readonly error = signal('');
  readonly message = signal('');

  readonly factions =
    STORE_ADMIN_FACTIONS;

  readonly statuses =
    STORE_ADMIN_STATUSES;

  readonly originTypes =
    STORE_ADMIN_ORIGIN_TYPES;

  draft:
    StoreAdminProductDraft =
      this.emptyDraft();

  private csrf = '';
  private sourceUpdateTime:
    string | null = null;

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId:
      object,

    private readonly meta:
      Meta,

    private readonly title:
      Title,

    private readonly router:
      Router
  ) {}

  ngOnInit(): void {
    this.title.setTitle(
      'RQS Admin // Neon Store'
    );

    this.meta.updateTag({
      name: 'robots',
      content:
        'noindex, nofollow, noarchive'
    });

    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {
      void this.restoreSession();
    } else {
      this.checked.set(true);
    }
  }

  ngOnDestroy(): void {
    this.meta.removeTag(
      "name='robots'"
    );
  }

  productName(
    product:
      StoreAdminProduct
  ): string {
    return (
      product.content.pt.name ||
      product.content.en.name ||
      product.id
    );
  }

  canEdit(
    product:
      StoreAdminProduct
  ): boolean {
    return (
      product.productType ===
      'affiliate'
    );
  }

  startCreate(): void {
    this.editorMode.set(
      'create'
    );

    this.draft =
      this.emptyDraft();

    this.sourceUpdateTime =
      null;

    this.invalidateDryRun();
    this.message.set('');
    this.error.set('');
  }

  startEdit(
    product:
      StoreAdminProduct
  ): void {
    if (
      !this.canEdit(product)
    ) {
      return;
    }

    this.editorMode.set(
      'edit'
    );

    this.sourceUpdateTime =
      product.updateTime;

    this.draft = {
      id:
        product.id,

      faction:
        product.faction,

      image:
        product.image,

      destinationUrl:
        product.destinationUrl,

      status:
        product.status,

      origin: {
        type:
          product.origin.type,

        sourceCollection:
          product.origin.sourceCollection,

        sourceId:
          product.origin.sourceId,

        content: {
          pt: {
            title:
              product.origin.content.pt
                .title,

            featuredIn:
              product.origin.content.pt
                .featuredIn
          },

          en: {
            title:
              product.origin.content.en
                .title,

            featuredIn:
              product.origin.content.en
                .featuredIn
          }
        }
      },

      content: {
        pt: {
          name:
            product.content.pt.name,

          shortDescription:
            product.content.pt
              .shortDescription,

          description:
            product.content.pt
              .description
        },

        en: {
          name:
            product.content.en.name,

          shortDescription:
            product.content.en
              .shortDescription,

          description:
            product.content.en
              .description
        }
      }
    };

    this.invalidateDryRun();
    this.message.set('');
    this.error.set('');
  }

  closeEditor(): void {
    this.editorMode.set(null);
    this.sourceUpdateTime =
      null;
    this.invalidateDryRun();
  }

  generateProductId(): void {
    if (
      this.editorMode() !==
      'create'
    ) {
      return;
    }

    const base =
      this.draft.content.pt.name ||
      this.draft.content.en.name;

    const slug =
      base
        .normalize('NFKD')
        .replace(
          /\p{Diacritic}/gu,
          ''
        )
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          '-'
        )
        .replace(
          /^-+|-+$/g,
          ''
        )
        .slice(0, 120)
        .replace(/-+$/g, '');

    this.draft.id =
      slug;

    this.invalidateDryRun();
  }

  invalidateDryRun(): void {
    this.productDryRun.set(
      null
    );
    this.ownerConfirmed.set(
      false
    );
  }

  setOwnerConfirmed(
    value: boolean
  ): void {
    this.ownerConfirmed.set(
      value
    );
  }

  async refresh(): Promise<void> {
    if (
      !this.csrf ||
      this.loading()
    ) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.message.set('');

    try {
      const result =
        await this.call<
          StoreAdminOverviewResponse
        >({
          action: 'overview'
        });

      this.overview.set(
        result
      );

      this.message.set(
        `Catálogo atualizado: ` +
        `${result.summary.totalProducts} produtos.`
      );
    } catch (error) {
      this.fail(error);
    } finally {
      this.loading.set(false);
    }
  }

  async runProductDryRun(
    operation:
      StoreAdminProductOperation
  ): Promise<void> {
    if (
      this.loading()
    ) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.message.set('');
    this.ownerConfirmed.set(
      false
    );

    try {
      const result =
        await this.call<
          StoreAdminProductDryRun
        >({
          action:
            'dry-run-product',

          operation,

          ...(operation === 'archive'
            ? {
                id:
                  this.draft.id,

                sourceUpdateTime:
                  this.sourceUpdateTime
              }
            : {
                product:
                  this.draft,

                sourceUpdateTime:
                  this.sourceUpdateTime
              })
        });

      this.productDryRun.set(
        result
      );

      this.message.set(
        result.status === 'PASS'
          ? 'DRY RUN aprovado. Revise o plano antes de confirmar.'
          : 'DRY RUN bloqueado. Corrija as pendências.'
      );
    } catch (error) {
      this.fail(error);
    } finally {
      this.loading.set(false);
    }
  }

  async applyProductOperation():
    Promise<void> {
    const dryRun =
      this.productDryRun();

    if (
      !dryRun ||
      dryRun.status !== 'PASS' ||
      !dryRun.dryRunToken ||
      !this.ownerConfirmed() ||
      this.loading()
    ) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.message.set('');

    try {
      let result:
        ProductMutationResult;

      if (
        dryRun.operation ===
        'create'
      ) {
        result =
          await this.call<
            ProductMutationResult
          >({
            action:
              'create-product',

            product:
              this.draft,

            dryRunToken:
              dryRun.dryRunToken,

            ownerConfirmation:
              true
          });
      } else if (
        dryRun.operation ===
        'update'
      ) {
        result =
          await this.call<
            ProductMutationResult
          >({
            action:
              'update-product',

            product:
              this.draft,

            sourceUpdateTime:
              dryRun.sourceUpdateTime,

            dryRunToken:
              dryRun.dryRunToken,

            ownerConfirmation:
              true
          });
      } else {
        result =
          await this.call<
            ProductMutationResult
          >({
            action:
              'archive-product',

            id:
              dryRun.documentId,

            sourceUpdateTime:
              dryRun.sourceUpdateTime,

            dryRunToken:
              dryRun.dryRunToken,

            ownerConfirmation:
              true
          });
      }

      this.message.set(
        `${result.firestore}: ` +
        `products/${result.product.id}`
      );

      this.editorMode.set(
        null
      );

      this.productDryRun.set(
        null
      );

      this.ownerConfirmed.set(
        false
      );

      this.sourceUpdateTime =
        null;

      await this.refresh();
    } catch (error) {
      this.fail(error);

      this.productDryRun.set(
        null
      );

      this.ownerConfirmed.set(
        false
      );
    } finally {
      this.loading.set(false);
    }
  }

  operationLabel(
    operation:
      StoreAdminProductOperation
  ): string {
    if (
      operation === 'create'
    ) {
      return 'CRIAR PRODUTO';
    }

    if (
      operation === 'update'
    ) {
      return 'ATUALIZAR PRODUTO';
    }

    return 'ARQUIVAR PRODUTO';
  }

  originTypeLabel(
    value:
      StoreProductOriginType
  ): string {
    if (value === 'broklin-saga') {
      return 'BROKLIN SAGA';
    }

    if (value === 'jonah-saga') {
      return 'JONAH SAGA';
    }

    if (value === 'global-saga') {
      return 'GLOBAL SAGA';
    }

    if (value === 'system-log') {
      return 'SYSTEM LOG';
    }

    if (value === 'discography') {
      return 'DISCOGRAPHY';
    }

    return 'NONE';
  }

  originAccessLabel(
    value:
      StoreProductOriginType
  ): string {
    if (
      value === 'broklin-saga' ||
      value === 'jonah-saga' ||
      value === 'global-saga'
    ) {
      return 'ACCESS STORY →';
    }

    if (value === 'system-log') {
      return 'ACCESS LOG →';
    }

    if (value === 'discography') {
      return 'ACCESS RELEASE →';
    }

    return '';
  }

  originSourceCollection(
    value:
      StoreProductOriginType
  ): StoreProductOrigin['sourceCollection'] {
    if (value === 'broklin-saga') {
      return 'lore';
    }

    if (value === 'jonah-saga') {
      return 'lore-jonah';
    }

    if (value === 'global-saga') {
      return 'global-sagas';
    }

    if (value === 'system-log') {
      return 'logs';
    }

    if (value === 'discography') {
      return 'discography';
    }

    return '';
  }

  onOriginTypeChange(): void {
    this.draft.origin.sourceCollection =
      this.originSourceCollection(
        this.draft.origin.type
      );

    this.draft.origin.sourceId = '';

    if (
      this.draft.origin.type !==
      'discography'
    ) {
      this.draft.origin.content.pt
        .featuredIn = '';

      this.draft.origin.content.en
        .featuredIn = '';
    }

    if (
      this.draft.origin.type ===
      'none'
    ) {
      this.draft.origin.content.pt
        .title = '';

      this.draft.origin.content.en
        .title = '';

      this.draft.origin.content.pt
        .featuredIn = '';

      this.draft.origin.content.en
        .featuredIn = '';
    }

    this.invalidateDryRun();
  }

  statusLabel(
    value:
      StoreAdminProductStatus
  ): string {
    if (value === 'available') {
      return 'AVAILABLE';
    }

    if (value === 'sold_out') {
      return 'SOLD OUT';
    }

    return 'INACTIVE';
  }

  private emptyDraft():
    StoreAdminProductDraft {
    return {
      id: '',
      faction:
        'tech-lead',
      image: '',
      destinationUrl: '',
      status:
        'available',

      origin: {
        type: 'none',

        sourceCollection: '',

        sourceId: '',

        content: {
          pt: {
            title: '',
            featuredIn: ''
          },

          en: {
            title: '',
            featuredIn: ''
          }
        }
      },

      content: {
        pt: {
          name: '',
          shortDescription: '',
          description: ''
        },

        en: {
          name: '',
          shortDescription: '',
          description: ''
        }
      }
    };
  }

  private async restoreSession():
    Promise<void> {
    try {
      const response =
        await fetch(
          '/api/admin/system-logs',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({
                action:
                  'session'
              }),

            credentials:
              'same-origin',

            cache:
              'no-store'
          }
        );

      const session =
        await response.json() as
          SessionResult & {
            message?: string;
          };

      if (
        !response.ok ||
        !session.authenticated ||
        !session.csrfToken
      ) {
        await this.router.navigate(
          ['/admin']
        );

        return;
      }

      this.csrf =
        session.csrfToken;

      await this.refresh();
    } catch {
      await this.router.navigate(
        ['/admin']
      );
    } finally {
      this.checked.set(true);
    }
  }

  private async call<T>(
    body: object
  ): Promise<T> {
    const response =
      await fetch(
        '/api/admin/store',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            'X-RQS-CSRF':
              this.csrf
          },

          body:
            JSON.stringify(
              body
            ),

          credentials:
            'same-origin',

          cache:
            'no-store'
        }
      );

    const result =
      await response.json() as
        T & {
          message?: string;
        };

    if (!response.ok) {
      if (
        response.status ===
        401
      ) {
        void this.router.navigate(
          ['/admin']
        );
      }

      throw new Error(
        result.message ||
        'Operação recusada pelo módulo Neon Store.'
      );
    }

    return result;
  }

  private fail(
    error: unknown
  ): void {
    this.error.set(
      error instanceof Error
        ? error.message
        : 'Falha inesperada no módulo Neon Store.'
    );
  }
}
