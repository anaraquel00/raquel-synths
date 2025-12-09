import { Component } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
@Component({
  selector: 'app-footer',
  imports: [MatIconModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
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
}
