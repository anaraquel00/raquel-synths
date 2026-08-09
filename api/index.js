const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');

module.exports = async (req, res) => {
  try {
    const rootDir = path.resolve(__dirname, '..');
    process.chdir(rootDir);

    const serverDir = path.join(rootDir, 'dist/raquel-synths/server');

    // 1. Importa o manifesto e o bootstrap do Angular SSR ANTES do server.mjs
    const bootstrapFiles = [
      'main.server.mjs',
      'angular-app-engine-manifest.mjs',
      'angular-app-manifest.mjs'
    ];

    for (const file of bootstrapFiles) {
      const filePath = path.join(serverDir, file);
      if (fs.existsSync(filePath)) {
        try {
          await import(pathToFileURL(filePath).href);
        } catch (e) {
          console.warn(`⚠️ [RQS Vercel] Aviso ao carregar ${file}:`, e.message);
        }
      }
    }

    // 2. Importa o ponto de entrada do servidor (server.mjs)
    const serverPath = path.join(serverDir, 'server.mjs');
    const serverUrl = pathToFileURL(serverPath).href;

    const serverModule = await import(serverUrl);
    const handler = serverModule.reqHandler || serverModule.default || serverModule.app;

    if (typeof handler !== 'function') {
      throw new Error(
        `Nenhum handler válido encontrado em server.mjs. Exportações: ${Object.keys(serverModule).join(', ')}`
      );
    }

    // 3. Executa o manipulador da requisição
    return handler(req, res);
  } catch (error) {
    console.error('🔥 [RQS Vercel Function Error]:', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end(`RQS Serverless Error: ${error.message}\n${error.stack || ''}`);
  }
};
