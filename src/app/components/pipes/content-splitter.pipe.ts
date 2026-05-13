import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitContent',
  standalone: true
})
export class SplitContentPipe implements PipeTransform {

  // minWords = 150 garante que cada "bloco" tenha volume suficiente antes de permitir um banner
  transform(html: string, minWords: number = 150): string[] {
    if (!html) return [];

    // 1. Fragmenta o texto original nas tags de fechamento de parágrafo
    const paragraphs = html
      .split('</p>')
      .filter(chunk => chunk.trim().length > 0)
      .map(chunk => chunk + '</p>');

    const safeChunks: string[] = [];
    let currentBlock = '';
    let currentBlockWordCount = 0;

    // Função interna do Arquiteto para contar apenas texto real (ignora <p>, <b>, <i>, etc.)
    const countRealWords = (text: string): number => {
      const strippedText = text.replace(/<[^>]*>?/gm, ''); // Limpa o HTML
      const words = strippedText.match(/\S+/g); // Conta os blocos de caracteres
      return words ? words.length : 0;
    };

    // 2. Loop de Agrupamento Dinâmico
    for (const paragraph of paragraphs) {
      currentBlock += paragraph;
      currentBlockWordCount += countRealWords(paragraph);

      // Se o bloco atual atingiu a massa crítica (minWords), nós o empacotamos e abrimos espaço
      if (currentBlockWordCount >= minWords) {
        safeChunks.push(currentBlock);
        currentBlock = '';
        currentBlockWordCount = 0;
      }
    }

    // 3. Coleta de Resíduos (Se sobrou texto no final que não atingiu a cota)
    if (currentBlock.trim().length > 0) {
      safeChunks.push(currentBlock);
    }

    return safeChunks;
  }
}
