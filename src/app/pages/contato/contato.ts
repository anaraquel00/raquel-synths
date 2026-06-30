import { Component, inject, signal, afterNextRender, OnInit } from '@angular/core'; // Adicionado OnInit
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common'; // Adicionado DOCUMENT
import { TranslationService } from '../../services/translation.service';
import { CONTACT_DATA } from '../../data/app-data';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { SafeHtmlPipe } from '../../components/pipes/safe-html.pipe';
import { SeoService } from '../../services/seo.service'; // Importado
import { Router } from '@angular/router'; // Importado

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SafeHtmlPipe],
  templateUrl: './contato.html',
  styleUrls: ['./contato.scss']
})
export class ContatoComponent implements OnInit { // Implementando OnInit
  public translate = inject(TranslationService);
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  public currentLang = signal<'pt' | 'en'>('pt');
  uplinkForm: FormGroup;
  isSending = false;
  successMessage = false;
  errorMessage = false;

  constructor() {
    this.uplinkForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      website: ['']
    });

    afterNextRender(() => {
      this.currentLang.set(this.translate.isPt() ? 'pt' : 'en');
    });
  }

  // 🛡️ MOTOR DE AUTORIDADE: Identificação e SEO para Google Partners
  ngOnInit() {
    // 🛡️ TRAVA DE HIERARQUIA: Só executa o SEO se a rota for exatamente /contato
  if (this.router.url === '/contato') {
    const isPt = this.translate.isPt();
    this.document.documentElement.lang = isPt ? 'pt-BR' : 'en-US';

    this.seoService.updateMetaTags({
      title: isPt ? 'Uplink | Contato' : 'Uplink | Contact',
      description: isPt ? 'Fale com a RQS.' : 'Contact RQS.',
      url: 'https://raquelsynths.com/contato'
    });

    // 3. JSON-LD DE CONTATO: O Google ama páginas de contato estruturadas
    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": isPt ? "Página de Contato RaQuel Synths" : "RaQuel Synths Contact Page",
      "description": isPt ? "Formulário oficial para contato e parcerias." : "Official form for contact and partnerships.",
      "url": `https://raquelsynths.com/contato`,
      "mainEntity": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "contato@raquelsynths.com.br",
        "url": `https://raquelsynths.com/contato`
      }
    });
  }
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
