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
    .badge-pending { background:#451a0340; color:#f59e0b; border:1px solid #f59e0b40; }
    .badge-approved { background:#05280640; color:#22c55e; border:1px solid #22c55e40; }
    .badge-delivered { background:#03166040; color:#60a5fa; border:1px solid #60a5fa40; }
    .badge-cancelled { background:#45090940; color:#f87171; border:1px solid #f8717140; }
    .action-btns { display:flex; gap:4px; }
    .btn-primary { display:flex; align-items:center; gap:6px; background:#1d4ed8; color:#fff; border:none; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-primary:hover { background:#2563eb; }
    .btn-primary:disabled { background:#334155; color:#64748b; cursor:not-allowed; }
    .btn-secondary { background:#1e293b; color:#94a3b8; border:1px solid #334155; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-secondary:hover { background:#334155; color:#e2e8f0; }
    .btn-icon { background:none; border:none; cursor:pointer; padding:6px; border-radius:6px; display:flex; align-items:center; color:#64748b; transition:all .2s; }
    .btn-icon.edit:hover { background:#1d4ed820; color:#4f8ef7; }
    .btn-icon.delete:hover { background:#ef444420; color:#ef4444; }
    .btn-icon:hover { background:#334155; color:#e2e8f0; }
    .alert-success { background:#052e16; border:1px solid #166534; color:#4ade80; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .alert-error { background:#450a0a; border:1px solid #991b1b; color:#fca5a5; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .empty-state { text-align:center; padding:60px 20px; color:#475569; }
    .empty-state mat-icon { font-size:48px; width:48px; height:48px; margin-bottom:12px; opacity:.4; }
    .empty-state p { font-size:15px; margin:0; }
    .loading-state { text-align:center; padding:60px 20px; color:#475569; display:flex; flex-direction:column; align-items:center; gap:12px; }
    .spinner { width:32px; height:32px; border:3px solid #334155; border-top-color:#4f8ef7; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:200; display:flex; align-items:center; justify-content:center; }
    .modal { background:#1e293b; border:1px solid #334155; border-radius:14px; width:520px; max-width:95vw; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.5); }
    .modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #334155; }
    .modal-header h3 { margin:0; font-size:17px; font-weight:700; color:#f1f5f9; }
    .modal-body { padding:24px; display:flex; flex-direction:column; gap:16px; }
    .modal-footer { padding:16px 24px; border-top:1px solid #334155; display:flex; justify-content:flex-end; gap:10px; }
    .form-group { display:flex; flex-direction:column; gap:6px; }
    .form-group label { font-size:13px; color:#94a3b8; font-weight:500; }
    .form-group input, .form-group select { background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 12px; color:#e2e8f0; font-size:14px; outline:none; width:100%; box-sizing:border-box; }
    .form-group input:focus, .form-group select:focus { border-color:#4f8ef7; }
    .form-group select option { background:#1e293b; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
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
          <div class="stat-card"><div class="label">Pending</div><div class="value" style="color:#f59e0b">{{ pendingCount }}</div></div>
          <div class="stat-card"><div class="label">Approved</div><div class="value" style="color:#22c55e">{{ approvedCount }}</div></div>
          <div class="stat-card"><div class="label">Delivered</div><div class="value" style="color:#60a5fa">{{ deliveredCount }}</div></div>
        </div>

        <div class="toolbar">
          <div class="search-box"><mat-icon>search</mat-icon><input type="text" placeholder="Search orders..." [(ngModel)]="searchTerm" (input)="applyFilter()" /></div>
          <div class="filter-tabs">
            <button *ngFor="let s of statuses" class="filter-tab" [class.active]="filterStatus===s" (click)="filterStatus=s; applyFilter()">{{ s }}</button>
          </div>
        </div>

        <div class="data-table-wrap" *ngIf="!loading && filtered.length > 0">
          <table>
            <thead><tr><th>#</th><th>Supplier</th><th>Product</th><th>Qty</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let o of filtered">
                <td style="color:#64748b">{{ o.id }}</td>
                <td><strong>{{ o.supplierName || o.supplierId }}</strong></td>
                <td>{{ o.productName || o.productId || '—' }}</td>
                <td>{{ o.quantity }}</td>
                <td>
                  <span class="badge" [class.badge-pending]="o.status==='PENDING'" [class.badge-approved]="o.status==='APPROVED'" [class.badge-delivered]="o.status==='DELIVERED'" [class.badge-cancelled]="o.status==='CANCELLED'">{{ o.status }}</span>
                </td>
                <td>{{ o.notes || '—' }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn-icon edit" (click)="openEdit(o)"><mat-icon>edit</mat-icon></button>
                    <button class="btn-icon" style="color:#22c55e" (click)="updateStatus(o.id,'APPROVED')" *ngIf="o.status==='PENDING'"><mat-icon>check_circle</mat-icon></button>
                    <button class="btn-icon" style="color:#60a5fa" (click)="updateStatus(o.id,'DELIVERED')" *ngIf="o.status==='APPROVED'"><mat-icon>local_shipping</mat-icon></button>
                    <button class="btn-icon delete" (click)="delete(o.id)"><mat-icon>delete</mat-icon></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" *ngIf="!loading && filtered.length===0"><mat-icon>shopping_cart</mat-icon><p>No orders found.</p></div>
        <div class="loading-state" *ngIf="loading"><div class="spinner"></div><p>Loading...</p></div>
      </main>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Order' : 'Create Order' }}</h3>
          <button class="btn-icon" (click)="closeModal()"><mat-icon>close</mat-icon></button>
        </div>
        <div class="modal-body">
          <div class="alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>
          <div class="form-group"><label>Supplier *</label>
            <select [(ngModel)]="form.supplierId"><option value="">Select supplier...</option><option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</option></select>
          </div>
          <div class="form-group"><label>Product</label>
            <select [(ngModel)]="form.productId"><option value="">Select product...</option><option *ngFor="let p of products" [value]="p.id">{{ p.name }}</option></select>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Quantity *</label><input type="number" [(ngModel)]="form.quantity" placeholder="0" min="1" /></div>
            <div class="form-group"><label>Status</label>
              <select [(ngModel)]="form.status"><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select>
            </div>
          </div>
          <div class="form-group"><label>Notes</label><input type="text" [(ngModel)]="form.notes" placeholder="Optional notes..." /></div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeModal()">Cancel</button>
          <button class="btn-primary" (click)="save()" [disabled]="loading">{{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create Order') }}</button>
        </div>
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orders: any[] = []; filtered: any[] = []; suppliers: any[] = []; products: any[] = [];
  searchTerm = ''; filterStatus = 'ALL'; statuses = ['ALL','PENDING','APPROVED','DELIVERED','CANCELLED'];
  showModal = false; isEditing = false; loading = false; errorMsg = ''; successMsg = ''; editingId: number | null = null;
  form: any = { supplierId: '', productId: '', quantity: '', status: 'PENDING', notes: '' };

  constructor(private orderService: OrderService, private supplierService: SupplierService, private productService: ProductService, private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadOrders();
    this.supplierService.getAllSuppliers().subscribe({ next: d => { this.suppliers = d; this.cdr.detectChanges(); } });
    this.productService.getAllProducts().subscribe({ next: d => { this.products = d; this.cdr.detectChanges(); } });
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => { this.orders = data; this.applyFilter(); this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load orders.'; this.cdr.detectChanges(); }
    });
  }

  applyFilter() {
    let list = [...this.orders];
    if (this.filterStatus !== 'ALL') list = list.filter(o => o.status === this.filterStatus);
    if (this.searchTerm) { const t = this.searchTerm.toLowerCase(); list = list.filter(o => o.supplierName?.toLowerCase().includes(t) || String(o.id).includes(t)); }
    this.filtered = list;
  }

  openAdd() { this.isEditing = false; this.form = { supplierId: '', productId: '', quantity: '', status: 'PENDING', notes: '' }; this.editingId = null; this.showModal = true; }
  openEdit(o: any) { this.isEditing = true; this.editingId = o.id; this.form = { supplierId: o.supplierId, productId: o.productId, quantity: o.quantity, status: o.status, notes: o.notes }; this.showModal = true; }
  closeModal() { this.showModal = false; this.errorMsg = ''; }

  save() {
    if (!this.form.supplierId || !this.form.quantity) { this.errorMsg = 'Supplier and quantity are required.'; return; }
    this.loading = true;
    const call = this.isEditing ? this.orderService.updateOrder(this.editingId!, this.form) : this.orderService.createOrder(this.form);
    call.subscribe({
      next: () => { this.successMsg = this.isEditing ? 'Order updated!' : 'Order created!'; this.showModal = false; this.loadOrders(); setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000); },
      error: () => { this.loading = false; this.errorMsg = 'Operation failed.'; this.cdr.detectChanges(); }
    });
  }

  updateStatus(id: number, status: string) {
    this.orderService.updateOrderStatus(id, status).subscribe({
      next: () => { this.successMsg = `Order marked as ${status}`; this.loadOrders(); setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000); },
      error: () => { this.errorMsg = 'Status update failed.'; this.cdr.detectChanges(); }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this order?')) return;
    this.orderService.deleteOrder(id).subscribe({
      next: () => { this.successMsg = 'Order deleted.'; this.loadOrders(); setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000); },
      error: () => { this.errorMsg = 'Delete failed.'; this.cdr.detectChanges(); }
    });
  }

  get pendingCount() { return this.orders.filter(o => o.status === 'PENDING').length; }
  get approvedCount() { return this.orders.filter(o => o.status === 'APPROVED').length; }
  get deliveredCount() { return this.orders.filter(o => o.status === 'DELIVERED').length; }
}
