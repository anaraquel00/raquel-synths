export type SocialSourceType = 'system_log' | 'saga_episode' | 'music_release';
export type SocialDestination = 'instagram' | 'facebook';
export type SocialAssetType = 'IMAGE' | 'VIDEO' | 'REEL' | 'CAROUSEL' | 'STORY';
export type SocialPackageStatus = 'DRAFT' | 'APPROVED' | 'CANCELED' |
  'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';

export interface NormalizedSource {
  sourceType: SocialSourceType;
  sourceId: string;
  sourceUrl: string;
  title: string;
  summary: string;
  canonicalUrl: string;
  primaryImage?: string;
  publishedAt: string;
  language: 'pt-BR' | 'en-US';
  sourceRevision: string;
  musicDeepLinkUrl?: string;
  arc?: string;
  season?: number;
  episode?: number;
  team?: string;
  artist?: string;
  releaseType?: string;
  soundcloudUrl?: string;
  spotifyUrl?: string;
  logType?: string;
  logDate?: string;
}

export interface SocialPackageDraft {
  id?: string;
  sourceType: SocialSourceType;
  sourceId: string;
  sourceUrl: string;
  sourceRevision: string;
  language: 'pt-BR' | 'en-US';
  socialAssetUrl: string;
  socialAssetType: SocialAssetType;
  instagramCaption: string;
  facebookCaption: string;
  cta: string;
  destinationUrl: string;
  utmCampaign: string;
  utmContent: string;
  destinations: SocialDestination[];
  createdAt?: string;
  approvedAt?: string | null;
  publishedAt?: string | null;
  status?: SocialPackageStatus;
  sourceStale?: boolean;
  approvalValid?: boolean;
  instagramDelivery?: SocialDelivery | null;
}

export interface DryRunCheck {
  code: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

export interface DryRunDiagnostics {
  status: 'PASS' | 'FAIL';
  checks: DryRunCheck[];
}

export type MetaConnectionStatus = 'NOT_CONFIGURED' | 'READY' | 'ERROR';

export interface MetaPlatformDiagnostics {
  platform: SocialDestination;
  status: MetaConnectionStatus;
  missingConfiguration: string[];
  requiredPermissions: string[];
  missingPermissions: string[];
  identity?: { id?: string; name?: string; username?: string; accountType?: string };
  capabilities: { feed: boolean; reels: boolean; stories: boolean };
  checks: DryRunCheck[];
}

export interface MetaConnectionDiagnostics {
  graphApiVersion: string;
  checkedAt: string;
  publishingEnabled: boolean;
  writeGate: {
    flagEnabled: boolean;
    previewEnvironment: boolean;
    branchMatch: boolean;
    enabled: boolean;
  };
  facebook: MetaPlatformDiagnostics;
  instagram: MetaPlatformDiagnostics;
  relationship: { status: 'NOT_CHECKED' | 'MATCH' | 'MISMATCH' | 'MISSING' };
  token: { valid: boolean; appIdMatches: boolean; expiresAt: string | null; dataAccessExpiresAt: string | null };
}

export type SocialDeliveryStatus = 'NOT_STARTED' | 'PENDING' | 'CONTAINER_CREATED' |
  'PUBLISHING' | 'PUBLISHED' | 'FAILED';

export interface SocialDelivery {
  status: SocialDeliveryStatus;
  idempotencyKey: string;
  remoteContainerId: string | null;
  remotePostId: string | null;
  attemptCount: number;
  lastError: string | null;
  publishedAt: string | null;
}
