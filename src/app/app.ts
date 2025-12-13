import { Component, signal } from '@angular/core';
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { Home } from "./pages/home/home";
import { AppThemeSwitcher } from './app-theme-switcher/app-theme-switcher';
import { StorytellingComponent } from "./app-storytelling/app-storytelling";
import { SobreComponent } from "./pages/sobre/sobre";
import { VisualNovelComponent } from "./app-visual-novel/app-visual-novel";
import { DiscographyComponent } from "./app-discography/app-discography";
import { ReactiveFormsModule } from '@angular/forms';
import { ContatoComponent } from "./pages/contato/contato";

@Component({
  selector: 'app-root',
  imports: [Header,
    Footer,
    Home,
    StorytellingComponent,
    SobreComponent,
    VisualNovelComponent,
    DiscographyComponent,
    ContatoComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
title = 'raquel-synths';
}
