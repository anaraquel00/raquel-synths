import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para o *ngIf
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // O Arsenal de Formulários

@Component({
  selector: 'app-contato',
  standalone: true, // <--- A MÁGICA ESTÁ AQUI. Diz que ele é independente.
  imports: [
    CommonModule,        // Traz o *ngIf, *ngFor
    ReactiveFormsModule  // Traz o formGroup, formControlName
  ],
  templateUrl: './contato.html', // Ou o nome que você deu
  styleUrls: ['./contato.scss']
})
export class ContatoComponent implements OnInit {
  uplinkForm: FormGroup;
  isSending: boolean = false;
  successMessage: boolean = false;

  constructor(private fb: FormBuilder) {
    this.uplinkForm = this.fb.group({
      agentName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      daw: ['Ableton', Validators.required],
      demoLink: ['', Validators.required],
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.uplinkForm.valid) {
      this.isSending = true;
      console.log('📡 DADOS CRIPTOGRAFADOS RECEBIDOS:', this.uplinkForm.value);

      // Simulação de envio para o QG
      setTimeout(() => {
        this.isSending = false;
        this.successMessage = true;
        this.uplinkForm.reset();
      }, 2000);
    } else {
      this.uplinkForm.markAllAsTouched(); // Acende os alertas vermelhos
    }
  }
}
