const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');

let handlerCache = null;

module.exports = async (req, res) => {
  try {
    if (!handlerCache) {
      const rootDir = path.resolve(__dirname, '..');
      process.chdir(rootDir);

      const serverDir = path.join(rootDir, 'dist/raquel-synths/server');

      // 1. Carrega os manifestos e o bundle principal do SSR na ordem correta
      const filesToLoad = [
        'angular-app-engine-manifest.mjs',
        'angular-app-manifest.mjs',
        'main.server.mjs'
      ];

      for (const file of filesToLoad) {
        const filePath = path.join(serverDir, file);
        if (fs.existsSync(filePath)) {
          try {
            await import(pathToFileURL(filePath).href);
          } catch (e) {
            console.warn(`[RQS Vercel] Aviso ao carregar ${file}:`, e.message);
          }
        }
      }

      // 2. Importa o ponto de entrada do servidor Express/Angular
      const serverPath = path.join(serverDir, 'server.mjs');
      const serverModule = await import(pathToFileURL(serverPath).href);

      handlerCache = serverModule.reqHandler || serverModule.default || serverModule.app;

      if (typeof handlerCache !== 'function') {
        throw new Error(
          `Nenhum handler válido em server.mjs. Exportações: ${Object.keys(serverModule).join(', ')}`
        );
      }
    }

    return handlerCache(req, res);
  } catch (error) {
    console.error('🔥 [RQS Vercel Function Error]:', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end(`RQS Serverless Error: ${error.message}\n${error.stack || ''}`);
  }
};
