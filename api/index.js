const path = require('path');

module.exports = async (req, res) => {
  try {
    const serverPath = path.resolve(__dirname, '../dist/raquel-synths/server/server.mjs');
    const server = await import(serverPath);
    
    // Executa o manipulador de requisições do Angular App Engine
    return server.reqHandler(req, res);
  } catch (error) {
    console.error('🔥 [RQS Vercel Function Crash]:', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end(`RQS Serverless Error: ${error.message}`);
  }
};
