import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { StockService } from '../../services/stock';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-stock-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, SidebarComponent],
  styles: [`
    .app-layout { display:flex; min-height:100vh; background:#0f172a; color:#e2e8f0; font-family:'Segoe UI',sans-serif; }
    .main-content { margin-left:240px; flex:1; padding:32px; min-height:100vh; }
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; }
    .page-header h2 { font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
    .page-header p { font-size:14px; color:#64748b; margin:0; }
    .header-actions { display:flex; gap:10px; }

    /* TAB BAR */
    .tab-bar { display:flex; gap:8px; margin-bottom:24px; border-bottom:1px solid #334155; padding-bottom:0; }
    .tab { padding:10px 20px; font-size:14px; font-weight:500; color:#64748b; cursor:pointer; border-bottom:2px solid transparent; transition:all .2s; background:none; border-top:none; border-left:none; border-right:none; }
    .tab:hover { color:#e2e8f0; }
    .tab.active { color:#4f8ef7; border-bottom-color:#4f8ef7; }

    /* STOCK LEVEL CARDS */
    .stock-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; margin-bottom:24px; }
    .stock-card { background:#1e293b; border:1px solid #334155; border-radius:10px; padding:16px; }
    .stock-card .product-name { font-size:13px; font-weight:600; color:#f1f5f9; margin-bottom:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .stock-card .product-category { font-size:11px; color:#64748b; margin-bottom:10px; }
    .stock-card .stock-level { display:flex; align-items:center; justify-content:space-between; }
    .stock-card .stock-num { font-size:22px; font-weight:700; }
    .stock-card .stock-label { font-size:11px; color:#64748b; }
    .stock-bar { height:4px; background:#334155; border-radius:2px; margin-top:10px; overflow:hidden; }
    .stock-bar-fill { height:100%; border-radius:2px; transition:width .4s; }

    /* FORMS */
    .form-card { background:#1e293b; border:1px solid #334155; border-radius:12px; padding:24px; margin-bottom:24px; }
    .form-card h3 { font-size:16px; font-weight:600; color:#f1f5f9; margin:0 0 20px; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
    .form-field { display:flex; flex-direction:column; gap:6px; }
    .form-field label { font-size:13px; color:#94a3b8; font-weight:500; }
    .form-field input, .form-field select, .form-field textarea {
      background:#0f172a; border:1px solid #334155; border-radius:8px;
      padding:10px 12px; color:#e2e8f0; font-size:14px; outline:none;
      transition:border-color .2s; width:100%; box-sizing:border-box;
    }
    .form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color:#4f8ef7; }
    .form-field select option { background:#1e293b; }
    .form-field textarea { resize:vertical; min-height:70px; }
    .form-full { grid-column:1/-1; }
    .type-toggle { display:flex; gap:8px; }
    .type-btn { flex:1; padding:10px; border-radius:8px; border:1px solid #334155; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; background:#0f172a; color:#64748b; }
    .type-btn.in.active { background:#22c55e20; border-color:#22c55e; color:#22c55e; }
    .type-btn.out.active { background:#ef444420; border-color:#ef4444; color:#ef4444; }

    /* TABLE */
    .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
    .search-box { display:flex; align-items:center; gap:8px; background:#1e293b; border:1px solid #334155; border-radius:8px; padding:8px 14px; flex:1; max-width:360px; }
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
    .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; text-transform:uppercase; }
    .badge-in { background:#22c55e20; color:#22c55e; border:1px solid #22c55e40; }
    .badge-out { background:#ef444420; color:#ef4444; border:1px solid #ef444440; }
    .badge-low { background:#f9731620; color:#f97316; border:1px solid #f9731640; }

    /* BUTTONS */
    .btn-primary { display:flex; align-items:center; gap:6px; background:#1d4ed8; color:#fff; border:none; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; transition:background .2s; }
    .btn-primary:hover { background:#2563eb; }
    .btn-primary:disabled { background:#334155; color:#64748b; cursor:not-allowed; }
    .btn-success { display:flex; align-items:center; gap:6px; background:#16a34a; color:#fff; border:none; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-success:hover { background:#15803d; }
    .btn-danger { display:flex; align-items:center; gap:6px; background:#dc2626; color:#fff; border:none; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-danger:hover { background:#b91c1c; }
    .btn-secondary { background:#1e293b; color:#94a3b8; border:1px solid #334155; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-secondary:hover { background:#334155; color:#e2e8f0; }
    .btn-icon { background:none; border:none; cursor:pointer; padding:6px; border-radius:6px; display:flex; align-items:center; color:#64748b; transition:all .2s; }
    .btn-icon.delete:hover { background:#ef444420; color:#ef4444; }
    .btn-row { display:flex; gap:10px; }

    /* ALERTS */
    .alert-success { background:#052e16; border:1px solid #166534; color:#4ade80; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }
    .alert-error { background:#450a0a; border:1px solid #991b1b; color:#fca5a5; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px; }

    /* MODAL */
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:200; display:flex; align-items:center; justify-content:center; }
    .modal { background:#1e293b; border:1px solid #334155; border-radius:14px; width:540px; max-width:95vw; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.5); }
    .modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #334155; }
    .modal-header h3 { margin:0; font-size:17px; font-weight:700; color:#f1f5f9; }
    .modal-body { padding:24px; display:flex; flex-direction:column; gap:16px; }
    .modal-footer { padding:16px 24px; border-top:1px solid #334155; display:flex; justify-content:flex-end; gap:10px; }

    /* SNACK */
    .snack { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#1e293b; border:1px solid #334155; color:#e2e8f0; padding:12px 24px; border-radius:10px; font-size:14px; z-index:999; box-shadow:0 8px 24px rgba(0,0,0,.4); }

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
          <div>
            <h2>Stock Transactions</h2>
            <p>Record inventory movements and manage products</p>
          </div>
          <div class="header-actions">
            <button class="btn-success" (click)="openAddProduct()"><mat-icon>add_box</mat-icon> Add Product</button>
            <button class="btn-primary" (click)="activeTab='transaction'; showTransactionForm=true"><mat-icon>swap_horiz</mat-icon> Record Transaction</button>
          </div>
        </div>

        <div class="alert-success" *ngIf="successMsg">{{ successMsg }}</div>
        <div class="alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

        <!-- TAB BAR -->
        <div class="tab-bar">
          <button class="tab" [class.active]="activeTab==='history'" (click)="activeTab='history'; showTransactionForm=false">Transaction History</button>
          <button class="tab" [class.active]="activeTab==='stock'" (click)="activeTab='stock'">Current Stock Levels</button>
          <button class="tab" [class.active]="activeTab==='transaction'" (click)="activeTab='transaction'; showTransactionForm=true">Record Transaction</button>
        </div>

        <!-- TRANSACTION FORM -->
        <div class="form-card" *ngIf="activeTab==='transaction'">
          <h3>Record Stock Movement</h3>
          <div class="form-grid">
            <div class="form-field">
              <label>Transaction Type</label>
              <div class="type-toggle">
                <button class="type-btn in" [class.active]="txForm.type==='IN'" (click)="txForm.type='IN'"><mat-icon>arrow_downward</mat-icon> Stock IN</button>
                <button class="type-btn out" [class.active]="txForm.type==='OUT'" (click)="txForm.type='OUT'"><mat-icon>arrow_upward</mat-icon> Stock OUT</button>
              </div>
            </div>
            <div class="form-field">
              <label>Product *</label>
              <select [(ngModel)]="txForm.productId">
                <option [value]="null" disabled>Select product...</option>
                <option *ngFor="let p of products" [value]="p.id">{{ p.name }} (Stock: {{ p.currentStock }})</option>
              </select>
            </div>
            <div class="form-field">
              <label>Quantity *</label>
              <input type="number" [(ngModel)]="txForm.quantity" placeholder="0" min="1" />
            </div>
            <div class="form-field">
              <label>Handled By</label>
              <select [(ngModel)]="txForm.handledById">
                <option [value]="null" disabled>Select user...</option>
                <option *ngFor="let u of users" [value]="u.id">{{ u.name || u.username }}</option>
              </select>
            </div>
            <div class="form-field form-full">
              <label>Notes</label>
              <textarea [(ngModel)]="txForm.notes" placeholder="Optional reason or notes..."></textarea>
            </div>
          </div>
          <div class="btn-row">
            <button class="btn-primary" (click)="saveTransaction()" [disabled]="loading">
              {{ loading ? 'Saving...' : 'Save Transaction' }}
            </button>
            <button class="btn-secondary" (click)="activeTab='history'; showTransactionForm=false">Cancel</button>
          </div>
        </div>

        <!-- CURRENT STOCK LEVELS -->
        <ng-container *ngIf="activeTab==='stock'">
          <div class="toolbar">
            <div class="search-box">
              <mat-icon>search</mat-icon>
              <input type="text" placeholder="Search products..." [(ngModel)]="stockSearch" (input)="filterStock()" />
            </div>
          </div>
          <div class="stock-grid">
            <div class="stock-card" *ngFor="let p of filteredProducts">
              <div class="product-name" title="{{ p.name }}">{{ p.name }}</div>
              <div class="product-category">{{ p.category || 'Uncategorized' }}</div>
              <div class="stock-level">
                <div>
                  <div class="stock-num" [style.color]="getStockColor(p)">{{ p.currentStock }}</div>
                  <div class="stock-label">units in stock</div>
                </div>
                <span class="badge badge-low" *ngIf="p.currentStock <= p.reorderLevel">LOW</span>
              </div>
              <div class="stock-bar">
                <div class="stock-bar-fill" [style.width]="getStockPct(p) + '%'" [style.background]="getStockColor(p)"></div>
              </div>
              <div style="display:flex;gap:6px;margin-top:12px">
                <button class="btn-icon" style="flex:1;justify-content:center;background:#22c55e20;color:#22c55e;border-radius:6px;padding:6px"
                  (click)="quickTransaction(p, 'IN')" title="Add stock">
                  <mat-icon>add</mat-icon>
                </button>
                <button class="btn-icon" style="flex:1;justify-content:center;background:#ef444420;color:#ef4444;border-radius:6px;padding:6px"
                  (click)="quickTransaction(p, 'OUT')" title="Remove stock">
                  <mat-icon>remove</mat-icon>
                </button>
                <button class="btn-icon delete" style="flex:1;justify-content:center;border-radius:6px;padding:6px"
                  (click)="deleteProduct(p.id)" title="Delete product">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
          <div class="empty-state" *ngIf="filteredProducts.length === 0">
            <mat-icon>inventory_2</mat-icon><p>No products found.</p>
          </div>
        </ng-container>

        <!-- TRANSACTION HISTORY -->
        <ng-container *ngIf="activeTab==='history'">
          <div class="toolbar">
            <div class="search-box">
              <mat-icon>search</mat-icon>
              <input type="text" placeholder="Search transactions..." [(ngModel)]="txSearch" (input)="filterTransactions()" />
            </div>
          </div>
          <div class="data-table-wrap">
            <table>
              <thead>
                <tr><th>Product</th><th>Type</th><th>Quantity</th><th>Handled By</th><th>Stock After</th><th>Notes</th><th>Date</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of filteredTransactions">
                  <td style="font-weight:600">{{ t.productName }}</td>
                  <td><span [class]="t.type === 'IN' ? 'badge badge-in' : 'badge badge-out'">{{ t.type }}</span></td>
                  <td>{{ t.quantity }}</td>
                  <td>{{ t.handledBy || '—' }}</td>
                  <td style="font-weight:600">{{ t.stockAfterTransaction }}</td>
                  <td style="color:#64748b;font-size:13px">{{ t.notes || '—' }}</td>
                  <td style="color:#94a3b8">{{ t.timestamp | date:'MMM d, y, h:mm a' }}</td>
                </tr>
                <tr *ngIf="filteredTransactions.length === 0">
                  <td colspan="7" style="text-align:center;color:#94a3b8;padding:40px">No transactions found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>

      </main>
    </div>

    <!-- ADD PRODUCT MODAL -->
    <div class="modal-overlay" *ngIf="showProductModal" (click)="closeProductModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Add New Product</h3>
          <button class="btn-icon" (click)="closeProductModal()"><mat-icon>close</mat-icon></button>
        </div>
        <div class="modal-body">
          <div class="alert-error" *ngIf="modalError">{{ modalError }}</div>
          <div class="form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="form-field">
              <label>Product Name *</label>
              <input type="text" [(ngModel)]="productForm.name" placeholder="e.g. Laptop" />
            </div>
            <div class="form-field">
              <label>Category</label>
              <input type="text" [(ngModel)]="productForm.category" placeholder="e.g. Electronics" />
            </div>
            <div class="form-field">
              <label>Initial Stock *</label>
              <input type="number" [(ngModel)]="productForm.currentStock" placeholder="0" min="0" />
            </div>
            <div class="form-field">
              <label>Reorder Level</label>
              <input type="number" [(ngModel)]="productForm.reorderLevel" placeholder="10" min="0" />
            </div>
            <div class="form-field">
              <label>Price</label>
              <input type="number" [(ngModel)]="productForm.price" placeholder="0.00" min="0" />
            </div>
            <div class="form-field">
              <label>Unit</label>
              <input type="text" [(ngModel)]="productForm.unit" placeholder="e.g. pcs, kg, litre" />
            </div>
            <div class="form-field" style="grid-column:1/-1">
              <label>Description</label>
              <textarea [(ngModel)]="productForm.description" placeholder="Optional description..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeProductModal()">Cancel</button>
          <button class="btn-success" (click)="saveProduct()" [disabled]="loading">
            {{ loading ? 'Adding...' : 'Add Product' }}
          </button>
        </div>
      </div>
    </div>

    <!-- QUICK TRANSACTION MODAL -->
    <div class="modal-overlay" *ngIf="showQuickModal" (click)="showQuickModal=false">
      <div class="modal" style="width:380px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ quickForm.type === 'IN' ? 'Add Stock' : 'Remove Stock' }} — {{ quickProduct?.name }}</h3>
          <button class="btn-icon" (click)="showQuickModal=false"><mat-icon>close</mat-icon></button>
        </div>
        <div class="modal-body">
          <div class="form-field">
            <label>Quantity *</label>
            <input type="number" [(ngModel)]="quickForm.quantity" placeholder="0" min="1" />
          </div>
          <div class="form-field">
            <label>Notes</label>
            <input type="text" [(ngModel)]="quickForm.notes" placeholder="Optional reason..." />
          </div>
          <div style="background:#0f172a;border-radius:8px;padding:12px;font-size:13px;color:#94a3b8">
            Current stock: <strong style="color:#e2e8f0">{{ quickProduct?.currentStock }}</strong> units
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="showQuickModal=false">Cancel</button>
          <button [class]="quickForm.type==='IN' ? 'btn-success' : 'btn-danger'" (click)="saveQuickTransaction()" [disabled]="loading">
            {{ loading ? 'Saving...' : (quickForm.type === 'IN' ? 'Add Stock' : 'Remove Stock') }}
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="toast" class="snack">{{ toast }}</div>
  `
})
export class StockTransactions implements OnInit {
  transactions: any[] = [];
  filteredTransactions: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  users: any[] = [];

  activeTab: 'history' | 'stock' | 'transaction' = 'history';
  showTransactionForm = false;
  showProductModal = false;
  showQuickModal = false;
  loading = false;
  toast = '';
  successMsg = '';
  errorMsg = '';
  modalError = '';
  txSearch = '';
  stockSearch = '';

  quickProduct: any = null;
  quickForm: any = { quantity: 1, type: 'IN', notes: '' };

  txForm: any = { productId: null, type: 'IN', quantity: 0, handledById: null, notes: '' };

  productForm: any = { name: '', category: '', currentStock: 0, reorderLevel: 10, price: 0, unit: '', description: '' };

  constructor(
    private stockService: StockService,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.stockService.getAllTransactions().subscribe({ next: d => { this.transactions = d; this.filteredTransactions = d; this.cdr.detectChanges(); } });
    this.productService.getAllProducts().subscribe({ next: d => { this.products = d; this.filteredProducts = d; this.cdr.detectChanges(); } });
    this.productService.getAllUsers().subscribe({ next: d => { this.users = d; this.cdr.detectChanges(); } });
  }

  filterTransactions() {
    const t = this.txSearch.toLowerCase();
    this.filteredTransactions = this.transactions.filter(tx =>
      tx.productName?.toLowerCase().includes(t) || tx.handledBy?.toLowerCase().includes(t) || tx.type?.toLowerCase().includes(t)
    );
  }

  filterStock() {
    const t = this.stockSearch.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.name?.toLowerCase().includes(t) || p.category?.toLowerCase().includes(t)
    );
  }

  // TRANSACTION
  saveTransaction() {
    if (!this.txForm.productId || !this.txForm.quantity) { this.errorMsg = 'Product and quantity are required.'; return; }
    this.loading = true;
    this.stockService.recordTransaction(this.txForm).subscribe({
      next: () => {
        this.showToast('✅ Transaction recorded!');
        this.txForm = { productId: null, type: 'IN', quantity: 0, handledById: null, notes: '' };
        this.activeTab = 'history';
        this.loading = false;
        this.loadAll();
      },
      error: () => { this.loading = false; this.showToast('❌ Transaction failed!'); this.cdr.detectChanges(); }
    });
  }

  // QUICK TRANSACTION from stock card
  quickTransaction(product: any, type: 'IN' | 'OUT') {
    this.quickProduct = product;
    this.quickForm = { quantity: 1, type, notes: '', productId: product.id };
    this.showQuickModal = true;
  }

  saveQuickTransaction() {
    if (!this.quickForm.quantity || this.quickForm.quantity < 1) { return; }
    this.loading = true;
    this.stockService.recordTransaction({
      productId: this.quickProduct.id,
      type: this.quickForm.type,
      quantity: this.quickForm.quantity,
      notes: this.quickForm.notes,
      handledById: null
    }).subscribe({
      next: () => {
        this.showQuickModal = false;
        this.loading = false;
        this.showToast(`✅ Stock ${this.quickForm.type === 'IN' ? 'added' : 'removed'} successfully!`);
        this.loadAll();
      },
      error: () => { this.loading = false; this.showToast('❌ Transaction failed!'); this.cdr.detectChanges(); }
    });
  }

  // ADD PRODUCT
  openAddProduct() {
    this.productForm = { name: '', category: '', currentStock: 0, reorderLevel: 10, price: 0, unit: '', description: '' };
    this.modalError = '';
    this.showProductModal = true;
  }

  closeProductModal() { this.showProductModal = false; this.modalError = ''; }

  saveProduct() {
    if (!this.productForm.name) { this.modalError = 'Product name is required.'; return; }
    this.loading = true;
    this.productService.addProduct(this.productForm).subscribe({
      next: () => {
        this.showProductModal = false;
        this.loading = false;
        this.successMsg = 'Product added successfully!';
        this.loadAll();
        setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => { this.loading = false; this.modalError = 'Failed to add product.'; this.cdr.detectChanges(); }
    });
  }

  // DELETE PRODUCT
  deleteProduct(id: number) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => { this.showToast('🗑️ Product deleted.'); this.loadAll(); },
      error: () => this.showToast('❌ Delete failed.')
    });
  }

  // HELPERS
  getStockColor(p: any): string {
    if (p.currentStock <= 0) return '#ef4444';
    if (p.currentStock <= p.reorderLevel) return '#f97316';
    return '#22c55e';
  }

  getStockPct(p: any): number {
    const max = Math.max(...this.products.map(x => x.currentStock || 0), 1);
    return Math.min(Math.round((p.currentStock / max) * 100), 100);
  }

  showToast(msg: string) { this.toast = msg; setTimeout(() => { this.toast = ''; this.cdr.detectChanges(); }, 3000); }
}
