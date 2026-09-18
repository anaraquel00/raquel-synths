#!/usr/bin/env node

/**
 * RQS — remediate-vol020-descriptions.mjs
 *
 * Normalizes ONLY descriptionPT and descriptionEN in
 * discography/ep-the-blueprint-sessions-v020.
 *
 * DRY RUN by default. A future authorized write requires both:
 * APPLY=1
 * RQS_CONFIRM_VOL020_DESCRIPTION_PATCH=ep-the-blueprint-sessions-v020
 */

import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { google } from 'googleapis';

import { normalizeEditorialDescription } from '../api/soundcloud-importer.js';

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT || 'raquel-synths-platform';
const COLLECTION = 'discography';
const DOCUMENT_ID = 'ep-the-blueprint-sessions-v020';
const DESCRIPTION_FIELDS = ['descriptionPT', 'descriptionEN'];
const APPLY = process.env.APPLY === '1';
const CONFIRMATION =
  process.env.RQS_CONFIRM_VOL020_DESCRIPTION_PATCH || '';

function documentUrl() {
  return (
    'https://firestore.googleapis.com/v1/projects/' +
    `${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents/` +
    `${encodeURIComponent(COLLECTION)}/${encodeURIComponent(DOCUMENT_ID)}`
  );
}

function getServiceAccountCredentials() {
  const rawCredentials =
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

  if (!rawCredentials) return undefined;

  const credentials = JSON.parse(rawCredentials);

  if (typeof credentials.private_key === 'string') {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }

  return credentials;
}

async function getAccessToken() {
  const credentials = getServiceAccountCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    projectId: credentials?.project_id || PROJECT_ID,
    scopes: ['https://www.googleapis.com/auth/datastore']
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token =
    typeof tokenResponse === 'string'
      ? tokenResponse
      : tokenResponse?.token;

  if (!token) {
    throw new Error('Could not obtain Google access token.');
  }

  return token;
}

async function fetchDocument(accessToken) {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const response = await fetch(documentUrl(), { headers });

  if (!response.ok) {
    throw new Error(
      `Firestore GET failed: ${response.status} ${await response.text()}`
    );
  }

  return response.json();
}

function stringField(document, field) {
  const value = document.fields?.[field]?.stringValue;

  if (typeof value !== 'string') {
    throw new Error(`${field} must exist as a Firestore string.`);
  }

  return value;
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

function protectedFields(document) {
  return Object.fromEntries(
    Object.entries(document.fields || {}).filter(
      ([field]) => !DESCRIPTION_FIELDS.includes(field)
    )
  );
}

function printComparison(field, before, after) {
  console.log(`${field}:`);
  console.log(`  changed = ${before !== after}`);
  console.log(`  before_length = ${before.length}`);
  console.log(`  after_length = ${after.length}`);
  console.log(`  before_sha256 = ${digest(before)}`);
  console.log(`  after_sha256 = ${digest(after)}`);
  console.log(`--- ${field} BEFORE ---`);
  console.log(before);
  console.log(`--- ${field} AFTER ---`);
  console.log(after);
  console.log(`--- END ${field} ---`);
}

async function patchDescriptions(beforeDocument, after, accessToken) {
  const url = new URL(documentUrl());

  for (const field of DESCRIPTION_FIELDS) {
    url.searchParams.append('updateMask.fieldPaths', field);
  }

  url.searchParams.set(
    'currentDocument.updateTime',
    beforeDocument.updateTime
  );

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        descriptionPT: { stringValue: after.descriptionPT },
        descriptionEN: { stringValue: after.descriptionEN }
      }
    })
  });

  if (!response.ok) {
    throw new Error(
      `Firestore PATCH failed: ${response.status} ${await response.text()}`
    );
  }
}

async function main() {
  console.log('RQS VOL.020 DESCRIPTION REMEDIATION');
  console.log(`MODE = ${APPLY ? 'APPLY' : 'DRY_RUN'}`);
  console.log(`PROJECT = ${PROJECT_ID}`);
  console.log(`DOCUMENT = ${COLLECTION}/${DOCUMENT_ID}`);
  console.log('UPDATE_MASK = descriptionPT,descriptionEN');

  const beforeDocument = await fetchDocument();
  const before = {
    descriptionPT: stringField(beforeDocument, 'descriptionPT'),
    descriptionEN: stringField(beforeDocument, 'descriptionEN')
  };

  for (const [field, value] of Object.entries(before)) {
    if (/<[a-z][^>]*>/iu.test(value)) {
      throw new Error(
        `${field} already contains HTML-like markup; refusing to normalize twice.`
      );
    }
  }

  const after = {
    descriptionPT: normalizeEditorialDescription(before.descriptionPT),
    descriptionEN: normalizeEditorialDescription(before.descriptionEN)
  };

  printComparison(
    'descriptionPT',
    before.descriptionPT,
    after.descriptionPT
  );
  printComparison(
    'descriptionEN',
    before.descriptionEN,
    after.descriptionEN
  );

  if (!APPLY) {
    console.log('PRECONDITION = document exists + current updateTime');
    console.log('POST_WRITE_READ_BACK = REQUIRED');
    console.log('MUTATION = NONE');
    return;
  }

  if (CONFIRMATION !== DOCUMENT_ID) {
    throw new Error(
      'Explicit document confirmation is required for APPLY mode.'
    );
  }

  const accessToken = await getAccessToken();
  await patchDescriptions(beforeDocument, after, accessToken);

  const readBack = await fetchDocument(accessToken);
  const verifiedDescriptions = DESCRIPTION_FIELDS.every(
    field => stringField(readBack, field) === after[field]
  );
  const protectedFieldsUnchanged = isDeepStrictEqual(
    protectedFields(readBack),
    protectedFields(beforeDocument)
  );

  if (!verifiedDescriptions || !protectedFieldsUnchanged) {
    throw new Error('Post-write read-back verification failed.');
  }

  console.log('POST_WRITE_READ_BACK = PASS');
  console.log('PROTECTED_FIELDS_UNCHANGED = PASS');
  console.log('MUTATION = descriptionPT,descriptionEN');
}

main().catch(error => {
  console.error(
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
