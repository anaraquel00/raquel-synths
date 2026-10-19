export const RQS_EDITORIAL_TIME_ZONE = 'America/Recife';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateOnly = (value) => {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day;
};

export const getEditorialDateKey = (
  now = new Date(),
  timeZone = RQS_EDITORIAL_TIME_ZONE
) => {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    return '';
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts
      .filter(part => part.type === 'year' || part.type === 'month' || part.type === 'day')
      .map(part => [part.type, part.value])
  );

  return values.year && values.month && values.day
    ? `${values.year}-${values.month}-${values.day}`
    : '';
};

export const isPublicationEligible = (
  { published, releaseDate },
  now = new Date(),
  timeZone = RQS_EDITORIAL_TIME_ZONE
) => {
  if (published !== true || typeof releaseDate !== 'string') {
    return false;
  }

  const normalizedReleaseDate = releaseDate.trim();

  if (DATE_ONLY_PATTERN.test(normalizedReleaseDate)) {
    if (!isValidDateOnly(normalizedReleaseDate)) {
      return false;
    }

    const editorialDate = getEditorialDateKey(now, timeZone);
    return Boolean(editorialDate) && normalizedReleaseDate <= editorialDate;
  }

  const releaseTime = Date.parse(normalizedReleaseDate);
  return Number.isFinite(releaseTime) && releaseTime <= now.getTime();
};

// System Logs anteriores ao campo published já eram documentos aprovados.
// A normalização mantém esse arquivo público sem permitir published: false.
export const normalizeLegacyPublicationFlag = (published) =>
  published === undefined || published === null
    ? true
    : published === true;
