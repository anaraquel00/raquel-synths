#!/usr/bin/env node

/**
 * RQS — patch-hybrid-soundtracks.mjs
 *
 * Writes ONLY global-sagas/{s1-e1..s1-e10}.content and .content_en.
 * DRY RUN by default. Use APPLY=1 to write after full preflight.
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { google } from 'googleapis';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'raquel-synths-platform';
const COLLECTION = 'global-sagas';
const APPLY = process.env.APPLY === '1';

const TARGETS = {
  's1-e1': {
    title: 'ANALOG INTRUSION (The Crime)',
    url: 'https://raquelsynths.com/play/analog-intrusion?service=soundcloud',
  },
  's1-e2': {
    title: 'NEURAL CORRIDOR',
    url: 'https://raquelsynths.com/play/neural-corridor?service=soundcloud',
  },
  's1-e3': {
    title: 'PREMONITION // SYSTEM FAILURE RECODE',
    url: '#',
  },
  's1-e4': {
    title: 'SYNTHETIC STARS (EXTENDED CLUB MIX)',
    url: 'https://raquelsynths.com/play/synthetic-stars?service=soundcloud',
  },
  's1-e5': {
    title: 'SOULS IN THE TIME WEB',
    url: 'https://raquelsynths.com/play/souls-in-the-time-web?service=soundcloud',
  },
  's1-e6': {
    title: 'TO LOVE YOU MORE // DEAD SIGNAL RECODE',
    url: '#',
  },
  's1-e7': {
    title: 'SUNNY VIBE // RED SUNSET RECODE',
    url: '#',
  },
  's1-e8': {
    title: 'RESIDUE LOG (RECONNEXION)',
    url: 'https://raquelsynths.com/play/residue-log?service=soundcloud',
  },
  's1-e9': {
    title: 'BREAK IN THE MATRIX (MATRIX GLITCH)',
    url: 'https://raquelsynths.com/play/single-break-in-the-matrix?service=soundcloud',
  },
  's1-e10': {
    title: 'THE LAST ONE',
    url: 'https://raquelsynths.com/play/single-the-last-one?service=soundcloud',
  },
};

const PLACEHOLDER_IDS = new Set(['s1-e3', 's1-e6', 's1-e7']);

async function getAuthHeaders() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/datastore'],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;

  if (!token) {
    throw new Error('Could not obtain Google access token.');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function docName(id) {
  return `projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}/${id}`;
}

function docUrl(id) {
  return `https://firestore.googleapis.com/v1/${docName(id)}`;
}

async function fetchDoc(headers, id) {
  const response = await fetch(docUrl(id), { headers });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`${id}: GET failed ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function validateTarget(id, target) {
  if (target.url === '#') {
    if (!PLACEHOLDER_IDS.has(id)) {
      throw new Error(`${id}: placeholder URL is not allowed.`);
    }
    return 'PLACEHOLDER';
  }

  if (PLACEHOLDER_IDS.has(id)) {
    throw new Error(`${id}: expected placeholder URL.`);
  }
  if (/\s/.test(target.url)) {
    throw new Error(`${id}: URL contains whitespace.`);
  }

  let url;
  try {
    url = new URL(target.url);
  } catch {
    throw new Error(`${id}: malformed URL.`);
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'raquelsynths.com' ||
    !url.pathname.startsWith('/play/') ||
    url.searchParams.get('service') !== 'soundcloud'
  ) {
    throw new Error(`${id}: URL does not meet the owned SoundCloud contract.`);
  }

  return 'READY';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function soundtrackBlock(id, target, isPt) {
  const copy = isPt ? 'Trilha sonora deste episódio' : 'Episode soundtrack';
  const cta = isPt ? '▶ OUVIR NO SOUNDCLOUD' : '▶ LISTEN ON SOUNDCLOUD';

  return `<p class="rqs-soundtrack" data-rqs-soundtrack="${id}"><a class="rqs-soundtrack-link" href="${escapeHtml(target.url)}" target="_blank" rel="noopener noreferrer"><span class="rqs-soundtrack-status">SOUNDTRACK SIGNAL // ONLINE</span><strong class="rqs-soundtrack-title">${escapeHtml(target.title)}</strong><span class="rqs-soundtrack-copy">${copy}</span><span class="rqs-soundtrack-cta">${cta}</span></a></p>`;
}

function markerCount(content, id) {
  const marker = new RegExp(`data-rqs-soundtrack=(['"])${escapeRegExp(id)}\\1`, 'g');
  return [...content.matchAll(marker)].length;
}

function replaceSoundtrackBlock(content, id, block) {
  const count = markerCount(content, id);
  if (count > 1) {
    throw new Error(`${id}: duplicate soundtrack markers found.`);
  }

  const blockPattern = new RegExp(
    `<p\\b(?=[^>]*data-rqs-soundtrack=(['"])${escapeRegExp(id)}\\1)[^>]*>[\\s\\S]*?</p>`,
    'g',
  );
  const matchedBlocks = [...content.matchAll(blockPattern)];

  if (matchedBlocks.length !== count) {
    throw new Error(`${id}: soundtrack marker is not contained in one paragraph.`);
  }

  const withoutExisting = content.replace(blockPattern, '').replace(/\s+$/, '');
  const patched = withoutExisting ? `${withoutExisting}\n${block}` : block;

  return {
    current: count === 1 ? 'EXISTS' : 'MISSING',
    content: patched,
    changed: patched !== content,
  };
}

function actionFor(ptPatch, enPatch) {
  if (!ptPatch.changed && !enPatch.changed) {
    return 'UNCHANGED';
  }
  if (ptPatch.current === 'MISSING' && enPatch.current === 'MISSING') {
    return 'ADD';
  }
  return 'REPLACE';
}

function stringField(doc, id, field) {
  const value = doc.fields?.[field]?.stringValue;
  if (typeof value !== 'string') {
    throw new Error(`${id}: ${field} must be a string.`);
  }
  return value;
}

function createWrite(id, content, contentEn) {
  return {
    update: {
      name: docName(id),
      fields: {
        content: { stringValue: content },
        content_en: { stringValue: contentEn },
      },
    },
    updateMask: { fieldPaths: ['content', 'content_en'] },
    currentDocument: { exists: true },
  };
}

function verifyPatchedContent(content, id, target, isPt) {
  const expected = soundtrackBlock(id, target, isPt);
  return markerCount(content, id) === 1 && content.endsWith(expected);
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

async function main() {
  console.log('RQS HYBRID SOUNDTRACK PATCH');
  console.log(`MODE = ${APPLY ? 'APPLY' : 'DRY_RUN'}`);
  console.log(`PROJECT = ${PROJECT_ID}`);
  console.log(`COLLECTION = ${COLLECTION}`);
  console.log('');

  for (const [id, target] of Object.entries(TARGETS)) {
    validateTarget(id, target);
  }

  const headers = await getAuthHeaders();
  const rows = [];
  const prepared = [];

  for (const [id, target] of Object.entries(TARGETS)) {
    const doc = await fetchDoc(headers, id);
    if (!doc) {
      throw new Error(`${id}: document does not exist.`);
    }

    const content = stringField(doc, id, 'content');
    const contentEn = stringField(doc, id, 'content_en');
    const ptPatch = replaceSoundtrackBlock(content, id, soundtrackBlock(id, target, true));
    const enPatch = replaceSoundtrackBlock(contentEn, id, soundtrackBlock(id, target, false));

    rows.push({
      episode: id,
      title: target.title,
      url_state: validateTarget(id, target),
      pt_current: ptPatch.current,
      en_current: enPatch.current,
      action: actionFor(ptPatch, enPatch),
    });
    prepared.push({ id, target, content, contentEn, ptPatch, enPatch });
  }

  console.table(rows);
  console.log('');

  if (!APPLY) {
    console.log('MODE = DRY_RUN');
    console.log('VALID_DOCUMENTS = 10/10');
    console.log(`READY = ${Object.keys(TARGETS).length - PLACEHOLDER_IDS.size}`);
    console.log(`PLACEHOLDER = ${PLACEHOLDER_IDS.size}`);
    console.log('MUTATION = NONE');
    return;
  }

  const backupPath = join(tmpdir(), `rqs-hybrid-soundtracks-backup-${timestamp()}.json`);
  const backup = prepared.map(({ id, content, contentEn }) => ({
    episode: id,
    content,
    content_en: contentEn,
  }));
  await writeFile(backupPath, `${JSON.stringify(backup, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  console.log(`BACKUP = ${backupPath}`);

  const writes = prepared
    .filter(({ ptPatch, enPatch }) => ptPatch.changed || enPatch.changed)
    .map(({ id, ptPatch, enPatch }) => createWrite(id, ptPatch.content, enPatch.content));

  if (!writes.length) {
    console.log('MUTATION = NONE');
    return;
  }

  const commitUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`;
  const response = await fetch(commitUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ writes }),
  });

  if (!response.ok) {
    throw new Error(`COMMIT failed ${response.status}: ${await response.text()}`);
  }

  let verifyFailed = false;
  for (const { id, target, ptPatch, enPatch } of prepared) {
    const doc = await fetchDoc(headers, id);
    const content = doc ? stringField(doc, id, 'content') : '';
    const contentEn = doc ? stringField(doc, id, 'content_en') : '';
    const pass = content === ptPatch.content
      && contentEn === enPatch.content
      && verifyPatchedContent(content, id, target, true)
      && verifyPatchedContent(contentEn, id, target, false);
    console.log(`${id} ${pass ? 'PASS' : 'FAIL'}`);
    verifyFailed ||= !pass;
  }

  console.log(`POST_WRITE_VERIFY = ${verifyFailed ? 'FAIL' : 'PASS'}`);
  if (verifyFailed) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error('PATCH_ERROR');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
