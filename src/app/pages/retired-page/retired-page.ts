import { Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-retired-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main aria-labelledby="retired-route-title">
      <h1 id="retired-route-title">410</h1>

      <p>
        {{ translate.isPt()
          ? 'Esta rota foi permanentemente aposentada do site RaQuel Synths.'
          : 'This route has been permanently retired from the RaQuel Synths website.' }}
      </p>

      <a routerLink="/">
        {{ translate.isPt() ? 'Voltar à base' : 'Back to base' }}
      </a>
    </main>
  `
})
export class RetiredPageComponent {
  protected readonly translate = inject(TranslationService);

  private readonly responseInit =
    inject(RESPONSE_INIT, { optional: true });

  constructor() {
    if (this.responseInit) {
      this.responseInit.status = 410;
      this.responseInit.statusText = 'Gone';
    }
  }
}
