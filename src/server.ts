import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = join(serverDistFolder, '../browser');

const app = express();

let angularApp: AngularNodeAppEngine | undefined;

function getAngularApp(): AngularNodeAppEngine {
  if (!angularApp) {
    angularApp = new AngularNodeAppEngine();
  }
  return angularApp;
}

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Renderiza a aplicação Angular via SSR capturando erros detalhados
 */
app.use((req, res, next) => {
  getAngularApp()
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch((err) => {
      console.error('🔥 [RQS SSR Render Error]:', err);
      res.status(500);
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.send(`SSR Render Error: ${err?.stack || err?.message || err}`);
    });
});

/**
 * Manipulador global de erros do Express
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔥 [Express Global Error]:', err);
  res.status(500);
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.send(`Express Global Error: ${err?.stack || err?.message || err}`);
});

if (isMainModule(import.meta.url) || process.env['pm_id'] || process.argv[1]?.match(/server\.mjs$/)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
