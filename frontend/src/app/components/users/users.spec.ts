import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UsersComponent } from './users';

describe('UsersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
  });
  it('should create', () => {
    const fixture = TestBed.createComponent(UsersComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
