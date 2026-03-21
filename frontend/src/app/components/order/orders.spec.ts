import { TestBed } from '@angular/core/testing';
import { OrdersComponent } from './orders';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('OrdersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
  });
  it('should create', () => {
    const fixture = TestBed.createComponent(OrdersComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
