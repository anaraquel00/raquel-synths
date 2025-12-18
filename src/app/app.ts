import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { Home } from "./pages/home/home";
import { AppThemeSwitcher } from './app-theme-switcher/app-theme-switcher';
import { StorytellingComponent } from "./app-storytelling/app-storytelling";
import { SobreComponent } from "./pages/sobre/sobre";

import { DiscographyComponent } from "./app-discography/app-discography";
import { ReactiveFormsModule } from '@angular/forms';
import { ContatoComponent } from "./pages/contato/contato";
import { AdBannerComponent } from "./components/ad-banner/ad-banner";

@Component({
  selector: 'app-root',
  imports: [Header,
    Footer,
    AdBannerComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
title = 'raquel-synths';
}
