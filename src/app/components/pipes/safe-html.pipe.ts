import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  // Esse método diz pro Angular: "Esse HTML é seguro, pode renderizar com estilos!"
  transform(html: string): SafeHtml {
    if (!html) return '';

    // 🛡️ ADSENSE SENTINEL FIREWALL: Erradica tentativas de Cloaking inline que venham da Base de Dados.
    // Purga agressivamente qualquer display:none, visibility:hidden ou opacity:0 injetado em atributos style.
    const firewallHtml = html.replace(/style=["'][^"']*(display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0)[^"']*["']/gi, 'style="/* [RQS PURGED] */"');

    return this.sanitizer.bypassSecurityTrustHtml(firewallHtml);
  }
}
