import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeepLinkRedirect } from './deep-link-redirect';

describe('DeepLinkRedirect', () => {
  let component: DeepLinkRedirect;
  let fixture: ComponentFixture<DeepLinkRedirect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeepLinkRedirect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeepLinkRedirect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
