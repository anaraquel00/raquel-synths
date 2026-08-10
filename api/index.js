import { reqHandler } from '../dist/raquel-synths/server/server.mjs';

export default async function handler(req, res) {
  console.log('🧪 [VERCEL ENTRY]', {
    url: req.url,
    originalUrl: req.originalUrl,
    method: req.method,
    host: req.headers.host,
    forwardedHost: req.headers['x-forwarded-host'],
    forwardedProto: req.headers['x-forwarded-proto']
  });

  try {
    return await reqHandler(req, res);
  } catch (error) {
    console.error('🔥 [RQS Vercel Function Error]:', error);

    res.statusCode = 500;
    res.setHeader(
      'content-type',
      'text/plain; charset=utf-8'
    );

    res.end(
      `RQS Serverless Error: ${error.message}\n${error.stack || ''}`
    );
  }
}
