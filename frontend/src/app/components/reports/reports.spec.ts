import { ReportsComponent } from './reports';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('ReportsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
  });
  it('should create', () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
