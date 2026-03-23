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
    .data-table-wrap { overflow:hidden; border-radius:8px; }
    table { width:100%; border-collapse:collapse; }
    th { padding:10px 12px; text-align:left; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; border-bottom:1px solid #334155; background:#162032; }
    td { padding:10px 12px; font-size:13px; color:#cbd5e1; border-bottom:1px solid #1e293b; }
    tbody tr:last-child td { border-bottom:none; }
    tbody tr:hover { background:#253347; }
    .badge { display:inline-block; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600; text-transform:uppercase; }
    .badge-expired { background:#ef444420; color:#ef4444; border:1px solid #ef444440; }
    .badge-expiring { background:#f9731620; color:#f97316; border:1px solid #f9731640; }
    .section-tabs { display:flex; gap:6px; margin-bottom:20px; }
    .section-tab { background:#0f172a; border:1px solid #334155; border-radius:20px; padding:5px 14px; font-size:12px; color:#94a3b8; cursor:pointer; font-weight:500; transition:all .2s; }
    .section-tab.active { background:#1d4ed8; border-color:#1d4ed8; color:#fff; }
    .export-btn { display:flex; align-items:center; gap:4px; background:#0f172a; border:1px solid #334155; color:#94a3b8; border-radius:8px; padding:6px 12px; font-size:12px; cursor:pointer; transition:all .2s; margin-left:auto; }
    .export-btn:hover { background:#334155; color:#e2e8f0; }
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
        <div class="loading-state" *ngIf="loading"><div class="spinner"></div><p>Loading reports...</p></div>

        <!-- SUMMARY STAT CARDS from /api/reports/dashboard -->
        <div class="stat-cards" *ngIf="summary && !loading">
          <div class="stat-card">
            <div class="label">Total Products</div>
            <div class="value" style="color:#4f8ef7">{{ summary.totalProducts || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Stock Value</div>
            <div class="value" style="color:#22c55e" style="font-size:20px">₹{{ (summary.totalStockValue || 0) | number:'1.0-0' }}</div>
          </div>
          <div class="stat-card">
            <div class="label">Low Stock Items</div>
            <div class="value" style="color:#ef4444">{{ summary.lowStockCount || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="label">Expiring Soon</div>
            <div class="value" style="color:#f97316">{{ summary.expiringSoonCount || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Categories</div>
            <div class="value" style="color:#a78bfa">{{ summary.totalCategories || 0 }}</div>
          </div>
        </div>

        <div class="reports-grid" *ngIf="!loading">

          <!-- STOCK MOVEMENT REPORT -->
          <div class="report-card">
            <h3>
              <mat-icon>swap_vert</mat-icon> Stock Movement
              <a class="export-btn" [href]="getExportUrl('stock-movement')" target="_blank">
                <mat-icon style="font-size:14px;width:14px;height:14px">download</mat-icon> Export
              </a>
            </h3>
            <div class="date-range">
              <label>From</label>
              <input type="date" [(ngModel)]="fromDate" />
              <label>To</label>
              <input type="date" [(ngModel)]="toDate" />
              <button class="btn-sm" (click)="loadStockMovement()">Apply</button>
            </div>
            <ng-container *ngIf="stockMovement">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                <div style="background:#0f172a;border-radius:8px;padding:12px;text-align:center">
                  <div style="font-size:11px;color:#64748b;margin-bottom:6px;text-transform:uppercase">Total IN</div>
                  <div style="font-size:22px;font-weight:700;color:#22c55e">{{ stockMovement.totalIn || 0 }}</div>
                </div>
                <div style="background:#0f172a;border-radius:8px;padding:12px;text-align:center">
                  <div style="font-size:11px;color:#64748b;margin-bottom:6px;text-transform:uppercase">Total OUT</div>
                  <div style="font-size:22px;font-weight:700;color:#ef4444">{{ stockMovement.totalOut || 0 }}</div>
                </div>
              </div>
              <div class="data-table-wrap" *ngIf="stockMovement.transactions?.length > 0">
                <table>
                  <thead><tr><th>Product</th><th>Type</th><th>Qty</th><th>Date</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let t of stockMovement.transactions?.slice(0,8)">
                      <td>{{ t.productName }}</td>
                      <td><span [style.color]="t.type==='IN' ? '#22c55e' : '#ef4444'" style="font-weight:600">{{ t.type }}</span></td>                      <td>{{ t.quantity }}</td>
                      <td style="color:#64748b;font-size:12px">{{ t.timestamp | date:'MMM d, h:mm a' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ng-container>
            <div class="empty-msg" *ngIf="!stockMovement">Select a date range and apply.</div>
          </div>

          <!-- SALES REPORT -->
          <div class="report-card">
            <h3>
              <mat-icon>trending_up</mat-icon> Sales Report
              <a class="export-btn" [href]="getExportUrl('sales')" target="_blank">
                <mat-icon style="font-size:14px;width:14px;height:14px">download</mat-icon> Export
              </a>
            </h3>
            <div class="date-range">
              <label>From</label>
              <input type="date" [(ngModel)]="salesFrom" />
              <label>To</label>
              <input type="date" [(ngModel)]="salesTo" />
              <button class="btn-sm" (click)="loadSales()">Apply</button>
            </div>
            <ng-container *ngIf="salesReport">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                <div style="background:#0f172a;border-radius:8px;padding:12px;text-align:center">
                  <div style="font-size:11px;color:#64748b;margin-bottom:6px;text-transform:uppercase">Total Sales</div>
                  <div style="font-size:20px;font-weight:700;color:#4f8ef7">{{ salesReport.totalTransactions || 0 }}</div>
                </div>
                <div style="background:#0f172a;border-radius:8px;padding:12px;text-align:center">
                  <div style="font-size:11px;color:#64748b;margin-bottom:6px;text-transform:uppercase">Total Value</div>
                  <div style="font-size:20px;font-weight:700;color:#22c55e">₹{{ (salesReport.totalValue || 0) | number:'1.0-0' }}</div>
                </div>
              </div>
              <div class="bar-chart" *ngIf="salesReport.topProducts?.length > 0">
                <div class="bar-row" *ngFor="let p of salesReport.topProducts?.slice(0,6)">
                  <div class="bar-label">{{ p.productName }}</div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width]="getSalesBarPct(p.totalQuantity) + '%'" style="background:#4f8ef7"></div>
                  </div>
                  <div class="bar-val">{{ p.totalQuantity }}</div>
                </div>
              </div>
            </ng-container>
            <div class="empty-msg" *ngIf="!salesReport">Select a date range and apply.</div>
          </div>

          <!-- EXPIRY REPORT -->
          <div class="report-card">
            <h3>
              <mat-icon>event_busy</mat-icon> Expiry Report
              <a class="export-btn" [href]="getExportUrl('expiry')" target="_blank">
                <mat-icon style="font-size:14px;width:14px;height:14px">download</mat-icon> Export
              </a>
            </h3>
            <ng-container *ngIf="expiryReport">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                <div style="background:#0f172a;border-radius:8px;padding:12px;text-align:center">
                  <div style="font-size:11px;color:#64748b;margin-bottom:6px;text-transform:uppercase">Expired</div>
                  <div style="font-size:22px;font-weight:700;color:#ef4444">{{ expiryReport.expiredCount || 0 }}</div>
                </div>
                <div style="background:#0f172a;border-radius:8px;padding:12px;text-align:center">
                  <div style="font-size:11px;color:#64748b;margin-bottom:6px;text-transform:uppercase">Expiring Soon</div>
                  <div style="font-size:22px;font-weight:700;color:#f97316">{{ expiryReport.expiringSoonCount || 0 }}</div>
                </div>
              </div>
              <div class="data-table-wrap" *ngIf="expiryReport.items?.length > 0">
                <table>
                  <thead><tr><th>Product</th><th>Expiry Date</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let item of expiryReport.items?.slice(0,8)">
                      <td>{{ item.productName }}</td>
                      <td style="color:#64748b">{{ item.expiryDate | date:'MMM d, y' }}</td>
                      <td>
                        <span class="badge" [class.badge-expired]="item.status==='EXPIRED'" [class.badge-expiring]="item.status==='EXPIRING_SOON'">
                          {{ item.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="empty-msg" *ngIf="!expiryReport.items?.length">No expiring products.</div>
            </ng-container>
            <div class="loading-state" *ngIf="!expiryReport" style="padding:20px">
              <div class="spinner"></div>
            </div>
          </div>

          <!-- TOP SELLING CHART -->
          <div class="report-card">
            <h3><mat-icon>bar_chart</mat-icon> Top Selling Products</h3>
            <div class="date-range" style="margin-bottom:16px">
              <label>Days</label>
              <select style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:7px 10px;color:#e2e8f0;font-size:13px;outline:none"
                [(ngModel)]="chartDays" (change)="loadCharts()">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <div class="bar-chart" *ngIf="topSellingChart?.labels?.length > 0">
              <div class="bar-row" *ngFor="let label of topSellingChart.labels; let i = index">
                <div class="bar-label">{{ label }}</div>
                <div class="bar-track">
                  <div class="bar-fill"
                    [style.width]="getChartBarPct(topSellingChart.datasets[0]?.data[i]) + '%'"
                    style="background:linear-gradient(90deg,#4f8ef7,#7c3aed)"></div>
                </div>
                <div class="bar-val">{{ topSellingChart.datasets[0]?.data[i] }}</div>
              </div>
            </div>
            <div class="empty-msg" *ngIf="!topSellingChart?.labels?.length">No sales data for this period.</div>
          </div>

        </div>
      </main>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  summary: any = null;
  stockMovement: any = null;
  salesReport: any = null;
  expiryReport: any = null;
  topSellingChart: any = null;
  loading = false;
  errorMsg = '';
  chartDays = 30;

  fromDate = '';
  toDate = '';
  salesFrom = '';
  salesTo = '';

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const now = new Date();
    this.toDate = now.toISOString().split('T')[0];
    this.salesTo = this.toDate;
    const past = new Date(now);
    past.setDate(past.getDate() - 30);
    this.fromDate = past.toISOString().split('T')[0];
    this.salesFrom = this.fromDate;
  }

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading = true;
    // Dashboard summary
    this.reportService.getDashboardSummary().subscribe({
      next: d => { this.summary = d; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
    // Expiry report (no date needed)
    this.reportService.getExpiryReport().subscribe({
      next: d => { this.expiryReport = d; this.cdr.detectChanges(); },
      error: () => { this.expiryReport = { expiredCount: 0, expiringSoonCount: 0, items: [] }; this.cdr.detectChanges(); }
    });
    // Charts
    this.loadCharts();
  }

  loadStockMovement() {
    if (!this.fromDate || !this.toDate) return;
    this.reportService.getStockMovement(this.fromDate, this.toDate).subscribe({
      next: d => { this.stockMovement = d; this.cdr.detectChanges(); },
      error: () => { this.errorMsg = 'Failed to load stock movement.'; this.cdr.detectChanges(); }
    });
  }

  loadSales() {
    if (!this.salesFrom || !this.salesTo) return;
    this.reportService.getSalesReport(this.salesFrom, this.salesTo).subscribe({
      next: d => { this.salesReport = d; this.cdr.detectChanges(); },
      error: () => { this.errorMsg = 'Failed to load sales report.'; this.cdr.detectChanges(); }
    });
  }

  loadCharts() {
    this.reportService.getTopSellingChart(this.chartDays).subscribe({
      next: d => { this.topSellingChart = d; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  getExportUrl(type: string): string {
    const from = `${this.fromDate}T00:00:00`;
    const to = `${this.toDate}T23:59:59`;
    const token = localStorage.getItem('token');
    if (type === 'stock-movement') return `http://localhost:8080/api/reports/stock-movement/export/excel?from=${from}&to=${to}&token=${token}`;
    if (type === 'sales') return `http://localhost:8080/api/reports/sales/export/excel?from=${from}&to=${to}&token=${token}`;
    if (type === 'expiry') return `http://localhost:8080/api/reports/expiry/export/excel?token=${token}`;
    return '#';
  }

  getSalesBarPct(val: number): number {
    const max = Math.max(...(this.salesReport?.topProducts?.map((p: any) => p.totalQuantity) || [1]));
    return max > 0 ? Math.round((val / max) * 100) : 0;
  }

  getChartBarPct(val: number): number {
    const max = Math.max(...(this.topSellingChart?.datasets?.[0]?.data || [1]));
    return max > 0 ? Math.round((val / max) * 100) : 0;
  }
}
