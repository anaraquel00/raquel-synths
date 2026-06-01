import { Component, DOCUMENT, inject } from '@angular/core';
import { ContatoComponent } from "../contato/contato";
import { DiscographyComponent } from "../../app-discography/app-discography";
import { AppVisualNovel } from "../../app-visual-novel/app-visual-novel";
import { StorytellingComponent } from "../../app-storytelling/app-storytelling";
import { SobreComponent } from "../sobre/sobre";
import { Home } from "../home/home";
import { AdBannerComponent } from "../../components/ad-banner/ad-banner";
import { SeoService } from '../../services/seo.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-landing-page',
  imports: [ContatoComponent,
    DiscographyComponent,
    AppVisualNovel,
    StorytellingComponent,
    SobreComponent,
    Home, AdBannerComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  public translate = inject(TranslationService);
  private document = inject(DOCUMENT);
  private seoService = inject(SeoService);

ngOnInit() {
  const isPt = this.translate.isPt();
  this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

  // 🛡️ SOBERANIA DA LANDING PAGE (Apenas ela manda na Home)
  this.seoService.updateMetaTags({
    title: isPt ? 'Sagas Cyberpunk & Banda Virtual' : 'Cyberpunk Sagas & Virtual Band',
    description: isPt ? 'Onde o analógico sangra no digital. Mergulhe na Guerra Sonora.' : 'Where analog bleeds into digital. Dive into the Sonic War.',
    url: 'https://raquelsynths.com.br/'
  });
}
}
