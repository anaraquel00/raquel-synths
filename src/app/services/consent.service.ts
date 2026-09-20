import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
export type ConsentState = 'UNKNOWN' | 'ACCEPTED' | 'REJECTED';
@Injectable({ providedIn: 'root' })
export class ConsentService {
  readonly state = signal<ConsentState>('UNKNOWN');
  private readonly key = 'rqs_consent_v2';
  private readonly platformId = inject(PLATFORM_ID);
  constructor() { this.read(); }
  read(): ConsentState { if (!isPlatformBrowser(this.platformId)) return 'UNKNOWN'; const value=window.localStorage.getItem(this.key); const state: ConsentState=value==='ACCEPTED'||value==='REJECTED'?value:'UNKNOWN'; this.state.set(state); return state; }
  accept(): void { this.set('ACCEPTED'); }
  reject(): void { this.set('REJECTED'); }
  private set(state: ConsentState): void { this.state.set(state); if (isPlatformBrowser(this.platformId)) window.localStorage.setItem(this.key,state); }
}
