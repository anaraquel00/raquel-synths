/* api/index.js */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default async (req, res) => {
  try {
    // process.cwd() garante a resolução infalível a partir da raiz da Vercel (/var/task)
    const serverPath = path.join(process.cwd(), 'dist/raquel-synths/server/server.mjs');

    // Converte para URL de arquivo válida para importação segura em ESM no Linux
    const { reqHandler } = await import(pathToFileURL(serverPath).href);
    return reqHandler(req, res);
  } catch (error) {
    console.error('🛡️ [RQS ENGINE CRASH] Falha ao inicializar o Express SSR:', error);
    res.status(500).send('RQS Mainframe connection error: ' + error.message);
  }
};
