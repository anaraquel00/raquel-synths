export type StoreAdminMerchant =
  | 'shein'
  | 'mercado-livre'
  | 'amazon'
  | 'aliexpress'
  | 'stripe'
  | 'partner'
  | 'unknown';

export type StoreAdminProductStatus =
  | 'available'
  | 'sold_out'
  | 'inactive';

export type StoreAdminProductType =
  | 'affiliate'
  | 'official'
  | 'unknown';

export type StoreAdminFaction =
  | 'tech-lead'
  | 'synth-general'
  | 'sonic-arsenal'
  | 'neon-witch'
  | 'rust-riot'
  | 'backstage-vip'
  | string;

export type StoreAdminProductOperation =
  | 'create'
  | 'update'
  | 'archive';

export type StoreProductOriginType =
  | 'none'
  | 'broklin-saga'
  | 'jonah-saga'
  | 'global-saga'
  | 'system-log'
  | 'discography';

export type StoreProductOriginCollection =
  | ''
  | 'lore'
  | 'lore-jonah'
  | 'global-sagas'
  | 'logs'
  | 'discography';

export interface StoreProductOriginLocalizedContent {
  title: string;
  featuredIn: string;
}

export interface StoreProductOrigin {
  type: StoreProductOriginType;

  sourceCollection:
    StoreProductOriginCollection;

  sourceId: string;

  content: {
    pt:
      StoreProductOriginLocalizedContent;

    en:
      StoreProductOriginLocalizedContent;
  };
}

export const STORE_ADMIN_ORIGIN_TYPES: StoreProductOriginType[] = [
  'none',
  'broklin-saga',
  'jonah-saga',
  'global-saga',
  'system-log',
  'discography'
];

export const STORE_ADMIN_AFFILIATE_MERCHANTS: StoreAdminMerchant[] = [
  'shein',
  'mercado-livre',
  'amazon',
  'aliexpress'
];

export const STORE_ADMIN_FACTIONS: StoreAdminFaction[] = [
  'tech-lead',
  'synth-general',
  'sonic-arsenal',
  'neon-witch',
  'rust-riot'
];

export const STORE_ADMIN_STATUSES: StoreAdminProductStatus[] = [
  'available',
  'sold_out',
  'inactive'
];

export interface StoreAdminLocalizedContent {
  name: string;
  shortDescription: string;
  description: string;
}

export interface StoreAdminProductDraft {
  id: string;
  faction: string;
  image: string;
  destinationUrl: string;
  status: StoreAdminProductStatus;
  origin: StoreProductOrigin;
  content: {
    pt: StoreAdminLocalizedContent;
    en: StoreAdminLocalizedContent;
  };
}

export interface StoreAdminProduct {
  id: string;
  faction: StoreAdminFaction;
  image: string;

  destinationUrl: string;
  sourceUrlField:
    | 'destinationUrl'
    | 'stripeUrl'
    | 'link'
    | 'url'
    | null;

  merchant: StoreAdminMerchant;
  merchantLabel: string;
  productType: StoreAdminProductType;

  rawStatus: string | null;
  status: StoreAdminProductStatus;

  visibleInStore: boolean;
  legacyDestinationField: boolean;
  updateTime: string | null;

  origin: StoreProductOrigin;

  content: {
    pt: StoreAdminLocalizedContent;
    en: StoreAdminLocalizedContent;
  };

  warnings: string[];
}

export interface StoreAdminCatalogSummary {
  totalProducts: number;
  visibleAffiliateProducts: number;
  hiddenProducts: number;
  productsWithWarnings: number;
  legacyDestinationProducts: number;
  missingShortDescriptions: number;
  merchantCounts: Record<StoreAdminMerchant, number>;
}

export interface StoreAdminOverviewResponse {
  generatedAt: string;
  collection: 'products';
  readOnly: boolean;
  summary: StoreAdminCatalogSummary;
  products: StoreAdminProduct[];
}

export interface StoreAdminProductDryRun {
  operation: StoreAdminProductOperation;
  status: 'PASS' | 'BLOCKED';
  blocked: string[];
  warnings: string[];

  documentId: string;
  documentPath: string;
  merchant: StoreAdminMerchant | null;

  sourceUpdateTime: string | null;
  firestoreWrites: 0;
  dryRunToken: string | null;

  writePlan: {
    operation: 'CREATE' | 'UPDATE' | 'ARCHIVE';
    fields: string[];
  };

  preview: StoreAdminProductDraft | null;
}

export type StoreCampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'expired';

export type StoreCampaignPlacement =
  | 'hero-signal'
  | 'current-signal';

export interface StoreAdminCampaignContent {
  kicker: string;
  title: string;
  offerLabel: string;
  supportingText: string;
  ctaLabel: string;
}

export interface StoreAdminCampaign {
  id: string;

  status:
    StoreCampaignStatus;

  merchant:
    'mercado-livre'
    | 'shein'
    | 'amazon'
    | 'aliexpress';

  placement:
    StoreCampaignPlacement;

  priority: number;

  destinationUrl: string;
  image: string;

  startAt: string | null;
  endAt: string | null;

  linkedProductIds: string[];

  content: {
    pt:
      StoreAdminCampaignContent;

    en:
      StoreAdminCampaignContent;
  };
}

export interface StoreAdminCampaignRecord
extends StoreAdminCampaign {
  merchantLabel: string;

  effectiveStatus:
    StoreCampaignStatus;

  updateTime:
    string | null;

  warnings: string[];
}

export interface StoreAdminCampaignDryRun {
  operation:
    'create'
    | 'update';

  status:
    'PASS'
    | 'BLOCKED';

  blocked: string[];
  warnings: string[];

  documentId: string;
  documentPath: string;

  sourceUpdateTime:
    string | null;

  firestoreWrites: 0;

  dryRunToken:
    string | null;

  writePlan: {
    operation:
      'CREATE'
      | 'UPDATE';

    fields: string[];
  };

  preview:
    | (
        StoreAdminCampaign & {
          effectiveStatus?:
            StoreCampaignStatus;
        }
      )
    | null;
}
