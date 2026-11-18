import {
  buildLogsArchiveCanonical,
  getLogsArchiveTotalPages,
  isLogsArchivePageInRange,
  paginateArchiveLogs,
  parseLogsArchivePageParam,
  prepareArchiveLogs
} from './logs-archive.utils';

describe('logs archive pagination policy', () => {
  const logs = Array.from({ length: 44 }, (_, index) => ({
    id: `log-${index + 1}`,
    date: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    isArchiveLink: false
  }));

  it('keeps all published content logs instead of dropping the four newest', () => {
    const prepared = prepareArchiveLogs([
      ...logs,
      {
        id: 'archive-link',
        date: '2026-12-31',
        isArchiveLink: true
      }
    ]);

    expect(prepared.length).toBe(44);
    expect(prepared.some(log => log.id === 'archive-link')).toBeFalse();
  });

  it('sorts logs in descending chronological order', () => {
    const prepared = prepareArchiveLogs([
      { id: 'older', date: '2026-01-01' },
      { id: 'newer', date: '2026-11-16' },
      { id: 'middle', date: '2026-05-01' }
    ]);

    expect(prepared.map(log => log.id))
      .toEqual(['newer', 'middle', 'older']);
  });

  it('calculates nine pages for 44 logs at five items per page', () => {
    expect(getLogsArchiveTotalPages(44, 5)).toBe(9);

    const prepared = prepareArchiveLogs(logs);
    expect(paginateArchiveLogs(prepared, 0, 5).length).toBe(5);
    expect(paginateArchiveLogs(prepared, 8, 5).length).toBe(4);
  });

  it('accepts root and positive integer pages, and normalizes page=0', () => {
    expect(parseLogsArchivePageParam(null))
      .toEqual({ kind: 'root', index: 0 });
    expect(parseLogsArchivePageParam('0'))
      .toEqual({ kind: 'redirect-root', index: 0 });
    expect(parseLogsArchivePageParam('1'))
      .toEqual({ kind: 'page', index: 1 });
    expect(parseLogsArchivePageParam('8'))
      .toEqual({ kind: 'page', index: 8 });
  });

  it('rejects malformed page parameters', () => {
    for (const invalid of ['-1', 'abc', '1.5', '']) {
      expect(parseLogsArchivePageParam(invalid).kind)
        .withContext(invalid)
        .toBe('invalid');
    }
  });

  it('rejects pages outside the dynamic archive range', () => {
    expect(isLogsArchivePageInRange(0, 9, 44)).toBeTrue();
    expect(isLogsArchivePageInRange(1, 9, 44)).toBeTrue();
    expect(isLogsArchivePageInRange(8, 9, 44)).toBeTrue();
    expect(isLogsArchivePageInRange(999, 9, 44)).toBeFalse();
  });

  it('builds a unique canonical for every valid page', () => {
    expect(buildLogsArchiveCanonical(0))
      .toBe('https://raquelsynths.com/logs-archive');
    expect(buildLogsArchiveCanonical(1))
      .toBe('https://raquelsynths.com/logs-archive?page=1');
    expect(buildLogsArchiveCanonical(2))
      .toBe('https://raquelsynths.com/logs-archive?page=2');
    expect(buildLogsArchiveCanonical(8))
      .toBe('https://raquelsynths.com/logs-archive?page=8');
  });
});
