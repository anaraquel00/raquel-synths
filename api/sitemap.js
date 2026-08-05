export default async function handler(req, res) {
  // 🛡️ BLINDAGEM DE PERFORMANCE: Cache na Vercel Edge Network
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // "2026-08-05"
  const currentLastMod = '2026-08-05'; // Data atualizada do deploy

  // 1. AS ROTAS BASE DO FRONT-END (Incluindo a nova /hybrid-saga)
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

  // 2. BUSCA NO FIREBASE (Logs, Lore e Global-Sagas com lastmod dinâmico)
  try {
    const projectId = 'raquel-synths-platform';
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    const [logsRes, loreRes, globalSagasRes] = await Promise.all([
      fetch(`${baseUrl}/logs?pageSize=300`),
      fetch(`${baseUrl}/lore?pageSize=300`),
      fetch(`${baseUrl}/global-sagas?pageSize=300`) // 🚀 Busca também a coleção do Core Híbrido
    ]);

    const logsData = await logsRes.json();
    const loreData = await loreRes.json();
    const globalSagasData = await globalSagasRes.json();

    const extractUrls = (data, basePath) => {
      if (data.documents) {
        data.documents.forEach((doc) => {
          const id = doc.name.split('/').pop();
          let lastmodValue = currentLastMod;

          // 🛡️ FIREWALL 1: Proteção dos Logs (Pela Data no ID)
          if (basePath === 'log-reader') {
            const logDate = id.substring(0, 10);
            if (logDate > todayStr) return;
          }

          // 🛡️ FIREWALL 2: Proteção da Lore e Sagas Híbridas (Pelo releaseDate no banco)
          if (basePath === 'lore-reader' || basePath === 'hybrid-reader') {
            const releaseDateStr = doc.fields?.releaseDate?.stringValue;

            if (releaseDateStr) {
              const releaseDate = new Date(releaseDateStr);
              if (releaseDate > today) return; // Se a data for futura (ex: 1 de setembro), o sitemap oculta até o dia certo!
            }
          }

          xml += `  <url>\n    <loc>https://raquelsynths.com/${basePath}/${id}</loc>\n    <lastmod>${lastmodValue}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });
      }
    };

    extractUrls(logsData, 'log-reader');
    extractUrls(loreData, 'lore-reader');
    extractUrls(globalSagasData, 'hybrid-reader'); // 🚀 Mapeia os leitores híbridos para /hybrid-reader/:id

  } catch (error) {
    console.error('🛡️ [ERRO MAINFRAME] Falha ao acessar o Firebase:', error);
  }

  xml += `</urlset>`;
  res.status(200).send(xml);
}
