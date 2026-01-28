import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitContent',
  standalone: true
})
export class SplitContentPipe implements PipeTransform {
  // Transforma o texto HTML em uma lista de pedaços
  transform(html: string): string[] {
    if (!html) return [];
    // Quebra o texto a cada fechamento de parágrafo </p>
    // O filter(Boolean) remove pedaços vazios
    return html.split('</p>').filter(chunk => chunk.trim().length > 0).map(chunk => chunk + '</p>');
  }
}
