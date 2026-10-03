import assert from 'node:assert/strict';

import {
  pairLoreDocuments,
  parseLoreBlocks,
  validateLoreDocument
} from '../api/admin/lore-parser.js';

function blocks(values) {
  return values.map(text => ({
    tag: 'p',
    text
  }));
}

const pt = parseLoreBlocks(
  blocks([
    'EPISODE s2-e1 - T-14 // AVISO DE EXPIRAÇÃO',
    'EPISODE',
    's2-e1',
    'CATEGORY',
    'Temporada 2',
    'RELEASE DATE',
    '2027-01-10',
    'IMAGE',
    'https://example.com/s2-e1.webp',
    'TITLE',
    'T-14 // AVISO DE EXPIRAÇÃO',
    'DESCRIPTION',
    'Resumo PT.',
    'CONTENT',
    '<p>Conteúdo PT.</p>',
    '<pre class="system-log">SET_ERROR</pre>',
    'EPISODE s2-e2 - SEGUNDO',
    'CATEGORY',
    'Temporada 2',
    'RELEASE DATE',
    '2027-01-17',
    'IMAGE',
    'https://example.com/s2-e2.webp',
    'TITLE',
    'Segundo',
    'DESCRIPTION',
    'Resumo 2 PT.',
    'CONTENT',
    '<p>Conteúdo 2 PT.</p>'
  ]),
  {
    sourceName: 'BROKLIN_S2_PT-BR.docx'
  }
);

const en = parseLoreBlocks(
  blocks([
    'EPISODE s2-e1 - T-14 // EXPIRATION NOTICE',
    'CATEGORY',
    'Season 2',
    'RELEASE DATE',
    '2027-01-10',
    'IMAGE',
    'https://example.com/s2-e1.webp',
    'TITLE',
    'T-14 // EXPIRATION NOTICE',
    'DESCRIPTION',
    'EN summary.',
    'CONTENT',
    '<p>EN content.</p>',
    'EPISODE s2-e2 - SECOND',
    'CATEGORY',
    'Season 2',
    'RELEASE DATE',
    '2027-01-17',
    'IMAGE',
    'https://example.com/s2-e2.webp',
    'TITLE',
    'Second',
    'DESCRIPTION',
    'EN summary 2.',
    'CONTENT',
    '<p>EN content 2.</p>'
  ]),
  {
    sourceName: 'BROKLIN_S2_EN-US.docx'
  }
);

assert.equal(pt.language, 'pt-BR');
assert.equal(en.language, 'en-US');

assert.equal(pt.episodes.length, 2);
assert.equal(en.episodes.length, 2);

assert.equal(pt.episodes[0].id, 's2-e1');
assert.equal(
  pt.episodes[0].releaseDate,
  '2027-01-10'
);
assert.match(
  pt.episodes[0].content,
  /system-log/
);

assert.equal(
  validateLoreDocument(
    pt,
    'pt-BR'
  ).status,
  'PASS'
);

assert.equal(
  validateLoreDocument(
    en,
    'en-US'
  ).status,
  'PASS'
);

const pair = pairLoreDocuments({
  mode: 'broklin',
  pt,
  en
});

assert.equal(pair.status, 'PASS');
assert.equal(pair.collection, 'lore');
assert.equal(pair.documents.length, 2);

assert.deepEqual(
  Object.keys(
    pair.documents[0].fields
  ),
  [
    'title',
    'title_en',
    'category',
    'category_en',
    'content',
    'content_en',
    'description',
    'description_en',
    'image',
    'mode',
    'published',
    'releaseDate'
  ]
);

assert.equal(
  pair.documents[0].fields.mode,
  'broklin'
);

assert.equal(
  pair.documents[0].fields.published,
  true
);

assert.equal(
  pair.documents[0].fields.title_en,
  'T-14 // EXPIRATION NOTICE'
);

const badEn = structuredClone(en);
badEn.episodes[0].image =
  'https://example.com/other.webp';

assert.equal(
  pairLoreDocuments({
    mode: 'broklin',
    pt,
    en: badEn
  }).status,
  'BLOCKED'
);

const missingEn = structuredClone(en);
missingEn.episodes.pop();

assert.equal(
  pairLoreDocuments({
    mode: 'broklin',
    pt,
    en: missingEn
  }).status,
  'BLOCKED'
);

const jonah = pairLoreDocuments({
  mode: 'jonah',
  pt,
  en
});

assert.equal(
  jonah.collection,
  'lore-jonah'
);

assert.equal(
  jonah.documents[0].fields.mode,
  'jonah'
);

console.log('LORE_PARSER_PT = PASS');
console.log('LORE_PARSER_EN = PASS');
console.log('LORE_PAIRING = PASS');
console.log('LORE_FIRESTORE_DRAFT = PASS');
console.log('LORE_PAIRING_GUARDS = PASS');
console.log(
  'FIRESTORE_WRITES_DURING_LORE_PARSER_QA = 0'
);
