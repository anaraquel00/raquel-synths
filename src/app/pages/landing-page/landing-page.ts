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
    description: isPt
      ? 'Sagas cyberpunk, música eletrônica e personagens da RaQuel Synths. Explore Blue Team, Red Team e as histórias do universo RQS.'
      : 'Cyberpunk sagas, electronic music, and RaQuel Synths characters. Explore Blue Team, Red Team, and the stories of the RQS universe.',
    ogDescription: isPt
      ? 'Explore as sagas cyberpunk, personagens e música do universo RaQuel Synths.'
      : 'Explore the cyberpunk sagas, characters, and music of the RaQuel Synths universe.',
    twitterDescription: isPt
      ? 'Explore as sagas cyberpunk, personagens e música do universo RaQuel Synths.'
      : 'Explore the cyberpunk sagas, characters, and music of the RaQuel Synths universe.',
    imageAlt: isPt
      ? 'Broklin Garpeter e Jonah Cyperfield representando Blue Team e Red Team no universo cyberpunk RaQuel Synths.'
      : 'Broklin Garpeter and Jonah Cyperfield representing Blue Team and Red Team in the RaQuel Synths cyberpunk universe.',
    url: 'https://raquelsynths.com/'
  });
}
}
