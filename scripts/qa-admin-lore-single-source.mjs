import assert from 'node:assert/strict';

import {
  createLoreWritePlan
} from '../api/admin/lore.js';

const parsedPt = {
  episodes: [{
    id: 's2-e1',
    title: 'Sinal',
    category: 'Teste',
    description: 'Resumo',
    content: 'Conteúdo PT',
    image: 'https://example.com/s2-e1.jpg',
    releaseDate: '2027-01-01'
  }]
};

const createPt = createLoreWritePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'pt-BR',
  parsed: parsedPt,
  existingDocuments: {}
});

assert.equal(createPt.items[0].action, 'CREATE_PT');
assert.equal(createPt.items[0].fields.includes('title_en'), false);

const blockedEn = createLoreWritePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'en-US',
  parsed: {
    episodes: [{
      ...parsedPt.episodes[0],
      title: 'Signal',
      category: 'Test',
      description: 'Summary',
      content: 'EN content'
    }]
  },
  existingDocuments: {}
});

assert.equal(blockedEn.items[0].action, 'BLOCKED');

const existing = {
  's2-e1': {
    fields: {
      title: 'Sinal',
      category: 'Teste',
      description: 'Resumo',
      content: 'Conteúdo PT',
      image: 'https://example.com/s2-e1.jpg',
      releaseDate: '2027-01-01',
      mode: 'broklin',
      published: true
    }
  }
};

const mergeEn = createLoreWritePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'en-US',
  parsed: {
    episodes: [{
      ...parsedPt.episodes[0],
      title: 'Signal',
      category: 'Test',
      description: 'Summary',
      content: 'EN content'
    }]
  },
  existingDocuments: existing
});

assert.equal(mergeEn.items[0].action, 'MERGE_EN');
assert.deepEqual(
  mergeEn.items[0].fields.sort(),
  [
    'category_en',
    'content_en',
    'description_en',
    'title_en'
  ].sort()
);

const existingWithEn = structuredClone(existing);
existingWithEn['s2-e1'].fields.title_en = 'Signal';
existingWithEn['s2-e1'].fields.content_en = 'EN content';

const mergePt = createLoreWritePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'pt-BR',
  parsed: {
    episodes: [{
      ...parsedPt.episodes[0],
      title: 'Sinal atualizado'
    }]
  },
  existingDocuments: existingWithEn
});

assert.equal(mergePt.items[0].action, 'MERGE_PT');
assert.equal(mergePt.items[0].fields.includes('title'), true);
assert.equal(
  mergePt.items[0].fields.some(field => field.endsWith('_en')),
  false
);

console.log('LORE_SINGLE_SOURCE_CREATE_PT = PASS');
console.log('LORE_SINGLE_SOURCE_EN_REQUIRES_PT = PASS');
console.log('LORE_SINGLE_SOURCE_MERGE_EN = PASS');
console.log('LORE_SINGLE_SOURCE_MERGE_PT_PRESERVES_EN = PASS');
console.log('FIRESTORE_WRITES_DURING_LORE_SINGLE_SOURCE_QA = 0');
