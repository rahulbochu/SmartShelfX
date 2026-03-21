import { TestBed } from '@angular/core/testing';
import { SuppliersComponent } from './suppliers';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('SuppliersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliersComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
  });
  it('should create', () => {
    const fixture = TestBed.createComponent(SuppliersComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
