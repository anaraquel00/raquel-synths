export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // "2026-08-09"
  const currentLastMod = todayStr;

  // 1. ROTAS ESTÁTICAS
  const staticRoutes = [
    { path: '', priority: '1.0', lastmod: currentLastMod },
    { path: '/compliance', priority: '0.9', lastmod: currentLastMod },
    { path: '/dossier', priority: '0.9', lastmod: currentLastMod },
    { path: '/store', priority: '0.8', lastmod: currentLastMod },
    { path: '/saga', priority: '0.8', lastmod: currentLastMod },
    { path: '/visual-novel', priority: '0.8', lastmod: currentLastMod },
    { path: '/hybrid-saga', priority: '0.9', lastmod: currentLastMod },
    { path: '/logs-archive', priority: '0.9', lastmod: currentLastMod },
    { path: '/discografia', priority: '0.9', lastmod: currentLastMod },
    { path: '/musical-archives', priority: '0.9', lastmod: currentLastMod },
    { path: '/creator', priority: '0.5', lastmod: currentLastMod },
    { path: '/contato', priority: '0.5', lastmod: currentLastMod }
  ];

  for (const route of staticRoutes) {
    const safePath = route.path.replace(/&/g, '&amp;');
    xml += `  <url>\n    <loc>https://raquelsynths.com${safePath}</loc>\n    <lastmod>${route.lastmod}</lastmod>\n    <priority>${route.priority}</priority>\n  </url>\n`;
  }

  // 2. BUSCA NO FIREBASE COM RESILIÊNCIA INDIVIDUAL
  const projectId = 'raquel-synths-platform';
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  const collections = [
    { name: 'logs', path: 'log-reader' },
    { name: 'lore', path: 'lore-reader' },
    { name: 'global-sagas', path: 'hybrid-reader' }
  ];

  const fetchCollection = async (coll) => {
    try {
      const response = await fetch(`${baseUrl}/${coll.name}?pageSize=300`);
      if (!response.ok) {
        console.error(`🛡️ [RQS MAINFRAME] Erro HTTP ${response.status} ao carregar ${coll.name}`);
        return [];
      }
      const data = await response.ok ? await response.json() : {};
      return data.documents || [];
    } catch (err) {
      console.error(`🛡️ [RQS MAINFRAME] Falha de conexão na coleção ${coll.name}:`, err);
      return [];
    }
  };

  // Carrega todas de forma assíncrona, mas não permite que uma quebre as outras
  const [logsDocs, loreDocs, globalSagasDocs] = await Promise.all(
    collections.map(coll => fetchCollection(coll))
  );

  const processDocuments = (documents, basePath) => {
    if (!documents || documents.length === 0) return;

    documents.forEach((doc) => {
      const id = doc.name.split('/').pop();
      let lastmodValue = currentLastMod;

      // Proteção de Logs por Data no ID (YYYY-MM-DD-...)
      if (basePath === 'log-reader') {
        const logDate = id.substring(0, 10);
        // Regex de validação de data básica para evitar que IDs fora do padrão causem exclusão incorreta
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(logDate) && logDate > todayStr) return;
      }

      // Proteção da Lore e Sagas por releaseDate (Suporta stringValue e timestampValue)
      if (basePath === 'lore-reader' || basePath === 'hybrid-reader') {
        const releaseDateStr = doc.fields?.releaseDate?.stringValue || doc.fields?.releaseDate?.timestampValue;

        if (releaseDateStr) {
          const releaseDate = new Date(releaseDateStr);
          if (releaseDate > today) return;
        }
      }

      xml += `  <url>\n    <loc>https://raquelsynths.com/${basePath}/${id}</loc>\n    <lastmod>${lastmodValue}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });
  };

  processDocuments(logsDocs, 'log-reader');
  processDocuments(loreDocs, 'lore-reader');
  processDocuments(globalSagasDocs, 'hybrid-reader');

  xml += `</urlset>`;
  res.status(200).send(xml);
}
