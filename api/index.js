const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');

module.exports = async (req, res) => {
  try {
    // 🛡️ Define o diretório raiz para resolução de caminhos na Vercel
    const rootDir = path.resolve(__dirname, '..');
    process.chdir(rootDir);

    const serverDir = path.join(rootDir, 'dist/raquel-synths/server');

    // 1. Carrega o manifesto do Angular App Engine ANTES de importar o servidor
    const manifestFiles = [
      'angular-app-engine-manifest.mjs',
      'angular-app-manifest.mjs'
    ];

    for (const file of manifestFiles) {
      const manifestPath = path.join(serverDir, file);
      if (fs.existsSync(manifestPath)) {
        await import(pathToFileURL(manifestPath).href);
        break;
      }
    }

    // 2. Importa o bundle do servidor Angular SSR
    const serverPath = path.join(serverDir, 'server.mjs');
    const serverUrl = pathToFileURL(serverPath).href;

    const serverModule = await import(serverUrl);
    const handler = serverModule.reqHandler || serverModule.default || serverModule.app;

    if (typeof handler !== 'function') {
      throw new Error(
        `Nenhum handler válido encontrado em server.mjs. Exportações: ${Object.keys(serverModule).join(', ')}`
      );
    }

    // 3. Executa a requisição no manipulador do Angular
    return handler(req, res);
  } catch (error) {
    console.error('🔥 [RQS Vercel Function Error]:', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end(`RQS Serverless Error: ${error.message}\n${error.stack || ''}`);
  }
};
