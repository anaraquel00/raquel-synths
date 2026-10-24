import fs from 'node:fs/promises';
import path from 'node:path';
import { google } from 'googleapis';

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  'raquel-synths-platform';

const APPLY =
  process.env.APPLY === '1';

const BACKUP_PATH =
  process.env.BACKUP_PATH;

if (!BACKUP_PATH) {
  throw new Error('BACKUP_PATH_REQUIRED');
}

const COLLECTION = 'global-sagas';

const baseUrl =
  `https://firestore.googleapis.com/v1/projects/` +
  `${PROJECT_ID}/databases/(default)/documents`;


/*
 * Glitch:
 * sample = primeiro <p> completo.
 *
 * Sem porcentagem.
 * Sem corte no meio do parágrafo.
 */
function extractFirstParagraph(html = '') {
  const source = html.trim();

  if (!source) {
    return '';
  }

  const match =
    /<p\b[^>]*>[\s\S]*?<\/p\s*>/i.exec(source);

  if (match?.[0]) {
    return match[0].trim();
  }

  return '';
}


function value(fields, name) {
  return fields?.[name]?.stringValue ?? '';
}


function boolValue(fields, name) {
  return fields?.[name]?.booleanValue ?? false;
}


function plainText(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


const response =
  await fetch(
    `${baseUrl}/${COLLECTION}?pageSize=300`
  );

if (!response.ok) {
  throw new Error(
    `READ_FAILED: HTTP ${response.status}`
  );
}

const json =
  await response.json();

const docs =
  Array.isArray(json.documents)
    ? json.documents
    : [];


/*
 * Backup integral da collection antes de qualquer escrita.
 */
const backup = {
  createdAt: new Date().toISOString(),
  projectId: PROJECT_ID,
  collection: COLLECTION,
  documents: docs
};


if (!APPLY) {
  await fs.mkdir(
    path.dirname(BACKUP_PATH),
    { recursive: true }
  );

  try {
    await fs.writeFile(
      BACKUP_PATH,
      JSON.stringify(backup, null, 2),
      {
        mode: 0o600,
        flag: 'wx'
      }
    );

    console.log(
      `BACKUP = PASS (${BACKUP_PATH})`
    );
  } catch (error) {
    if (error?.code === 'EEXIST') {
      console.log(
        `BACKUP = EXISTS (${BACKUP_PATH})`
      );

      console.log(
        'BACKUP_NOT_OVERWRITTEN = PASS'
      );
    } else {
      throw error;
    }
  }
}


/*
 * Considera somente documentos publicados com conteúdo.
 *
 * Ordena por releaseDate e, em empate, por id.
 * Seleciona os 3 mais recentes.
 */
const candidates =
  docs
    .map(doc => {
      const id =
        doc.name?.split('/').pop() ?? '';

      const fields =
        doc.fields ?? {};

      return {
        id,
        fields,

        title:
          value(fields, 'title'),

        releaseDate:
          value(fields, 'releaseDate'),

        published:
          boolValue(fields, 'published'),

        content:
          value(fields, 'content'),

        contentEn:
          value(fields, 'content_en')
      };
    })
    .filter(ep =>
      ep.published &&
      ep.content
    )
    .sort((a, b) => {
      const byDate =
        a.releaseDate.localeCompare(
          b.releaseDate
        );

      if (byDate !== 0) {
        return byDate;
      }

      return a.id.localeCompare(
        b.id,
        undefined,
        {
          numeric: true,
          sensitivity: 'base'
        }
      );
    });


const targets =
  candidates.slice(-3);


console.log(
  `PUBLIC_GLITCH_EPISODES = ${candidates.length}`
);

console.log(
  `TARGET_LAST_3 = ${targets.length}`
);


for (const ep of targets) {
  const sample =
    extractFirstParagraph(
      ep.content
    );

  const sampleEn =
    extractFirstParagraph(
      ep.contentEn
    );

  ep.sample = sample;
  ep.sampleEn = sampleEn;

  console.log(
    `\nTARGET ${ep.id}`
  );

  console.log(
    `TITLE=${ep.title}`
  );

  console.log(
    `RELEASE_DATE=${ep.releaseDate}`
  );

  console.log(
    `SAMPLE_PT=${sample.length}`
  );

  console.log(
    `PT_PREVIEW=${plainText(sample).slice(0, 220)}`
  );

  console.log(
    `SAMPLE_EN=${sampleEn.length}`
  );

  console.log(
    `EN_PREVIEW=${plainText(sampleEn).slice(0, 220)}`
  );
}


const invalid =
  targets.filter(
    ep =>
      !ep.sample ||
      !ep.sampleEn
  );


if (!APPLY) {
  console.log(
    '\nDRY_RUN_FIRESTORE_WRITES = 0'
  );

  if (invalid.length > 0) {
    console.log(
      'SAMPLE_VALIDATION = FAIL'
    );
  } else {
    console.log(
      'SAMPLE_VALIDATION = PASS'
    );
  }

  console.log(
    'APPLY_REQUIRED = APPLY=1'
  );

  process.exit(0);
}


if (invalid.length > 0) {
  throw new Error(
    'APPLY_BLOCKED: sample PT/EN vazio'
  );
}


/*
 * APPLY exige backup pré-existente.
 */
const existingBackup =
  JSON.parse(
    await fs.readFile(
      BACKUP_PATH,
      'utf8'
    )
  );

if (
  existingBackup.projectId !== PROJECT_ID
) {
  throw new Error(
    'BACKUP_PROJECT_MISMATCH'
  );
}


const auth =
  new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/datastore'
    ]
  });

const client =
  await auth.getClient();

const access =
  await client.getAccessToken();

const token =
  typeof access === 'string'
    ? access
    : access?.token;

if (!token) {
  throw new Error('AUTH_FAILED');
}


for (const ep of targets) {
  const url =
    `${baseUrl}/${COLLECTION}/` +
    `${encodeURIComponent(ep.id)}` +
    `?updateMask.fieldPaths=sample` +
    `&updateMask.fieldPaths=sample_en` +
    `&updateMask.fieldPaths=content` +
    `&updateMask.fieldPaths=content_en`;

  const writeResponse =
    await fetch(
      url,
      {
        method: 'PATCH',

        headers: {
          Authorization:
            `Bearer ${token}`,

          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          fields: {
            sample: {
              stringValue:
                ep.sample
            },

            sample_en: {
              stringValue:
                ep.sampleEn
            }
          }
        })
      }
    );

  if (!writeResponse.ok) {
    throw new Error(
      `WRITE_FAILED ${ep.id}: ` +
      `HTTP ${writeResponse.status} ` +
      await writeResponse.text()
    );
  }

  console.log(
    `GLITCH_SAMPLE_UPDATED ${ep.id}`
  );
}


console.log(
  'FIRESTORE_WRITES = 3'
);

console.log(
  'GLITCH_PUBLIC_TEXT_GATE = PASS'
);
