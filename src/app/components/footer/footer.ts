import { Component } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { FOOTER_DATA } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';
@Component({
  selector: 'app-footer',
  imports: [MatIconModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  constructor(public translate: TranslationService) {
    }

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
  // --- NOVA FUNÇÃO DA NEWSLETTER ---
  subscribe() {
    const msg = this.translate.isPt()
      ? '🤘 Bem-vindo(a) à Resistência RQS! (Simulação: E-mail capturado!)'
      : '🤘 Welcome to the RQS Resistance! (Simulation: Email captured!)';
    alert(msg);
  }
}
