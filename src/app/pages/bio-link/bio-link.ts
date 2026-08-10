import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-bio-link',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bio-link.html',
  styleUrls: ['./bio-link.scss']
})
export class BioLinkComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  protected translate = inject(TranslationService);

  emailInputValue: string = '';
  subscribed = signal<boolean>(false);

  ngOnInit(): void {
  this.titleService.setTitle(
    'RaQuel Synths // Official Links & Bio'
  );

  this.metaService.updateTag({
    name: 'description',
    content:
      'Official portal for RaQuel Synths releases, lore, store, and community.'
  });

  this.metaService.updateTag({
    name: 'robots',
    content: 'noindex, follow'
  });
}

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  async subscribeNewsletter(): Promise<void> {
    const email = this.emailInputValue.trim();
    if (!email) return;

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.subscribed.set(true);
        this.emailInputValue = '';
      } else {
        console.error('❌ [BREVO ERROR]:', result.error);
      }
    } catch (error) {
      console.error('❌ [NETWORK ERROR]:', error);
    }
  }
}
