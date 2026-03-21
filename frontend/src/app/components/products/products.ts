import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, SidebarComponent],
  styles: [`
    .app-layout { display:flex; min-height:100vh; background:#0f172a; color:#e2e8f0; font-family:'Segoe UI',sans-serif; }
    .main-content { margin-left:240px; flex:1; padding:32px; min-height:100vh; }
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; }
    .page-header h2 { font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
    .page-header p { font-size:14px; color:#64748b; margin:0; }
    .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
    .search-box { display:flex; align-items:center; gap:8px; background:#1e293b; border:1px solid #334155; border-radius:8px; padding:8px 14px; flex:1; max-width:400px; }
    .search-box mat-icon { color:#64748b; font-size:18px; }
    .search-box input { background:none; border:none; outline:none; color:#e2e8f0; font-size:14px; width:100%; }
    .search-box input::placeholder { color:#475569; }
    .filter-select { background:#1e293b; border:1px solid #334155; border-radius:8px; padding:8px 12px; color:#e2e8f0; font-size:14px; outline:none; cursor:pointer; }
    .filter-select option { background:#1e293b; }
    .data-table-wrap { background:#1e293b; border:1px solid #334155; border-radius:12px; overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:#162032; }
    th { padding:12px 16px; text-align:left; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.5px; border-bottom:1px solid #334155; white-space:nowrap; }
    td { padding:13px 16px; font-size:14px; color:#cbd5e1; border-bottom:1px solid #1e293b; }
    tbody tr:last-child td { border-bottom:none; }
    tbody tr:hover { background:#253347; }
    .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; text-transform:uppercase; }
    .badge-ok { background:#22c55e20; color:#22c55e; border:1px solid #22c55e40; }
    .badge-low { background:#ef444420; color:#ef4444; border:1px solid #ef444440; }
    .badge-expired { background:#94a3b820; color:#94a3b8; border:1px solid #94a3b840; }
    .action-btns { display:flex; gap:4px; }
    .btn-primary { display:flex; align-items:center; gap:6px; background:#1d4ed8; color:#fff; border:none; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-primary:hover { background:#2563eb; }
    .btn-primary:disabled { background:#334155; color:#64748b; cursor:not-allowed; }
    .btn-secondary { background:#1e293b; color:#94a3b8; border:1px solid #334155; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-secondary:hover { background:#334155; color:#e2e8f0; }
    .btn-icon { background:none; border:none; cursor:pointer; padding:6px; border-radius:6px; display:flex; align-items:center; color:#64748b; transition:all .2s; }
    .btn-icon.edit:hover { background:#1d4ed820; color:#4f8ef7; }
    .btn-icon.delete:hover { background:#ef444420; color:#ef4444; }
    .alert-success { background:#052e16; border:1px solid #166534; color:#4ade80; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .alert-error { background:#450a0a; border:1px solid #991b1b; color:#fca5a5; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:200; display:flex; align-items:center; justify-content:center; }
    .modal { background:#1e293b; border:1px solid #334155; border-radius:14px; width:560px; max-width:95vw; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.5); }
    .modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #334155; }
    .modal-header h3 { margin:0; font-size:17px; font-weight:700; color:#f1f5f9; }
    .modal-body { padding:24px; display:flex; flex-direction:column; gap:14px; }
    .modal-footer { padding:16px 24px; border-top:1px solid #334155; display:flex; justify-content:flex-end; gap:10px; }
    .form-group { display:flex; flex-direction:column; gap:6px; }
    .form-group label { font-size:13px; color:#94a3b8; font-weight:500; }
    .form-group input, .form-group select, .form-group textarea {
      background:#0f172a; border:1px solid #334155; border-radius:8px;
      padding:10px 12px; color:#e2e8f0; font-size:14px; outline:none;
      width:100%; box-sizing:border-box; transition:border-color .2s;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color:#4f8ef7; }
    .form-group select option { background:#1e293b; }
    .form-group textarea { resize:vertical; min-height:70px; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .empty-state { text-align:center; padding:60px 20px; color:#475569; }
    .loading-state { text-align:center; padding:60px 20px; color:#475569; display:flex; flex-direction:column; align-items:center; gap:12px; }
    .spinner { width:32px; height:32px; border:3px solid #334155; border-top-color:#4f8ef7; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .snack { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#1e293b; border:1px solid #334155; color:#e2e8f0; padding:12px 24px; border-radius:10px; font-size:14px; z-index:999; }
  `],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <div class="page-header">
          <div>
            <h2>Products</h2>
            <p>Manage your product catalogue and stock levels</p>
          </div>
          <button class="btn-primary" (click)="openAdd()">
            <mat-icon>add</mat-icon> Add Product
          </button>
        </div>

        <div class="alert-success" *ngIf="successMsg">{{ successMsg }}</div>
        <div class="alert-error" *ngIf="errorMsg && !showModal">{{ errorMsg }}</div>

        <div class="toolbar">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search products..." [(ngModel)]="searchTerm" (input)="search()" />
          </div>
          <select class="filter-select" [(ngModel)]="filterStatus" (change)="search()">
            <option value="">All Status</option>
            <option value="OK">In Stock</option>
            <option value="LOW">Low Stock</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <select class="filter-select" [(ngModel)]="filterCategory" (change)="search()">
            <option value="">All Categories</option>
            <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
          </select>
        </div>

        <div class="data-table-wrap" *ngIf="!loading && filtered.length > 0">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Reorder</th>
                <th>Status</th>
                <th>Vendor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of filtered">
                <td style="color:#64748b;font-size:12px">{{ p.sku || '—' }}</td>
                <td style="font-weight:600;color:#f1f5f9">{{ p.name }}</td>
                <td style="color:#64748b">{{ p.category || '—' }}</td>
                <td>{{ p.price ? '₹' + p.price : '—' }}</td>
                <td>
                  <span [style.color]="p.currentStock <= p.reorderLevel ? '#ef4444' : '#22c55e'" style="font-weight:700">
                    {{ p.currentStock }}
                  </span>
                </td>
                <td>{{ p.reorderLevel }}</td>
                <td>
                  <span class="badge"
                    [class.badge-ok]="p.stockStatus === 'OK'"
                    [class.badge-low]="p.stockStatus === 'LOW'"
                    [class.badge-expired]="p.stockStatus === 'EXPIRED' || p.stockStatus === 'EXPIRING_SOON'">
                    {{ p.stockStatus }}
                  </span>
                </td>
                <td style="color:#64748b">{{ p.vendorName || '—' }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn-icon edit" (click)="openEdit(p)"><mat-icon>edit</mat-icon></button>
                    <button class="btn-icon delete" (click)="delete(p.id)"><mat-icon>delete</mat-icon></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="!loading && filtered.length === 0">
          <mat-icon style="font-size:48px;width:48px;height:48px;opacity:.4;display:block;margin:0 auto 12px">inventory_2</mat-icon>
          <p>No products found.</p>
        </div>
        <div class="loading-state" *ngIf="loading">
          <div class="spinner"></div><p>Loading products...</p>
        </div>
      </main>
    </div>

    <!-- ADD / EDIT MODAL -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Product' : 'Add Product' }}</h3>
          <button class="btn-icon" (click)="closeModal()"><mat-icon>close</mat-icon></button>
        </div>
        <div class="modal-body">
          <div class="alert-error" *ngIf="modalError">{{ modalError }}</div>
          <div class="form-row">
            <div class="form-group">
              <label>Product Name *</label>
              <input type="text" [(ngModel)]="form.name" placeholder="e.g. Ball Point Pen" />
            </div>
            <div class="form-group">
              <label>SKU</label>
              <input type="text" [(ngModel)]="form.sku" placeholder="e.g. PEN-001" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <input type="text" [(ngModel)]="form.category" placeholder="e.g. Stationery" />
            </div>
            <div class="form-group">
              <label>Unit</label>
              <input type="text" [(ngModel)]="form.unit" placeholder="pcs, kg, litre..." />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Price (₹)</label>
              <input type="number" [(ngModel)]="form.price" placeholder="0.00" min="0" />
            </div>
            <div class="form-group">
              <label>Current Stock</label>
              <input type="number" [(ngModel)]="form.currentStock" placeholder="0" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Reorder Level</label>
              <input type="number" [(ngModel)]="form.reorderLevel" placeholder="10" min="0" />
            </div>
            <div class="form-group">
              <label>Reorder Quantity</label>
              <input type="number" [(ngModel)]="form.reorderQuantity" placeholder="50" min="0" />
            </div>
          </div>
          <div class="form-group">
            <label>Vendor</label>
            <select [(ngModel)]="form.vendorId">
              <option [ngValue]="null">No vendor</option>
              <option *ngFor="let v of vendors" [ngValue]="v.id">{{ v.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="form.description" placeholder="Optional description..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeModal()">Cancel</button>
          <button class="btn-primary" (click)="save()" [disabled]="loading">
            {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Add Product') }}
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="toast" class="snack">{{ toast }}</div>
  `
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  filtered: any[] = [];
  vendors: any[] = [];
  categories: string[] = [];
  searchTerm = '';
  filterStatus = '';
  filterCategory = '';
  showModal = false;
  isEditing = false;
  editId: number | null = null;
  loading = false;
  successMsg = '';
  errorMsg = '';
  modalError = '';
  toast = '';
  form: any = {
    name: '', sku: '', price: null, category: '', unit: '',
    currentStock: 0, reorderLevel: 10, reorderQuantity: 50,
    vendorId: null, description: '', isPerishable: false
  };

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
    this.loadVendors();
  }

  load() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: d => {
        this.products = d;
        this.filtered = d;
        // extract unique categories
        this.categories = [...new Set(d.map((p: any) => p.category).filter(Boolean))] as string[];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'Failed to load products.';
        console.error('Products error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadVendors() {
    this.productService.getAllVendors().subscribe({
      next: d => { this.vendors = d; this.cdr.detectChanges(); },
      error: () => {
        // fallback to users if vendors endpoint doesn't exist
        this.productService.getAllUsers().subscribe({
          next: d => { this.vendors = d.filter((u: any) => u.role === 'Vendor'); this.cdr.detectChanges(); }
        });
      }
    });
  }

  search() {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.products.filter(p => {
      const matchSearch = !t || p.name?.toLowerCase().includes(t) ||
        p.category?.toLowerCase().includes(t) || p.sku?.toLowerCase().includes(t);
      const matchStatus = !this.filterStatus || p.stockStatus === this.filterStatus;
      const matchCat = !this.filterCategory || p.category === this.filterCategory;
      return matchSearch && matchStatus && matchCat;
    });
  }

  openAdd() {
    this.isEditing = false;
    this.form = {
      name: '', sku: '', price: null, category: '', unit: '',
      currentStock: 0, reorderLevel: 10, reorderQuantity: 50,
      vendorId: null, description: '', isPerishable: false
    };
    this.modalError = '';
    this.showModal = true;
  }

  openEdit(p: any) {
    this.isEditing = true;
    this.editId = p.id;
    this.form = {
      name: p.name, sku: p.sku || '', price: p.price,
      category: p.category || '', unit: p.unit || '',
      currentStock: p.currentStock, reorderLevel: p.reorderLevel,
      reorderQuantity: p.reorderQuantity, vendorId: p.vendorId || null,
      description: p.description || '', isPerishable: p.isPerishable || false
    };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.modalError = ''; }

  save() {
    if (!this.form.name?.trim()) { this.modalError = 'Product name is required.'; return; }
    this.loading = true;
    const call = this.isEditing
      ? this.productService.updateProduct(this.editId!, this.form)
      : this.productService.addProduct(this.form);
    call.subscribe({
      next: () => {
        this.showModal = false;
        this.loading = false;
        this.successMsg = this.isEditing ? 'Product updated!' : 'Product added!';
        this.load();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.error || '';
        this.modalError = msg || 'Operation failed. Please try again.';
        console.error('Save product error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => { this.showToast('Product deleted.'); this.load(); },
      error: () => this.showToast('Delete failed.')
    });
  }

  showToast(msg: string) {
    this.toast = msg;
    setTimeout(() => { this.toast = ''; this.cdr.detectChanges(); }, 3000);
  }
}
