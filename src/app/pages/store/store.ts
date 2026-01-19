import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

  // INJEÇÕES
  private router = inject(Router);
  translate = inject(TranslationService); // Deixei public pra usar no HTML se precisar
  currentLang = this.translate.currentLang;

  // DADOS
  products = STORE_DATA;

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBackHome() {
    this.router.navigate(['/']);
  }

  // ==========================================================
  // 🧠 O CÉREBRO DA OPERAÇÃO (Gerenciador de Cliques)
  // ==========================================================
  handleShopClick(productUrl: string) {
    const isShein = productUrl.toLowerCase().includes('shein');

    if (isShein) {
      // 🚨 CAMINHO A: É SHEIN? -> Modal de Cupom Agressivo
      this.openSheinCouponModal(productUrl);
    } else {
      // 🛡️ CAMINHO B: É OUTRO? -> Modal de Parceiro Genérico
      this.openGenericPartnerModal(productUrl);
    }
  }

  // --- 🅰️ MODAL ESPECÍFICO DA SHEIN (CUPONS!) ---
  private openSheinCouponModal(url: string) {
    const isPt = this.translate.currentLang() === 'pt';
    const title = isPt ? '🔥 CUPOM DETECTADO!' : '🔥 COUPON DETECTED!';
    const btnText = isPt ? 'COPIAR E COMPRAR 🛍️' : 'COPY & SHOP 🛍️';

    Swal.fire({
      title: title,
      // HTML COM OS CÓDIGOS DE 40% E 50%
      html: `
        <div style="text-align: center; color: #ddd;">
          <p style="margin-bottom: 10px; font-size: 1.1rem;">
            ${isPt ? 'Economize até <strong>40% OFF</strong> nas melhores marcas!' : 'Save up to <strong>40% OFF</strong> on top brands!'}
          </p>

          <div style="
            background: #000;
            color: #ff0055;
            font-family: 'Courier New', monospace;
            font-size: 2.2rem;
            padding: 15px;
            border: 3px dashed #ff0055;
            margin: 15px 0;
            font-weight: 800;
            letter-spacing: 2px;
            position: relative;
          ">
            348EW73
            <span style="position: absolute; top: -12px; right: 10px; background: #ff0055; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px;">TOP OFFER</span>
          </div>

          <p style="font-size: 0.9rem; color: #888; margin-bottom: 20px;">
            ${isPt ? '(Clique abaixo para copiar e aplicar no checkout)' : '(Click below to copy and apply at checkout)'}
          </p>

          <div style="
            background: rgba(255,255,255,0.05);
            padding: 12px;
            border-radius: 8px;
            font-size: 0.85rem;
            border-left: 4px solid #00ff41;
            text-align: left;
          ">
            <strong>💡 ${isPt ? 'Dica de Mestre:' : 'Pro Tip:'}</strong>
            ${isPt
              ? 'Novo usuário? Tente o código <code style="color: #00ff41; font-weight:bold;">WY3BYYD</code> para ganhar <strong>50% OFF!</strong>'
              : 'New user? Try code <code style="color: #00ff41; font-weight:bold;">WY3BYYD</code> to get <strong>50% OFF!</strong>'}
          </div>
        </div>
      `,
      icon: 'warning',
      background: '#121212',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#ff0055',
      cancelButtonColor: '#444',
      confirmButtonText: btnText,
      cancelButtonText: isPt ? 'Voltar' : 'Go Back',

      preConfirm: () => {
        // Copia o código principal (40%)
        navigator.clipboard.writeText('348EW73');
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(url, '_blank');
        this.showToast(isPt ? 'Cupom copiado!' : 'Coupon copied!');
      }
    });
  }

  // --- 🅱️ MODAL GENÉRICO (AMAZON, ALI, ETC) ---
  private openGenericPartnerModal(url: string) {
    const lang = this.translate.currentLang();

    // Tenta pegar o modo (se sua função existir), senão assume 'broklin'
    // Adicionei um try/catch/check pra evitar o erro que você teve
    let isJonah = false;
    try {
        // @ts-ignore (Ignora erro se a função não existir no momento)
        const currentMode = this.translate.currentMode ? this.translate.currentMode() : 'broklin';
        isJonah = currentMode === 'jonah';
    } catch(e) { console.log('Modo não detectado, usando padrão.'); }

    const modeColor = isJonah ? '#ff3300' : '#00ffff';
    const bgColor = isJonah ? '#1a0000' : '#121212';

    const content = this.getPartnerConfig(url, lang);

    Swal.fire({
      title: content.title,
      text: content.msg,
      icon: 'info',
      color: '#fff',
      background: bgColor,
      confirmButtonColor: 'transparent',
      cancelButtonColor: '#333',
      showCancelButton: true,
      confirmButtonText: `${content.btn} 🚀`,
      cancelButtonText: lang === 'pt' ? 'Voltar' : 'Go Back',
      footer: `<span style="color: ${modeColor}">${content.footer}</span>`,
      customClass: { popup: 'cyberpunk-swal' }
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(url, '_blank');
      }
    });
  }

  // --- CONFIGURAÇÃO DOS PARCEIROS (MANTIDA) ---
  private getPartnerConfig(url: string, lang: string) {
    const lowerUrl = url.toLowerCase();

    // Nota: Removi o IF da Shein daqui porque ele agora tem função própria!

    if (lowerUrl.includes('amazon')) {
      return lang === 'pt'
        ? { title: 'Indo para Amazon! 📦', msg: 'Compra segura e entrega rápida.', footer: '🚚 Verifique Frete Grátis', btn: 'Ver na Amazon' }
        : { title: 'Going to Amazon! 📦', msg: 'Secure purchase and fast delivery.', footer: '🚚 Check Free Shipping', btn: 'Go to Amazon' };
    }
    else if (lowerUrl.includes('aliexpress')) {
      return lang === 'pt'
        ? { title: 'Indo para AliExpress! 🌏', msg: 'Importação direta da China.', footer: '⏳ Atenção ao prazo de entrega.', btn: 'Ver no Ali' }
        : { title: 'Going to AliExpress! 🌏', msg: 'Direct import from China.', footer: '⏳ Check delivery time.', btn: 'Go to Ali' };
    }
    else if (lowerUrl.includes('stripe') || lowerUrl.includes('checkout')) {
      return lang === 'pt'
        ? { title: 'Checkout Seguro 🔒', msg: 'Ambiente criptografado.', footer: '🛡️ Processado via Stripe', btn: 'Pagar Agora' }
        : { title: 'Secure Checkout 🔒', msg: 'Encrypted environment.', footer: '🛡️ Processed via Stripe', btn: 'Pay Now' };
    }
    else {
      return lang === 'pt'
        ? { title: 'Site Externo 🔗', msg: 'Você está saindo da RaQuel Synths.', footer: 'Navegue com segurança.', btn: 'Continuar' }
        : { title: 'External Site 🔗', msg: 'You are leaving RaQuel Synths.', footer: 'Browse safely.', btn: 'Continue' };
    }
  }

  // --- HELPER: TOAST FEEDBACK ---
  private showToast(msg: string) {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      background: '#000',
      color: '#00ff41'
    });
    toast.fire({ icon: 'success', title: msg });
  }
}
