import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product';
import { ForecastService } from '../../services/forecast';
import { OrderService } from '../../services/order';
import { SupplierService } from '../../services/supplier';
import { StockService } from '../../services/stock';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, SidebarComponent],
  styles: [`
    .app-layout { display:flex; min-height:100vh; background:#0a1628; color:#e2e8f0; font-family:'Segoe UI',sans-serif; }
    .main-content { margin-left:240px; flex:1; padding:32px; min-height:100vh; }

    /* HEADER */
    .page-header { margin-bottom:24px; }
    .page-header h2 { font-size:22px; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
    .page-header p { font-size:13px; color:#475569; margin:0; }

    /* STAT CARDS */
    .stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:14px; margin-bottom:24px; }
    .stat-card { background:#112240; border:1px solid #1e3a5f; border-radius:10px; padding:18px 20px; }
    .stat-card .label { font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:.8px; margin-bottom:10px; font-weight:600; }
    .stat-card .value { font-size:30px; font-weight:700; margin-bottom:4px; line-height:1; }
    .stat-card .sub { font-size:12px; color:#475569; margin-top:6px; }
    .stat-card .sub a { cursor:pointer; text-decoration:none; }
    .stat-card .trend { font-size:11px; margin-top:4px; display:flex; align-items:center; gap:4px; }

    /* CHART CARDS */
    .charts-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
    .charts-row-3 { display:grid; grid-template-columns:2fr 1fr; gap:16px; margin-bottom:16px; }
    .chart-card { background:#112240; border:1px solid #1e3a5f; border-radius:10px; padding:20px; }
    .chart-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .chart-card-header h3 { font-size:13px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; margin:0; }
    .chart-card-header .period { font-size:12px; color:#475569; background:#0a1628; border:1px solid #1e3a5f; border-radius:6px; padding:4px 10px; cursor:pointer; }
    canvas { display:block; }

    /* LEGEND */
    .legend { display:flex; gap:16px; flex-wrap:wrap; margin-top:12px; }
    .legend-item { display:flex; align-items:center; gap:6px; font-size:12px; color:#94a3b8; }
    .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .legend-line { width:20px; height:3px; border-radius:2px; flex-shrink:0; }

    /* TABLE CARDS */
    .table-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
    .table-card { background:#112240; border:1px solid #1e3a5f; border-radius:10px; overflow:hidden; }
    .table-card-header { padding:14px 18px; border-bottom:1px solid #1e3a5f; display:flex; align-items:center; justify-content:space-between; }
    .table-card-header h3 { font-size:13px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; margin:0; }
    .table-card-header a { font-size:12px; color:#4f8ef7; cursor:pointer; text-decoration:none; }
    table { width:100%; border-collapse:collapse; }
    th { padding:10px 16px; text-align:left; font-size:11px; font-weight:600; color:#475569; text-transform:uppercase; letter-spacing:.5px; border-bottom:1px solid #1e3a5f; background:#0d1e38; }
    td { padding:11px 16px; font-size:13px; color:#cbd5e1; border-bottom:1px solid #0f2133; }
    tbody tr:last-child td { border-bottom:none; }
    tbody tr:hover { background:#162d4a; }

    /* BADGES */
    .badge { display:inline-block; padding:2px 9px; border-radius:12px; font-size:11px; font-weight:600; text-transform:uppercase; }
    .badge-low { background:#ef444420; color:#ef4444; border:1px solid #ef444430; }
    .badge-pending { background:#f59e0b20; color:#f59e0b; border:1px solid #f59e0b30; }
    .badge-approved { background:#22c55e20; color:#22c55e; border:1px solid #22c55e30; }
    .badge-delivered { background:#60a5fa20; color:#60a5fa; border:1px solid #60a5fa30; }
    .badge-cancelled { background:#94a3b820; color:#94a3b8; border:1px solid #94a3b830; }

    /* DONUT LABEL */
    .donut-wrap { display:flex; align-items:center; gap:24px; }
    .donut-legend { display:flex; flex-direction:column; gap:10px; }
    .donut-legend-item { display:flex; align-items:center; gap:8px; font-size:12px; color:#94a3b8; }
    .donut-legend-item span.dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .donut-legend-item .val { font-weight:700; color:#e2e8f0; margin-left:auto; padding-left:12px; }

    .empty-msg { text-align:center; padding:28px; color:#475569; font-size:13px; }

    /* VENDOR / USER SPECIFIC */
    .full-width { grid-column:1/-1; }
    @media(max-width:900px) { .charts-row,.charts-row-3,.table-row { grid-template-columns:1fr; } }
  `],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">

        <div class="page-header">
          <h2>{{ getTitle() }}</h2>
          <p>{{ getBannerSubtitle() }}</p>
        </div>

        <!-- ===== ADMIN DASHBOARD ===== -->
        <ng-container *ngIf="userRole === 'ADMIN'">

          <!-- STAT CARDS -->
          <div class="stat-grid">
            <div class="stat-card">
              <div class="label">Total Products</div>
              <div class="value" style="color:#4f8ef7">{{ totalProducts }}</div>
              <div class="sub"><a style="color:#4f8ef7" (click)="navigate('/stock')">View all →</a></div>
            </div>
            <div class="stat-card">
              <div class="label">Low Stock</div>
              <div class="value" style="color:#ef4444">{{ lowStockCount }}</div>
              <div class="sub"><a style="color:#ef4444" (click)="navigate('/stock')">View alerts →</a></div>
            </div>
            <div class="stat-card">
              <div class="label">High Risk</div>
              <div class="value" style="color:#f97316">{{ highRiskCount }}</div>
              <div class="sub"><a style="color:#f97316" (click)="navigate('/forecast')">View forecast →</a></div>
            </div>
            <div class="stat-card">
              <div class="label">Pending Orders</div>
              <div class="value" style="color:#f59e0b">{{ pendingOrders }}</div>
              <div class="sub"><a style="color:#f59e0b" (click)="navigate('/orders')">View orders →</a></div>
            </div>
            <div class="stat-card">
              <div class="label">Suppliers</div>
              <div class="value" style="color:#22c55e">{{ totalSuppliers }}</div>
              <div class="sub"><a style="color:#22c55e" (click)="navigate('/suppliers')">View all →</a></div>
            </div>
          </div>

          <!-- ROW 1: Stock Movement + PO Status -->
          <div class="charts-row">
            <div class="chart-card">
              <div class="chart-card-header">
                <h3>Stock Movement Trend</h3>
                <span class="period">Last 30 days</span>
              </div>
              <canvas #lineChart width="420" height="180"></canvas>
              <div class="legend" style="margin-top:12px">
                <div class="legend-item"><div class="legend-line" style="background:#22c55e"></div> Stock IN</div>
                <div class="legend-item"><div class="legend-line" style="background:#ef4444"></div> Stock OUT</div>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-card-header">
                <h3>PO Status Breakdown</h3>
              </div>
              <div class="donut-wrap">
                <canvas #donutChart width="160" height="160"></canvas>
                <div class="donut-legend">
                  <div class="donut-legend-item"><span class="dot" style="background:#f59e0b"></span> Pending <span class="val">{{ pendingOrders }}</span></div>
                  <div class="donut-legend-item"><span class="dot" style="background:#22c55e"></span> Approved <span class="val">{{ approvedOrders }}</span></div>
                  <div class="donut-legend-item"><span class="dot" style="background:#60a5fa"></span> Delivered <span class="val">{{ deliveredOrders }}</span></div>
                  <div class="donut-legend-item"><span class="dot" style="background:#ef4444"></span> Cancelled <span class="val">{{ cancelledOrders }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- ROW 2: Stock by Category + Top Restocked -->
          <div class="charts-row">
            <div class="chart-card">
              <div class="chart-card-header">
                <h3>Stock by Category</h3>
              </div>
              <div class="donut-wrap">
                <canvas #categoryChart width="160" height="160"></canvas>
                <div class="donut-legend">
                  <div class="donut-legend-item" *ngFor="let c of categoryData">
                    <span class="dot" [style.background]="c.color"></span> {{ c.label }}
                    <span class="val">{{ c.value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-card-header">
                <h3>Top Restocked Products</h3>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <ng-container *ngFor="let p of topRestocked">
                  <div style="display:flex;flex-direction:column;gap:4px">
                    <div style="display:flex;justify-content:space-between;font-size:12px">
                      <span style="color:#e2e8f0;font-weight:500">{{ p.name }}</span>
                      <span style="color:#4f8ef7;font-weight:700">{{ p.stock }} units</span>
                    </div>
                    <div style="height:5px;background:#1e3a5f;border-radius:3px;overflow:hidden">
                      <div style="height:100%;border-radius:3px;background:linear-gradient(90deg,#4f8ef7,#7c3aed)"
                        [style.width]="getBarPct(p.stock) + '%'"></div>
                    </div>
                  </div>
                </ng-container>
                <div class="empty-msg" *ngIf="topRestocked.length === 0">No product data yet.</div>
              </div>
            </div>
          </div>

          <!-- ROW 3: Low Stock Table + Recent Orders Table -->
          <div class="table-row">
            <div class="table-card">
              <div class="table-card-header">
                <h3>Low Stock Items</h3>
                <a (click)="navigate('/stock')">View all →</a>
              </div>
              <table *ngIf="lowStockProducts.length > 0">
                <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Status</th></tr></thead>
                <tbody>
                  <tr *ngFor="let p of lowStockProducts.slice(0,6)">
                    <td style="font-weight:600;color:#f1f5f9">{{ p.name }}</td>
                    <td style="color:#64748b">{{ p.category }}</td>
                    <td style="color:#ef4444;font-weight:700">{{ p.currentStock }}</td>
                    <td><span class="badge badge-low">LOW</span></td>
                  </tr>
                </tbody>
              </table>
              <div class="empty-msg" *ngIf="lowStockProducts.length === 0">All products sufficiently stocked.</div>
            </div>

            <div class="table-card">
              <div class="table-card-header">
                <h3>Recent Purchase Orders</h3>
                <a (click)="navigate('/orders')">View all →</a>
              </div>
              <table *ngIf="recentOrders.length > 0">
                <thead><tr><th>Supplier</th><th>Qty</th><th>Status</th></tr></thead>
                <tbody>
                  <tr *ngFor="let o of recentOrders.slice(0,6)">
                    <td style="font-weight:600;color:#f1f5f9">{{ o.supplierName || ('Supplier #' + o.supplierId) }}</td>
                    <td>{{ o.quantity }}</td>
                    <td>
                      <span class="badge"
                        [class.badge-pending]="o.status==='PENDING'"
                        [class.badge-approved]="o.status==='APPROVED'"
                        [class.badge-delivered]="o.status==='DELIVERED'"
                        [class.badge-cancelled]="o.status==='CANCELLED'">
                        {{ o.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="empty-msg" *ngIf="recentOrders.length === 0">No orders yet.</div>
            </div>
          </div>

        </ng-container>

        <!-- ===== USER DASHBOARD ===== -->
        <ng-container *ngIf="userRole === 'USER'">
          <div class="stat-grid">
            <div class="stat-card">
              <div class="label">Total Products</div>
              <div class="value" style="color:#4f8ef7">{{ totalProducts }}</div>
              <div class="sub"><a style="color:#4f8ef7" (click)="navigate('/stock')">View all →</a></div>
            </div>
            <div class="stat-card">
              <div class="label">Low Stock Alerts</div>
              <div class="value" style="color:#ef4444">{{ lowStockCount }}</div>
              <div class="sub"><a style="color:#ef4444" (click)="navigate('/stock')">View alerts →</a></div>
            </div>
            <div class="stat-card">
              <div class="label">High Risk Products</div>
              <div class="value" style="color:#f97316">{{ highRiskCount }}</div>
              <div class="sub"><a style="color:#f97316" (click)="navigate('/forecast')">View forecast →</a></div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-card">
              <div class="chart-card-header"><h3>Stock Movement Trend</h3><span class="period">Last 30 days</span></div>
              <canvas #lineChartUser width="420" height="180"></canvas>
              <div class="legend" style="margin-top:12px">
                <div class="legend-item"><div class="legend-line" style="background:#22c55e"></div> Stock IN</div>
                <div class="legend-item"><div class="legend-line" style="background:#ef4444"></div> Stock OUT</div>
              </div>
            </div>
            <div class="chart-card">
              <div class="chart-card-header"><h3>Stock by Category</h3></div>
              <div class="donut-wrap">
                <canvas #categoryChartUser width="160" height="160"></canvas>
                <div class="donut-legend">
                  <div class="donut-legend-item" *ngFor="let c of categoryData">
                    <span class="dot" [style.background]="c.color"></span> {{ c.label }}
                    <span class="val">{{ c.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="table-card">
            <div class="table-card-header">
              <h3>Low Stock Items</h3>
              <a (click)="navigate('/stock')">Record transaction →</a>
            </div>
            <table *ngIf="lowStockProducts.length > 0">
              <thead><tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Reorder Level</th><th>Status</th></tr></thead>
              <tbody>
                <tr *ngFor="let p of lowStockProducts">
                  <td style="font-weight:600;color:#f1f5f9">{{ p.name }}</td>
                  <td style="color:#64748b">{{ p.category }}</td>
                  <td style="color:#ef4444;font-weight:700">{{ p.currentStock }}</td>
                  <td>{{ p.reorderLevel }}</td>
                  <td><span class="badge badge-low">LOW</span></td>
                </tr>
              </tbody>
            </table>
            <div class="empty-msg" *ngIf="lowStockProducts.length === 0">All products sufficiently stocked.</div>
          </div>
        </ng-container>

        <!-- ===== VENDOR DASHBOARD ===== -->
        <ng-container *ngIf="userRole === 'Vendor'">
          <div class="stat-grid">
            <div class="stat-card">
              <div class="label">Total Orders</div>
              <div class="value" style="color:#4f8ef7">{{ recentOrders.length }}</div>
              <div class="sub"><a style="color:#4f8ef7" (click)="navigate('/orders')">View all →</a></div>
            </div>
            <div class="stat-card">
              <div class="label">Pending</div>
              <div class="value" style="color:#f59e0b">{{ pendingOrders }}</div>
              <div class="sub"><a style="color:#f59e0b" (click)="navigate('/orders')">Review →</a></div>
            </div>
            <div class="stat-card">
              <div class="label">Approved</div>
              <div class="value" style="color:#22c55e">{{ approvedOrders }}</div>
              <div class="sub">Ready for delivery</div>
            </div>
            <div class="stat-card">
              <div class="label">Delivered</div>
              <div class="value" style="color:#60a5fa">{{ deliveredOrders }}</div>
              <div class="sub">Completed</div>
            </div>
            <div class="stat-card">
              <div class="label">Suppliers</div>
              <div class="value" style="color:#a78bfa">{{ totalSuppliers }}</div>
              <div class="sub"><a style="color:#a78bfa" (click)="navigate('/suppliers')">View all →</a></div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-card">
              <div class="chart-card-header"><h3>PO Status Breakdown</h3></div>
              <div class="donut-wrap">
                <canvas #donutVendor width="160" height="160"></canvas>
                <div class="donut-legend">
                  <div class="donut-legend-item"><span class="dot" style="background:#f59e0b"></span> Pending <span class="val">{{ pendingOrders }}</span></div>
                  <div class="donut-legend-item"><span class="dot" style="background:#22c55e"></span> Approved <span class="val">{{ approvedOrders }}</span></div>
                  <div class="donut-legend-item"><span class="dot" style="background:#60a5fa"></span> Delivered <span class="val">{{ deliveredOrders }}</span></div>
                  <div class="donut-legend-item"><span class="dot" style="background:#ef4444"></span> Cancelled <span class="val">{{ cancelledOrders }}</span></div>
                </div>
              </div>
            </div>
            <div class="chart-card">
              <div class="chart-card-header"><h3>Order Activity</h3><span class="period">Last 30 days</span></div>
              <canvas #lineVendor width="300" height="160"></canvas>
            </div>
          </div>

          <div class="table-row">
            <div class="table-card">
              <div class="table-card-header">
                <h3>Recent Orders</h3>
                <a (click)="navigate('/orders')">View all →</a>
              </div>
              <table *ngIf="recentOrders.length > 0">
                <thead><tr><th>Supplier</th><th>Product</th><th>Qty</th><th>Status</th></tr></thead>
                <tbody>
                  <tr *ngFor="let o of recentOrders.slice(0,6)">
                    <td style="font-weight:600;color:#f1f5f9">{{ o.supplierName || ('Supplier #' + o.supplierId) }}</td>
                    <td style="color:#64748b">{{ o.productName || '—' }}</td>
                    <td>{{ o.quantity }}</td>
                    <td>
                      <span class="badge"
                        [class.badge-pending]="o.status==='PENDING'"
                        [class.badge-approved]="o.status==='APPROVED'"
                        [class.badge-delivered]="o.status==='DELIVERED'"
                        [class.badge-cancelled]="o.status==='CANCELLED'">
                        {{ o.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="empty-msg" *ngIf="recentOrders.length === 0">No orders yet.</div>
            </div>

            <div class="table-card">
              <div class="table-card-header">
                <h3>Suppliers</h3>
                <a (click)="navigate('/suppliers')">View all →</a>
              </div>
              <table *ngIf="supplierList.length > 0">
                <thead><tr><th>Name</th><th>Contact</th><th>Email</th></tr></thead>
                <tbody>
                  <tr *ngFor="let s of supplierList.slice(0,6)">
                    <td style="font-weight:600;color:#f1f5f9">{{ s.name }}</td>
                    <td style="color:#64748b">{{ s.contactPerson || '—' }}</td>
                    <td style="color:#475569;font-size:12px">{{ s.email }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="empty-msg" *ngIf="supplierList.length === 0">No suppliers yet.</div>
            </div>
          </div>
        </ng-container>

      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // Admin charts
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  // User charts
  @ViewChild('lineChartUser') lineChartUserRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChartUser') categoryChartUserRef!: ElementRef<HTMLCanvasElement>;
  // Vendor charts
  @ViewChild('donutVendor') donutVendorRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineVendor') lineVendorRef!: ElementRef<HTMLCanvasElement>;

  userRole = '';
  userName = '';
  totalProducts = 0;
  lowStockCount = 0;
  highRiskCount = 0;
  lowStockProducts: any[] = [];
  recentOrders: any[] = [];
  pendingOrders = 0;
  approvedOrders = 0;
  deliveredOrders = 0;
  cancelledOrders = 0;
  totalSuppliers = 0;
  supplierList: any[] = [];
  topRestocked: any[] = [];
  categoryData: { label: string; value: number; color: string }[] = [];
  transactions: any[] = [];
  chartsDrawn = false;

  private COLORS = ['#4f8ef7','#22c55e','#f59e0b','#ef4444','#a78bfa','#fb923c','#38bdf8','#f472b6'];

  constructor(
    private productService: ProductService,
    private forecastService: ForecastService,
    private orderService: OrderService,
    private supplierService: SupplierService,
    private stockService: StockService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.decodeToken();
    this.loadByRole();
  }

  ngAfterViewInit() {
    // Charts drawn after data loads via setTimeout in loadAll
  }

  decodeToken() {
    const token = this.authService.getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userRole = payload.role || payload.authorities?.[0]?.replace('ROLE_', '') || '';
      this.userName = payload.sub || payload.username || payload.name || 'User';
    } catch {}
  }

  loadByRole() {
    if (this.userRole === 'ADMIN') {
      this.loadProductData();
      this.loadOrderData();
      this.loadSupplierData();
      this.loadTransactions();
    } else if (this.userRole === 'USER') {
      this.loadProductData();
      this.loadTransactions();
    } else if (this.userRole === 'Vendor') {
      this.loadOrderData();
      this.loadSupplierData();
    } else {
      this.loadProductData();
      this.loadOrderData();
      this.loadSupplierData();
      this.loadTransactions();
    }
  }

  loadProductData() {
    this.productService.getAllProducts().subscribe({
      next: d => {
        this.totalProducts = d.length;
        this.topRestocked = d
          .sort((a: any, b: any) => (b.currentStock || 0) - (a.currentStock || 0))
          .slice(0, 5)
          .map((p: any) => ({ name: p.name, stock: p.currentStock || 0 }));
        // build category data
        const map: any = {};
        d.forEach((p: any) => {
          const cat = p.category || 'Other';
          map[cat] = (map[cat] || 0) + (p.currentStock || 0);
        });
        this.categoryData = Object.keys(map).map((k, i) => ({
          label: k, value: map[k], color: this.COLORS[i % this.COLORS.length]
        }));
        this.cdr.detectChanges();
        setTimeout(() => this.drawAllCharts(), 150);
      }
    });
    this.productService.getLowStockProducts().subscribe({
      next: d => { this.lowStockCount = d.length; this.lowStockProducts = d; this.cdr.detectChanges(); }
    });
    this.forecastService.getHighRiskProducts().subscribe({
      next: d => { this.highRiskCount = d.length; this.cdr.detectChanges(); },
      error: () => { this.highRiskCount = 0; this.cdr.detectChanges(); }
    });
  }

  loadOrderData() {
    this.orderService.getAllOrders().subscribe({
      next: d => {
        this.recentOrders = d;
        this.pendingOrders = d.filter((o: any) => o.status === 'PENDING').length;
        this.approvedOrders = d.filter((o: any) => o.status === 'APPROVED').length;
        this.deliveredOrders = d.filter((o: any) => o.status === 'DELIVERED').length;
        this.cancelledOrders = d.filter((o: any) => o.status === 'CANCELLED').length;
        this.cdr.detectChanges();
        setTimeout(() => this.drawAllCharts(), 150);
      }
    });
  }

  loadSupplierData() {
    this.supplierService.getAllSuppliers().subscribe({
      next: d => { this.totalSuppliers = d.length; this.supplierList = d; this.cdr.detectChanges(); }
    });
  }

  loadTransactions() {
    this.stockService.getAllTransactions().subscribe({
      next: d => {
        this.transactions = d;
        this.cdr.detectChanges();
        setTimeout(() => this.drawAllCharts(), 150);
      },
      error: () => {}
    });
  }

  drawAllCharts() {
    if (this.userRole === 'ADMIN') {
      this.drawLineChart(this.lineChartRef?.nativeElement, 420, 180);
      this.drawDonutChart(this.donutChartRef?.nativeElement, [
        { value: this.pendingOrders, color: '#f59e0b' },
        { value: this.approvedOrders, color: '#22c55e' },
        { value: this.deliveredOrders, color: '#60a5fa' },
        { value: this.cancelledOrders, color: '#ef4444' }
      ], 160);
      this.drawDonutChart(this.categoryChartRef?.nativeElement,
        this.categoryData.map(c => ({ value: c.value, color: c.color })), 160);
    } else if (this.userRole === 'USER') {
      this.drawLineChart(this.lineChartUserRef?.nativeElement, 420, 180);
      this.drawDonutChart(this.categoryChartUserRef?.nativeElement,
        this.categoryData.map(c => ({ value: c.value, color: c.color })), 160);
    } else if (this.userRole === 'Vendor') {
      this.drawDonutChart(this.donutVendorRef?.nativeElement, [
        { value: this.pendingOrders, color: '#f59e0b' },
        { value: this.approvedOrders, color: '#22c55e' },
        { value: this.deliveredOrders, color: '#60a5fa' },
        { value: this.cancelledOrders, color: '#ef4444' }
      ], 160);
      this.drawVendorLineChart(this.lineVendorRef?.nativeElement);
    }
  }

  drawLineChart(canvas: HTMLCanvasElement | undefined, w: number, h: number) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    // Build last 7 days buckets
    const days = 7;
    const labels: string[] = [];
    const inData: number[] = [];
    const outData: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
      const dayStr = d.toISOString().split('T')[0];
      const dayTx = this.transactions.filter(t => t.timestamp?.startsWith(dayStr));
      inData.push(dayTx.filter(t => t.type === 'IN').reduce((s: number, t: any) => s + (t.quantity || 0), 0));
      outData.push(dayTx.filter(t => t.type === 'OUT').reduce((s: number, t: any) => s + (t.quantity || 0), 0));
    }

    const pad = { top: 16, right: 16, bottom: 32, left: 40 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;
    const maxVal = Math.max(...inData, ...outData, 1);
    const step = cw / (days - 1);

    // Grid lines
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = '10px Segoe UI';
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(maxVal - (maxVal / 4) * i)), pad.left - 6, y + 3);
    }

    // X labels
    ctx.fillStyle = '#475569';
    ctx.font = '10px Segoe UI';
    ctx.textAlign = 'center';
    labels.forEach((l, i) => {
      ctx.fillText(l, pad.left + i * step, h - 8);
    });

    // Draw line helper
    const drawLine = (data: number[], color: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      data.forEach((v, i) => {
        const x = pad.left + i * step;
        const y = pad.top + ch - (v / maxVal) * ch;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      // dots
      data.forEach((v, i) => {
        const x = pad.left + i * step;
        const y = pad.top + ch - (v / maxVal) * ch;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    // Area fill IN
    ctx.beginPath();
    ctx.fillStyle = '#22c55e15';
    inData.forEach((v, i) => {
      const x = pad.left + i * step;
      const y = pad.top + ch - (v / maxVal) * ch;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.left + (days - 1) * step, pad.top + ch);
    ctx.lineTo(pad.left, pad.top + ch);
    ctx.closePath();
    ctx.fill();

    drawLine(inData, '#22c55e');
    drawLine(outData, '#ef4444');
  }

  drawDonutChart(canvas: HTMLCanvasElement | undefined, data: { value: number; color: string }[], size: number) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const total = data.reduce((s, d) => s + d.value, 0);
    ctx.clearRect(0, 0, size, size);
    if (total === 0) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#1e3a5f';
      ctx.lineWidth = 20;
      ctx.stroke();
      return;
    }
    let start = -Math.PI / 2;
    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    data.forEach(d => {
      if (d.value === 0) return;
      const slice = (d.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      ctx.strokeStyle = '#0a1628';
      ctx.lineWidth = 2;
      ctx.stroke();
      start += slice;
    });
    // Inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#112240';
    ctx.fill();
    // Center total
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `bold ${size > 180 ? 18 : 14}px Segoe UI`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy);
  }

  drawVendorLineChart(canvas: HTMLCanvasElement | undefined) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Simple bar chart of orders by status
    const w = 300, h = 160;
    ctx.clearRect(0, 0, w, h);
    const bars = [
      { label: 'Pending', value: this.pendingOrders, color: '#f59e0b' },
      { label: 'Approved', value: this.approvedOrders, color: '#22c55e' },
      { label: 'Delivered', value: this.deliveredOrders, color: '#60a5fa' },
      { label: 'Cancelled', value: this.cancelledOrders, color: '#ef4444' }
    ];
    const max = Math.max(...bars.map(b => b.value), 1);
    const pad = { top: 12, bottom: 28, left: 10, right: 10 };
    const bw = (w - pad.left - pad.right) / bars.length;
    bars.forEach((b, i) => {
      const bh = ((b.value / max) * (h - pad.top - pad.bottom));
      const x = pad.left + i * bw + bw * 0.15;
      const y = h - pad.bottom - bh;
      ctx.fillStyle = b.color + '40';
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, bw * 0.7, bh, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = '10px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, x + bw * 0.35, h - 8);
      if (b.value > 0) {
        ctx.fillStyle = b.color;
        ctx.font = 'bold 11px Segoe UI';
        ctx.fillText(String(b.value), x + bw * 0.35, y - 4);
      }
    });
  }

  getBarPct(stock: number): number {
    const max = Math.max(...this.topRestocked.map(p => p.stock), 1);
    return Math.round((stock / max) * 100);
  }

  getTitle(): string {
    if (this.userRole === 'ADMIN') return 'Admin Dashboard';
    if (this.userRole === 'USER') return 'Inventory Dashboard';
    if (this.userRole === 'Vendor') return 'Vendor Dashboard';
    return 'Dashboard';
  }

  getBannerSubtitle(): string {
    if (this.userRole === 'ADMIN') return `Welcome back, ${this.userName}. Full system overview.`;
    if (this.userRole === 'USER') return `Welcome back, ${this.userName}. Here's your inventory status.`;
    if (this.userRole === 'Vendor') return `Welcome back, ${this.userName}. Track your orders and suppliers.`;
    return `Welcome back, ${this.userName}.`;
  }

  navigate(path: string) { this.router.navigate([path]); }
}
