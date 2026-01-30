import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { CONTACT_DATA } from '../../data/app-data';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contato.html',
  styleUrls: ['./contato.scss']
})
export class ContatoComponent {
  public translate = inject(TranslationService);
  private fb = inject(FormBuilder);

  uplinkForm: FormGroup;
  isSending = false;
  successMessage = false;

  constructor() {
    this.uplinkForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required], // Novo campo
      message: ['', Validators.required],

      // 🍯 O HONEYPOT (Campo armadilha)
      // Não tem Validação, pois deve ficar vazio!
      website: ['']
    });
  }

  get text() {
    return this.translate.isPt() ? CONTACT_DATA.pt : CONTACT_DATA.en;
  }

  onSubmit() {
    // 1. Verifica Honeypot (Se tiver valor, é Robô 🤖)
    if (this.uplinkForm.value.website) {
      console.log('🍯 Honeypot ativado! Robô capturado.');
      this.isSending = true;
      // Finge que enviou para enganar o bot
      setTimeout(() => { this.successMessage = true; }, 1000);
      return;
    }

    if (this.uplinkForm.valid) {
      this.isSending = true;
      console.log('Enviando dados reais:', this.uplinkForm.value);

      // Simulação de envio (Aqui entraria seu serviço de Email/Firebase)
      setTimeout(() => {
        this.isSending = false;
        this.successMessage = true;
        this.uplinkForm.reset();
      }, 2000);
    }
  }
}
