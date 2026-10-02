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
  readOnly: true;
  summary: StoreAdminCatalogSummary;
  products: StoreAdminProduct[];
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
  status: StoreCampaignStatus;
  merchant: Exclude<
    StoreAdminMerchant,
    'stripe' | 'partner' | 'unknown'
  >;
  placement: StoreCampaignPlacement;
  priority: number;
  destinationUrl: string;
  image: string;
  startAt: string | null;
  endAt: string | null;
  linkedProductIds: string[];
  content: {
    pt: StoreAdminCampaignContent;
    en: StoreAdminCampaignContent;
  };
}
