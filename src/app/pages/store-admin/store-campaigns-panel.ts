import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  StoreAdminCampaign,
  StoreAdminCampaignDryRun,
  StoreAdminCampaignRecord,
  StoreCampaignPlacement,
  StoreCampaignStatus
} from '../../models/store-admin.model';

interface SessionResult {
  authenticated: boolean;
  csrfToken?: string;
}

interface CampaignMutationResult {
  firestore:
    'CREATED'
    | 'UPDATED';

  campaign:
    StoreAdminCampaignRecord;
}

@Component({
  selector:
    'app-store-campaigns-panel',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './store-campaigns-panel.html',

  styleUrl:
    './store-campaigns-panel.scss'
})
export class StoreCampaignsPanelComponent
implements OnInit {
  readonly checked =
    signal(false);

  readonly loading =
    signal(false);

  readonly campaigns =
    signal<StoreAdminCampaignRecord[]>(
      []
    );

  readonly editorMode =
    signal<'create' | 'edit' | null>(
      null
    );

  readonly dryRun =
    signal<StoreAdminCampaignDryRun | null>(
      null
    );

  readonly ownerConfirmed =
    signal(false);

  readonly error =
    signal('');

  readonly message =
    signal('');

  readonly statuses:
    StoreCampaignStatus[] = [
      'draft',
      'scheduled',
      'active',
      'paused',
      'expired'
    ];

  readonly placements:
    StoreCampaignPlacement[] = [
      'hero-signal',
      'current-signal'
    ];

  readonly merchants = [
    'mercado-livre',
    'shein',
    'amazon',
    'aliexpress'
  ] as const;

  draft:
    StoreAdminCampaign =
      this.emptyDraft();

  linkedProductsText = '';
  startLocal = '';
  endLocal = '';

  private csrf = '';

  private sourceUpdateTime:
    string | null = null;

  constructor(
    @Inject(PLATFORM_ID)
    private readonly platformId:
      object,

    private readonly router:
      Router
  ) {}

  ngOnInit(): void {
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

  startCreate(): void {
    this.editorMode.set(
      'create'
    );

    this.draft =
      this.emptyDraft();

    this.linkedProductsText = '';
    this.startLocal = '';
    this.endLocal = '';
    this.sourceUpdateTime = null;

    this.invalidateDryRun();
    this.error.set('');
    this.message.set('');
  }

  startEdit(
    campaign:
      StoreAdminCampaignRecord
  ): void {
    this.editorMode.set(
      'edit'
    );

    this.sourceUpdateTime =
      campaign.updateTime;

    this.draft = {
      id:
        campaign.id,

      status:
        campaign.status,

      merchant:
        campaign.merchant,

      placement:
        campaign.placement,

      priority:
        campaign.priority,

      destinationUrl:
        campaign.destinationUrl,

      image:
        campaign.image,

      startAt:
        campaign.startAt,

      endAt:
        campaign.endAt,

      linkedProductIds: [
        ...campaign.linkedProductIds
      ],

      content: {
        pt: {
          ...campaign.content.pt
        },

        en: {
          ...campaign.content.en
        }
      }
    };

    this.linkedProductsText =
      campaign.linkedProductIds
        .join(', ');

    this.startLocal =
      this.toLocalInput(
        campaign.startAt
      );

    this.endLocal =
      this.toLocalInput(
        campaign.endAt
      );

    this.invalidateDryRun();
    this.error.set('');
    this.message.set('');
  }

  closeEditor(): void {
    this.editorMode.set(null);
    this.sourceUpdateTime = null;
    this.invalidateDryRun();
  }

  generateCampaignId(): void {
    if (
      this.editorMode() !==
      'create'
    ) {
      return;
    }

    const base =
      this.draft.content.pt.title ||
      this.draft.content.en.title ||
      'campaign';

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
        .slice(0, 100)
        .replace(/-+$/g, '');

    this.draft.id =
      slug || 'campaign';

    this.invalidateDryRun();
  }

  invalidateDryRun(): void {
    this.dryRun.set(null);
    this.ownerConfirmed.set(false);
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
        await this.call<{
          campaigns:
            StoreAdminCampaignRecord[];
        }>({
          action:
            'list-campaigns'
        });

      this.campaigns.set(
        result.campaigns
      );
    } catch (error) {
      this.fail(error);
    } finally {
      this.loading.set(false);
    }
  }

  async runDryRun():
    Promise<void> {
    const mode =
      this.editorMode();

    if (
      !mode ||
      this.loading()
    ) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.message.set('');
    this.ownerConfirmed.set(false);

    try {
      const campaign =
        this.buildCampaign();

      const result =
        await this.call<
          StoreAdminCampaignDryRun
        >({
          action:
            'dry-run-campaign',

          operation:
            mode,

          campaign,

          sourceUpdateTime:
            this.sourceUpdateTime
        });

      this.dryRun.set(
        result
      );

      this.message.set(
        result.status === 'PASS'
          ? 'Campaign DRY RUN aprovado.'
          : 'Campaign DRY RUN bloqueado.'
      );
    } catch (error) {
      this.fail(error);
    } finally {
      this.loading.set(false);
    }
  }

  async applyCampaign():
    Promise<void> {
    const result =
      this.dryRun();

    if (
      !result ||
      result.status !== 'PASS' ||
      !result.dryRunToken ||
      !this.ownerConfirmed() ||
      this.loading()
    ) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.message.set('');

    try {
      const campaign =
        this.buildCampaign();

      const response =
        await this.call<
          CampaignMutationResult
        >({
          action:
            result.operation ===
              'create'
              ? 'create-campaign'
              : 'update-campaign',

          campaign,

          sourceUpdateTime:
            result.sourceUpdateTime,

          dryRunToken:
            result.dryRunToken,

          ownerConfirmation:
            true
        });

      this.message.set(
        `${response.firestore}: ` +
        `store-campaigns/` +
        `${response.campaign.id}`
      );

      this.editorMode.set(null);
      this.dryRun.set(null);
      this.ownerConfirmed.set(false);
      this.sourceUpdateTime = null;

      await this.refresh();
    } catch (error) {
      this.fail(error);
      this.dryRun.set(null);
      this.ownerConfirmed.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  effectiveLabel(
    campaign:
      StoreAdminCampaignRecord
  ): string {
    return campaign.effectiveStatus
      .toUpperCase();
  }

  private buildCampaign():
    StoreAdminCampaign {
    return {
      ...this.draft,

      priority:
        Number(
          this.draft.priority
        ),

      startAt:
        this.toIso(
          this.startLocal
        ),

      endAt:
        this.toIso(
          this.endLocal
        ),

      linkedProductIds:
        this.linkedProductsText
          .split(',')
          .map(item =>
            item.trim()
          )
          .filter(Boolean)
    };
  }

  private toIso(
    value: string
  ): string | null {
    if (!value) return null;

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toISOString();
  }

  private toLocalInput(
    value:
      string | null
  ): string {
    if (!value) return '';

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '';
    }

    const offset =
      date.getTimezoneOffset();

    const local =
      new Date(
        date.getTime() -
        offset * 60_000
      );

    return local
      .toISOString()
      .slice(0, 16);
  }

  private emptyDraft():
    StoreAdminCampaign {
    return {
      id: '',
      status: 'draft',
      merchant:
        'mercado-livre',
      placement:
        'hero-signal',
      priority: 100,
      destinationUrl: '',
      image: '',
      startAt: null,
      endAt: null,
      linkedProductIds: [],

      content: {
        pt: {
          kicker:
            'AFFILIATE SIGNAL',
          title: '',
          offerLabel: '',
          supportingText: '',
          ctaLabel:
            'VER OFERTA ↗'
        },

        en: {
          kicker:
            'AFFILIATE SIGNAL',
          title: '',
          offerLabel: '',
          supportingText: '',
          ctaLabel:
            'VIEW OFFER ↗'
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
                action: 'session'
              }),

            credentials:
              'same-origin',

            cache:
              'no-store'
          }
        );

      const session =
        (await response.json()) as SessionResult;

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

          credentials:
            'same-origin',

          cache:
            'no-store',

          body:
            JSON.stringify(body)
        }
      );

    const result =
      (await response.json()) as T & {
        message?: string;
      };

    if (!response.ok) {
      throw new Error(
        result.message ||
        'Operação recusada pelo Campaign Engine.'
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
        : 'Falha inesperada no Campaign Engine.'
    );
  }
}
