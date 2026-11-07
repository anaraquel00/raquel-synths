import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminShellComponent } from './admin-shell';

describe('AdminShellComponent', () => {
  let fixture: ComponentFixture<AdminShellComponent>;
  let component: AdminShellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShellComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.checked.set(true);
    component.authenticated.set(true);
    fixture.detectChanges();
  });

  it('mantém Lore e Sagas Globais arquivados e sem ação navegável', () => {
    const archivedCards = Array.from(
      fixture.nativeElement.querySelectorAll('.module-card.archived')
    ) as HTMLElement[];

    expect(archivedCards.length).toBe(2);
    expect(archivedCards.map(card => card.querySelector('h3')?.textContent?.trim()))
      .toEqual(['Lore', 'Sagas Globais']);
    expect(archivedCards.every(card => card.textContent?.includes('ARQUIVADO')))
      .toBeTrue();
    expect(archivedCards.every(card => card.tagName === 'ARTICLE'))
      .toBeTrue();
    expect(archivedCards.every(card => !card.querySelector('a')))
      .toBeTrue();
    expect(archivedCards.every(card => !card.textContent?.includes('Abrir módulo')))
      .toBeTrue();
  });

  it('preserva os três módulos administrativos ativos', () => {
    const activeCards = Array.from(
      fixture.nativeElement.querySelectorAll('a.module-card')
    ) as HTMLAnchorElement[];

    expect(activeCards.length).toBe(3);
    expect(activeCards.map(card => card.querySelector('h3')?.textContent?.trim()))
      .toEqual([
        'Logs do Sistema',
        'Social Publishing',
        'Media Control Plane'
      ]);
    expect(activeCards.map(card => card.getAttribute('href')))
      .toEqual([
        '/admin/system-logs',
        '/admin/social-publishing',
        '/admin/radio'
      ]);
  });
});
