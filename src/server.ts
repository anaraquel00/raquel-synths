import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express from 'express';

const app = express();

const angularApp = new AngularNodeAppEngine({
  trustProxyHeaders: [
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-for'
  ]
});

app.use(async (req, res, next) => {
  console.log('🧪 [ANGULAR ENGINE REQUEST]', {
    url: req.url,
    originalUrl: req.originalUrl,
    method: req.method
  });

  try {
    const response = await angularApp.handle(req);

    console.log('🧪 [ANGULAR ENGINE RESPONSE]', {
      hasResponse: !!response,
      status: response?.status,
      statusText: response?.statusText,
      contentType: response?.headers.get('content-type')
    });

    if (response) {
      await writeResponseToNodeResponse(
        response,
        res
      );

      return;
    }

    console.log(
      '🧪 [ANGULAR ENGINE NO RESPONSE]'
    );

    next();

  } catch (error) {
    console.error(
      '🔥 [ANGULAR ENGINE ERROR]',
      error
    );

    next(error);
  }
});

export const reqHandler =
  createNodeRequestHandler(app);
