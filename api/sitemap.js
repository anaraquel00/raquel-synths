export default async function handler(req, res) {
  // 🛡️ BLINDAGEM DE PERFORMANCE: Cache na Vercel Edge Network
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 1. AS ROTAS BASE DO FRONT-END (Atualizadas hoje com o novo SeoService)
  const staticRoutes = [
    { path: '', priority: '1.0', lastmod: '2026-06-01' },
    { path: '/compliance', priority: '0.9', lastmod: '2026-06-01' },
    { path: '/dossier', priority: '0.9', lastmod: '2026-06-01' },
    { path: '/store', priority: '0.8', lastmod: '2026-06-01' },
    { path: '/saga', priority: '0.8', lastmod: '2026-06-01' },
    { path: '/visual-novel', priority: '0.8', lastmod: '2026-06-01' },
    { path: '/logs-archive', priority: '0.9', lastmod: '2026-06-01' },
    { path: '/discografia', priority: '0.9', lastmod: '2026-06-01' },
    { path: '/musical-archives', priority: '0.9', lastmod: '2026-06-01' },
    { path: '/creator', priority: '0.5', lastmod: '2026-05-18' },
    { path: '/contato', priority: '0.5', lastmod: '2026-05-18' }
  ];

  for (const route of staticRoutes) {
    const safePath = route.path.replace(/&/g, '&amp;');
    xml += `  <url>\n    <loc>https://raquelsynths.com${safePath}</loc>\n    <lastmod>${route.lastmod}</lastmod>\n    <priority>${route.priority}</priority>\n  </url>\n`;
  }

  // 2. BUSCA NO FIREBASE (Logs e Lore com lastmod dinâmico)
  try {
    const projectId = 'raquel-synths-platform';
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    const [logsRes, loreRes] = await Promise.all([
      fetch(`${baseUrl}/logs?pageSize=300`),
      fetch(`${baseUrl}/lore?pageSize=300`)
    ]);

    const logsData = await logsRes.json();
    const loreData = await loreRes.json();

    const extractUrls = (data, basePath) => {
      if (data.documents) {
        data.documents.forEach((doc) => {
          const id = doc.name.split('/').pop();
          let lastmodValue = '2026-06-01'; // Fallback estratégico para forçar reindexação pós-correção de canónicas

          // 🛡️ FIREWALL 1: Proteção dos Logs (Pela Data no ID)
          if (basePath === 'log-reader') {
            const logDate = id.substring(0, 10);
            if (logDate > todayStr) return;
            // Para forçar o Googlebot a reler canónicas corrigidas hoje, usamos 2026-06-01.
            // No futuro, mude para: lastmodValue = logDate;
            lastmodValue = '2026-06-01';
          }

          // 🛡️ FIREWALL 2: Proteção da Lore (Pelo releaseDate no banco)
          if (basePath === 'lore-reader') {
            const releaseDateStr = doc.fields?.releaseDate?.stringValue;

            if (releaseDateStr) {
              const releaseDate = new Date(releaseDateStr);
              if (releaseDate > today) return;
              // Para forçar o Googlebot a reler canónicas corrigidas hoje, usamos 2026-06-01.
              // No futuro, mude para: lastmodValue = releaseDateStr.substring(0, 10);
              lastmodValue = '2026-06-01';
            }
          }

          xml += `  <url>\n    <loc>https://raquelsynths.com/${basePath}/${id}</loc>\n    <lastmod>${lastmodValue}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });
      }
    };

    extractUrls(logsData, 'log-reader');
    extractUrls(loreData, 'lore-reader');

  } catch (error) {
    console.error('🛡️ [ERRO MAINFRAME] Falha ao acessar o Firebase:', error);
  }

  xml += `</urlset>`;
  res.status(200).send(xml);
}
