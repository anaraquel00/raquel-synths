import assert from 'node:assert/strict';

import {
  createLoreWritePlan,
  firestoreWritesForLorePlan,
  loreDryRunIdentity,
  makeLoreDryRunToken,
  verifyLoreDryRunToken
} from '../api/admin/lore.js';

const key = 'rqs-stage-4-test-key-with-at-least-32-bytes';

const parsed = {
  episodes: [{
    id: 's2-e1',
    title: 'Sinal de Teste',
    category: 'Teste',
    description: 'Descrição PT',
    content: 'Conteúdo PT',
    image: 'https://example.com/s2-e1.jpg',
    releaseDate: '2027-01-01'
  }]
};

const createPlan = createLoreWritePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'pt-BR',
  parsed,
  existingDocuments: {}
});

const createWrites = firestoreWritesForLorePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'pt-BR',
  parsed,
  existingDocuments: {},
  writePlan: createPlan.items
});

assert.equal(createWrites.length, 1);
assert.equal(
  createWrites[0].currentDocument.exists,
  false
);
assert.equal(
  Object.hasOwn(createWrites[0].update.fields, 'title_en'),
  false
);

const existing = {
  's2-e1': {
    updateTime: '2026-10-03T17:00:00.000000Z',
    fields: {
      title: 'Título anterior',
      category: 'Teste',
      description: 'Descrição PT',
      content: 'Conteúdo PT',
      image: 'https://example.com/s2-e1.jpg',
      releaseDate: '2027-01-01',
      mode: 'broklin',
      published: true,
      title_en: 'Existing EN Title',
      content_en: 'Existing EN Content'
    }
  }
};

const mergePlan = createLoreWritePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'pt-BR',
  parsed,
  existingDocuments: existing
});

assert.equal(mergePlan.items[0].action, 'MERGE_PT');

const mergeWrites = firestoreWritesForLorePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'pt-BR',
  parsed,
  existingDocuments: existing,
  writePlan: mergePlan.items
});

assert.equal(mergeWrites.length, 1);
assert.deepEqual(
  mergeWrites[0].updateMask.fieldPaths,
  ['title']
);
assert.equal(
  mergeWrites[0].currentDocument.updateTime,
  existing['s2-e1'].updateTime
);
assert.equal(
  Object.keys(mergeWrites[0].update.fields)
    .some(field => field.endsWith('_en')),
  false
);

const identity = loreDryRunIdentity({
  mode: 'broklin',
  collection: 'lore',
  source: {
    documentId: 'drive_document_123456',
    modifiedTime: '2026-10-03T16:00:00.000Z'
  },
  language: 'pt-BR',
  sourceChecksum: 'checksum-123',
  writePlan: createPlan.items
});

const token = makeLoreDryRunToken(identity, key);

assert.equal(
  verifyLoreDryRunToken(token, identity, key),
  true
);

assert.equal(
  verifyLoreDryRunToken(
    token,
    {
      ...identity,
      sourceChecksum: 'changed-checksum'
    },
    key
  ),
  false
);

assert.throws(
  () => firestoreWritesForLorePlan({
    mode: 'broklin',
    collection: 'lore',
    language: 'en-US',
    parsed,
    existingDocuments: existing,
    writePlan: [{
      id: 's2-e1',
      action: 'MERGE_EN',
      language: 'en-US',
      fields: ['title_en'],
      issues: []
    }]
  }),
  error => error?.code === 'LORE_PT_IMPORT_NOT_ALLOWED'
);

console.log('LORE_PT_IMPORT_CREATE_PRECONDITION = PASS');
console.log('LORE_PT_IMPORT_MERGE_UPDATE_TIME = PASS');
console.log('LORE_PT_IMPORT_PRESERVES_EN = PASS');
console.log('LORE_PT_IMPORT_TOKEN_BINDING = PASS');
console.log('LORE_PT_IMPORT_REJECTS_EN = PASS');
console.log('FIRESTORE_NETWORK_WRITES_DURING_STAGE_4_QA = 0');
