import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// 🛡️ BLINDAGEM DE ROTA: Funciona em qualquer versão do Node.js (Evita o Crash)
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = join(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();


/* ========================================================================== */
/* 📡 ENGINE DE SITEMAP DINÂMICO UNIFICADO NO EXPRESS (SEO ENGINE)           */
/* ========================================================================== */
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentLastMod = todayStr;

    // 1. AS ROTAS BASE DO FRONT-END (Prerendered e estáticas reais)
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
      { path: '/contato', priority: '0.5', lastmod: currentLastMod },
      { path: '/bio', priority: '0.8', lastmod: currentLastMod }
    ];

    for (const route of staticRoutes) {
      xml += `  <url>\n    <loc>https://raquelsynths.com${route.path}</loc>\n    <lastmod>${route.lastmod}</lastmod>\n    <priority>${route.priority}</priority>\n  </url>\n`;
    }

    // 2. BUSCA DINÂMICA NO FIREBASE REST (Logs, Lore e Global-Sagas)
    const projectId = 'raquel-synths-platform';
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    const [logsRes, loreRes, globalSagasRes] = await Promise.all([
      fetch(`${baseUrl}/logs?pageSize=300`).then(r => r.ok ? r.json() : {}),
      fetch(`${baseUrl}/lore?pageSize=300`).then(r => r.ok ? r.json() : {}),
      fetch(`${baseUrl}/global-sagas?pageSize=300`).then(r => r.ok ? r.json() : {})
    ]);

    const processDocsSitemap = (data: any, basePath: string) => {
      if (data && data.documents) {
        data.documents.forEach((doc: any) => {
          const id = doc.name.split('/').pop();
          xml += `  <url>\n    <loc>https://raquelsynths.com/${basePath}/${id}</loc>\n    <lastmod>${currentLastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });
      }
    };

    processDocsSitemap(logsRes, 'log-reader');
    processDocsSitemap(loreRes, 'lore-reader');
    processDocsSitemap(globalSagasRes, 'hybrid-reader');

    xml += `</urlset>`;
    res.status(200).send(xml);
  } catch (error) {
    console.error('🛡️ [EXPRESS SITEMAP ERROR]: Falha de conexão no sitemap:', error);
    next(); // Transfere o controle para o Angular se o sitemap estourar
  }
});
/* ========================================================================== */


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
// 🛡️ BLINDAGEM DE EXECUÇÃO: Garante que o servidor ligue localmente sem saída silenciosa
if (isMainModule(import.meta.url) || process.env['pm_id'] || process.argv[1]?.match(/server\.mjs$/)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
