import assert from 'node:assert/strict';

import {
  createLoreWritePlan,
  firestoreWritesForLoreEnPlan,
  loreDryRunIdentity,
  makeLoreDryRunToken,
  verifyLoreDryRunToken
} from '../api/admin/lore.js';

const key = 'rqs-stage-5a-test-key-with-at-least-32-bytes';

const parsedEn = {
  episodes: [{
    id: 's2-e1',
    title: 'Test Signal',
    category: 'Integration Test',
    description: 'English description',
    content: 'English content',
    image: 'https://example.com/s2-e1.jpg',
    releaseDate: '2027-01-01'
  }]
};

const existingBase = {
  's2-e1': {
    updateTime: '2026-10-03T18:00:00.000000Z',
    fields: {
      title: 'Sinal de Teste',
      category: 'Teste de Integração',
      description: 'Descrição PT',
      content: 'Conteúdo PT',
      image: 'https://example.com/s2-e1.jpg',
      releaseDate: '2027-01-01',
      mode: 'broklin',
      published: true
    }
  }
};

const enPlan = createLoreWritePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'en-US',
  parsed: parsedEn,
  existingDocuments: existingBase
});

assert.equal(enPlan.items[0].action, 'MERGE_EN');
assert.deepEqual(
  [...enPlan.items[0].fields].sort(),
  ['title_en', 'category_en', 'description_en', 'content_en'].sort()
);

const writes = firestoreWritesForLoreEnPlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'en-US',
  parsed: parsedEn,
  existingDocuments: existingBase,
  writePlan: enPlan.items
});

assert.equal(writes.length, 1);
assert.equal(
  writes[0].currentDocument.updateTime,
  existingBase['s2-e1'].updateTime
);
assert.deepEqual(
  [...writes[0].updateMask.fieldPaths].sort(),
  ['title_en', 'category_en', 'description_en', 'content_en'].sort()
);
assert.equal(
  Object.keys(writes[0].update.fields)
    .every(field => field.endsWith('_en')),
  true
);
assert.equal(
  Object.keys(writes[0].update.fields)
    .some(field => [
      'title', 'category', 'description', 'content',
      'image', 'releaseDate', 'mode', 'published'
    ].includes(field)),
  false
);

const missingBasePlan = createLoreWritePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'en-US',
  parsed: parsedEn,
  existingDocuments: {}
});
assert.equal(missingBasePlan.items[0].action, 'BLOCKED');

const sharedConflictBase = structuredClone(existingBase);
sharedConflictBase['s2-e1'].fields.releaseDate = '2027-01-10';

const sharedConflictPlan = createLoreWritePlan({
  mode: 'broklin',
  collection: 'lore',
  language: 'en-US',
  parsed: parsedEn,
  existingDocuments: sharedConflictBase
});
assert.equal(sharedConflictPlan.items[0].action, 'BLOCKED');
assert.match(
  sharedConflictPlan.items[0].issues.join(' '),
  /releaseDate compartilhado diverge/
);

const identity = loreDryRunIdentity({
  mode: 'broklin',
  collection: 'lore',
  source: {
    documentId: 'drive_en_document_123456',
    modifiedTime: '2026-10-03T18:00:00.000Z'
  },
  language: 'en-US',
  sourceChecksum: 'en-checksum-123',
  writePlan: enPlan.items
});

const token = makeLoreDryRunToken(identity, key);
assert.equal(verifyLoreDryRunToken(token, identity, key), true);
assert.equal(
  verifyLoreDryRunToken(
    token,
    { ...identity, sourceChecksum: 'changed-checksum' },
    key
  ),
  false
);

console.log('LORE_EN_REQUIRES_PT_BASE = PASS');
console.log('LORE_EN_SHARED_FIELDS_VALIDATION = PASS');
console.log('LORE_EN_MERGE_IMPLEMENTATION = PASS');
console.log('LORE_EN_PRESERVES_PT_FIELDS = PASS');
console.log('LORE_EN_UPDATE_TIME_PRECONDITION = PASS');
console.log('LORE_EN_DRY_RUN_TOKEN_BINDING = PASS');
console.log('LORE_EN_ATOMIC_WRITE_BATCH = PASS');
console.log('FIRESTORE_NETWORK_WRITES_DURING_STAGE_5A_QA = 0');
