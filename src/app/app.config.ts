import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    // Liga o Roteador com transições bonitas e binding de input
    provideRouter(routes, withComponentInputBinding(), withViewTransitions(),withInMemoryScrolling({
        scrollPositionRestoration: 'top', // Sempre rola pro topo na navegação
        anchorScrolling: 'enabled'        // Permite usar links com # (âncoras)
      })),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()), provideClientHydration(withEventReplay())

  ]
};
