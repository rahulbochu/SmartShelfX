import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, SidebarComponent],
  styles: [`
    .app-layout { display:flex; min-height:100vh; background:#0f172a; color:#e2e8f0; font-family:'Segoe UI',sans-serif; }
    .main-content { margin-left:240px; flex:1; padding:32px; min-height:100vh; }
    .page-header { margin-bottom:28px; }
    .page-header h2 { font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
    .page-header p { font-size:14px; color:#64748b; margin:0; }
    .stat-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:16px; margin-bottom:28px; }
    .stat-card { background:#1e293b; border:1px solid #334155; border-radius:12px; padding:20px; }
    .stat-card .label { font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
    .stat-card .value { font-size:28px; font-weight:700; }
    .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .search-box { display:flex; align-items:center; gap:8px; background:#1e293b; border:1px solid #334155; border-radius:8px; padding:8px 14px; flex:1; max-width:400px; }
    .search-box mat-icon { color:#64748b; font-size:18px; }
    .search-box input { background:none; border:none; outline:none; color:#e2e8f0; font-size:14px; width:100%; }
    .search-box input::placeholder { color:#475569; }
    .data-table-wrap { background:#1e293b; border:1px solid #334155; border-radius:12px; overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:#162032; }
    th { padding:12px 16px; text-align:left; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.5px; border-bottom:1px solid #334155; }
    td { padding:13px 16px; font-size:14px; color:#cbd5e1; border-bottom:1px solid #1e293b; }
    tbody tr:last-child td { border-bottom:none; }
    tbody tr:hover { background:#253347; }
    .avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; flex-shrink:0; }
    .user-cell { display:flex; align-items:center; gap:10px; }
    .user-info .name { font-weight:600; color:#f1f5f9; font-size:14px; }
    .user-info .email { font-size:12px; color:#64748b; }
    .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; text-transform:uppercase; }
    .badge-admin { background:#7c3aed20; color:#a78bfa; border:1px solid #7c3aed40; }
    .badge-user { background:#0369a120; color:#38bdf8; border:1px solid #0369a140; }
    .badge-vendor { background:#c2410c20; color:#fb923c; border:1px solid #c2410c40; }
    .role-select { background:#0f172a; border:1px solid #334155; border-radius:6px; padding:5px 8px; color:#e2e8f0; font-size:13px; outline:none; cursor:pointer; }
    .btn-icon { background:none; border:none; cursor:pointer; padding:6px; border-radius:6px; display:flex; align-items:center; color:#64748b; transition:all .2s; }
    .btn-icon.delete:hover { background:#ef444420; color:#ef4444; }
    .alert-success { background:#052e16; border:1px solid #166534; color:#4ade80; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .alert-error { background:#450a0a; border:1px solid #991b1b; color:#fca5a5; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .empty-state { text-align:center; padding:60px 20px; color:#475569; }
    .empty-state mat-icon { font-size:48px; width:48px; height:48px; margin-bottom:12px; opacity:.4; }
    .loading-state { text-align:center; padding:60px 20px; color:#475569; display:flex; flex-direction:column; align-items:center; gap:12px; }
    .spinner { width:32px; height:32px; border:3px solid #334155; border-top-color:#4f8ef7; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <div class="page-header">
          <h2>User &amp; Role Management</h2>
          <p>Manage system users and assign roles</p>
        </div>

        <div class="alert-success" *ngIf="successMsg">{{ successMsg }}</div>
        <div class="alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

        <div class="stat-cards">
          <div class="stat-card"><div class="label">Total Users</div><div class="value" style="color:#4f8ef7">{{ users.length }}</div></div>
          <div class="stat-card"><div class="label">Admins</div><div class="value" style="color:#a78bfa">{{ countByRole('ADMIN') }}</div></div>
          <div class="stat-card"><div class="label">Users</div><div class="value" style="color:#38bdf8">{{ countByRole('USER') }}</div></div>
          <div class="stat-card"><div class="label">Vendors</div><div class="value" style="color:#fb923c">{{ countByRole('Vendor') }}</div></div>
        </div>

        <div class="toolbar">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search users..." [(ngModel)]="searchTerm" (input)="search()" />
          </div>
        </div>

        <div class="data-table-wrap" *ngIf="!loading && filtered.length > 0">
          <table>
            <thead><tr><th>User</th><th>Role</th><th>Change Role</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of filtered">
                <td>
                  <div class="user-cell">
                    <div class="avatar" [style.background]="getAvatarColor(u)">{{ getInitials(u) }}</div>
                    <div class="user-info">
                      <div class="name">{{ u.username || u.name || u.email }}</div>
                      <div class="email">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge"
                    [class.badge-admin]="u.role==='ADMIN'"
                    [class.badge-user]="u.role==='USER'"
                    [class.badge-vendor]="u.role==='Vendor'">
                    {{ u.role }}
                  </span>
                </td>
                <td>
                  <select class="role-select" [(ngModel)]="u.role" (change)="changeRole(u.id, u.role)">
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </td>
                <td>
                  <button class="btn-icon delete" (click)="delete(u.id)" title="Delete user">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" *ngIf="!loading && filtered.length === 0">
          <mat-icon>manage_accounts</mat-icon><p>No users found.</p>
        </div>
        <div class="loading-state" *ngIf="loading">
          <div class="spinner"></div><p>Loading...</p>
        </div>
      </main>
    </div>
  `
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  filtered: any[] = [];
  searchTerm = '';
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filtered = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Failed to load users.';
        this.cdr.detectChanges();
      }
    });
  }

  search() {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.users.filter(u =>
      u.username?.toLowerCase().includes(t) ||
      u.name?.toLowerCase().includes(t) ||
      u.email?.toLowerCase().includes(t) ||
      u.role?.toLowerCase().includes(t)
    );
  }

  changeRole(id: number, role: string) {
    this.userService.updateUserRole(id, role).subscribe({
      next: () => {
        this.successMsg = 'Role updated successfully!';
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => {
        this.errorMsg = 'Failed to update role.';
        this.loadUsers();
        this.cdr.detectChanges();
      }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.successMsg = 'User deleted.';
        this.loadUsers();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => {
        this.errorMsg = 'Delete failed.';
        this.cdr.detectChanges();
      }
    });
  }

  countByRole(role: string) {
    return this.users.filter(u => u.role === role).length;
  }

  getInitials(u: any): string {
    const n = u.username || u.name || u.email || '?';
    return n.split(/[@.\s]/)
      .filter(Boolean)
      .map((p: string) => p[0].toUpperCase())
      .join('')
      .slice(0, 2);
  }

  getAvatarColor(u: any): string {
    const n = u.username || u.name || u.email || 'U';
    const colors = ['#1d4ed8', '#7c3aed', '#0369a1', '#c2410c', '#166534', '#9d174d'];
    return colors[(n.charCodeAt(0) || 0) % colors.length];
  }
}
