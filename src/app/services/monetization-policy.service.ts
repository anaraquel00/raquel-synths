import { computed, Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MonetizationPolicyService {
  private readonly currentUrl = signal('');
  readonly currentBannerEligible = computed(() => this.isBannerEligible(this.currentUrl()));
  readonly currentArticleEligible = computed(() => this.isArticleEligible(this.currentUrl()));
  readonly currentEligible = computed(() => this.currentBannerEligible() || this.currentArticleEligible());
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.updateCurrent(event.urlAfterRedirects);
    });
  }

  updateCurrent(url: string): void { this.currentUrl.set(url); }
  isBannerEligible(url: string): boolean { const path = this.path(url); return path === '/' || path === '/discografia'; }
  isArticleEligible(url: string): boolean { const path = this.path(url); return /^\/lore\/[^/]+\/[^/]+$/.test(path) || /^\/hybrid-reader\/[^/]+$/.test(path) || /^\/log-reader\/[^/]+$/.test(path) || path === '/musical-archives'; }
  private path(url: string): string { return (url.split(/[?#]/)[0] || '/').replace(/\/$/, '') || '/'; }
}
