import { Component, OnInit, OnDestroy, AfterViewChecked, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { AdBannerComponent } from "../../components/ad-banner/ad-banner";
import { ContentService } from '../../services/content.service';
import { Observable, map } from 'rxjs';
import { SplitContentPipe } from "../../components/pipes/content-splitter.pipe";

@Component({
  selector: 'app-lore-reader',
  standalone: true,
  imports: [CommonModule, AdBannerComponent, SplitContentPipe],
  templateUrl: './lore-reader.html',
  styleUrls: ['./lore-reader.scss']
})
export class LoreReaderComponent implements OnInit, OnDestroy, AfterViewChecked {

  // --- INJEÇÕES ---
  private contentService = inject(ContentService);
  public translate = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // --- VARIÁVEIS DE CONTROLE ---
  currentMode: 'broklin' | 'jonah' = 'broklin';
  episodes$!: Observable<any[]>;

  // Variáveis para o Scroll
  private targetId: string | null = null;
  private scrollDone = false;
  private themeObserver: MutationObserver | null = null;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID ) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // 1. Configuração Simples do Observable (Sem lógica de scroll aqui!)
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.checkTheme(); // Descobre se é Broklin ou Jonah
      this.loadEpisodes(); // <--- CHAMA OS DADOS DO FIREBASE

      // Observer do Tema (Se mudar de Broklin pra Jonah, recarrega)
      this.themeObserver = new MutationObserver(() => {
        this.checkTheme();
        this.loadEpisodes(); // <--- RECARREGA SE O TEMA MUDAR
      });
      this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
}
  // 🔥 NOVA FUNÇÃO: Conecta com o Serviço corrigido
  loadEpisodes() {
    // Chama o serviço passando apenas o MODO (sem língua)
    this.episodes$ = this.contentService.getEpisodes(this.currentMode);
  }

  // 🔥 A MÁGICA NUCLEAR 🔥
  // Esse método roda VÁRIAS vezes. Ele verifica o HTML visualmente.
  ngAfterViewChecked() {

    // Se temos um alvo E ainda não scrolamos...
    if (this.isBrowser && this.targetId && !this.scrollDone) {
      const element = document.getElementById(this.targetId);

      if (element) {
        // ACHOU! Executa o scroll.
        console.log('🧔 Broklin: Elemento encontrado visualmente! Scrollando...');

        // Cálculo do Offset (para não ficar atrás do menu)
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({

          top: offsetPosition,
          behavior: "smooth"
        });

        // Marca como feito para ele parar de tentar
        this.scrollDone = true;
      }
    }
  }

  ngOnDestroy() {
    if (this.themeObserver) this.themeObserver.disconnect();
  }

  private checkTheme() {
    if (!this.isBrowser) return;
    const isJonah = document.body.classList.contains('mode-jonah');
    this.currentMode = isJonah ? 'jonah' : 'broklin';
  }

  goBack() {
    this.router.navigate(['/visual-novel']);
  }
}
