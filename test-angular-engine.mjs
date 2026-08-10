import { AngularNodeAppEngine } from '@angular/ssr/node';

console.log('1. Antes do AngularNodeAppEngine');

const engine = new AngularNodeAppEngine();

console.log('2. AngularNodeAppEngine criado:', !!engine);
