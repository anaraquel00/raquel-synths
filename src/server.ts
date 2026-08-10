import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express from 'express';

const app = express();

const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'raquelsynths.com',
    'www.raquelsynths.com'
  ],

  trustProxyHeaders: [
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-for'
  ]
});

app.use(async (req, res, next) => {
  try {
    const response =
      await angularApp.handle(req);

    if (response) {
      await writeResponseToNodeResponse(
        response,
        res
      );

      return;
    }

    next();

  } catch (error) {
    console.error(
      '🔥 [RQS Angular SSR Error]:',
      error
    );

    next(error);
  }
});

export const reqHandler =
  createNodeRequestHandler(app);