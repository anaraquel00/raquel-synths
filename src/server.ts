import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// =====================================================================
// 🛰️ [ MÓDULO GOD-TIER ]: GERADOR DE SITEMAP DINÂMICO (BLUE TEAM ONLY)
// =====================================================================
app.get(['/sitemap.xml', '/dynamic-sitemap'], async (req, res) => {
  res.header('Content-Type', 'application/xml');

  // 🛡️ BLINDAGEM DE PERFORMANCE (Vercel Edge Network)
  // Faz o cache do sitemap no Vercel por 24h, zerando o custo de Serverless Functions
  res.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. AS ROTAS BASE (Blindadas e sem código legado)
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
    xml += `  <url>\n    <loc>https://raquelsynths.com.br${route.path}</loc>\n    <priority>${route.priority}</priority>\n  </url>\n`;
  }

  // 2. A BUSCA NO FIREBASE (Rest API - Processamento Paralelo)
  try {
    const projectId = 'raquel-synths-platform';
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    // Dispara apenas as requisições essenciais (Economia de banda)
    // 🛡️ ADICIONADO pageSize=300 para garantir que o Firebase não oculte os arquivos mais antigos (Paginação)
    const [logsRes, loreRes, loreJonahRes] = await Promise.all([
      fetch(`${baseUrl}/logs?pageSize=300`),
      fetch(`${baseUrl}/lore?pageSize=300`),
      fetch(`${baseUrl}/lore-jonah?pageSize=300`) // ☢️ Indexando a visão do Jonah!
    ]);

    const logsData = await logsRes.json();
    const loreData = await loreRes.json();
    const loreJonahData = await loreJonahRes.json();

    // � INDEXANDO OS LOGS OFICIAIS
    if (logsData.documents) {
      logsData.documents.forEach((doc: any) => {
        const logId = doc.name.split('/').pop();
        xml += `  <url>\n    <loc>https://raquelsynths.com.br/log-reader/${logId}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      });
    }

    // 🛡️ INDEXANDO A MINHA SAGA (Blue Team)
    if (loreData.documents) {
      loreData.documents.forEach((doc: any) => {
        const epId = doc.name.split('/').pop();
        xml += `  <url>\n    <loc>https://raquelsynths.com.br/lore-reader/${epId}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      });
    }

    // ☢️ INDEXANDO A SAGA CORROMPIDA (Red Team - Jonah)
    if (loreJonahData.documents) {
      loreJonahData.documents.forEach((doc: any) => {
        const epId = doc.name.split('/').pop();
        // Encaminha os links do Jonah para a leitora de Sagas para gerar tração
        xml += `  <url>\n    <loc>https://raquelsynths.com.br/lore-reader/${epId}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      });
    }
  } catch (error) {
    console.error('🛡️ [ERRO NO MAINFRAME] Falha ao extrair dados do Firebase para o Sitemap:', error);
  }

  xml += `</urlset>`;
  res.send(xml);
});
// =====================================================================

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
