import { NotificationsComponent } from './notifications';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('NotificationsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
  });
  it('should create', () => {
    const fixture = TestBed.createComponent(NotificationsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
