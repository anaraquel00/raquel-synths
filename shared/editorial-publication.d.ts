export const RQS_EDITORIAL_TIME_ZONE: 'America/Recife';

export interface PublicationCandidate {
  published: boolean;
  releaseDate: string | null | undefined;
}

export function getEditorialDateKey(
  now?: Date,
  timeZone?: string
): string;

export function isPublicationEligible(
  candidate: PublicationCandidate,
  now?: Date,
  timeZone?: string
): boolean;

export function normalizeLegacyPublicationFlag(
  published: unknown
): boolean;
