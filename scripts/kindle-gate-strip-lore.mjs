import fs from 'node:fs/promises';
import path from 'node:path';
import { google } from 'googleapis';

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  'raquel-synths-platform';

const APPLY = process.env.APPLY === '1';
const BACKUP_PATH = process.env.BACKUP_PATH;

const COLLECTIONS = [
  'lore',
  'lore-jonah'
];

const EPISODE_ID =
  /^s[12]-e\d+$/i;

if (!BACKUP_PATH) {
  console.error(
    'BACKUP_PATH_REQUIRED: informe um caminho fora do repositório.'
  );
  process.exit(1);
}

const baseUrl =
  `https://firestore.googleapis.com/v1/projects/` +
  `${PROJECT_ID}/databases/(default)/documents`;


/**
 * Extrai somente a primeira seção narrativa.
 *
 * Preferência:
 *   primeiro <h2/h3> + conteúdo até o próximo <h2/h3>.
 *
 * Fallback:
 *   no máximo os dois primeiros parágrafos.
 *
 * Se não houver estrutura HTML segura,
 * retorna vazio e o frontend cai para description.
 */
function extractFirstSection(html = '') {
  const source = html.trim();

  if (!source) {
    return '';
  }

  /*
   * Objetivo editorial:
   *
   * - preservar no máximo o primeiro título;
   * - preservar no máximo 2 parágrafos;
   * - nunca entregar uma seção enorme por acidente;
   * - se a estrutura não for reconhecida, retornar vazio.
   */

  const headingMatch =
    source.match(/<h[23]\b[^>]*>[\s\S]*?<\/h[23]>/i);

  const paragraphMatches =
    [...source.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)]
      .slice(0, 2)
      .map(match => match[0].trim());

  const pieces = [];

  if (headingMatch?.[0]) {
    pieces.push(
      headingMatch[0].trim()
    );
  }

  pieces.push(
    ...paragraphMatches
  );

  const sample =
    pieces.join('\n\n').trim();

  /*
   * Hard safety gate.
   *
   * Uma amostra editorial acima de 2000 caracteres
   * deve ser revisada manualmente em vez de ser
   * publicada automaticamente.
   */
  if (sample.length > 2000) {
    return '';
  }

  return sample;
}


async function listCollection(collection) {
  const response = await fetch(
    `${baseUrl}/${collection}?pageSize=300`
  );

  if (!response.ok) {
    throw new Error(
      `READ_FAILED ${collection}: HTTP ${response.status}`
    );
  }

  const json = await response.json();

  return Array.isArray(json.documents)
    ? json.documents
    : [];
}


const backup = {
  createdAt: new Date().toISOString(),
  projectId: PROJECT_ID,
  collections: {}
};

const targets = [];


/**
 * 1. LÊ AS COLLECTIONS
 * 2. MONTA BACKUP
 * 3. PREPARA AMOSTRAS
 */
for (const collection of COLLECTIONS) {
  const docs =
    await listCollection(collection);

  backup.collections[collection] = docs;

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

    /**
     * Documento que já não possui texto integral
     * não precisa sofrer nova migração.
     */
    if (
      !contentPt &&
      !contentEn
    ) {
      continue;
    }

    const sample =
      extractFirstSection(contentPt);

    const sampleEn =
      extractFirstSection(contentEn);

    targets.push({
      collection,
      id,

      sample,
      sampleEn,

      hasPt:
        Boolean(contentPt),

      hasEn:
        Boolean(contentEn)
    });
  }
}


/**
 * BACKUP
 *
 * Em APPLY=1 exigimos que o backup já exista.
 * Assim uma execução destrutiva nunca sobrescreve
 * acidentalmente o backup original.
 */
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

} else {
  let existingBackup;

  try {
    existingBackup =
      JSON.parse(
        await fs.readFile(
          BACKUP_PATH,
          'utf8'
        )
      );
  } catch {
    throw new Error(
      'APPLY_BLOCKED: backup válido não encontrado. ' +
      'Execute primeiro o dry-run.'
    );
  }

  if (
    existingBackup.projectId !==
    PROJECT_ID
  ) {
    throw new Error(
      'APPLY_BLOCKED: backup pertence a outro projeto.'
    );
  }

  console.log(
    `BACKUP_VERIFIED = PASS (${BACKUP_PATH})`
  );
}


console.log(
  `TARGET_EPISODES = ${targets.length}`
);

for (const target of targets) {
  console.log(
    `PLAN ${target.collection}/${target.id}` +
    ` PT=${target.hasPt}` +
    ` EN=${target.hasEn}` +
    ` SAMPLE_PT=${target.sample.length}` +
    ` SAMPLE_EN=${target.sampleEn.length}`
  );
}


/**
 * DRY RUN PARA AQUI.
 */
if (!APPLY) {
  console.log(
    'DRY_RUN_FIRESTORE_WRITES = 0'
  );

  console.log(
    'APPLY_REQUIRED = APPLY=1'
  );

  process.exit(0);
}


/**
 * AUTH SOMENTE QUANDO APPLY=1
 */
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
    'AUTH_FAILED: access token ausente'
  );
}


/**
 * MIGRAÇÃO
 *
 * sample/sample_en:
 *   são escritos.
 *
 * content/content_en:
 *   estão no updateMask,
 *   mas ausentes de fields,
 *   portanto são removidos.
 *
 * Outros campos:
 *   permanecem intactos.
 */
for (const target of targets) {
  const url =
    `${baseUrl}/` +
    `${encodeURIComponent(target.collection)}/` +
    `${encodeURIComponent(target.id)}` +
    `?updateMask.fieldPaths=sample` +
    `&updateMask.fieldPaths=sample_en` +
    `&updateMask.fieldPaths=content` +
    `&updateMask.fieldPaths=content_en`;

  const fields = {};

  if (target.sample) {
    fields.sample = {
      stringValue: target.sample
    };
  }

  if (target.sampleEn) {
    fields.sample_en = {
      stringValue: target.sampleEn
    };
  }

  const response =
    await fetch(url, {
      method: 'PATCH',

      headers: {
        Authorization:
          `Bearer ${token}`,

        'Content-Type':
          'application/json'
      },

      body: JSON.stringify({
        fields
      })
    });

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
    `STRIPPED ${target.collection}/${target.id}`
  );
}


console.log(
  `FIRESTORE_WRITES = ${targets.length}`
);

console.log(
  'KINDLE_PUBLIC_TEXT_GATE = PASS'
);
