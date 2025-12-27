import { Component, OnInit } from '@angular/core';
 // Importante para o *ngIf
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // O Arsenal de Formulários
import { CONTACT_DATA } from '../../data/app-data';
import { TranslationService } from '../../services/translation.service';
import { HttpClient,HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contato',
  standalone: true, // <--- A MÁGICA ESTÁ AQUI. Diz que ele é independente.
  imports: [
    ReactiveFormsModule,
    HttpClientModule
],
  templateUrl: './contato.html', // Ou o nome que você deu
  styleUrls: ['./contato.scss']
})
export class ContatoComponent {
  uplinkForm: FormGroup;
  isSending: boolean = false;
  successMessage: boolean = false;


  constructor(private fb: FormBuilder,
    public translate: TranslationService,
    private http: HttpClient) {
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

      // 📡 Preparando o Payload (Os dados da missão)
      const formData = this.uplinkForm.value;

      // 🚀 DISPARO REAL PARA O FORMSPREE
      // IMPORTANTE: Troque o link abaixo pelo seu do Formspree!
      this.http.post('https://formspree.io/f/xanrzygr', formData)
        .subscribe({
          next: (response) => {
            console.log('✅ UPLINK ESTABELECIDO!', response);
            this.isSending = false;
            this.successMessage = true;
            this.uplinkForm.reset();
          },
          error: (error) => {
            console.error('❌ FALHA NO UPLINK:', error);
            this.isSending = false;
            alert('Erro na conexão. O servidor deles pode estar Offline.');
          }
        });

    } else {
      this.uplinkForm.markAllAsTouched();
    }
  }
}
