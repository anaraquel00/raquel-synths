import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department } from '../../../data/store-data';


@Component({
  selector: 'app-store-departments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-departments.html', // Confirme o nome
  styleUrls: ['./store-departments.scss']   // Confirme o nome
})
export class StoreDepartmentsComponent {

  // 🚪 PORTA DE ENTRADA 1: Recebe a lista de departamentos
  @Input() departments: Department[] = [];

  // 🚪 PORTA DE ENTRADA 2: Recebe a língua atual ('pt' ou 'en')
  @Input() currentLang: 'pt' | 'en' = 'pt';

  @Input() productCounts: Record<string, number> = {};

  // 📢 MEGAFONE DE SAÍDA: Avisa ao pai qual setor foi clicado
  @Output() selectDept = new EventEmitter<string>();

  // Método interno que dispara o evento para cima
  // Adicione o parâmetro opcional 'event'
  onCardClick(deptId: string, event?: Event) {

    // Se foi um clique no botão, para a propagação pra não clicar no card também
    if (event) {
      event.stopPropagation();
    }

    console.log('🚀 Disparando navegação para:', deptId);
    this.selectDept.emit(deptId);
  }
}
