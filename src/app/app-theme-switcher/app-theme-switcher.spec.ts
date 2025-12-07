import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppThemeSwitcher } from './app-theme-switcher';

describe('AppThemeSwitcher', () => {
  let component: AppThemeSwitcher;
  let fixture: ComponentFixture<AppThemeSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppThemeSwitcher]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppThemeSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
