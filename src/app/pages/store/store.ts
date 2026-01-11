import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // <--- IMPORTANTE: Importar o Router
import { STORE_DATA } from '../../data/store-data';
import { TranslationService } from '../../services/translation.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store.html',
  styleUrls: ['./store.scss']
})
export class StoreComponent {

  // INJEÇÕES DE DEPENDÊNCIA
  private router = inject(Router); // <--- O Router entra aqui!
  private translate = inject(TranslationService);
  currentLang = this.translate.currentLang;

  // --- ESTRUTURA DE PARCEIROS (O Cérebro) ---
  private getPartnerConfig(url: string, lang: string) {
    const lowerUrl = url.toLowerCase();

    // 1. CONFIGURAÇÃO: Defina aqui seus parceiros e textos
    if (lowerUrl.includes('shein')) {
      return lang === 'pt'
        ? { title: 'Indo para Shein! 👗', msg: 'Redirecionando para nosso parceiro de moda.', footer: '💡 Dica: Procure por cupons!', btn: 'Ver na Loja' }
        : { title: 'Going to Shein! 👗', msg: 'Redirecting to our fashion partner.', footer: '💡 Tip: Look for coupons!', btn: 'Go to Store' };
    }

    else if (lowerUrl.includes('amazon')) {
      return lang === 'pt'
        ? { title: 'Indo para Amazon! 📦', msg: 'Compra segura e entrega rápida com Jeff Bezos.', footer: '🚚 Verifique se tem Frete Grátis', btn: 'Ver na Amazon' }
        : { title: 'Going to Amazon! 📦', msg: 'Secure purchase and fast delivery.', footer: '🚚 Check for Free Shipping', btn: 'Go to Amazon' };
    }

    else if (lowerUrl.includes('aliexpress')) {
      return lang === 'pt'
        ? { title: 'Indo para AliExpress! 🌏', msg: 'Redirecionando para importação direta.', footer: '⏳ Atenção ao prazo de entrega.', btn: 'Ver no Ali' }
        : { title: 'Going to AliExpress! 🌏', msg: 'Redirecting to direct import.', footer: '⏳ Check delivery time.', btn: 'Go to Ali' };
    }

    else if (lowerUrl.includes('stripe') || lowerUrl.includes('checkout')) {
      return lang === 'pt'
        ? { title: 'Checkout Seguro 🔒', msg: 'Ambiente criptografado para finalizar seu pagamento.', footer: '🛡️ Pagamento processado via Stripe', btn: 'Pagar Agora' }
        : { title: 'Secure Checkout 🔒', msg: 'Encrypted environment to complete your payment.', footer: '🛡️ Processed via Stripe', btn: 'Pay Now' };
    }

    // FALLBACK (Caso seja um link novo que você esqueceu de configurar)
    else {
      return lang === 'pt'
        ? { title: 'Site Externo 🔗', msg: 'Você está saindo do ambiente RaQuel Synths.', footer: 'Navegue com segurança.', btn: 'Continuar' }
        : { title: 'External Site 🔗', msg: 'You are leaving RaQuel Synths environment.', footer: 'Browse safely.', btn: 'Continue' };
    }
  }

  // --- A FUNÇÃO PRINCIPAL (Agora ficou limpinha!) ---
  handleShopClick(productUrl: string) {
    const lang = this.translate.currentLang();
    const currentMode = this.translate.currentMode();
    const isJonah = currentMode === 'jonah';

    // Cores (Jonah vs Broklin)
    const modeColor = isJonah ? '#ff3300' : '#00ffff';
    const bgColor = isJonah ? '#1a0000' : '#121212';

    // PEGA OS DADOS DO PARCEIRO AUTOMATICAMENTE 👇
    const content = this.getPartnerConfig(productUrl, lang);

    Swal.fire({
      title: content.title,
      text: content.msg,
      icon: 'info', // Você pode até colocar ícone dinâmico no config se quiser!

      color: '#fff',
      background: bgColor,

      confirmButtonColor: 'transparent',
      cancelButtonColor: '#333',

      showCancelButton: true,
      confirmButtonText: `${content.btn} 🚀`,
      cancelButtonText: lang === 'pt' ? 'Voltar' : 'Go Back',

      footer: `<span style="color: ${modeColor}">${content.footer}</span>`,

      customClass: {
        popup: 'cyberpunk-swal'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(productUrl, '_blank');
      }
    });
  }
  // DADOS
  products = STORE_DATA;


  // AÇÃO DO BOTÃO VOLTAR
  goBackHome() {
    this.router.navigate(['/']);
  }

   // AÇÃO DE COMPRA
  buyProduct(url: string) {
    if (url) window.open(url, '_blank');
  }
}
