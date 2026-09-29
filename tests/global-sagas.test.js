import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {
  COLLECTION,
  canonicalKey,
  docxBlocks,
  editorialDraft,
  importDocumentId,
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

test('rascunho editorial é privado, não publicado e separado do catálogo público', () => {
  const parsed = parseEditorialBlocks(sourceBlocks, 'source.docx');
  const source = {
    documentId: 'drive_document_123',
    name: 'jonah-season-2-pt-BR.docx',
    modifiedTime: '2026-09-29T10:00:00.000Z'
  };
  const draft = editorialDraft(parsed, 'pt-BR', source);

  assert.equal(COLLECTION, 'editorial-global-saga-imports');
  assert.equal(draft.status, 'draft');
  assert.equal(draft.published, false);
  assert.equal(draft.publication, 'NO');
  assert.equal(draft.source.provider, 'google-drive');
  assert.equal(importDocumentId(parsed.canonicalKey, 'pt-BR'), `${parsed.canonicalKey}--pt-br`);
  assert.equal(canonicalKey(parsed), parsed.canonicalKey);
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
