import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReportService } from '../../services/report';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, SidebarComponent],
  styles: [`
    .app-layout { display:flex; min-height:100vh; background:#0f172a; color:#e2e8f0; font-family:'Segoe UI',sans-serif; }
    .main-content { margin-left:240px; flex:1; padding:32px; min-height:100vh; }
    .page-header { margin-bottom:28px; }
    .page-header h2 { font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
    .page-header p { font-size:14px; color:#64748b; margin:0; }
    .stat-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:16px; margin-bottom:28px; }
    .stat-card { background:#1e293b; border:1px solid #334155; border-radius:12px; padding:20px; }
    .stat-card .label { font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
    .stat-card .value { font-size:28px; font-weight:700; }
    .reports-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    @media(max-width:900px) { .reports-grid { grid-template-columns:1fr; } }
    .report-card { background:#1e293b; border:1px solid #334155; border-radius:12px; padding:24px; }
    .report-card h3 { font-size:15px; font-weight:600; color:#f1f5f9; margin:0 0 20px; display:flex; align-items:center; gap:8px; }
    .report-card h3 mat-icon { font-size:18px; width:18px; height:18px; color:#4f8ef7; }
    .bar-chart { display:flex; flex-direction:column; gap:10px; }
    .bar-row { display:flex; align-items:center; gap:10px; }
    .bar-label { font-size:12px; color:#94a3b8; width:120px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex-shrink:0; }
    .bar-track { flex:1; background:#0f172a; border-radius:4px; height:12px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:4px; transition:width .6s ease; }
    .bar-val { font-size:12px; color:#64748b; width:40px; text-align:right; flex-shrink:0; }
    .low-stock-list { display:flex; flex-direction:column; gap:8px; }
    .low-stock-item { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#0f172a; border-radius:8px; border:1px solid #334155; }
    .low-stock-item .name { font-size:13px; color:#e2e8f0; font-weight:500; }
    .low-stock-item .stock { font-size:13px; font-weight:700; color:#ef4444; }
    .low-stock-item .reorder { font-size:12px; color:#64748b; }
    .order-stats { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .order-stat-item { background:#0f172a; border-radius:8px; padding:14px; text-align:center; }
    .order-stat-item .os-label { font-size:11px; color:#64748b; text-transform:uppercase; margin-bottom:6px; }
    .order-stat-item .os-val { font-size:22px; font-weight:700; }
    .date-range { display:flex; align-items:center; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
    .date-range label { font-size:13px; color:#94a3b8; }
    .date-range input { background:#0f172a; border:1px solid #334155; border-radius:8px; padding:7px 10px; color:#e2e8f0; font-size:13px; outline:none; }
    .date-range input:focus { border-color:#4f8ef7; }
    .btn-sm { background:#1d4ed8; color:#fff; border:none; border-radius:8px; padding:7px 16px; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-sm:hover { background:#2563eb; }
    .alert-error { background:#450a0a; border:1px solid #991b1b; color:#fca5a5; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .loading-state { text-align:center; padding:60px 20px; color:#475569; display:flex; flex-direction:column; align-items:center; gap:12px; }
    .spinner { width:32px; height:32px; border:3px solid #334155; border-top-color:#4f8ef7; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .empty-msg { font-size:13px; color:#475569; text-align:center; padding:24px 0; }
  `],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <div class="page-header">
          <h2>Reports &amp; Analytics</h2>
          <p>Inventory insights and performance overview</p>
        </div>

        <div class="alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

        <div class="stat-cards" *ngIf="summary">
          <div class="stat-card"><div class="label">Total Products</div><div class="value" style="color:#4f8ef7">{{ summary.totalProducts || 0 }}</div></div>
          <div class="stat-card"><div class="label">Total Stock Value</div><div class="value" style="color:#22c55e">₹{{ (summary.totalStockValue || 0) | number:'1.0-0' }}</div></div>
          <div class="stat-card"><div class="label">Low Stock Items</div><div class="value" style="color:#ef4444">{{ summary.lowStockCount || 0 }}</div></div>
          <div class="stat-card"><div class="label">Out of Stock</div><div class="value" style="color:#f97316">{{ summary.outOfStockCount || 0 }}</div></div>
        </div>

        <div class="loading-state" *ngIf="loading"><div class="spinner"></div><p>Loading reports...</p></div>

        <div class="reports-grid" *ngIf="!loading">
          <div class="report-card">
            <h3><mat-icon>star</mat-icon> Top Products by Stock</h3>
            <div class="bar-chart" *ngIf="topProducts.length > 0">
              <div class="bar-row" *ngFor="let p of topProducts">
                <div class="bar-label" title="{{ p.name }}">{{ p.name }}</div>
                <div class="bar-track"><div class="bar-fill" [style.width]="getBarWidth(p.currentStock, maxStock) + '%'" style="background:#4f8ef7"></div></div>
                <div class="bar-val">{{ p.currentStock }}</div>
              </div>
            </div>
            <div class="empty-msg" *ngIf="topProducts.length === 0">No data available.</div>
          </div>

          <div class="report-card">
            <h3><mat-icon>shopping_cart</mat-icon> Order Statistics</h3>
            <div class="order-stats" *ngIf="orderStats">
              <div class="order-stat-item"><div class="os-label">Total</div><div class="os-val" style="color:#4f8ef7">{{ orderStats.total || 0 }}</div></div>
              <div class="order-stat-item"><div class="os-label">Pending</div><div class="os-val" style="color:#f59e0b">{{ orderStats.pending || 0 }}</div></div>
              <div class="order-stat-item"><div class="os-label">Approved</div><div class="os-val" style="color:#22c55e">{{ orderStats.approved || 0 }}</div></div>
              <div class="order-stat-item"><div class="os-label">Delivered</div><div class="os-val" style="color:#60a5fa">{{ orderStats.delivered || 0 }}</div></div>
            </div>
            <div class="empty-msg" *ngIf="!orderStats">No order data available.</div>
          </div>

          <div class="report-card">
            <h3><mat-icon>warning</mat-icon> Low Stock Report</h3>
            <div class="low-stock-list" *ngIf="lowStockItems.length > 0">
              <div class="low-stock-item" *ngFor="let item of lowStockItems">
                <span class="name">{{ item.name }}</span>
                <span class="reorder">Reorder: {{ item.reorderLevel }}</span>
                <span class="stock">{{ item.currentStock }} left</span>
              </div>
            </div>
            <div class="empty-msg" *ngIf="lowStockItems.length === 0">🎉 No low stock items!</div>
          </div>

          <div class="report-card">
            <h3><mat-icon>swap_vert</mat-icon> Stock Movement</h3>
            <div class="date-range">
              <label>From</label><input type="date" [(ngModel)]="fromDate" />
              <label>To</label><input type="date" [(ngModel)]="toDate" />
              <button class="btn-sm" (click)="loadStockMovement()">Apply</button>
            </div>
            <div class="bar-chart" *ngIf="stockMovement.length > 0">
              <div class="bar-row" *ngFor="let m of stockMovement">
                <div class="bar-label">{{ m.productName }}</div>
                <div class="bar-track"><div class="bar-fill" [style.width]="getBarWidth(m.quantity, maxMovement) + '%'" [style.background]="m.type === 'IN' ? '#22c55e' : '#ef4444'"></div></div>
                <div class="bar-val" [style.color]="m.type === 'IN' ? '#22c55e' : '#ef4444'">{{ m.quantity }}</div>
              </div>
            </div>
            <div class="empty-msg" *ngIf="stockMovement.length === 0">Select a date range and apply.</div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  summary: any = null; topProducts: any[] = []; lowStockItems: any[] = [];
  orderStats: any = null; stockMovement: any[] = [];
  loading = false; errorMsg = ''; fromDate = ''; toDate = '';

  constructor(private reportService: ReportService, private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
    const now = new Date();
    this.toDate = now.toISOString().split('T')[0];
    const past = new Date(now); past.setDate(past.getDate() - 30);
    this.fromDate = past.toISOString().split('T')[0];
  }

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading = true;
    this.reportService.getInventorySummary().subscribe({ next: d => { this.summary = d; this.cdr.detectChanges(); }, error: () => {} });
    this.reportService.getTopProducts().subscribe({ next: d => { this.topProducts = d.slice(0, 8); this.loading = false; this.cdr.detectChanges(); }, error: () => { this.loading = false; this.cdr.detectChanges(); } });
    this.reportService.getLowStockReport().subscribe({ next: d => { this.lowStockItems = d; this.cdr.detectChanges(); }, error: () => {} });
    this.reportService.getOrderStats().subscribe({ next: d => { this.orderStats = d; this.cdr.detectChanges(); }, error: () => {} });
  }

  loadStockMovement() {
    if (!this.fromDate || !this.toDate) return;
    this.reportService.getStockMovement(this.fromDate, this.toDate).subscribe({
      next: d => { this.stockMovement = d; this.cdr.detectChanges(); },
      error: () => { this.errorMsg = 'Failed to load stock movement.'; this.cdr.detectChanges(); }
    });
  }

  get maxStock() { return Math.max(...this.topProducts.map(p => p.currentStock || 0), 1); }
  get maxMovement() { return Math.max(...this.stockMovement.map(m => m.quantity || 0), 1); }
  getBarWidth(value: number, max: number): number { return max > 0 ? Math.round((value / max) * 100) : 0; }
}
