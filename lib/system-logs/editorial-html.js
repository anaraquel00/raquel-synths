import sanitizeHtml from 'sanitize-html';

const EXTRA_EDITORIAL_TAGS = [
  'del',
  'details',
  'img',
  'ins',
  'picture',
  'source',
  'summary'
];

const BLOCKED_ACTIVE_TAGS = new Set([
  'applet',
  'audio',
  'base',
  'button',
  'canvas',
  'embed',
  'form',
  'frame',
  'frameset',
  'iframe',
  'input',
  'link',
  'math',
  'meta',
  'noscript',
  'object',
  'option',
  'script',
  'select',
  'style',
  'svg',
  'template',
  'textarea',
  'video',
  'xmp'
]);

const EDITORIAL_TAGS = [
  ...new Set([
    ...sanitizeHtml.defaults.allowedTags,
    ...EXTRA_EDITORIAL_TAGS
  ])
].filter(tag => !BLOCKED_ACTIVE_TAGS.has(tag));

const EDITORIAL_TAG_SET = new Set(EDITORIAL_TAGS);
const SELF_CLOSING_TAGS = [
  ...new Set([
    ...sanitizeHtml.defaults.selfClosing,
    'col',
    'source',
    'wbr'
  ])
];
const SELF_CLOSING_TAG_SET = new Set(SELF_CLOSING_TAGS);

const EDITORIAL_ATTRIBUTES = {
  '*': [
    'dir',
    'lang',
    'title'
  ],
  a: [
    'href',
    'rel',
    'target',
    'title'
  ],
  blockquote: ['cite'],
  col: ['span', 'width'],
  colgroup: ['span', 'width'],
  data: ['value'],
  del: ['cite', 'datetime'],
  details: ['open'],
  img: [
    'alt',
    'decoding',
    'height',
    'loading',
    'src',
    'srcset',
    'title',
    'width'
  ],
  ins: ['cite', 'datetime'],
  li: ['value'],
  ol: ['reversed', 'start', 'type'],
  q: ['cite'],
  source: [
    'height',
    'media',
    'sizes',
    'src',
    'srcset',
    'type',
    'width'
  ],
  td: ['colspan', 'headers', 'rowspan'],
  th: ['abbr', 'colspan', 'headers', 'rowspan', 'scope'],
  time: ['datetime']
};

const URL_ATTRIBUTES = new Set(['cite', 'href', 'src']);
const NON_TEXT_TAGS = [
  ...BLOCKED_ACTIVE_TAGS
];

function attributeName(attribute) {
  return typeof attribute === 'string' ? attribute : attribute?.name;
}

function allowedAttribute(tagName, name) {
  return [
    ...(EDITORIAL_ATTRIBUTES['*'] || []),
    ...(EDITORIAL_ATTRIBUTES[tagName] || [])
  ].some(attribute => attributeName(attribute) === name);
}

function safeEditorialUrl(value) {
  const candidate = String(value || '').trim();
  if (!candidate || /[\u0000-\u001f\u007f]/u.test(candidate)) return false;
  if (candidate.startsWith('//')) return false;
  const scheme = /^([a-z][a-z0-9+.-]*):/iu.exec(candidate)?.[1]?.toLowerCase();
  return !scheme || scheme === 'http' || scheme === 'https';
}

function invalidDiagnostic(sourceFormat, details = []) {
  return {
    sourceFormat,
    sanitization: 'FAIL',
    editorialContent: 'FAIL',
    securityChanges: details.length,
    securityChangeDetails: details,
    renderableContent: 'FAIL',
    publishAllowed: 'NO'
  };
}

function meaningfulContent(content) {
  const text = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {}
  })
    .replace(/&(?:nbsp|#160|#xa0);/giu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();

  return Boolean(text || /<img\b[^>]*\bsrc\s*=/iu.test(content));
}

function sanitizeEditorialHtml(value) {
  const source = String(value || '').replace(/\r\n?/g, '\n').trim();

  if (!source) {
    return {
      content: '',
      diagnostic: invalidDiagnostic('PLAIN_TEXT')
    };
  }

  if (!/<[a-z!/][^>]*>/iu.test(source)) {
    return {
      content: '',
      diagnostic: invalidDiagnostic('PLAIN_TEXT')
    };
  }

  let securityChanges = 0;
  const securityChangeDetails = [];

  const recordChange = detail => {
    securityChanges += 1;
    if (
      securityChangeDetails.length < 20 &&
      !securityChangeDetails.includes(detail)
    ) {
      securityChangeDetails.push(detail);
    }
  };

  try {
    const content = sanitizeHtml(source, {
      allowedTags: EDITORIAL_TAGS,
      allowedAttributes: EDITORIAL_ATTRIBUTES,
      allowedSchemes: ['http', 'https'],
      allowedSchemesByTag: {},
      allowedSchemesAppliedToAttributes: ['cite', 'href', 'src'],
      allowProtocolRelative: false,
      disallowedTagsMode: 'discard',
      nonTextTags: NON_TEXT_TAGS,
      selfClosing: SELF_CLOSING_TAGS,
      parseStyleAttributes: false,
      transformTags: {
        a: (tagName, attributes) => {
          if (!attributes.href) return { tagName, attribs: attributes };
          return {
            tagName,
            attribs: {
              ...attributes,
              target: '_blank',
              rel: 'noopener noreferrer'
            }
          };
        }
      },
      onOpenTag: (tagName, attributes) => {
        if (!EDITORIAL_TAG_SET.has(tagName)) {
          recordChange(`elemento <${tagName}> não suportado removido`);
          return;
        }

        for (const [name, attributeValue] of Object.entries(attributes)) {
          if (!allowedAttribute(tagName, name)) {
            recordChange(`atributo ${name} removido de <${tagName}>`);
            continue;
          }

          if (URL_ATTRIBUTES.has(name) && !safeEditorialUrl(attributeValue)) {
            recordChange(`URL insegura em ${name} removida de <${tagName}>`);
          }

          if (
            name === 'srcset' &&
            /(?:javascript|vbscript|data)\s*:/iu.test(attributeValue)
          ) {
            recordChange(`URL insegura em srcset removida de <${tagName}>`);
          }
        }

        if (
          tagName === 'a' &&
          attributes.href &&
          safeEditorialUrl(attributes.href) &&
          (
            attributes.target !== '_blank' ||
            attributes.rel !== 'noopener noreferrer'
          )
        ) {
          recordChange('atributos de segurança normalizados em <a>');
        }
      },
      onCloseTag: (tagName, isImplied) => {
        if (
          isImplied &&
          EDITORIAL_TAG_SET.has(tagName) &&
          !SELF_CLOSING_TAG_SET.has(tagName)
        ) {
          recordChange('estrutura HTML malformada normalizada');
        }
      }
    }).trim();

    const editorialContent = meaningfulContent(content);

    return {
      content,
      diagnostic: {
        sourceFormat: 'HTML',
        sanitization: securityChanges ? 'PASS WITH CHANGES' : 'PASS',
        editorialContent: editorialContent ? 'PASS' : 'FAIL',
        securityChanges,
        securityChangeDetails,
        renderableContent: editorialContent ? 'PASS' : 'FAIL',
        publishAllowed: editorialContent ? 'YES' : 'NO'
      }
    };
  } catch {
    return {
      content: '',
      diagnostic: invalidDiagnostic('HTML', ['falha interna de sanitização'])
    };
  }
}

export {
  EDITORIAL_ATTRIBUTES,
  EDITORIAL_TAGS,
  sanitizeEditorialHtml
};
