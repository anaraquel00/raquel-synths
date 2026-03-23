import { Component, signal } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { FOOTER_DATA } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';

import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-footer',
  standalone: true, // Adicionei standalone se for v17+
  imports: [MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

   // DADOS REAIS
  paypalLink = 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=anaraquel00@gmail.com&currency_code=USD&item_name=Support_RQS';
  pixKey = '727721b9-52c4-421b-a232-63e1c4cab57b';

  constructor(
    public translate: TranslationService,
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

}
