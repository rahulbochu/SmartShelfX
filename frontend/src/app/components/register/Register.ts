import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-bg">
      <div class="auth-card">
        <h1>SmartShelfX</h1>
        <p>Create a new account to get started</p>

        <div class="form-grid">
          <div class="form-field">
            <label>Full Name</label>
            <input [(ngModel)]="name" placeholder="John Smith">
          </div>
          <div class="form-field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" placeholder="john@example.com">
          </div>
          <div class="form-field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" placeholder="••••••••">
          </div>
          <div class="form-field">
            <label>Role</label>
            <select [(ngModel)]="role">
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary" style="width:100%;justify-content:center" (click)="register()">
          Create Account
        </button>

        <div *ngIf="error" style="margin-top:12px;color:#ef4444;font-size:13px;text-align:center">{{ error }}</div>

        <div class="auth-link">
          Already have an account? <a (click)="goToLogin()">Sign in here</a>
        </div>
      </div>
    </div>
    <div *ngIf="toast" class="snack">{{ toast }}</div>
  `
})
export class RegisterComponent {
  name = ''; email = ''; password = ''; role = 'USER'; error = ''; toast = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.error = '';
    this.authService.register(this.name, this.email, this.password, this.role).subscribe({
      next: () => { this.toast = 'Account created! Redirecting...'; setTimeout(() => this.router.navigate(['/login']), 1500); },
      error: () => { this.error = 'Registration failed. Email may already exist.'; }
    });
  }

  goToLogin() { this.router.navigate(['/login']); }
}
