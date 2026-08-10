/* api/sitemap.js */

export default async function handler(req, res) {
  // =====================================================
  // HEADERS
  // =====================================================

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');

  res.setHeader(
    'Cache-Control',
    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600'
  );

  const siteUrl = 'https://raquelsynths.com';

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

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
      return todayStr;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return todayStr;
    }

    return date.toISOString().split('T')[0];
  };

  const appendUrl = ({
    path,
    lastmod = todayStr,
    changefreq,
    priority
  }) => {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>\n`;
    xml += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;

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
  //
  // 8 páginas
  // =====================================================

  const staticRoutes = [
    {
      path: '',
      priority: '1.0'
    },

    {
      path: '/compliance',
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
      path: '/discografia',
      priority: '0.9'
    },

    {
      path: '/musical-archives',
      priority: '0.8'
    },

    {
      path: '/saga',
      priority: '0.8'
    },

    {
      path: '/logs-archive',
      priority: '0.8'
    }
  ];

  for (const route of staticRoutes) {
    appendUrl({
      path: route.path,
      lastmod: todayStr,
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
      lastmod: todayStr,
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
  // 4. CARREGA BROKLIN + JONAH
  //
  // Importante:
  //
  // lore       -> /lore/broklin/:id
  // lore-jonah -> /lore/jonah/:id
  // =====================================================

  const [
    broklinDocs,
    jonahDocs,
    logsDocs
  ] = await Promise.all([
    fetchCollection('lore'),
    fetchCollection('lore-jonah'),
    fetchCollection('logs')
  ]);

  // =====================================================
  // 5. FILTRO DE PUBLICAÇÃO
  // =====================================================

  const isPublicEpisode = (doc) => {
    const fields = doc?.fields ?? {};

    /**
     * Documento precisa estar explicitamente publicado.
     */
    const published =
      fields?.published?.booleanValue === true;

    if (!published) {
      return false;
    }

    /**
     * Não indexar episódios do futuro.
     */
    const releaseDateValue =
      fields?.releaseDate?.stringValue ??
      fields?.releaseDate?.timestampValue;

    if (releaseDateValue) {
      const releaseDate = new Date(releaseDateValue);

      if (
        !Number.isNaN(releaseDate.getTime()) &&
        releaseDate > now
      ) {
        return false;
      }
    }

    return true;
  };

  // =====================================================
  // 6. ADICIONA EPISÓDIOS
  // =====================================================

  const appendEpisodes = (
    documents,
    mode
  ) => {
    documents
      .filter(isPublicEpisode)
      .forEach((doc) => {
        const id =
          doc.name?.split('/').pop();

        if (!id) {
          return;
        }

        const releaseDate =
          doc.fields?.releaseDate?.stringValue ??
          doc.fields?.releaseDate?.timestampValue;

        /**
         * updateTime é ainda melhor que "hoje" para lastmod.
         *
         * Caso não exista, usa releaseDate.
         */
        const lastmod =
          normalizeDate(
            doc.updateTime ??
            releaseDate
          );

        appendUrl({
          path:
            `/lore/${mode}/${encodeURIComponent(id)}`,

          lastmod,
          changefreq: 'monthly',
          priority: '0.8'
        });
      });
  };

  appendEpisodes(
    broklinDocs,
    'broklin'
  );

  appendEpisodes(
    jonahDocs,
    'jonah'
  );

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

    const dateValue =
      doc.fields?.date?.stringValue ??
      doc.fields?.date?.timestampValue;

    if (!dateValue) {
      return;
    }

    const logDate =
      String(dateValue).slice(0, 10);

    if (logDate > todayStr) {
      return;
    }

    const lastmod =
      normalizeDate(
        doc.updateTime ??
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
