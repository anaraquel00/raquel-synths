import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RadioAdminComponent } from './radio-admin';

describe('RadioAdminComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RadioAdminComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    });
  });

  it('keeps the Foundation UI explicitly read-only', () => {
    const fixture = TestBed.createComponent(RadioAdminComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.authenticated.set(true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent || '';

    expect(text).toContain('NO YOUTUBE WRITES');
    expect(text).toContain('RUN RADIO DRY RUN');
    expect(text).not.toContain('CREATE YOUTUBE LIVE');
  });
});
