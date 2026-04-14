import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-author-signature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './author-signature.html',
  styleUrl: './author-signature.scss'
})
export class AuthorSignatureComponent {
  public translate = inject(TranslationService);
}
