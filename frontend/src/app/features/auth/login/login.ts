import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .login-page {
      min-height: 100vh;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', sans-serif;
      padding: 24px;
    }
    .login-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo h1 { font-size: 22px; font-weight: 700; color: #4f8ef7; margin-bottom: 4px; }
    .logo p { font-size: 13px; color: #64748b; }
    .card-title { font-size: 18px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
    .card-sub { font-size: 13px; color: #64748b; margin-bottom: 24px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-group label { font-size: 13px; color: #94a3b8; font-weight: 500; }
    .form-group input {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 11px 14px;
      color: #e2e8f0;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      width: 100%;
    }
    .form-group input:focus { border-color: #4f8ef7; }
    .form-group input::placeholder { color: #475569; }
    .btn-submit {
      width: 100%;
      background: #1d4ed8;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 4px;
    }
    .btn-submit:hover { background: #2563eb; }
    .btn-submit:disabled { background: #334155; color: #64748b; cursor: not-allowed; }
    .alert-error {
      background: #450a0a;
      border: 1px solid #991b1b;
      color: #fca5a5;
      padding: 11px 14px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .register-link {
      text-align: center;
      margin-top: 20px;
      font-size: 13px;
      color: #64748b;
    }
    .register-link a {
      color: #4f8ef7;
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
    }
    .register-link a:hover { text-decoration: underline; }
  `],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="logo">
          <h1>SmartShelfX</h1>
          <p>Inventory Management System</p>
        </div>

        <div class="card-title">Welcome back</div>
        <div class="card-sub">Sign in to your account to continue</div>

        <div class="alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

        <div class="form-group">
          <label>Email Address</label>
          <input
            type="email"
            [(ngModel)]="email"
            placeholder="you@example.com"
            [disabled]="loading"
            (keyup.enter)="login()"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            type="password"
            [(ngModel)]="password"
            placeholder="Enter your password"
            [disabled]="loading"
            (keyup.enter)="login()"
          />
        </div>

        <button class="btn-submit" (click)="login()" [disabled]="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="register-link">
          Don't have an account? <a (click)="goToRegister()">Register here</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  login() {
    this.errorMsg = '';

    if (!this.email.trim()) { this.errorMsg = 'Email is required.'; return; }
    if (!this.password) { this.errorMsg = 'Password is required.'; return; }

    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (token: string) => {
        this.authService.saveToken(token);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err : any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || err?.error || 'Invalid email or password.';
        this.cdr.detectChanges();
      }
    });
  }

  goToRegister() { this.router.navigate(['/register']); }
}
