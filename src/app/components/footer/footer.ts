import { Component, signal } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { FOOTER_DATA } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';

import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-footer',
  standalone: true, // Adicionei standalone se for v17+
  imports: [FormsModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

  // Variáveis reativas
  email = signal('');
  loading = signal(false);

  // DADOS REAIS
  paypalLink = 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=anaraquel00@gmail.com&currency_code=USD&item_name=Support_RQS';
  pixKey = '727721b9-52c4-421b-a232-63e1c4cab57b';

  constructor(
    public translate: TranslationService,
    private http: HttpClient
  ) {}

  get t() { return this.translate.isPt() ? FOOTER_DATA.pt : FOOTER_DATA.en; }

  // --- AÇÃO DO PAYPAL ---
  openPaypal() {
    // Abre em nova aba (Segurança padrão)
    window.open(this.paypalLink, '_blank', 'noopener,noreferrer');
  }

  // --- AÇÃO DO PIX (COM SWEET ALERT) ---
  copyPix() {
    navigator.clipboard.writeText(this.pixKey).then(() => {
      // ✅ UX SÊNIOR: Modal Bonito e Verde
      Swal.fire({
        title: 'PIX Copiado!',
        text: 'A chave está na sua área de transferência. Obrigado pelo café! ☕',
        icon: 'success',
        confirmButtonColor: '#00ff41', // Verde Neon do seu site
        background: '#1a1a1a', // Fundo escuro
        color: '#fff' // Texto branco
      });
    }).catch(err => {
      console.error('Erro ao copiar', err);
      // Fallback elegante se falhar
      Swal.fire({
        title: 'Ops!',
        text: 'Não consegui copiar automático. Anota aí: ' + this.pixKey,
        icon: 'error',
        background: '#1a1a1a',
        color: '#fff'
      });
    });
  }

  // --- NEWSLETTER (COM SWEET ALERT) ---
  subscribe() {
    if (!this.email() || !this.email().includes('@')) {
      Swal.fire({
        title: 'E-mail Inválido',
        text: 'Por favor, digite um e-mail real.',
        icon: 'warning',
        confirmButtonColor: '#ffcc00',
        background: '#1a1a1a',
        color: '#fff'
      });
      return;
    }

    this.loading.set(true);

    this.http.post('/api/subscribe', { email: this.email() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.email.set('');

        Swal.fire({
          title: this.translate.isPt() ? 'Bem-vindo à Resistência!' : 'Welcome to the Resistance!',
          text: this.translate.isPt() ? 'Inscrito com sucesso.' : 'Subscribed successfully.',
          icon: 'success',
          confirmButtonColor: '#00ff41',
          background: '#1a1a1a',
          color: '#fff'
        });
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
        Swal.fire({
          title: 'Erro no Servidor',
          text: 'Tente novamente mais tarde.',
          icon: 'error',
          background: '#1a1a1a',
          color: '#fff'
        });
      }
    });
  }
}
