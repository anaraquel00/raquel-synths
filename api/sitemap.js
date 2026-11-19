/* api/sitemap.js */

import {
  isPublicationEligible,
  normalizeLegacyPublicationFlag
} from '../shared/editorial-publication.js';

export default async function handler(req, res) {
  // =====================================================
  // HEADERS
  // =====================================================

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');

  res.setHeader(
    'Cache-Control',
    'public, max-age=300, s-maxage=3600, stale-while-revalidate=300'
  );

  const siteUrl = 'https://raquelsynths.com';

  const now = new Date();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;

  xml +=
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  const escapeXml = (value = '') =>
    String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const normalizeDate = (value) => {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return date.toISOString().split('T')[0];
  };

  const appendUrl = ({
    path,
    lastmod,
    changefreq,
    priority
  }) => {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>\n`;

    if (lastmod) {
      xml += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
    }

    if (changefreq) {
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
    }

    if (priority) {
      xml += `    <priority>${priority}</priority>\n`;
    }

    xml += `  </url>\n`;
  };

  // =====================================================
  // 1. ROTAS ESTÁTICAS REALMENTE PRERENDERIZADAS
  // =====================================================

  const staticRoutes = [
    {
      path: '',
      lastmod: '2026-09-19',
      priority: '1.0'
    },

    {
      path: '/compliance',
      lastmod: '2026-09-19',
      priority: '0.7'
    },

    {
      path: '/dossier',
      priority: '0.7'
    },

    {
      path: '/creator',
      priority: '0.6'
    },

    {
      path: '/contato',
      priority: '0.5'
    },

    {
      path: '/saga',
      priority: '0.8'
    },

    {
      path: '/logs-archive',
      priority: '0.8'
    },
    {
      path: '/hybrid-saga',
      priority: '0.8'
    }
  ];

  for (const route of staticRoutes) {
    appendUrl({
      path: route.path,
      lastmod: route.lastmod,
      changefreq: 'weekly',
      priority: route.priority
    });
  }

  // =====================================================
  // 2. SUMÁRIOS DAS SAGAS
  //
  // 4 páginas prerenderizadas:
  //
  // /visual-novel/broklin/s1
  // /visual-novel/broklin/s2
  // /visual-novel/jonah/s1
  // /visual-novel/jonah/s2
  // =====================================================

  const visualNovelRoutes = [
    '/visual-novel/broklin/s1',
    '/visual-novel/broklin/s2',

    '/visual-novel/jonah/s1',
    '/visual-novel/jonah/s2'
  ];

  for (const path of visualNovelRoutes) {
    appendUrl({
      path,
      changefreq: 'weekly',
      priority: '0.9'
    });
  }

  // =====================================================
  // 3. FIRESTORE
  // =====================================================

  const projectId = 'raquel-synths-platform';

  const firestoreBaseUrl =
    `https://firestore.googleapis.com/v1/projects/` +
    `${projectId}/databases/(default)/documents`;

  /**
   * Busca uma collection inteira.
   *
   * pageSize 300 é suficiente para as duas sagas atuais.
   */
  const fetchCollection = async (collectionName) => {
    try {
      const response = await fetch(
        `${firestoreBaseUrl}/${collectionName}?pageSize=300`
      );

      if (!response.ok) {
        console.error(
          `[RQS SITEMAP] Firestore HTTP ${response.status}: ${collectionName}`
        );

        return [];
      }

      const data = await response.json();

      return Array.isArray(data.documents)
        ? data.documents
        : [];

    } catch (error) {
      console.error(
        `[RQS SITEMAP] Falha ao buscar ${collectionName}:`,
        error instanceof Error
          ? error.message
          : String(error)
      );

      return [];
    }
  };

  // =====================================================
  // 4. CARREGA APENAS SYSTEM LOGS
  //
  // Os previews /lore/... e /hybrid-reader/... permanecem
  // acessíveis, mas são noindex, follow e não são anunciados
  // pelo sitemap.
  // =====================================================

  const logsDocs =
    await fetchCollection('logs');

  // =====================================================
// 7. LOGS PUBLICADOS
// =====================================================

const appendPublishedLogs = (documents) => {
  documents.forEach((doc) => {

    const id =
      doc.name?.split('/').pop();

    if (!id) {
      return;
    }

    // Página de navegação/ponte, não é artigo
    if (id === 'system-archive') {
      return;
    }

    const fields = doc.fields ?? {};

    const dateValue =
      fields.date?.stringValue ??
      fields.date?.timestampValue;

    if (!isPublicationEligible({
      published: normalizeLegacyPublicationFlag(
        fields.published?.booleanValue
      ),
      releaseDate: dateValue
    }, now)) {
      return;
    }

    const hasSubstantiveLocale = (locale) => {
      const localeFields =
        locale?.mapValue?.fields ?? {};

      const title =
        localeFields.title?.stringValue?.trim();

      const hasBody = [
        'description',
        'techContent',
        'jonahComment'
      ].some((key) =>
        localeFields[key]?.stringValue?.trim()
      );

      return Boolean(title && hasBody);
    };

    if (
      !hasSubstantiveLocale(fields.pt) &&
      !hasSubstantiveLocale(fields.en)
    ) {
      return;
    }

    const orderDate =
      fields.orderDate?.stringValue ??
      fields.orderDate?.timestampValue;

    const lastmod =
      normalizeDate(
        doc.updateTime ??
        orderDate ??
        dateValue
      );

    appendUrl({
      path:
        `/log-reader/${encodeURIComponent(id)}`,

      lastmod,
      changefreq: 'monthly',
      priority: '0.7'
    });
  });
};

appendPublishedLogs(logsDocs);

  // =====================================================
  // FINAL
  // =====================================================

  xml += `</urlset>`;

  return res
    .status(200)
    .send(xml);
}
