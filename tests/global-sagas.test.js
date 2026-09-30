import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import JSZip from 'jszip';
import {
  COLLECTION,
  DRIVE_SCOPE,
  canonicalKey,
  createEpisodeWritePlan,
  docxBlocks,
  dryRunContract,
  expectedEpisodeIds,
  firestoreWritesForPlan,
  parseEditorialBlocks,
  sourcePairingStatus,
  supportFor,
  validateParsed
} from '../api/admin/global-sagas.js';

async function sampleDocx() {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    </Types>`);
  zip.folder('_rels')?.file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>`);
  zip.folder('word')?.file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p><w:r><w:t>SAGA: GLITCH IN THE MATRIX</w:t></w:r></w:p>
        <w:p><w:r><w:t>SEASON: 2</w:t></w:r></w:p>
        <w:p><w:r><w:t>EDITION: JONAH'S LEGACY</w:t></w:r></w:p>
        <w:p><w:r><w:t>LANGUAGE: EN-US</w:t></w:r></w:p>
        <w:p><w:r><w:t>EPISODE 1 — Signal</w:t></w:r></w:p>
        <w:p><w:r><w:t>SUBTITLE: Source preserved</w:t></w:r></w:p>
        <w:p><w:r><w:t>Original prose.</w:t></w:r></w:p>
        <w:sectPr/>
      </w:body>
    </w:document>`);
  return zip.generateAsync({ type: 'nodebuffer' });
}

async function canonicalContractDocx() {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    </Types>`);
  zip.folder('_rels')?.file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>`);
  const episodes = Array.from({ length: 8 }, (_, index) => {
    const number = index + 1;
    return `<w:p><w:r><w:t>EPISODE s2-e${number} - Episódio ${number}</w:t></w:r></w:p>
    <w:p>
      <w:r><w:t>EPISODE</w:t><w:br/><w:t>s2-e${number}</w:t><w:br/><w:t>CATEGORY</w:t><w:br/><w:t>Temporada 2</w:t><w:br/><w:t>RELEASE DATE</w:t><w:br/><w:t>2027-01-${String(number + 9).padStart(2, '0')}</w:t><w:br/><w:t>IMAGE</w:t><w:br/><w:t>https://example.com/s2-e${number}.jpg</w:t><w:br/><w:t>TITLE</w:t><w:br/><w:t>Episódio ${number}</w:t><w:br/><w:t>DESCRIPTION</w:t><w:br/><w:t>Descrição ${number}</w:t><w:br/><w:t>CONTENT</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t>&lt;p&gt;&lt;em&gt;Conteúdo original ${number}&lt;/em&gt;&lt;strong&gt; preservado.&lt;/strong&gt;&lt;/p&gt;&lt;pre class=&quot;system-log&quot;&gt;status ${number}&lt;/pre&gt;</w:t></w:r></w:p>
    <w:p><w:r><w:t>END EPISODE</w:t></w:r></w:p>`;
  }).join('');
  zip.folder('word')?.file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p><w:r><w:t>GLITCH IN THE MATRIX - S2 // JONAH'S LEGACY</w:t></w:r></w:p>
        ${episodes}
        <w:sectPr/>
      </w:body>
    </w:document>`);
  return zip.generateAsync({ type: 'nodebuffer' });
}

const sourceBlocks = [
  { tag: 'p', text: 'SAGA: GLITCH IN THE MATRIX' },
  { tag: 'p', text: 'SEASON: 2' },
  { tag: 'p', text: "EDITION: JONAH'S LEGACY" },
  { tag: 'p', text: 'LANGUAGE: PT-BR' },
  { tag: 'h2', text: 'EPISÓDIO 1 — O Primeiro Ruído' },
  { tag: 'p', text: 'SUBTÍTULO: Um eco na infraestrutura' },
  { tag: 'p', text: 'O texto editorial original permanece aqui.' },
  { tag: 'p', text: 'DIÁLOGO: — Ainda existe sinal?' },
  { tag: 'p', text: 'SYSTEM LOG: integridade 42%' },
  { tag: 'img', text: '[IMAGEM INCORPORADA 1]' },
  { tag: 'p', text: 'CRÉDITOS: Ana Raquel' },
  { tag: 'h2', text: 'EPISÓDIO 2' },
  { tag: 'h3', text: 'A Segunda Frequência' },
  { tag: 'p', text: 'SUBTÍTULO: Retorno de Jonah' },
  { tag: 'p', text: 'Outro corpo editorial sem reescrita.' }
];

function seasonTwo(language = 'pt-BR') {
  return {
    saga: 'GLITCH IN THE MATRIX',
    season: 2,
    edition: "JONAH'S LEGACY",
    language,
    canonicalKey: 'glitch-in-the-matrix-s2-jonahs-legacy',
    preamble: [],
    episodes: expectedEpisodeIds().map((id, index) => ({
      number: index + 1,
      episodeId: id,
      slug: id,
      category: language === 'pt-BR' ? 'Temporada 2' : 'Season 2',
      releaseDate: `2027-01-${String(index + 10).padStart(2, '0')}`,
      image: `https://raquelsynths.com/${id}.jpg`,
      title: `${language === 'pt-BR' ? 'Episódio' : 'Episode'} ${index + 1}`,
      description: `${language === 'pt-BR' ? 'Descrição' : 'Description'} ${index + 1}`,
      content: `<p>${language} content ${index + 1}</p>`,
      subtitle: '',
      blocks: [{ type: 'body', content: `${language} content ${index + 1}` }]
    }))
  };
}

function existingDocuments(parsed, language) {
  return Object.fromEntries(parsed.episodes.map((episode, index) => {
    const suffix = language === 'en-US' ? '_en' : '';
    return [episode.episodeId, {
      updateTime: `2026-09-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`,
      fields: {
        [`title${suffix}`]: episode.title,
        [`category${suffix}`]: episode.category,
        [`description${suffix}`]: episode.description,
        [`content${suffix}`]: episode.content,
        image: episode.image,
        releaseDate: episode.releaseDate,
        mode: 'hybrid',
        published: false
      }
    }];
  }));
}

test('parser preserva metadados, ordem, conteúdo e tipos editoriais', () => {
  const parsed = parseEditorialBlocks(sourceBlocks, 'jonah-season-2-pt-BR.docx');

  assert.equal(parsed.saga, 'GLITCH IN THE MATRIX');
  assert.equal(parsed.season, 2);
  assert.equal(parsed.edition, "JONAH'S LEGACY");
  assert.equal(parsed.language, 'pt-BR');
  assert.equal(parsed.canonicalKey, 'glitch-in-the-matrix-s2-jonahs-legacy');
  assert.deepEqual(parsed.episodes.map(episode => episode.title), [
    'O Primeiro Ruído',
    'A Segunda Frequência'
  ]);
  assert.deepEqual(parsed.episodes[0].blocks.map(block => block.type), [
    'body',
    'dialogue',
    'system-log',
    'image',
    'credits'
  ]);
  assert.equal(
    parsed.episodes[0].blocks[0].content,
    'O texto editorial original permanece aqui.'
  );
});

test('arquivo DOCX real é convertido em blocos editoriais', async () => {
  const converted = await docxBlocks(await sampleDocx());
  const parsed = parseEditorialBlocks(converted.blocks, 'season-2-en-US.docx');

  assert.equal(parsed.language, 'en-US');
  assert.equal(parsed.episodes.length, 1);
  assert.equal(parsed.episodes[0].title, 'Signal');
  assert.equal(parsed.episodes[0].blocks[0].content, 'Original prose.');
});

test('contrato canônico reconhece cabeçalho, quebras manuais e oito episódios', async () => {
  const converted = await docxBlocks(await canonicalContractDocx());
  const parsed = parseEditorialBlocks(
    converted.blocks,
    'GLITCH_IN_THE_MATRIX_S2_JONAHS_LEGACY_PT.docx'
  );
  const validation = validateParsed(parsed, 'pt-BR', converted.parserWarnings);

  assert.equal(parsed.saga, 'GLITCH IN THE MATRIX');
  assert.equal(parsed.season, 2);
  assert.equal(parsed.edition, "JONAH'S LEGACY");
  assert.equal(parsed.language, 'pt-BR');
  assert.equal(parsed.episodes.length, 8);
  assert.equal(new Set(parsed.episodes.map(episode => episode.slug)).size, 8);
  assert.deepEqual(
    parsed.episodes.map(episode => episode.episodeId),
    Array.from({ length: 8 }, (_, index) => `s2-e${index + 1}`)
  );
  assert.deepEqual(
    parsed.episodes.map(episode => episode.slug),
    Array.from({ length: 8 }, (_, index) => `s2-e${index + 1}`)
  );
  assert.equal(parsed.episodes[0].category, 'Temporada 2');
  assert.equal(parsed.episodes[0].releaseDate, '2027-01-10');
  assert.equal(parsed.episodes[0].image, 'https://example.com/s2-e1.jpg');
  assert.equal(parsed.episodes[0].title, 'Episódio 1');
  assert.equal(parsed.episodes[0].description, 'Descrição 1');
  assert.equal(
    parsed.episodes[0].content,
    '<p><em>Conteúdo original 1</em><strong> preservado.</strong></p><pre class="system-log">status 1</pre>'
  );
  assert.doesNotMatch(parsed.episodes[0].content, /END EPISODE/);
  assert.doesNotMatch(parsed.episodes[0].content, /&lt;(?:p|em|strong|pre)/);
  assert.ok(parsed.episodes.every(episode => episode.content));
  assert.ok(parsed.episodes.every(episode => episode.blocks.length > 0));
  assert.equal(validation.status, 'VALID');
});

test('cabeçalho inline de episódio inicia bloco e preserva HTML após CONTENT', () => {
  const parsed = parseEditorialBlocks([
    { tag: 'p', text: "GLITCH IN THE MATRIX - S2 // JONAH'S LEGACY" },
    {
      tag: 'p',
      text: 'EPISODE s2-e1 - T-14 // AVISO DE EXPIRAÇÃO\nCATEGORY\nTemporada 2\nRELEASE DATE\n2027-01-10\nIMAGE\nhttps://example.com/e1.jpg\nTITLE\nT-14 // AVISO DE EXPIRAÇÃO\nDESCRIPTION\nSinal crítico.\nCONTENT\nTexto original.\nEND EPISODE',
      html: 'EPISODE s2-e1 - T-14 // AVISO DE EXPIRAÇÃO<br>CATEGORY<br>Temporada 2<br>RELEASE DATE<br>2027-01-10<br>IMAGE<br>https://example.com/e1.jpg<br>TITLE<br>T-14 // AVISO DE EXPIRAÇÃO<br>DESCRIPTION<br>Sinal crítico.<br>CONTENT<br><em>Texto original.</em><br>END EPISODE'
    }
  ], 'GLITCH_IN_THE_MATRIX_S2_JONAHS_LEGACY_PT.docx');

  assert.equal(parsed.episodes.length, 1);
  assert.equal(parsed.episodes[0].episodeId, 's2-e1');
  assert.equal(parsed.episodes[0].title, 'T-14 // AVISO DE EXPIRAÇÃO');
  assert.equal(parsed.episodes[0].content, '<em>Texto original.</em>');
});

test('cabeçalho inline e metadado EPISODE do mesmo slug formam um único episódio', () => {
  const parsed = parseEditorialBlocks([
    { tag: 'p', text: "GLITCH IN THE MATRIX - S2 // JONAH'S LEGACY" },
    { tag: 'p', text: 'EPISODE s2-e1 - T-14 // AVISO DE EXPIRAÇÃO' },
    { tag: 'p', text: 'EPISODE\ns2-e1\nCATEGORY\nTemporada 2\nCONTENT' },
    {
      tag: 'p',
      text: '<p><em>Hellcife. Bunker da Red Team...</em></p>',
      html: '&lt;p&gt;&lt;em&gt;Hellcife. Bunker da Red Team...&lt;/em&gt;&lt;/p&gt;'
    },
    { tag: 'p', text: 'END EPISODE' }
  ], 'GLITCH_IN_THE_MATRIX_S2_JONAHS_LEGACY_PT.docx');

  assert.equal(parsed.episodes.length, 1);
  assert.equal(parsed.episodes[0].slug, 's2-e1');
  assert.equal(
    parsed.episodes[0].content,
    '<p><em>Hellcife. Bunker da Red Team...</em></p>'
  );
});

test('pairing reconhece fontes PT e EN do mesmo cânone sem unir conteúdo', () => {
  const canonical = canonicalKey({
    saga: 'GLITCH IN THE MATRIX',
    season: 2,
    edition: "JONAH'S LEGACY"
  });
  const pairing = sourcePairingStatus(canonical, [
    {
      name: 'GLITCH_IN_THE_MATRIX_S2_JONAHS_LEGACY_PT.docx',
      support: { status: 'SUPPORTED' }
    },
    {
      name: 'GLITCH_IN_THE_MATRIX_S2_JONAHS_LEGACY_EN.docx',
      support: { status: 'SUPPORTED' }
    }
  ]);

  assert.equal(canonical, 'glitch-in-the-matrix-s2-jonahs-legacy');
  assert.deepEqual(pairing, {
    'pt-BR': 'CONNECTED',
    'en-US': 'CONNECTED'
  });
});

test('validação bloqueia idioma divergente e slugs duplicados', () => {
  const parsed = parseEditorialBlocks(sourceBlocks, 'source.docx');
  parsed.episodes[1].slug = parsed.episodes[0].slug;

  const validation = validateParsed(parsed, 'en-US');

  assert.equal(validation.status, 'BLOCKED');
  assert.match(validation.blocked.join(' '), /diverge/);
  assert.match(validation.blocked.join(' '), /duplicado/);
});

test('PT cria exatamente oito documentos canônicos não publicados em global-sagas', () => {
  const parsed = seasonTwo('pt-BR');
  const plan = createEpisodeWritePlan(parsed, 'pt-BR', 'checksum-pt', {});
  const writes = firestoreWritesForPlan(plan);
  const contract = dryRunContract(plan);

  assert.equal(COLLECTION, 'global-sagas');
  assert.deepEqual(expectedEpisodeIds(), [
    's2-e1', 's2-e2', 's2-e3', 's2-e4',
    's2-e5', 's2-e6', 's2-e7', 's2-e8'
  ]);
  assert.deepEqual(plan.items.map(item => item.id), expectedEpisodeIds());
  assert.ok(plan.items.every(item => item.action === 'CREATE'));
  assert.ok(plan.items.every(item => item.sourceChecksum === 'checksum-pt'));
  assert.equal(writes.length, 8);
  assert.ok(writes.every(write => write.currentDocument.exists === false));
  assert.ok(writes.every(write => /\/global-sagas\/s2-e[1-8]$/.test(write.update.name)));
  assert.equal(writes[0].update.fields.title.stringValue, 'Episódio 1');
  assert.equal(writes[0].update.fields.category.stringValue, 'Temporada 2');
  assert.equal(writes[0].update.fields.description.stringValue, 'Descrição 1');
  assert.equal(writes[0].update.fields.content.stringValue, '<p>pt-BR content 1</p>');
  assert.equal(writes[0].update.fields.mode.stringValue, 'hybrid');
  assert.equal(writes[0].update.fields.published.booleanValue, false);
  assert.equal(contract.firestoreWrites, 0);
  assert.equal(contract.catalog, 'WOULD WRITE 8 EPISODES TO global-sagas');
  assert.equal(contract.initialPublicState, 'published = false');
});

test('EN usa campos _en e merge preserva todos os campos PT', () => {
  const pt = seasonTwo('pt-BR');
  const en = seasonTwo('en-US');
  const existing = existingDocuments(pt, 'pt-BR');
  const plan = createEpisodeWritePlan(en, 'en-US', 'checksum-en', existing);
  const writes = firestoreWritesForPlan(plan);

  assert.ok(plan.items.every(item => item.action === 'MERGE_EN'));
  assert.deepEqual(Object.keys(plan.items[0].writeFields).sort(), [
    'category_en', 'content_en', 'description_en', 'title_en'
  ]);
  assert.deepEqual(writes[0].updateMask.fieldPaths.sort(), [
    'category_en', 'content_en', 'description_en', 'title_en'
  ]);
  assert.equal(Object.hasOwn(writes[0].update.fields, 'title'), false);
  assert.equal(Object.hasOwn(writes[0].update.fields, 'content'), false);
  assert.equal(writes[0].currentDocument.updateTime, existing['s2-e1'].updateTime);
});

test('PT merge preserva EN e não inclui campos _en no field mask', () => {
  const pt = seasonTwo('pt-BR');
  const en = seasonTwo('en-US');
  const existing = existingDocuments(en, 'en-US');
  const plan = createEpisodeWritePlan(pt, 'pt-BR', 'checksum-pt', existing);
  const writes = firestoreWritesForPlan(plan);

  assert.ok(plan.items.every(item => item.action === 'MERGE_PT'));
  assert.deepEqual(writes[0].updateMask.fieldPaths.sort(), [
    'category', 'content', 'description', 'title'
  ]);
  assert.equal(writes[0].updateMask.fieldPaths.some(field => field.endsWith('_en')), false);
});

test('reimport idêntico é UNCHANGED e divergência compartilhada vira CONFLICT', () => {
  const pt = seasonTwo('pt-BR');
  const existing = existingDocuments(pt, 'pt-BR');
  const unchanged = createEpisodeWritePlan(pt, 'pt-BR', 'checksum-pt', existing);
  assert.ok(unchanged.items.every(item => item.action === 'UNCHANGED'));
  assert.deepEqual(firestoreWritesForPlan(unchanged), []);

  existing['s2-e4'].fields.image = 'https://raquelsynths.com/divergent.jpg';
  const conflict = createEpisodeWritePlan(pt, 'pt-BR', 'checksum-pt', existing);
  assert.equal(conflict.items.find(item => item.id === 's2-e4').action, 'CONFLICT');
  assert.throws(() => firestoreWritesForPlan(conflict), /plano contém conflitos/i);
});

test('Season 1 e documento agregado são bloqueados pelo plano', () => {
  const parsed = seasonTwo('pt-BR');
  parsed.season = 1;
  parsed.episodes = parsed.episodes.map((episode, index) => ({
    ...episode,
    number: index + 1,
    episodeId: `s1-e${index + 1}`,
    slug: `s1-e${index + 1}`
  }));
  const plan = createEpisodeWritePlan(parsed, 'pt-BR', 'checksum', {});

  assert.ok(plan.items.every(item => item.action === 'BLOCKED'));
  assert.ok(plan.items.every(item => item.id.startsWith('s2-e')));
  assert.equal(plan.items.some(item => item.id.includes('--pt')), false);
});

test('coleção antiga não é alvo e leitores públicos mantêm o contrato global-sagas', () => {
  const importer = readFileSync(new URL('../api/admin/global-sagas.js', import.meta.url), 'utf8');
  const contentService = readFileSync(new URL('../src/app/services/content.service.ts', import.meta.url), 'utf8');
  const routes = readFileSync(new URL('../src/app/app.routes.ts', import.meta.url), 'utf8');
  const sitemap = readFileSync(new URL('../api/sitemap.js', import.meta.url), 'utf8');
  const retiredCollection = ['editorial', 'global', 'saga', 'imports'].join('-');

  assert.equal(importer.includes(retiredCollection), false);
  assert.equal(DRIVE_SCOPE, 'https://www.googleapis.com/auth/drive.readonly');
  assert.ok(contentService.includes("'global-sagas'"));
  assert.ok(contentService.includes('episode.published !== true'));
  assert.ok(contentService.includes('releaseDate'));
  assert.ok(routes.includes("path: 'hybrid-saga'"));
  assert.ok(routes.includes("path: 'hybrid-reader/:id'"));
  assert.ok(sitemap.includes("fetchCollection('global-sagas')"));
  assert.ok(sitemap.includes('fields?.published?.booleanValue === true'));
});

test('formato .doc legado é explicitamente bloqueado', () => {
  const support = supportFor({
    name: 'legacy-season.doc',
    mimeType: 'application/msword'
  });

  assert.equal(support.status, 'BLOCKED');
  assert.equal(
    support.message,
    'Formato .doc legado detectado. Converta para .docx antes da importação.'
  );
});
