import { Component, inject, signal, afterNextRender } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { CONTACT_DATA } from '../../data/app-data';

// 1. IMPORTAR AS FERRAMENTAS DO FIREBASE
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { SafeHtmlPipe } from '../../components/pipes/safe-html.pipe';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SafeHtmlPipe],
  templateUrl: './contato.html',
  styleUrls: ['./contato.scss']
})
export class ContatoComponent {
  public translate = inject(TranslationService);
  private fb = inject(FormBuilder);

  // 2. INJETAR O BANCO DE DADOS
  private firestore = inject(Firestore);

  // 🛡️ ESTADO SSR: Trava inicial no Português para passar pela Hidratação
  public currentLang = signal<'pt' | 'en'>('pt');

  uplinkForm: FormGroup;
  isSending = false;
  successMessage = false;
  errorMessage = false; // Pra avisar se der ruim

  constructor() {
    this.uplinkForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      website: [''] // 🍯 Honeypot
    });

    afterNextRender(() => {
      this.currentLang.set(this.translate.isPt() ? 'pt' : 'en');
    });
  }

  get text() {
    return this.currentLang() === 'pt' ? CONTACT_DATA.pt : CONTACT_DATA.en;
  }

  // AQUI É ONDE A MÁGICA ACONTECE
  async onSubmit() {
    // 1. Defesa Anti-Robô 🤖
    if (this.uplinkForm.value.website) {
      console.log('🍯 Honeypot ativado! Robô bloqueado.');
      this.isSending = true;
      setTimeout(() => { this.successMessage = true; }, 1000);
      return;
    }

    if (this.uplinkForm.valid) {
      this.isSending = true;
      this.errorMessage = false;

      try {
        // 2. Preparar o Pacote de Dados
        const mensagemParaSalvar = {
          name: this.uplinkForm.value.name,
          email: this.uplinkForm.value.email,
          subject: this.uplinkForm.value.subject,
          message: this.uplinkForm.value.message,
          dataEnvio: new Date().toISOString(), // Carimbo de Data/Hora
          lida: false // Status pra você controlar depois
        };

        // 3. Enviar para a coleção 'mensagens' no Firebase
        const collectionRef = collection(this.firestore, 'mensagens');
        await addDoc(collectionRef, mensagemParaSalvar);

        // 4. Sucesso!
        console.log('✅ Mensagem salva no Firebase!');
        this.isSending = false;
        this.successMessage = true;
        this.uplinkForm.reset();

      } catch (error) {
        // 5. Erro (Sem internet, permissão negada, etc)
        console.error('❌ Erro ao enviar:', error);
        this.isSending = false;
        this.errorMessage = true;
      }
    }
  }
}
