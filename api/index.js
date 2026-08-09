/* api/index.js */
import '@angular/ssr/node';
import 'express';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default async (req, res) => {
  try {
    // process.cwd() garante a resolução estável a partir da raiz da Vercel (/var/task)
    const relativePath = 'dist/raquel-synths/server/server.mjs';
    const absolutePath = path.join(process.cwd(), relativePath);
    const fileUrl = pathToFileURL(absolutePath).href;

    // Importação dinâmica protegida que roda o servidor já contendo as dependências injetadas acima
    const { reqHandler } = await import("" + fileUrl);
    return reqHandler(req, res);
  } catch (error) {
    console.error('🛡️ [RQS LAMBDA ERROR] Falha de processamento no SSR:', error);
    res.status(500).send('RQS Mainframe Initialization Error: ' + error.message);
  }
};
