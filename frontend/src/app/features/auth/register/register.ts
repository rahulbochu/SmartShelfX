import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .register-page {
      min-height: 100vh;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', sans-serif;
      padding: 24px;
    }
    .register-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    .logo { text-align: center; margin-bottom: 28px; }
    .logo h1 { font-size: 22px; font-weight: 700; color: #4f8ef7; margin-bottom: 4px; }
    .logo p { font-size: 13px; color: #64748b; }
    .card-title { font-size: 18px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
    .card-sub { font-size: 13px; color: #64748b; margin-bottom: 24px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-group label { font-size: 13px; color: #94a3b8; font-weight: 500; }
    .form-group input,
    .form-group select {
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
    .form-group input:focus,
    .form-group select:focus { border-color: #4f8ef7; }
    .form-group input::placeholder { color: #475569; }
    .form-group select option { background: #1e293b; color: #e2e8f0; }
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
    .alert-success {
      background: #052e16;
      border: 1px solid #166534;
      color: #4ade80;
      padding: 11px 14px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .login-link {
      text-align: center;
      margin-top: 20px;
      font-size: 13px;
      color: #64748b;
    }
    .login-link a {
      color: #4f8ef7;
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
    }
    .login-link a:hover { text-decoration: underline; }
    .role-hint {
      font-size: 11px;
      color: #475569;
      margin-top: 4px;
    }
  `],
  template: `
    <div class="register-page">
      <div class="register-card">
        <div class="logo">
          <h1>SmartShelfX</h1>
          <p>Inventory Management System</p>
        </div>

        <div class="card-title">Create an account</div>
        <div class="card-sub">Fill in the details below to get started</div>

        <div class="alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>
        <div class="alert-success" *ngIf="successMsg">{{ successMsg }}</div>

        <div class="form-group">
          <label>Full Name</label>
          <input
            type="text"
            [(ngModel)]="username"
            placeholder="John Doe"
            [disabled]="loading"
          />
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input
            type="email"
            [(ngModel)]="email"
            placeholder="you@example.com"
            [disabled]="loading"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            type="password"
            [(ngModel)]="password"
            placeholder="Minimum 6 characters"
            [disabled]="loading"
          />
        </div>

        <div class="form-group">
          <label>Role</label>
          <select [(ngModel)]="role" [disabled]="loading">
            <option value="">Select a role...</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
            <option value="Vendor">Vendor</option>
          </select>
          <span class="role-hint">
            Admin: full access · User: standard access · Vendor: supplier access
          </span>
        </div>

        <button class="btn-submit" (click)="register()" [disabled]="loading">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>

        <div class="login-link">
          Already have an account? <a (click)="goToLogin()">Sign in</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  role = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  register() {

  if (this.loading) return;
    console.log('Sending role:', this.role);
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.username.trim()) { this.errorMsg = 'Name is required.'; return; }
    if (!this.email.trim()) { this.errorMsg = 'Email is required.'; return; }
    if (!this.password || this.password.length < 6) { this.errorMsg = 'Password must be at least 6 characters.'; return; }
    if (!this.role) { this.errorMsg = 'Please select a role.'; return; }

    this.loading = true;
    this.authService.register(this.username, this.email, this.password, this.role).subscribe({
      next: () => {
        this.successMsg = 'Account created! Redirecting to login...';
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err : any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || err?.error || 'Registration failed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  goToLogin() { this.router.navigate(['/login']); }
}
