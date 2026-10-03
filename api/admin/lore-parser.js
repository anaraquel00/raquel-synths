const VALID_LANGUAGES = new Set(['pt-BR', 'en-US']);
const VALID_MODES = new Set(['broklin', 'jonah']);

function decodeEntities(value) {
  return String(value || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function htmlText(value) {
  return decodeEntities(
    String(value || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  ).trim();
}

function htmlBlocks(html) {
  const blocks = [];
  const pattern = /<(h[1-6]|p|li|blockquote|pre)\b[^>]*>([\s\S]*?)<\/\1>|<img\b[^>]*>/gi;
  let match;
  let imageIndex = 0;

  while ((match = pattern.exec(String(html || '')))) {
    if (/^<img\b/i.test(match[0])) {
      imageIndex += 1;
      blocks.push({
        tag: 'img',
        text: `[EMBEDDED IMAGE ${imageIndex}]`
      });
      continue;
    }

    const text = htmlText(match[2]);
    if (text) {
      blocks.push({
        tag: match[1].toLowerCase(),
        text,
        html: match[2]
      });
    }
  }

  return blocks;
}

async function docxBlocks(buffer) {
  const mammothModule = await import('mammoth');
  const mammoth = mammothModule.default || mammothModule;
  const result = await mammoth.convertToHtml(
    { buffer },
    {
      includeDefaultStyleMap: true,
      styleMap: [
        "p[style-name='Episode'] => h2:fresh",
        "p[style-name='Episódio'] => h2:fresh",
        "p[style-name='Episode Title'] => h2:fresh",
        "p[style-name='Título do Episódio'] => h2:fresh"
      ]
    }
  );

  return {
    blocks: htmlBlocks(result.value),
    parserWarnings: (result.messages || []).map(message => message.message)
  };
}

function normalizeLanguage(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replaceAll('_', '-');

  if (['pt', 'pt-br', 'portuguese', 'português', 'portugues'].includes(normalized)) {
    return 'pt-BR';
  }
  if (['en', 'en-us', 'english', 'inglês', 'ingles'].includes(normalized)) {
    return 'en-US';
  }
  return '';
}

function inferLanguageFromName(name) {
  const match = /(?:^|[\s._-])(pt(?:[\s._-]*br)?|en(?:[\s._-]*us)?)(?:[\s._-]|$)/i.exec(
    String(name || '')
  );
  return normalizeLanguage(match?.[1] || '');
}

function canonicalEpisodeId(value) {
  const match = /^s(\d+)-e(\d+)$/i.exec(String(value || '').trim());
  if (!match) return '';
  const season = Number(match[1]);
  const episode = Number(match[2]);
  if (season < 1 || episode < 1) return '';
  return `s${season}-e${episode}`;
}

function episodeMarker(line) {
  const text = String(line || '').trim();
  const canonical = /^EPISODE\s+(s\d+-e\d+)(?:\s*[-—]\s*(.+))?$/i.exec(text);
  if (canonical) {
    return {
      id: canonicalEpisodeId(canonical[1]),
      titleHint: canonical[2]?.trim() || ''
    };
  }

  const compact = /^(s\d+-e\d+)(?:\s*[-—]\s*(.+))?$/i.exec(text);
  if (compact) {
    return {
      id: canonicalEpisodeId(compact[1]),
      titleHint: compact[2]?.trim() || ''
    };
  }

  return null;
}

function isValidReleaseDate(value) {
  const text = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

function isValidImage(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  try {
    const parsed = new URL(text);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function logicalBlocks(inputBlocks) {
  return inputBlocks.flatMap((sourceBlock, sourceIndex) => {
    const rawText = String(sourceBlock?.text || '').replace(/\r\n?/g, '\n');

    if (typeof sourceBlock?.html !== 'string') {
      return rawText.split('\n').map((text, index) => ({
        text: text.trim(),
        separatorBefore: index ? '\n' : '',
        sourceIndex
      }));
    }

    const html = sourceBlock.html;
    const lines = [];
    const breakPattern = /<br\s*\/?>/gi;
    let cursor = 0;
    let separatorBefore = '';
    let match;

    while ((match = breakPattern.exec(html))) {
      const segment = html.slice(cursor, match.index);
      lines.push({
        text: htmlText(segment),
        separatorBefore,
        sourceIndex
      });
      separatorBefore = '\n';
      cursor = match.index + match[0].length;
    }

    const segment = html.slice(cursor);
    lines.push({
      text: htmlText(segment),
      separatorBefore,
      sourceIndex
    });
    return lines;
  });
}

const FIELD_LABELS = new Map([
  ['EPISODE', 'episode'],
  ['CATEGORY', 'category'],
  ['RELEASE DATE', 'releaseDate'],
  ['IMAGE', 'image'],
  ['TITLE', 'title'],
  ['DESCRIPTION', 'description'],
  ['CONTENT', 'content']
]);

function fieldLabel(line) {
  return FIELD_LABELS.get(String(line || '').trim().toUpperCase()) || '';
}

function parseInlineField(line) {
  const match = /^(EPISODE|CATEGORY|RELEASE DATE|IMAGE|TITLE|DESCRIPTION|CONTENT)\s*[:：]\s*(.*)$/i.exec(
    String(line || '').trim()
  );
  if (!match) return null;
  return {
    field: FIELD_LABELS.get(match[1].toUpperCase()),
    value: match[2].trim()
  };
}

export function parseLoreBlocks(
  inputBlocks,
  { sourceName = '', language = '' } = {}
) {
  const confirmedLanguage = normalizeLanguage(language);
  const inferredLanguage = inferLanguageFromName(sourceName);
  const resolvedLanguage = confirmedLanguage || inferredLanguage;
  const warnings = [];
  const episodes = [];
  let current = null;
  let pendingField = '';
  let inContent = false;
  let contentParts = [];
  let lastContentSourceIndex = -1;

  const closeEpisode = () => {
    if (!current) return;
    if (contentParts.length) {
      current.content = contentParts.join('');
    }
    episodes.push(current);
    current = null;
    pendingField = '';
    inContent = false;
    contentParts = [];
    lastContentSourceIndex = -1;
  };

  const startEpisode = marker => {
    if (!marker?.id) return;

    if (current?.id === marker.id) {
      if (!current.title && marker.titleHint) current.title = marker.titleHint;
      return;
    }

    closeEpisode();
    current = {
      id: marker.id,
      category: '',
      releaseDate: '',
      image: '',
      title: marker.titleHint || '',
      description: '',
      content: ''
    };
  };

  const setField = (name, value) => {
    const text = String(value || '').trim();
    if (name === 'episode') {
      const marker = episodeMarker(text);
      if (marker) startEpisode(marker);
      return;
    }
    if (!current) return;
    current[name] = text;
  };

  const appendContent = block => {
    const text = block.text;
    if (!text) return;
    if (lastContentSourceIndex === block.sourceIndex && contentParts.length) {
      contentParts.push(block.separatorBefore + text);
    } else {
      if (contentParts.length) contentParts.push('\n');
      contentParts.push(text);
    }
    lastContentSourceIndex = block.sourceIndex;
  };

  for (const block of logicalBlocks(inputBlocks || [])) {
    const text = block.text;

    if (inContent) {
      const marker = episodeMarker(text);
      if (marker) {
        startEpisode(marker);
        continue;
      }
      if (/^END EPISODE$/i.test(text)) {
        closeEpisode();
        continue;
      }
      appendContent(block);
      continue;
    }

    if (!text) continue;

    const marker = episodeMarker(text);
    if (marker) {
      pendingField = '';
      startEpisode(marker);
      continue;
    }

    if (pendingField) {
      if (pendingField === 'content') {
        inContent = true;
        contentParts = [];
        appendContent(block);
        pendingField = '';
        continue;
      }
      setField(pendingField, text);
      pendingField = '';
      continue;
    }

    const inline = parseInlineField(text);
    if (inline) {
      if (inline.field === 'episode') {
        setField('episode', inline.value);
      } else if (inline.field === 'content') {
        if (!current) {
          warnings.push('CONTENT encontrado antes de EPISODE.');
          continue;
        }

        inContent = true;
        contentParts = [];
        lastContentSourceIndex = -1;

        if (inline.value) {
          appendContent({
            text: inline.value,
            separatorBefore: '',
            sourceIndex: block.sourceIndex
          });
        }
      } else if (inline.field && inline.value) {
        setField(inline.field, inline.value);
      }
      continue;
    }

    const label = fieldLabel(text);
    if (label) {
      if (label === 'content') {
        if (!current) {
          warnings.push('CONTENT encontrado antes de EPISODE.');
          continue;
        }
        inContent = true;
        contentParts = [];
        lastContentSourceIndex = -1;
      } else {
        pendingField = label;
      }
      continue;
    }
  }

  closeEpisode();

  return {
    language: resolvedLanguage,
    inferredLanguage,
    sourceName,
    warnings,
    episodes
  };
}

export async function parseLoreDocxBuffer(
  buffer,
  options = {}
) {
  const { blocks, parserWarnings } = await docxBlocks(buffer);
  const parsed = parseLoreBlocks(blocks, options);
  return {
    ...parsed,
    warnings: [...parserWarnings, ...parsed.warnings]
  };
}

export function validateLoreDocument(parsed, expectedLanguage = '') {
  const blocked = [];
  const warnings = [...(parsed?.warnings || [])];
  const language = normalizeLanguage(expectedLanguage || parsed?.language || '');

  if (!VALID_LANGUAGES.has(language)) {
    blocked.push('Idioma PT-BR ou EN-US não identificado.');
  }
  if (parsed?.language && language && parsed.language !== language) {
    blocked.push(
      `Idioma detectado (${parsed.language}) diverge do idioma esperado (${language}).`
    );
  }
  if (!parsed?.episodes?.length) {
    blocked.push('Nenhum episódio foi identificado.');
  }

  const ids = new Set();
  for (const episode of parsed?.episodes || []) {
    if (!episode.id) {
      blocked.push('Episódio sem ID canônico sN-eN.');
      continue;
    }
    if (ids.has(episode.id)) {
      blocked.push(`EPISODE duplicado: ${episode.id}.`);
    }
    ids.add(episode.id);

    if (!episode.category) blocked.push(`${episode.id}: CATEGORY ausente.`);
    if (!episode.releaseDate) {
      blocked.push(`${episode.id}: RELEASE DATE ausente.`);
    } else if (!isValidReleaseDate(episode.releaseDate)) {
      blocked.push(`${episode.id}: RELEASE DATE deve usar YYYY-MM-DD.`);
    }
    if (!episode.image) {
      blocked.push(`${episode.id}: IMAGE ausente.`);
    } else if (!isValidImage(episode.image)) {
      blocked.push(`${episode.id}: IMAGE deve ser uma URL HTTPS válida.`);
    }
    if (!episode.title) blocked.push(`${episode.id}: TITLE ausente.`);
    if (!episode.description) blocked.push(`${episode.id}: DESCRIPTION ausente.`);
    if (!episode.content) blocked.push(`${episode.id}: CONTENT ausente.`);
  }

  return {
    status: blocked.length ? 'BLOCKED' : 'PASS',
    blocked,
    warnings,
    language
  };
}

export function pairLoreDocuments({
  mode,
  pt,
  en
}) {
  if (!VALID_MODES.has(mode)) {
    return {
      status: 'BLOCKED',
      collection: '',
      blocked: ['Mode deve ser broklin ou jonah.'],
      documents: []
    };
  }

  const ptValidation = validateLoreDocument(pt, 'pt-BR');
  const enValidation = validateLoreDocument(en, 'en-US');
  const blocked = [
    ...ptValidation.blocked.map(value => `PT-BR: ${value}`),
    ...enValidation.blocked.map(value => `EN-US: ${value}`)
  ];

  const collection = mode === 'broklin' ? 'lore' : 'lore-jonah';
  const ptById = new Map((pt?.episodes || []).map(ep => [ep.id, ep]));
  const enById = new Map((en?.episodes || []).map(ep => [ep.id, ep]));
  const allIds = [...new Set([...ptById.keys(), ...enById.keys()])]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const documents = [];

  for (const id of allIds) {
    const ptEpisode = ptById.get(id);
    const enEpisode = enById.get(id);

    if (!ptEpisode) {
      blocked.push(`${id}: versão PT-BR ausente.`);
      continue;
    }
    if (!enEpisode) {
      blocked.push(`${id}: versão EN-US ausente.`);
      continue;
    }
    if (ptEpisode.releaseDate !== enEpisode.releaseDate) {
      blocked.push(
        `${id}: RELEASE DATE diverge entre PT-BR (${ptEpisode.releaseDate}) e EN-US (${enEpisode.releaseDate}).`
      );
    }
    if (ptEpisode.image !== enEpisode.image) {
      blocked.push(`${id}: IMAGE diverge entre PT-BR e EN-US.`);
    }

    documents.push({
      id,
      collection,
      fields: {
        title: ptEpisode.title,
        title_en: enEpisode.title,
        category: ptEpisode.category,
        category_en: enEpisode.category,
        content: ptEpisode.content,
        content_en: enEpisode.content,
        description: ptEpisode.description,
        description_en: enEpisode.description,
        image: ptEpisode.image,
        mode,
        published: true,
        releaseDate: ptEpisode.releaseDate
      }
    });
  }

  return {
    status: blocked.length ? 'BLOCKED' : 'PASS',
    collection,
    blocked,
    warnings: [
      ...ptValidation.warnings.map(value => `PT-BR: ${value}`),
      ...enValidation.warnings.map(value => `EN-US: ${value}`)
    ],
    documents
  };
}
