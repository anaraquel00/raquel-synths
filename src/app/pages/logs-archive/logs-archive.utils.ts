export type LogsArchivePageParam =
  | { kind: 'root'; index: 0 }
  | { kind: 'page'; index: number }
  | { kind: 'redirect-root'; index: 0 }
  | { kind: 'invalid'; index: null };

export function parseLogsArchivePageParam(
  rawPage: string | null
): LogsArchivePageParam {
  if (rawPage === null) {
    return { kind: 'root', index: 0 };
  }

  if (!/^\d+$/.test(rawPage)) {
    return { kind: 'invalid', index: null };
  }

  const page = Number(rawPage);

  if (!Number.isSafeInteger(page)) {
    return { kind: 'invalid', index: null };
  }

  if (page === 0) {
    return { kind: 'redirect-root', index: 0 };
  }

  return { kind: 'page', index: page };
}

export function prepareArchiveLogs<T extends {
  date?: string;
  isArchiveLink?: boolean;
}>(
  logs: readonly T[]
): T[] {
  return [...logs]
    .filter(log => !log.isArchiveLink)
    .sort((a, b) => {
      const aTime = typeof a.date === 'string'
        ? new Date(a.date).getTime()
        : Number.NEGATIVE_INFINITY;
      const bTime = typeof b.date === 'string'
        ? new Date(b.date).getTime()
        : Number.NEGATIVE_INFINITY;

      return bTime - aTime;
    });
}

export function getLogsArchiveTotalPages(
  logCount: number,
  pageSize: number
): number {
  if (pageSize <= 0) {
    return 0;
  }

  return Math.ceil(Math.max(0, logCount) / pageSize);
}

export function isLogsArchivePageInRange(
  pageIndex: number,
  totalPages: number,
  logCount: number
): boolean {
  if (!Number.isSafeInteger(pageIndex) || pageIndex < 0) {
    return false;
  }

  if (pageIndex === 0) {
    return true;
  }

  return logCount > 0 && pageIndex < totalPages;
}

export function paginateArchiveLogs<T>(
  logs: readonly T[],
  pageIndex: number,
  pageSize: number
): T[] {
  const start = pageIndex * pageSize;
  return logs.slice(start, start + pageSize);
}

export function buildLogsArchiveCanonical(
  pageIndex: number
): string {
  const base = 'https://raquelsynths.com/logs-archive';

  return pageIndex === 0
    ? base
    : `${base}?page=${pageIndex}`;
}
