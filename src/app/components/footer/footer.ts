import { Component } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
@Component({
  selector: 'app-footer',
  imports: [MatIconModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
openDonation() {
    // Opção A: Alerta Simples
    alert("💸 O Cofre da RQS está sendo forjado! Em breve você poderá apoiar nossa arte. Obrigado pela intenção! 🖤");

    // Opção B: Se tiver o link, abre (futuro)
    // window.open('SEU_LINK_PAYPAL', '_blank');
  }
}
