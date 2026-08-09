import '@angular/ssr/node';
import 'express';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default async (req, res) => {
  try {
    const relativePath = 'dist/raquel-synths/server/server.mjs';
    const absolutePath = path.join(process.cwd(), relativePath);
    const fileUrl = pathToFileURL(absolutePath).href;

    const { reqHandler } = await import("" + fileUrl);
    return reqHandler(req, res);
  } catch (error) {
    console.error('🛡️ [RQS LAMBDA ERROR] Falha de processamento no SSR:', error);
    res.status(500).send('RQS Mainframe Initialization Error: ' + error.message);
  }
};
