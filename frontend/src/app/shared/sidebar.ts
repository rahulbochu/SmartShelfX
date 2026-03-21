import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  styles: [`
    .sidebar {
      width: 240px;
      min-height: 100vh;
      background: #0d1b2e;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #1e3a5f;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 100;
      font-family: 'Segoe UI', sans-serif;
    }

    /* LOGO ROW */
    .sidebar-logo {
      padding: 20px 16px 16px;
      border-bottom: 1px solid #1e3a5f;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
    }
    .logo-text h1 {
      font-size: 16px;
      font-weight: 700;
      color: #4f8ef7;
      margin: 0 0 2px;
    }
    .logo-text span {
      font-size: 10px;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* BELL BUTTON */
    .notif-btn {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      color: #64748b;
      display: flex;
      align-items: center;
      transition: all .2s;
      flex-shrink: 0;
    }
    .notif-btn:hover { background: #1e3a5f; color: #e2e8f0; }
    .notif-btn.active { background: #1e3a5f; color: #4f8ef7; }
    .notif-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .notif-badge {
      position: absolute;
      top: 2px; right: 2px;
      background: #ef4444;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      border-radius: 10px;
      min-width: 15px;
      height: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
    }

    /* DROPDOWN */
    .notif-dropdown {
      position: fixed;
      top: 62px;
      left: 16px;
      width: 320px;
      background: #112240;
      border: 1px solid #1e3a5f;
      border-radius: 12px;
      box-shadow: 0 16px 48px rgba(0,0,0,.6);
      z-index: 300;
      overflow: hidden;
    }
    .notif-dropdown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid #1e3a5f;
    }
    .notif-dropdown-header h4 {
      font-size: 13px;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0;
    }
    .mark-all-btn {
      background: none;
      border: none;
      color: #4f8ef7;
      font-size: 12px;
      cursor: pointer;
      padding: 0;
    }
    .mark-all-btn:hover { text-decoration: underline; }
    .notif-list {
      max-height: 340px;
      overflow-y: auto;
    }
    .notif-list::-webkit-scrollbar { width: 4px; }
    .notif-list::-webkit-scrollbar-track { background: transparent; }
    .notif-list::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid #0f2133;
      cursor: pointer;
      transition: background .15s;
    }
    .notif-item:last-child { border-bottom: none; }
    .notif-item:hover { background: #162d4a; }
    .notif-item.unread { background: #0f2133; }
    .notif-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .notif-icon mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .notif-content { flex: 1; min-width: 0; }
    .notif-title {
      font-size: 13px;
      font-weight: 500;
      color: #e2e8f0;
      margin-bottom: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notif-item.unread .notif-title { color: #fff; font-weight: 600; }
    .notif-msg {
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .notif-time { font-size: 11px; color: #334155; margin-top: 4px; }
    .unread-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4f8ef7;
      flex-shrink: 0;
      margin-top: 5px;
    }
    .notif-empty {
      text-align: center;
      padding: 32px 16px;
      color: #334155;
      font-size: 13px;
    }
    .notif-empty mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      display: block;
      margin: 0 auto 8px;
      opacity: .4;
    }
    .notif-loading {
      text-align: center;
      padding: 24px;
      color: #334155;
      font-size: 13px;
    }

    /* NAV */
    .sidebar-nav {
      flex: 1;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }
    .nav-section-label {
      font-size: 10px;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 10px 8px 4px;
      font-weight: 600;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 8px;
      color: #64748b;
      font-size: 13px;
      cursor: pointer;
      transition: all .2s;
      text-decoration: none;
    }
    .nav-item:hover { background: #1e3a5f; color: #e2e8f0; }
    .nav-item.active { background: #1d4ed8; color: #fff; }
    .nav-item mat-icon { font-size: 17px; width: 17px; height: 17px; flex-shrink: 0; }

    /* FOOTER */
    .sidebar-footer {
      padding: 10px;
      border-top: 1px solid #1e3a5f;
    }
    .user-info {
      padding: 10px 8px;
      margin-bottom: 4px;
    }
    .user-info .user-email {
      font-size: 12px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .role-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .role-badge.admin { background: #7c3aed20; color: #a78bfa; }
    .role-badge.user { background: #0369a120; color: #38bdf8; }
    .role-badge.vendor { background: #c2410c20; color: #fb923c; }
  `],
  template: `
    <aside class="sidebar">

      <!-- LOGO + BELL -->
      <div class="sidebar-logo">
        <div class="logo-text">
          <h1>SmartShelfX</h1>
          <span>Inventory System</span>
        </div>
        <button class="notif-btn" [class.active]="showDropdown" (click)="toggleDropdown($event)" title="Notifications">
          <mat-icon>{{ showDropdown ? 'notifications_active' : 'notifications' }}</mat-icon>
          <span class="notif-badge" *ngIf="unreadCount > 0">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </button>
      </div>

      <!-- NOTIFICATION DROPDOWN -->
      <div class="notif-dropdown" *ngIf="showDropdown" (click)="$event.stopPropagation()">
        <div class="notif-dropdown-header">
          <h4>Notifications <span style="color:#475569;font-weight:400">({{ unreadCount }} unread)</span></h4>
          <button class="mark-all-btn" *ngIf="unreadCount > 0" (click)="markAllRead()">Mark all read</button>
        </div>

        <div class="notif-loading" *ngIf="loadingNotifs">Loading...</div>

        <div class="notif-list" *ngIf="!loadingNotifs">
          <div class="notif-item" [class.unread]="!n.read"
            *ngFor="let n of notifications"
            (click)="markRead(n)">
            <div class="notif-icon" [style.background]="getIconBg(n.type)">
              <mat-icon [style.color]="getIconColor(n.type)">{{ getIcon(n.type) }}</mat-icon>
            </div>
            <div class="notif-content">
              <div class="notif-title">{{ n.title || n.type || 'Notification' }}</div>
              <div class="notif-msg">{{ n.message }}</div>
              <div class="notif-time">{{ n.createdAt | date:'MMM d, h:mm a' }}</div>
            </div>
            <div class="unread-dot" *ngIf="!n.read"></div>
          </div>

          <div class="notif-empty" *ngIf="notifications.length === 0">
            <mat-icon>notifications_none</mat-icon>
            No notifications yet.
          </div>
        </div>
      </div>

      <!-- NAV ITEMS -->
      <nav class="sidebar-nav">
        <div class="nav-section-label">Main</div>
        <a class="nav-item" [class.active]="isActive('/dashboard')" (click)="navigate('/dashboard')">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>

        <ng-container *ngIf="userRole === 'ADMIN' || userRole === 'USER'">
          <div class="nav-section-label">Inventory</div>
          <a class="nav-item" [class.active]="isActive('/products')" (click)="navigate('/products')">
            <mat-icon>inventory_2</mat-icon> Products
          </a>
          <a class="nav-item" [class.active]="isActive('/stock')" (click)="navigate('/stock')">
            <mat-icon>swap_horiz</mat-icon> Stock Transactions
          </a>
          <a class="nav-item" [class.active]="isActive('/forecast')" (click)="navigate('/forecast')">
            <mat-icon>trending_up</mat-icon> Demand Forecast
          </a>
        </ng-container>

        <div class="nav-section-label">Procurement</div>
        <a class="nav-item" [class.active]="isActive('/suppliers')" (click)="navigate('/suppliers')">
          <mat-icon>local_shipping</mat-icon> Suppliers
        </a>
        <a class="nav-item" [class.active]="isActive('/orders')" (click)="navigate('/orders')">
          <mat-icon>shopping_cart</mat-icon> Orders
        </a>

        <ng-container *ngIf="userRole === 'ADMIN'">
          <div class="nav-section-label">Administration</div>
          <a class="nav-item" [class.active]="isActive('/users')" (click)="navigate('/users')">
            <mat-icon>manage_accounts</mat-icon> Users
          </a>
          <a class="nav-item" [class.active]="isActive('/reports')" (click)="navigate('/reports')">
            <mat-icon>bar_chart</mat-icon> Reports
          </a>
        </ng-container>
      </nav>

      <!-- FOOTER -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-email">{{ userName }}</div>
          <span class="role-badge"
            [class.admin]="userRole==='ADMIN'"
            [class.user]="userRole==='USER'"
            [class.vendor]="userRole==='Vendor'">
            {{ userRole }}
          </span>
        </div>
        <a class="nav-item" (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </a>
      </div>

    </aside>
  `
})
export class SidebarComponent implements OnInit {
  currentRoute = '';
  userRole = '';
  userName = '';
  unreadCount = 0;
  showDropdown = false;
  notifications: any[] = [];
  loadingNotifs = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.decodeToken();
    this.currentRoute = this.router.url;
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute = e.urlAfterRedirects;
      this.showDropdown = false; // close on navigation
    });
    this.loadUnreadCount();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click')
  onDocumentClick() {
    this.showDropdown = false;
  }

  decodeToken() {
    const token = this.authService.getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userRole = payload.role || payload.authorities?.[0]?.replace('ROLE_', '') || '';
      this.userName = payload.sub || payload.username || payload.email || '';
    } catch {}
  }

  loadUnreadCount() {
    this.notificationService.getAllNotifications().subscribe({
      next: (data: any[]) => {
        this.unreadCount = data.filter(n => !n.read).length;
        this.notifications = data.slice(0, 10); // keep latest 10
      },
      error: () => { this.unreadCount = 0; }
    });
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) this.loadNotifications();
  }

  loadNotifications() {
    this.loadingNotifs = true;
    this.notificationService.getAllNotifications().subscribe({
      next: (data: any[]) => {
        this.notifications = data.slice(0, 10);
        this.unreadCount = data.filter(n => !n.read).length;
        this.loadingNotifs = false;
      },
      error: () => { this.loadingNotifs = false; }
    });
  }

  markRead(n: any) {
    if (n.read) return;
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => {
        n.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      }
    });
  }

  getIcon(type: string): string {
    return ({ LOW_STOCK: 'warning', ORDER: 'shopping_cart', SYSTEM: 'info', ALERT: 'error' } as any)[type] || 'notifications';
  }
  getIconColor(type: string): string {
    return ({ LOW_STOCK: '#f97316', ORDER: '#4f8ef7', SYSTEM: '#22c55e', ALERT: '#ef4444' } as any)[type] || '#94a3b8';
  }
  getIconBg(type: string): string {
    return ({ LOW_STOCK: '#f9731615', ORDER: '#4f8ef715', SYSTEM: '#22c55e15', ALERT: '#ef444415' } as any)[type] || '#33415515';
  }

  isActive(path: string): boolean {
    return this.currentRoute === path || this.currentRoute.startsWith(path);
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
