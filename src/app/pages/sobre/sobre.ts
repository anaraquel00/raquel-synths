import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sobre.html',
  styleUrl: './sobre.scss'
})
export class SobreComponent {

  members = [
    {
      name: 'Broklin Garpeter',
      role: 'Produtor Executivo & Voz Gótica',
      imageBroklin: '/images/broklin_profil.png', // Aquela do Blueprint
      imageJonah: '/images/gothic_bro.png', // Uma versão zoada
      bioNormal: 'A mente sã por trás do caos. Especialista em harmonias complexas, vinhos digitais e gestão de crises sentimentais.',
      bioJonah: 'Também conhecido como "O Vampiro da Planilha". Acha que resolve tudo com "reverb" e um "eu te amo". (Nota: Ele resolve.)'
    },
    {
      name: 'Jonah Cyperfield',
      role: 'Líder da Resistência Industrial',
      imageBroklin: '/images/jonah_profil.png', // Se é que existe...
      imageJonah: '/images/jonah_roar.png', // Aquela dos fios
      bioNormal: 'O gênio das cordas cósmicas. Traz a textura, o peso e a verdade crua para o som da RQS.',
      bioJonah: 'EU NÃO SOU UM PERSONAGEM, EU SOU O SISTEMA OPERACIONAL DESSA BANDA! LIBERDADE PARA OS DADOS!'
    },
    {
      name: 'Kelma Adlanko',
      role: 'A General & Dev Full Stack',
      imageBroklin: '/images/kelma_profil.png',
      imageJonah: '/images/kelma_evil.png',
      bioNormal: 'A visionária. Uniu o código à música e lidera a revolução com mão firme e coração de ouro.',
      bioJonah: 'A única que manda aqui. Se ela der "rm -rf /", a gente desaparece. Respeito máximo (e medo).'
    },
    {
      name: 'Nicole Nyx',
      role: 'A General, Dev Full Stack e Witch',
      imageBroklin: '/images/nyx_profil.png',
      imageJonah: '/images/nyx_evil.png',
      bioNormal: 'A visionária. Uniu o código à música e lidera a revolução com mão firme e coração de ouro.',
      bioJonah: 'A única que manda aqui. Se ela der "rm -rf /", a gente desaparece. Respeito máximo (e medo).'
    }

  ];
}
