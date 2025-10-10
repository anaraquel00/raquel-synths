import { Component, signal } from '@angular/core';
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { Home } from "./pages/home/home";

@Component({
  selector: 'app-root',
  imports: [Header, Footer, Home],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

}
