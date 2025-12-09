import { Component } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
@Component({
  selector: 'app-footer',
  imports: [MatIconModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
// O "Link Mágico" do PayPal (agora mascarado de "Buy me a Coffee")
  // Dica: No 'item_name' coloquei 'Coffee_for_RQS' para ficar estiloso na fatura do gringo.
  private myEmail = 'anaraquel00@gmail.com';
  private magicLink = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${this.myEmail}&currency_code=USD&item_name=Coffee_for_RQS_Devs`;

  // Sua chave Aleatória do Pix
  private pixKey = '727721b9-52c4-421b-a232-63e1c4cab57b';

  openDonation() {
    // O Menu de Escolha Global
    const choice = confirm(
      "🌍 CHOOSE YOUR WEAPON / ESCOLHA SEU APOIO 🇧🇷\n\n" +
      "☕ INTERNATIONAL: Click [OK] to 'Buy us a Coffee' via PayPal (USD).\n\n" +
      "💠 BRASIL: Clique em [CANCELAR] para copiar a chave PIX."
    );

    if (choice) {
      // Rota Internacional (PayPal/Café)
      window.open(this.magicLink, '_blank');
    } else {
      // Rota Nacional (Pix Aleatório)
      navigator.clipboard.writeText(this.pixKey).then(() => {
        alert(
          `✅ Chave PIX (Aleatória) copiada!\n\n` +
          `Cole no seu app do banco.\n\n` +
          `A Resistência BR agradece! 🤘🇧🇷`
        );
      }).catch(() => {
        // Fallback caso a cópia falhe
        prompt("Copie a chave PIX manualmente:", this.pixKey);
      });
    }
  }
}
