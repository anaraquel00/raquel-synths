import fs from 'node:fs/promises';
import { google } from 'googleapis';

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  'raquel-synths-platform';

const APPLY =
  process.env.APPLY === '1';

const BACKUP_PATH =
  process.env.BACKUP_PATH;

const COLLECTIONS = [
  'lore',
  'lore-jonah'
];

/*
 * IMPORTANTE:
 * somente Temporada 2.
 *
 * A Temporada 1 não será alterada.
 */
const EPISODE_ID =
  /^s2-e\d+$/i;

if (!BACKUP_PATH) {
  throw new Error(
    'BACKUP_PATH_REQUIRED'
  );
}

const baseUrl =
  `https://firestore.googleapis.com/v1/projects/` +
  `${PROJECT_ID}/databases/(default)/documents`;


/**
 * Extrai SOMENTE o primeiro parágrafo HTML completo.
 *
 * Exemplos válidos:
 *
 * <p>...</p>
 * <p><em>...</em></p>
 * <p><strong>...</strong>...</p>
 *
 * Não mede caracteres.
 * Não adiciona segundo parágrafo.
 * Não procura headings.
 */
function extractFirstParagraph(html = '') {
  const source = html.trim();

  if (!source) {
    return '';
  }

  const match =
    /<p\b[^>]*>[\s\S]*?<\/p\s*>/i.exec(
      source
    );

  if (match?.[0]) {
    return match[0].trim();
  }

  /*
   * Alguns conteúdos antigos podem conter
   * fechamento malformado como </p\>.
   */
  const malformed =
    /<p\b[^>]*>[\s\S]*?<\/p\\?>/i.exec(
      source
    );

  if (malformed?.[0]) {
    return malformed[0]
      .replace(/<\/p\\>/i, '</p>')
      .trim();
  }

  return '';
}


function plainText(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


const backup =
  JSON.parse(
    await fs.readFile(
      BACKUP_PATH,
      'utf8'
    )
  );

if (
  backup.projectId !== PROJECT_ID
) {
  throw new Error(
    'BACKUP_PROJECT_MISMATCH'
  );
}


const targets = [];

for (const collection of COLLECTIONS) {
  const docs =
    backup.collections?.[collection] ?? [];

  for (const doc of docs) {
    const id =
      doc.name?.split('/').pop();

    if (
      !id ||
      !EPISODE_ID.test(id)
    ) {
      continue;
    }

    const fields =
      doc.fields ?? {};

    const contentPt =
      fields.content?.stringValue ?? '';

    const contentEn =
      fields.content_en?.stringValue ?? '';

    const sample =
      extractFirstParagraph(
        contentPt
      );

    const sampleEn =
      extractFirstParagraph(
        contentEn
      );

    targets.push({
      collection,
      id,
      sample,
      sampleEn
    });
  }
}


console.log(
  `TARGET_S2_EPISODES = ${targets.length}`
);

for (const target of targets) {
  console.log(
    `\nPLAN ${target.collection}/${target.id}`
  );

  console.log(
    `SAMPLE_PT=${target.sample.length}`
  );

  console.log(
    `PT_PREVIEW=${plainText(target.sample).slice(0, 160)}`
  );

  console.log(
    `SAMPLE_EN=${target.sampleEn.length}`
  );

  console.log(
    `EN_PREVIEW=${plainText(target.sampleEn).slice(0, 160)}`
  );
}


if (!APPLY) {
  console.log(
    '\nDRY_RUN_FIRESTORE_WRITES = 0'
  );

  console.log(
    'SEASON_1_WRITES = 0'
  );

  console.log(
    'APPLY_REQUIRED = APPLY=1'
  );

  process.exit(0);
}


const invalid =
  targets.filter(
    target =>
      !target.sample ||
      !target.sampleEn
  );

if (invalid.length > 0) {
  console.error(
    '\nAPPLY_BLOCKED: samples vazios encontrados'
  );

  for (const target of invalid) {
    console.error(
      `${target.collection}/${target.id}` +
      ` PT=${target.sample.length}` +
      ` EN=${target.sampleEn.length}`
    );
  }

  process.exit(1);
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
  throw new Error(
    'AUTH_FAILED'
  );
}


for (const target of targets) {
  const url =
    `${baseUrl}/` +
    `${encodeURIComponent(target.collection)}/` +
    `${encodeURIComponent(target.id)}` +
    `?updateMask.fieldPaths=sample` +
    `&updateMask.fieldPaths=sample_en`;

  const response =
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
                target.sample
            },

            sample_en: {
              stringValue:
                target.sampleEn
            }
          }
        })
      }
    );

  if (!response.ok) {
    const body =
      await response.text();

    throw new Error(
      `WRITE_FAILED ` +
      `${target.collection}/${target.id}: ` +
      `HTTP ${response.status} ${body}`
    );
  }

  console.log(
    `S2_SAMPLE_UPDATED ` +
    `${target.collection}/${target.id}`
  );
}


console.log(
  `FIRESTORE_WRITES = ${targets.length}`
);

console.log(
  'SEASON_1_WRITES = 0'
);

console.log(
  'KINDLE_S2_FIRST_PARAGRAPH_GATE = PASS'
);
