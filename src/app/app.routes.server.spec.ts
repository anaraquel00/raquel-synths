import { RenderMode } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

describe('serverRoutes discography rendering', () => {
  it('server-renders /discografia without changing neighboring route modes', () => {
    expect(serverRoutes.find(route => route.path === 'discografia')?.renderMode)
      .toBe(RenderMode.Server);
    expect(serverRoutes.find(route => route.path === 'dossier')?.renderMode)
      .toBe(RenderMode.Prerender);
    expect(serverRoutes.find(route => route.path === 'musical-archives')?.renderMode)
      .toBe(RenderMode.Server);
  });
});
