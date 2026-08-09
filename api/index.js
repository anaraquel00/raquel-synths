const path = require('path');
const { pathToFileURL } = require('url');

module.exports = async (req, res) => {
  try {
    // 🛡️ Garante que o Angular App Engine localize o manifesto na raiz do dist
    const rootDir = path.resolve(__dirname, '..');
    process.chdir(rootDir);

    const serverPath = path.join(rootDir, 'dist/raquel-synths/server/server.mjs');
    const serverUrl = pathToFileURL(serverPath).href;

    const serverModule = await import(serverUrl);
    const handler = serverModule.reqHandler || serverModule.default || serverModule.app;

    if (typeof handler !== 'function') {
      throw new Error(
        `Nenhum handler válido encontrado em server.mjs. Exportações: ${Object.keys(serverModule).join(', ')}`
      );
    }

    return handler(req, res);
  } catch (error) {
    console.error('🔥 [RQS Vercel Function Error]:', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end(`RQS Serverless Error: ${error.message}\n${error.stack || ''}`);
  }
};
