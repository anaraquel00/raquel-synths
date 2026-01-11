import { Component, signal } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { FOOTER_DATA } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';

import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdBannerComponent } from "../ad-banner/ad-banner";
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-footer',
  imports: [FormsModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  constructor(
    public translate: TranslationService,
    private http: HttpClient // Injete o HttpClient
  ) {}


  get t() { // "t" de text
    return this.translate.isPt() ? FOOTER_DATA.pt : FOOTER_DATA.en;
  }
// SEUS DADOS REAIS
  paypalLink = 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=anaraquel00@gmail.com&currency_code=USD&item_name=Support_RQS'; // Coloque seu link aqui
  pixKey = '727721b9-52c4-421b-a232-63e1c4cab57b'; // Coloque sua chave aqui

  openPaypal() {
    window.open(this.paypalLink, '_blank');
  }

  copyPix() {
    // A API do navegador para copiar texto
    navigator.clipboard.writeText(this.pixKey).then(() => {
      alert(`🇧🇷 Chave PIX copiada: ${this.pixKey}\nObrigado pelo café! ☕`);
    }).catch(err => {
      console.error('Erro ao copiar', err);
      alert('Anota aí a chave: ' + this.pixKey);
    });
  }

    // Variáveis reativas para controlar o formulário
  email = signal('');
  loading = signal(false);

  // --- LÓGICA REAL DA NEWSLETTER ---
  subscribe() {
    if (!this.email() || !this.email().includes('@')) {
      alert('⚠️ Digite um e-mail válido!');
      return;
    }

    this.loading.set(true); // Ativa estado de carregamento

    // Chama sua API na Vercel
    this.http.post('/api/subscribe', { email: this.email() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.email.set(''); // Limpa o campo
        alert(this.translate.isPt() ? '✅ Inscrito com sucesso! Bem-vindo à Resistência.' : '✅ Subscribed successfully! Welcome to the Resistance.');
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
        alert('❌ Erro ao inscrever. Tente novamente mais tarde.');
      }
    });
  }

}
