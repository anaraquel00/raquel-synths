import { Component } from '@angular/core';
import { ContatoComponent } from "../contato/contato";
import { DiscographyComponent } from "../../app-discography/app-discography";
import { AppVisualNovel } from "../../app-visual-novel/app-visual-novel";
import { StorytellingComponent } from "../../app-storytelling/app-storytelling";
import { SobreComponent } from "../sobre/sobre";
import { Home } from "../home/home";
import { AdBannerComponent } from "../../components/ad-banner/ad-banner";

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

}
