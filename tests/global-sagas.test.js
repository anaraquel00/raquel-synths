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
  assert.equal(parsed.canonicalKey, 'glitch-in-the-matrix-s2-jonah-s-legacy');
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
