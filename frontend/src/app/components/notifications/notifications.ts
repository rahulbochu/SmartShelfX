import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../services/notification';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  styles: [`
    .app-layout { display:flex; min-height:100vh; background:#0f172a; color:#e2e8f0; font-family:'Segoe UI',sans-serif; }
    .sidebar { width:240px; min-height:100vh; background:#1e293b; display:flex; flex-direction:column; border-right:1px solid #334155; position:fixed; top:0; left:0; bottom:0; z-index:100; }
    .sidebar-logo { padding:24px 20px 20px; border-bottom:1px solid #334155; }
    .sidebar-logo h1 { font-size:18px; font-weight:700; color:#4f8ef7; margin:0 0 4px; }
    .sidebar-logo span { font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:.5px; }
    .sidebar-nav { flex:1; padding:16px 12px; display:flex; flex-direction:column; gap:4px; }
    .nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; color:#94a3b8; font-size:14px; cursor:pointer; transition:all .2s; text-decoration:none; }
    .nav-item:hover { background:#334155; color:#e2e8f0; }
    .nav-item.active { background:#1d4ed8; color:#fff; }
    .nav-item mat-icon { font-size:18px; width:18px; height:18px; }
    .sidebar-footer { padding:12px; border-top:1px solid #334155; }
    .main-content { margin-left:240px; flex:1; padding:32px; min-height:100vh; }
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; }
    .page-header h2 { font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
    .page-header p { font-size:14px; color:#64748b; margin:0; }
    .header-actions { display:flex; align-items:center; gap:10px; }
    .filter-tabs { display:flex; gap:6px; margin-bottom:20px; }
    .filter-tab { background:#1e293b; border:1px solid #334155; border-radius:20px; padding:5px 16px; font-size:12px; color:#94a3b8; cursor:pointer; transition:all .2s; font-weight:500; }
    .filter-tab:hover { background:#334155; color:#e2e8f0; }
    .filter-tab.active { background:#1d4ed8; border-color:#1d4ed8; color:#fff; }
    .notif-list { display:flex; flex-direction:column; gap:10px; }
    .notif-card { background:#1e293b; border:1px solid #334155; border-radius:12px; padding:16px 20px; display:flex; align-items:flex-start; gap:14px; transition:all .2s; }
    .notif-card:hover { border-color:#475569; }
    .notif-card.unread { border-left:3px solid #4f8ef7; background:#1e2d45; }
    .notif-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .notif-body { flex:1; }
    .notif-title { font-size:14px; font-weight:600; color:#f1f5f9; margin-bottom:4px; }
    .notif-card.unread .notif-title { color:#fff; }
    .notif-msg { font-size:13px; color:#94a3b8; margin-bottom:6px; line-height:1.5; }
    .notif-time { font-size:11px; color:#475569; }
    .notif-actions { display:flex; gap:6px; align-items:center; flex-shrink:0; }
    .btn-icon { background:none; border:none; cursor:pointer; padding:6px; border-radius:6px; display:flex; align-items:center; color:#64748b; transition:all .2s; }
    .btn-icon:hover { background:#334155; color:#e2e8f0; }
    .btn-icon.delete:hover { background:#ef444420; color:#ef4444; }
    .btn-read { background:#1d4ed820; border:1px solid #1d4ed850; color:#4f8ef7; border-radius:6px; padding:5px 10px; font-size:12px; cursor:pointer; transition:all .2s; white-space:nowrap; }
    .btn-read:hover { background:#1d4ed840; }
    .btn-primary { display:flex; align-items:center; gap:6px; background:#1d4ed8; color:#fff; border:none; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-primary:hover { background:#2563eb; }
    .unread-badge { background:#ef4444; color:#fff; border-radius:12px; padding:2px 8px; font-size:11px; font-weight:700; }
    .alert-success { background:#052e16; border:1px solid #166534; color:#4ade80; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .alert-error { background:#450a0a; border:1px solid #991b1b; color:#fca5a5; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .empty-state { text-align:center; padding:60px 20px; color:#475569; }
    .empty-state mat-icon { font-size:48px; width:48px; height:48px; margin-bottom:12px; opacity:.4; }
    .empty-state p { font-size:15px; margin:0; }
    .loading-state { text-align:center; padding:60px 20px; color:#475569; display:flex; flex-direction:column; align-items:center; gap:12px; }
    .spinner { width:32px; height:32px; border:3px solid #334155; border-top-color:#4f8ef7; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `],
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <h1>SmartShelfX</h1>
          <span>Inventory System</span>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item" (click)="navigate('/dashboard')"><mat-icon>dashboard</mat-icon> Dashboard</a>
          <a class="nav-item" (click)="navigate('/products')"><mat-icon>inventory_2</mat-icon> Products</a>
          <a class="nav-item" (click)="navigate('/stock')"><mat-icon>swap_horiz</mat-icon> Stock Transactions</a>
          <a class="nav-item" (click)="navigate('/forecast')"><mat-icon>trending_up</mat-icon> Demand Forecast</a>
          <a class="nav-item" (click)="navigate('/suppliers')"><mat-icon>local_shipping</mat-icon> Suppliers</a>
          <a class="nav-item" (click)="navigate('/orders')"><mat-icon>shopping_cart</mat-icon> Orders</a>
          <a class="nav-item active" (click)="navigate('/notifications')"><mat-icon>notifications</mat-icon> Notifications</a>
          <a class="nav-item" (click)="navigate('/users')"><mat-icon>manage_accounts</mat-icon> Users</a>
          <a class="nav-item" (click)="navigate('/reports')"><mat-icon>bar_chart</mat-icon> Reports</a>
        </nav>
        <div class="sidebar-footer">
          <a class="nav-item" (click)="logout()"><mat-icon>logout</mat-icon> Logout</a>
        </div>
      </aside>

      <main class="main-content">
        <div class="page-header">
          <div>
            <h2>Notifications &amp; Alerts
              <span class="unread-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
            </h2>
            <p>System alerts, low stock warnings and order updates</p>
          </div>
          <div class="header-actions">
            <button class="btn-primary" (click)="markAllRead()" *ngIf="unreadCount > 0">
              <mat-icon>done_all</mat-icon> Mark all read
            </button>
          </div>
        </div>

        <div class="alert-success" *ngIf="successMsg">{{ successMsg }}</div>
        <div class="alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

        <div class="filter-tabs">
          <button class="filter-tab" [class.active]="filterType==='ALL'" (click)="filterType='ALL'; applyFilter()">All ({{ notifications.length }})</button>
          <button class="filter-tab" [class.active]="filterType==='UNREAD'" (click)="filterType='UNREAD'; applyFilter()">Unread ({{ unreadCount }})</button>
          <button class="filter-tab" [class.active]="filterType==='READ'" (click)="filterType='READ'; applyFilter()">Read</button>
        </div>

        <div class="notif-list" *ngIf="!loading && filtered.length > 0">
          <div class="notif-card" [class.unread]="!n.read" *ngFor="let n of filtered">
            <div class="notif-icon" [style.background]="getIconBg(n.type)">
              <mat-icon [style.color]="getIconColor(n.type)">{{ getIcon(n.type) }}</mat-icon>
            </div>
            <div class="notif-body">
              <div class="notif-title">{{ n.title || n.type }}</div>
              <div class="notif-msg">{{ n.message }}</div>
              <div class="notif-time">{{ n.createdAt | date:'MMM d, y h:mm a' }}</div>
            </div>
            <div class="notif-actions">
              <button class="btn-read" *ngIf="!n.read" (click)="markRead(n.id)">Mark read</button>
              <button class="btn-icon delete" (click)="deleteNotification(n.id)"><mat-icon>close</mat-icon></button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!loading && filtered.length === 0">
          <mat-icon>notifications_none</mat-icon>
          <p>No notifications here.</p>
        </div>
        <div class="loading-state" *ngIf="loading"><div class="spinner"></div><p>Loading...</p></div>
      </main>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  filtered: any[] = [];
  filterType: 'ALL' | 'UNREAD' | 'READ' = 'ALL';
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadNotifications(); }

  loadNotifications() {
    this.loading = true;
    this.notificationService.getAllNotifications().subscribe({
      next: (data) => { this.notifications = data; this.applyFilter(); this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load notifications.'; this.cdr.detectChanges(); }
    });
  }

  applyFilter() {
    if (this.filterType === 'UNREAD') this.filtered = this.notifications.filter(n => !n.read);
    else if (this.filterType === 'READ') this.filtered = this.notifications.filter(n => n.read);
    else this.filtered = [...this.notifications];
  }

  markRead(id: number) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => this.loadNotifications(),
      error: () => { this.errorMsg = 'Failed to mark as read.'; this.cdr.detectChanges(); }
    });
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => { this.successMsg = 'All notifications marked as read.'; this.loadNotifications(); setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000); },
      error: () => { this.errorMsg = 'Operation failed.'; this.cdr.detectChanges(); }
    });
  }

  deleteNotification(id: number) {
    this.notificationService.deleteNotification(id).subscribe({
      next: () => this.loadNotifications(),
      error: () => { this.errorMsg = 'Delete failed.'; this.cdr.detectChanges(); }
    });
  }

  get unreadCount() { return this.notifications.filter(n => !n.read).length; }

  getIcon(type: string): string {
    const m: any = { LOW_STOCK: 'warning', ORDER: 'shopping_cart', SYSTEM: 'info', ALERT: 'error' };
    return m[type] || 'notifications';
  }

  getIconColor(type: string): string {
    const m: any = { LOW_STOCK: '#f97316', ORDER: '#4f8ef7', SYSTEM: '#22c55e', ALERT: '#ef4444' };
    return m[type] || '#94a3b8';
  }

  getIconBg(type: string): string {
    const m: any = { LOW_STOCK: '#f9731620', ORDER: '#4f8ef720', SYSTEM: '#22c55e20', ALERT: '#ef444420' };
    return m[type] || '#33415520';
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
