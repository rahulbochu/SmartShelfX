import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../services/order';
import { SupplierService } from '../../services/supplier';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, SidebarComponent],
  styles: [`
    .app-layout { display:flex; min-height:100vh; background:#0f172a; color:#e2e8f0; font-family:'Segoe UI',sans-serif; }
    .main-content { margin-left:240px; flex:1; padding:32px; min-height:100vh; }
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; }
    .page-header h2 { font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
    .page-header p { font-size:14px; color:#64748b; margin:0; }
    .stat-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:16px; margin-bottom:28px; }
    .stat-card { background:#1e293b; border:1px solid #334155; border-radius:12px; padding:20px; }
    .stat-card .label { font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
    .stat-card .value { font-size:28px; font-weight:700; }
    .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
    .search-box { display:flex; align-items:center; gap:8px; background:#1e293b; border:1px solid #334155; border-radius:8px; padding:8px 14px; flex:1; max-width:360px; }
    .search-box mat-icon { color:#64748b; font-size:18px; }
    .search-box input { background:none; border:none; outline:none; color:#e2e8f0; font-size:14px; width:100%; }
    .search-box input::placeholder { color:#475569; }
    .filter-tabs { display:flex; gap:6px; flex-wrap:wrap; }
    .filter-tab { background:#1e293b; border:1px solid #334155; border-radius:20px; padding:5px 14px; font-size:12px; color:#94a3b8; cursor:pointer; transition:all .2s; font-weight:500; }
    .filter-tab:hover { background:#334155; color:#e2e8f0; }
    .filter-tab.active { background:#1d4ed8; border-color:#1d4ed8; color:#fff; }
    .data-table-wrap { background:#1e293b; border:1px solid #334155; border-radius:12px; overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:#162032; }
    th { padding:12px 16px; text-align:left; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.5px; border-bottom:1px solid #334155; }
    td { padding:13px 16px; font-size:14px; color:#cbd5e1; border-bottom:1px solid #1e293b; }
    tbody tr:last-child td { border-bottom:none; }
    tbody tr:hover { background:#253347; }
    .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; text-transform:uppercase; }
    .badge-draft { background:#94a3b820; color:#94a3b8; border:1px solid #94a3b830; }
    .badge-sent { background:#4f8ef720; color:#4f8ef7; border:1px solid #4f8ef730; }
    .badge-pending { background:#f59e0b20; color:#f59e0b; border:1px solid #f59e0b30; }
    .badge-approved,.badge-acknowledged { background:#22c55e20; color:#22c55e; border:1px solid #22c55e30; }
    .badge-fulfilled,.badge-delivered { background:#60a5fa20; color:#60a5fa; border:1px solid #60a5fa30; }
    .badge-cancelled { background:#ef444420; color:#ef4444; border:1px solid #ef444430; }
    .action-btns { display:flex; gap:4px; }
    .btn-primary { display:flex; align-items:center; gap:6px; background:#1d4ed8; color:#fff; border:none; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-primary:hover { background:#2563eb; }
    .btn-primary:disabled { background:#334155; color:#64748b; cursor:not-allowed; }
    .btn-secondary { background:#1e293b; color:#94a3b8; border:1px solid #334155; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-secondary:hover { background:#334155; color:#e2e8f0; }
    .btn-icon { background:none; border:none; cursor:pointer; padding:6px; border-radius:6px; display:flex; align-items:center; color:#64748b; transition:all .2s; }
    .btn-icon:hover { background:#334155; color:#e2e8f0; }
    .btn-icon.delete:hover { background:#ef444420; color:#ef4444; }
    .alert-success { background:#052e16; border:1px solid #166534; color:#4ade80; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .alert-error { background:#450a0a; border:1px solid #991b1b; color:#fca5a5; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .empty-state { text-align:center; padding:60px 20px; color:#475569; }
    .empty-state mat-icon { font-size:48px; width:48px; height:48px; margin-bottom:12px; opacity:.4; }
    .loading-state { text-align:center; padding:60px 20px; color:#475569; display:flex; flex-direction:column; align-items:center; gap:12px; }
    .spinner { width:32px; height:32px; border:3px solid #334155; border-top-color:#4f8ef7; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:200; display:flex; align-items:center; justify-content:center; }
    .modal { background:#1e293b; border:1px solid #334155; border-radius:14px; width:560px; max-width:95vw; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.5); }
    .modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #334155; }
    .modal-header h3 { margin:0; font-size:17px; font-weight:700; color:#f1f5f9; }
    .modal-body { padding:24px; display:flex; flex-direction:column; gap:16px; }
    .modal-footer { padding:16px 24px; border-top:1px solid #334155; display:flex; justify-content:flex-end; gap:10px; }
    .form-group { display:flex; flex-direction:column; gap:6px; }
    .form-group label { font-size:13px; color:#94a3b8; font-weight:500; }
    .form-group input, .form-group select, .form-group textarea {
      background:#0f172a; border:1px solid #334155; border-radius:8px;
      padding:10px 12px; color:#e2e8f0; font-size:14px; outline:none;
      width:100%; box-sizing:border-box; transition:border-color .2s;
    }
    .form-group input:focus, .form-group select:focus { border-color:#4f8ef7; }
    .form-group select option { background:#1e293b; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .items-section { background:#0f172a; border-radius:8px; padding:14px; }
    .items-section h4 { font-size:13px; color:#94a3b8; margin:0 0 12px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
    .item-row { display:grid; grid-template-columns:1fr 80px 100px 32px; gap:8px; align-items:center; margin-bottom:8px; }
    .item-row:last-child { margin-bottom:0; }
    .btn-add-item { background:none; border:1px dashed #334155; border-radius:8px; color:#64748b; font-size:13px; cursor:pointer; padding:8px; width:100%; margin-top:8px; transition:all .2s; }
    .btn-add-item:hover { border-color:#4f8ef7; color:#4f8ef7; }
    .btn-remove-item { background:none; border:none; cursor:pointer; color:#ef4444; padding:4px; border-radius:4px; display:flex; align-items:center; }
  `],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <div class="page-header">
          <div><h2>Order Management</h2><p>Track and manage purchase orders</p></div>
          <button class="btn-primary" (click)="openAdd()"><mat-icon>add</mat-icon> New Order</button>
        </div>

        <div class="alert-success" *ngIf="successMsg">{{ successMsg }}</div>
        <div class="alert-error" *ngIf="errorMsg && !showModal">{{ errorMsg }}</div>

        <div class="stat-cards">
          <div class="stat-card"><div class="label">Total Orders</div><div class="value" style="color:#4f8ef7">{{ orders.length }}</div></div>
          <div class="stat-card"><div class="label">Draft</div><div class="value" style="color:#94a3b8">{{ countByStatus('DRAFT') }}</div></div>
          <div class="stat-card"><div class="label">Sent</div><div class="value" style="color:#4f8ef7">{{ countByStatus('SENT') }}</div></div>
          <div class="stat-card"><div class="label">Acknowledged</div><div class="value" style="color:#22c55e">{{ countByStatus('ACKNOWLEDGED') }}</div></div>
          <div class="stat-card"><div class="label">Fulfilled</div><div class="value" style="color:#60a5fa">{{ countByStatus('FULFILLED') }}</div></div>
          <div class="stat-card"><div class="label">Cancelled</div><div class="value" style="color:#ef4444">{{ countByStatus('CANCELLED') }}</div></div>
        </div>

        <div class="toolbar">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search orders..." [(ngModel)]="searchTerm" (input)="applyFilter()" />
          </div>
          <div class="filter-tabs">
            <button *ngFor="let s of statuses" class="filter-tab" [class.active]="filterStatus===s" (click)="filterStatus=s; applyFilter()">{{ s }}</button>
          </div>
        </div>

        <div class="data-table-wrap" *ngIf="!loading && filtered.length > 0">
          <table>
            <thead>
              <tr><th>Order #</th><th>Vendor</th><th>Items</th><th>Total Value</th><th>Status</th><th>Created By</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of filtered">
                <td style="font-weight:600;color:#f1f5f9">{{ o.orderNumber }}</td>
                <td>{{ o.vendor?.name || '—' }}</td>
                <td>{{ o.items?.length || 0 }} item(s)</td>
                <td>{{ o.totalValue ? '₹' + (o.totalValue | number:'1.0-0') : '—' }}</td>
                <td>
                  <span class="badge"
                    [class.badge-draft]="o.status==='DRAFT'"
                    [class.badge-sent]="o.status==='SENT'"
                    [class.badge-acknowledged]="o.status==='ACKNOWLEDGED'"
                    [class.badge-fulfilled]="o.status==='FULFILLED'"
                    [class.badge-cancelled]="o.status==='CANCELLED'">
                    {{ o.status }}
                  </span>
                </td>
                <td style="color:#64748b">{{ o.createdBy || '—' }}</td>
                <td style="color:#64748b;font-size:13px">{{ o.createdAt | date:'MMM d, y' }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn-icon" style="color:#22c55e" title="Mark Fulfilled"
                      *ngIf="o.status==='ACKNOWLEDGED'"
                      (click)="updateStatus(o.id, 'FULFILLED')"><mat-icon>check_circle</mat-icon></button>
                    <button class="btn-icon delete" title="Cancel"
                      *ngIf="o.status!=='FULFILLED' && o.status!=='CANCELLED'"
                      (click)="cancel(o.id)"><mat-icon>cancel</mat-icon></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" *ngIf="!loading && filtered.length === 0">
          <mat-icon>shopping_cart</mat-icon><p>No orders found.</p>
        </div>
        <div class="loading-state" *ngIf="loading"><div class="spinner"></div><p>Loading...</p></div>
      </main>
    </div>

    <!-- CREATE ORDER MODAL -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Create Purchase Order</h3>
          <button class="btn-icon" (click)="closeModal()"><mat-icon>close</mat-icon></button>
        </div>
        <div class="modal-body">
          <div class="alert-error" *ngIf="modalError">{{ modalError }}</div>

          <div class="form-group">
            <label>Vendor *</label>
            <select [(ngModel)]="form.vendorId">
              <option [ngValue]="null">Select vendor...</option>
              <option *ngFor="let v of vendors" [ngValue]="v.id">{{ v.name }}</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Expected Delivery Date</label>
              <input type="date" [(ngModel)]="form.expectedDeliveryDate" />
            </div>
            <div class="form-group">
              <label>Notes</label>
              <input type="text" [(ngModel)]="form.notes" placeholder="Optional notes..." />
            </div>
          </div>

          <!-- ORDER ITEMS -->
          <div class="items-section">
            <h4>Order Items</h4>
            <div class="item-row" *ngFor="let item of form.items; let i = index">
              <select [(ngModel)]="item.productId">
                <option [ngValue]="null">Select product...</option>
                <option *ngFor="let p of products" [ngValue]="p.id">{{ p.name }}</option>
              </select>
              <input type="number" [(ngModel)]="item.orderedQuantity" placeholder="Qty" min="1" />
              <input type="number" [(ngModel)]="item.unitPrice" placeholder="Price" min="0" />
              <button class="btn-remove-item" (click)="removeItem(i)" *ngIf="form.items.length > 1">
                <mat-icon style="font-size:16px;width:16px;height:16px">close</mat-icon>
              </button>
            </div>
            <button class="btn-add-item" (click)="addItem()">+ Add Item</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeModal()">Cancel</button>
          <button class="btn-primary" (click)="save()" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Create Order' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  filtered: any[] = [];
  vendors: any[] = [];
  products: any[] = [];
  searchTerm = '';
  filterStatus = 'ALL';
  statuses = ['ALL', 'DRAFT', 'SENT', 'ACKNOWLEDGED', 'FULFILLED', 'CANCELLED'];
  showModal = false;
  loading = false;
  errorMsg = '';
  successMsg = '';
  modalError = '';
  form: any = {
    vendorId: null,
    notes: '',
    expectedDeliveryDate: '',
    items: [{ productId: null, orderedQuantity: 1, unitPrice: 0 }]
  };

  constructor(
    private orderService: OrderService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();
    this.supplierService.getAllSuppliers().subscribe({ next: d => { this.vendors = d; this.cdr.detectChanges(); } });
    this.productService.getAllProducts().subscribe({ next: d => { this.products = d; this.cdr.detectChanges(); } });
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: d => { this.orders = d; this.applyFilter(); this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load orders.'; this.cdr.detectChanges(); }
    });
  }

  applyFilter() {
    let list = [...this.orders];
    if (this.filterStatus !== 'ALL') list = list.filter(o => o.status === this.filterStatus);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(o => o.orderNumber?.toLowerCase().includes(t) || o.vendor?.name?.toLowerCase().includes(t));
    }
    this.filtered = list;
  }

  openAdd() {
    this.form = {
      vendorId: null, notes: '', expectedDeliveryDate: '',
      items: [{ productId: null, orderedQuantity: 1, unitPrice: 0 }]
    };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.modalError = ''; }

  addItem() { this.form.items.push({ productId: null, orderedQuantity: 1, unitPrice: 0 }); }
  removeItem(i: number) { this.form.items.splice(i, 1); }

  save() {
    if (!this.form.vendorId) { this.modalError = 'Please select a vendor.'; return; }
    if (!this.form.items.length || !this.form.items[0].productId) { this.modalError = 'Please add at least one product.'; return; }
    this.loading = true;
    const payload = {
      vendorId: this.form.vendorId,
      notes: this.form.notes || null,
      expectedDeliveryDate: this.form.expectedDeliveryDate || null,
      items: this.form.items.filter((i: any) => i.productId).map((i: any) => ({
        productId: i.productId,
        orderedQuantity: Number(i.orderedQuantity),
        unitPrice: i.unitPrice ? Number(i.unitPrice) : null
      }))
    };
    this.orderService.createOrder(payload).subscribe({
      next: () => {
        this.showModal = false;
        this.loading = false;
        this.successMsg = 'Purchase order created!';
        this.loadOrders();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err: any) => {
        this.loading = false;
        this.modalError = err?.error?.message || err?.error || 'Failed to create order.';
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(id: number, status: string) {
    this.orderService.updateOrderStatus(id, status).subscribe({
      next: () => { this.successMsg = `Order marked as ${status}`; this.loadOrders(); setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000); },
      error: () => { this.errorMsg = 'Status update failed.'; this.cdr.detectChanges(); }
    });
  }

  cancel(id: number) {
    if (!confirm('Cancel this order?')) return;
    this.orderService.cancelOrder(id).subscribe({
      next: () => { this.successMsg = 'Order cancelled.'; this.loadOrders(); setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000); },
      error: () => { this.errorMsg = 'Cancel failed.'; this.cdr.detectChanges(); }
    });
  }

  countByStatus(status: string) { return this.orders.filter(o => o.status === status).length; }
}
