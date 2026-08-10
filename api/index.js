import { reqHandler } from '../dist/raquel-synths/server/server.mjs';

export default function handler(req, res) {
  try {
    return reqHandler(req, res);
  } catch (error) {
    console.error('🔥 [RQS Vercel Function Error]:', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end(`RQS Serverless Error: ${error.message}\n${error.stack || ''}`);
  }
}
