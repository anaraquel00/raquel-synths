import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contato.html',
  styleUrls: ['./contato.css']
})
export class ContactComponent implements OnInit {
  uplinkForm: FormGroup; // O nosso formulário
  isSending: boolean = false; // Para mostrar "Enviando..."
  successMessage: boolean = false; // Para mostrar "Sucesso!"

  // Injetando o Construtor de Formulários
  constructor(private fb: FormBuilder) {
    this.uplinkForm = this.fb.group({
      agentName: ['', [Validators.required, Validators.minLength(3)]], // Nome obrigatório
      email: ['', [Validators.required, Validators.email]], // E-mail válido
      daw: ['Ableton', Validators.required], // DAW favorita (já vem com Ableton marcado)
      demoLink: ['', Validators.required], // Link do SoundCloud/Spotify
      message: ['', [Validators.required, Validators.maxLength(500)]] // A mensagem
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.uplinkForm.valid) {
      this.isSending = true;
      console.log('Dados do Agente:', this.uplinkForm.value);

      // AQUI ENTRA A MÁGICA DE ENVIO (Podemos usar Formspree depois)
      // Por enquanto, vamos simular que enviou:
      setTimeout(() => {
        this.isSending = false;
        this.successMessage = true;
        this.uplinkForm.reset(); // Limpa o formulário
      }, 2000);
    } else {
      // Se tiver erro, marca tudo como "tocado" pro vermelho aparecer
      this.uplinkForm.markAllAsTouched();
    }
  }
}
