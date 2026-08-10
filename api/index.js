import { reqHandler } from '../dist/raquel-synths/server/server.mjs';
export default async function handler(req, res) {
  try {
    await reqHandler(req, res);
  } catch (error) {
    console.error('🔥 [RQS Vercel Function Error]:', error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader(
        'content-type',
        'text/plain; charset=utf-8'
      );
    }

    if (!res.writableEnded) {
      res.end('Internal Server Error');
    }
  }
}
