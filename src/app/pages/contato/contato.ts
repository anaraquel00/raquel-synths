import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para o *ngIf
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // O Arsenal de Formulários
import { CONTACT_DATA } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';

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
export class ContatoComponent {
  uplinkForm: FormGroup;
  isSending: boolean = false;
  successMessage: boolean = false;


  constructor(private fb: FormBuilder, public translate: TranslationService) {
    this.uplinkForm = this.fb.group({
      agentName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      daw: ['Ableton', Validators.required],
      demoLink: ['', Validators.required],
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  // 👇 Getter Mágico para o HTML ler os textos
  get text() {
    return this.translate.isPt() ? CONTACT_DATA.pt : CONTACT_DATA.en;
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
