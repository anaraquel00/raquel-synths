import { Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section aria-labelledby="not-found-title">
      <h1 id="not-found-title">404</h1>
      <p>
        {{ translate.isPt()
          ? 'Rota não encontrada no Mainframe.'
          : 'Route not found in the Mainframe.' }}
      </p>
      <a routerLink="/">
        {{ translate.isPt() ? 'Voltar à base' : 'Back to base' }}
      </a>
    </section>
  `
})
export class NotFoundComponent {
  protected translate = inject(TranslationService);

  private responseInit = inject(RESPONSE_INIT, { optional: true });

  constructor() {
    if (this.responseInit) {
      this.responseInit.status = 404;
    }
  }
}
