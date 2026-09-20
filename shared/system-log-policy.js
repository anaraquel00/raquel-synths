/**
 * Shared System Log containment policy.
 *
 * This neutral JavaScript manifest is consumed by both the Angular/SSR
 * bundle and the Vercel sitemap function. Logs absent from this map keep
 * the normal public/indexable/monetizable behavior.
 */
export const SYSTEM_LOG_POLICY = Object.freeze({
  '2026-04-27-log': Object.freeze({ indexable: false, monetizable: false }),
  '2026-05-04-log': Object.freeze({ indexable: false, monetizable: false }),
  '2026-05-11-log': Object.freeze({ indexable: false, monetizable: false }),
  '2026-05-18-log': Object.freeze({ indexable: false, monetizable: false }),
  '2026-05-25-log': Object.freeze({ indexable: false, monetizable: false }),
  '2026-06-01-log': Object.freeze({ indexable: false, monetizable: false }),
  '2026-06-08-log': Object.freeze({ indexable: false, monetizable: false }),
  '2026-06-15-log': Object.freeze({ indexable: false, monetizable: false }),
  '2026-06-22-log': Object.freeze({ indexable: false, monetizable: false }),
  '2026-07-13-log': Object.freeze({ indexable: false, monetizable: false }),
  'system-archive': Object.freeze({ indexable: false, monetizable: false })
});

export const getSystemLogPolicy = (id) =>
  SYSTEM_LOG_POLICY[id] ?? { indexable: true, monetizable: true };
