import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import {
  CommonModule,
  DOCUMENT
} from '@angular/common';

import { TranslationService } from '../../services/translation.service';
import { CONTACT_DATA } from '../../data/app-data';
import { SafeHtmlPipe } from '../../components/pipes/safe-html.pipe';
import { SeoService } from '../../services/seo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contato.html',
  styleUrls: ['./contato.scss']
})
export class ContatoComponent implements OnInit {

  public translate = inject(TranslationService);

  private fb = inject(FormBuilder);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  uplinkForm: FormGroup;

  isSending = false;
  successMessage = false;
  errorMessage = false;

  constructor() {
    this.uplinkForm = this.fb.group({
      name: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      website: ['']
    });
  }

  get text() {
    return this.translate.isPt()
      ? CONTACT_DATA.pt
      : CONTACT_DATA.en;
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

async onSubmit(): Promise<void> {

  if (this.uplinkForm.value.website) {
    this.successMessage = true;
    return;
  }

  if (!this.uplinkForm.valid) {
    return;
  }

  this.isSending = true;
  this.errorMessage = false;

  try {
    const response =
      await fetch('/api/contact', {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          name:
            this.uplinkForm.value.name,

          email:
            this.uplinkForm.value.email,

          subject:
            this.uplinkForm.value.subject,

          message:
            this.uplinkForm.value.message,

          website:
            this.uplinkForm.value.website
        })
      });

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.error ||
        'Transmission failed'
      );
    }

    this.successMessage = true;
    this.uplinkForm.reset();

  } catch (error) {
    console.error(
      '[RQS CONTACT] Submit error:',
      error
    );

    this.errorMessage = true;

  } finally {
    this.isSending = false;
  }
}
}
