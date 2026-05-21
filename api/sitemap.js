export default async function handler(req, res) {
  // 🛡️ BLINDAGEM DE PERFORMANCE: Cache na Vercel Edge Network
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. AS ROTAS BASE DO FRONT-END E DEPARTAMENTOS PÚBLICOS
  const staticRoutes = [
    { path: '', priority: '1.0' },
    { path: '/compliance', priority: '0.9' },
    { path: '/dossier', priority: '0.9' },
    { path: '/store', priority: '0.8' },
    { path: '/saga', priority: '0.8' },
    { path: '/visual-novel', priority: '0.8' },
    { path: '/logs-archive', priority: '0.9' },
    { path: '/discografia', priority: '0.9' },
    { path: '/creator', priority: '0.5' },
    { path: '/contato', priority: '0.5' }
  ];

  for (const route of staticRoutes) {
    // Escapando caracteres de URL para o formato XML estrito
    const safePath = route.path.replace(/&/g, '&amp;');
    xml += `  <url>\n    <loc>https://raquelsynths.com.br${safePath}</loc>\n    <priority>${route.priority}</priority>\n  </url>\n`;
  }

  // 2. BUSCA NO FIREBASE (Logs e Lore)
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
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        data.documents.forEach((doc) => {
          const id = doc.name.split('/').pop();

          // 🛡️ FIREWALL 1: Proteção dos Logs (Pela Data no ID)
          if (basePath === 'log-reader') {
            const logDate = id.substring(0, 10);
            if (logDate > todayStr) return;
          }

          // 🛡️ FIREWALL 2: Proteção da Lore (Pelo releaseDate no banco)
          if (basePath === 'lore-reader') {
            // A API REST do Firebase esconde os dados dentro de fields.campo.tipo
            const releaseDateStr = doc.fields?.releaseDate?.stringValue;

            if (releaseDateStr) {
              const releaseDate = new Date(releaseDateStr);
              if (releaseDate > now) return;
            }
          }

          xml += `  <url>\n    <loc>https://raquelsynths.com.br/${basePath}/${id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
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
