import assert from 'node:assert/strict';
import test from 'node:test';

import { firestoreFields } from '../api/admin/system-logs.js';
import {
  getEditorialDateKey,
  isPublicationEligible,
  normalizeLegacyPublicationFlag,
  RQS_EDITORIAL_TIME_ZONE
} from '../shared/editorial-publication.js';

const releaseDate = '2026-10-19';
const beforeRecifeMidnight = new Date('2026-10-19T02:59:59.000Z');
const atRecifeMidnight = new Date('2026-10-19T03:00:00.000Z');

const eligible = (published, now, date = releaseDate) =>
  isPublicationEligible({
    published: normalizeLegacyPublicationFlag(published),
    releaseDate: date
  }, now);

test('usa America/Recife como calendário editorial para date-only', () => {
  assert.equal(RQS_EDITORIAL_TIME_ZONE, 'America/Recife');
  assert.equal(getEditorialDateKey(beforeRecifeMidnight), '2026-10-18');
  assert.equal(getEditorialDateKey(atRecifeMidnight), '2026-10-19');
  assert.equal(eligible(true, beforeRecifeMidnight), false);
  assert.equal(eligible(true, atRecifeMidnight), true);
});

test('preserva legado aprovado sem published e respeita a data editorial', () => {
  assert.equal(eligible(undefined, beforeRecifeMidnight), false);
  assert.equal(eligible(undefined, atRecifeMidnight), true);
  assert.equal(eligible(undefined, atRecifeMidnight, '2026-10-18'), true);
});

test('published explícito controla a elegibilidade sem furar o gate temporal', () => {
  assert.equal(eligible(true, atRecifeMidnight, '2026-10-18'), true);
  assert.equal(eligible(true, beforeRecifeMidnight), false);
  assert.equal(eligible(false, atRecifeMidnight, '2026-10-18'), false);
  assert.equal(eligible(false, atRecifeMidnight, '2020-01-01'), false);
});

test('rejeita datas date-only inválidas', () => {
  assert.equal(eligible(true, atRecifeMidnight, '2026-02-30'), false);
  assert.equal(eligible(true, atRecifeMidnight, ''), false);
});

test('novos imports de System Log normalizam published=true', () => {
  const fields = firestoreFields({
    date: releaseDate,
    image: 'https://raquelsynths.com/log.webp',
    pt: { title: 'PT', description: 'PT', techContent: 'PT', jonahComment: '' },
    en: { title: 'EN', description: 'EN', techContent: 'EN', jonahComment: '' }
  });

  assert.deepEqual(fields.published, { booleanValue: true });
});
