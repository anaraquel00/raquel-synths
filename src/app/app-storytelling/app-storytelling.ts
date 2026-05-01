import { Component, inject, PLATFORM_ID, signal, OnInit, OnDestroy, afterNextRender, Injector } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, take, timeout } from 'rxjs/operators';

import { TranslationService } from '../services/translation.service';
import { ContentService } from '../services/content.service';
import { SafeHtmlPipe } from '../components/pipes/safe-html.pipe';
import { AdBannerComponent } from "../components/ad-banner/ad-banner";
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-storytelling',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe, AdBannerComponent, NgOptimizedImage],
  templateUrl: './app-storytelling.html',
  styleUrls: ['./app-storytelling.scss']
})
export class StorytellingComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  public translate = inject(TranslationService);
  private platformId = inject(PLATFORM_ID);
  private injector = inject(Injector);
  private document = inject(DOCUMENT);

  public isJonahMode = signal<boolean>(false);
  private themeObserver: MutationObserver | undefined;

  constructor() {
    // 🛡️ TRAVA TÁTICA: Sincroniza o estado do tema e inicializa o observador apenas após a hidratação (DOM Estável)
    afterNextRender(() => {
      this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));

      this.themeObserver = new MutationObserver(() => {
        this.isJonahMode.set(this.document.body.classList.contains('mode-jonah'));
      });

      this.themeObserver.observe(this.document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  }

// 🔥 HOME: Corta os 4 primeiros e não liga pro ano!
  logs$: Observable<any[]> = isPlatformBrowser(this.platformId)
    ? this.injector.get(ContentService).getLogs().pipe(
        take(1),
        timeout(4000),
        map(logs => {
          if (!logs) return [];
          const archiveLinkDoc = logs.find(log => log.isArchiveLink);
          // DELETA AQUELE FILTRO DE '2025'. Tira só o botão.
          let contentLogs = logs.filter(log => !log.isArchiveLink);
          // Ordena por data (Mais novo no topo)
          contentLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          // Pega do 0 ao 4 (Os 4 mais recentes)
          const recentLogs = contentLogs.slice(0, 4);
          if (archiveLinkDoc) {
            return [...recentLogs, archiveLinkDoc];
          }
          return recentLogs;
        }),
        catchError(error => {
          console.error('🔥 [FIREBASE TIMEOUT/ERROR]:', error);
          return of([{ _isError: true, message: 'Dados criptografados. Acesse via terminal.' }]);
        })
      )
    : of([{
        title: 'RQS Cyberpunk Sagas & Lore',
        date: new Date().toISOString(),
        description: '<p>Where analog bleeds into digital. Read our transmedia storytelling, Cyberpunk logs, and Night City aesthetics. General Kelma and Broklin combat Jonah in this Audio Civil War.</p>',
        isExpanded: true
      }]); // 🛡️ MOCK PARA SEO (Executado apenas no Build/SSR)

  ngOnInit() {
    // Removida a verificação síncrona do DOM no OnInit.
    // Deixamos a inicialização exclusiva para o fluxo assíncrono do Firebase (logs$).
  }

  ngOnDestroy() {
    this.themeObserver?.disconnect();
  }

  getEventContent(event: any) {
    let content = this.translate.isPt() ? event.pt : event.en;
    if (!content || !content.description) return content;

    let processedContent = { ...content };

    // 🛡️ MOTOR DE DESTRUIÇÃO FÍSICA: Remove as notas se não for o caos, erradicando o cloaking.
    if (!this.isJonahMode()) {
      // A expressão limpa fisicamente tags <div>, <p> ou <span> que possuam 'jonah-note' em suas classes.
      processedContent.description = processedContent.description.replace(/<(div|p|span)[^>]*class=["']?[^"']*jonah-note[^"']*["']?[^>]*>[\s\S]*?<\/\1>/gi, '');
    }

    return processedContent;
  }

  toggleLog(event: any) {
    event.isExpanded = !event.isExpanded;
  }

  navigateToArchive() {
    this.router.navigate(['/logs-archive']);
  }
}
