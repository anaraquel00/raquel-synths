import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router'; 
import { toObservable } from '@angular/core/rxjs-interop'; // 👈 Essencial
import { SafeHtmlPipe } from "../../components/pipes/safe-html.pipe";
import { ContentService } from '../../services/content.service';
import { TranslationService } from '../../services/translation.service';
import { SeoService } from '../../services/seo.service'; 
import { Observable, combineLatest, map, switchMap, of, tap } from 'rxjs';
import { AdArticleComponent } from '../../components/ad-article/ad-article';

@Component({
  selector: 'app-log-reader',
  standalone: true, 
  imports: [CommonModule, SafeHtmlPipe, RouterLink, AdArticleComponent],
  templateUrl: './log-reader.html',
  styleUrl: './log-reader.scss',
})
export class LogReaderComponent implements OnInit {
  
  private route = inject(ActivatedRoute);
  public translate = inject(TranslationService);
  private contentService = inject(ContentService);
  private seoService = inject(SeoService); 

  // 🛡️ A CORREÇÃO: toObservable deve ser inicializado aqui, no topo da classe!
  // Isso garante que ele esteja no "Injection Context" correto.
  private isPt$ = toObservable(this.translate.isPt); 

  logData$!: Observable<any>; 

  ngOnInit() {
    // 🛰️ Captura o ID da URL de forma reativa
    const id$ = this.route.paramMap.pipe(map(params => params.get('id')));

    // 🛰️ COMBINAÇÃO TÁTICA: Usamos o 'isPt$' que definimos lá em cima
    this.logData$ = combineLatest([id$, this.isPt$]).pipe(
      switchMap(([id, isPt]) => {
        if (!id) return of(null);

        // Abre o uplink com o Firebase
        return this.contentService.getLogById(id).pipe(
          map((data: any) => {
            if (!data) return null;
            
            // 🗺️ Desempacota a árvore correta (EN ou PT)
            // Se o seu serviço usa isPt(), passamos o valor booleano
            const localized = isPt ? data.pt : data.en;

            return {
              id: id,
              date: data.date, 
              title: localized?.title,
              description: localized?.description,
              techContent: localized?.techContent,
              jonahComment: localized?.jonahComment 
            };
          }),
          tap(mappedData => {
            if (mappedData) {
              this.seoService.updateMetaTags({
                title: `${mappedData.title} | RQS Logs`,
                description: mappedData.description
              });
            }
          })
        );
      })
    );
  }
}