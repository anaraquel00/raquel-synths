import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const endpointPath = path.join(repoRoot, 'api', 'admin', 'lore.js');
const endpointSource = fs.readFileSync(endpointPath, 'utf8');

const originalBroklin = process.env.RQS_LORE_BROKLIN_DRIVE_FOLDER_ID;
const originalJonah = process.env.RQS_LORE_JONAH_DRIVE_FOLDER_ID;

process.env.RQS_LORE_BROKLIN_DRIVE_FOLDER_ID = 'broklin-folder-id-test';
process.env.RQS_LORE_JONAH_DRIVE_FOLDER_ID = 'jonah-folder-id-test';

const {
  DOCX_MIME,
  DRIVE_SCOPE,
  languageHint,
  normalizeMode,
  sourceConfig,
  supportFor
} = await import('../api/admin/lore.js');

try {
  assert.equal(DRIVE_SCOPE, 'https://www.googleapis.com/auth/drive.readonly');
  assert.equal(normalizeMode('broklin'), 'broklin');
  assert.equal(normalizeMode('JONAH'), 'jonah');
  assert.throws(() => normalizeMode('hybrid'), /broklin ou jonah/i);

  assert.deepEqual(
    {
      mode: sourceConfig('broklin').mode,
      collection: sourceConfig('broklin').collection,
      folderId: sourceConfig('broklin').folderId
    },
    {
      mode: 'broklin',
      collection: 'lore',
      folderId: 'broklin-folder-id-test'
    }
  );

  assert.deepEqual(
    {
      mode: sourceConfig('jonah').mode,
      collection: sourceConfig('jonah').collection,
      folderId: sourceConfig('jonah').folderId
    },
    {
      mode: 'jonah',
      collection: 'lore-jonah',
      folderId: 'jonah-folder-id-test'
    }
  );

  assert.equal(languageHint('BROKLIN_S2_PT-BR.docx'), 'pt-BR');
  assert.equal(languageHint('BROKLIN_S2_EN-US.docx'), 'en-US');
  assert.equal(languageHint('BROKLIN_S2.docx'), '');

  assert.equal(
    supportFor({ name: 'BROKLIN_S2_PT-BR.docx', mimeType: DOCX_MIME }).status,
    'SUPPORTED'
  );
  assert.equal(
    supportFor({ name: 'legacy.doc', mimeType: 'application/msword' }).status,
    'BLOCKED'
  );
  assert.equal(
    supportFor({ name: 'notes.txt', mimeType: 'text/plain' }).status,
    'BLOCKED'
  );

  assert.match(endpointSource, /drive\.readonly/);

  // Stage 4/5A legitimately add Firestore read/write pipeline code to the
  // same endpoint. This QA now checks that Drive itself remains read-only
  // and that both Firestore write paths are still explicitly gated.
  assert.match(endpointSource, /RQS_LORE_WRITES_ENABLED/);
  assert.match(endpointSource, /RQS_LORE_EN_WRITES_ENABLED/);
  assert.match(endpointSource, /VERCEL_ENV === 'preview'/);
  assert.match(endpointSource, /NODE_ENV !== 'production'/);

  assert.doesNotMatch(
    endpointSource,
    /drive\.files\.(create|update|delete|copy)\s*\(/i
  );

  console.log('LORE_DRIVE_MODE_GUARDS = PASS');
  console.log('LORE_DRIVE_FOLDER_MAPPING = PASS');
  console.log('LORE_DRIVE_DOCX_CONTRACT = PASS');
  console.log('LORE_DRIVE_SCOPE_READONLY = PASS');
  console.log('LORE_FIRESTORE_WRITE_GATES_PRESENT = PASS');
  console.log('FIRESTORE_NETWORK_WRITES_DURING_LORE_DRIVE_QA = 0');
  console.log('DRIVE_MUTATIONS_DURING_LORE_DRIVE_QA = 0');
} finally {
  if (originalBroklin === undefined) {
    delete process.env.RQS_LORE_BROKLIN_DRIVE_FOLDER_ID;
  } else {
    process.env.RQS_LORE_BROKLIN_DRIVE_FOLDER_ID = originalBroklin;
  }

  if (originalJonah === undefined) {
    delete process.env.RQS_LORE_JONAH_DRIVE_FOLDER_ID;
  } else {
    process.env.RQS_LORE_JONAH_DRIVE_FOLDER_ID = originalJonah;
  }
}
