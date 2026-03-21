import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SupplierService } from '../../services/supplier';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../../shared/sidebar';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, SidebarComponent],
  styles: [`
    .app-layout { display:flex; min-height:100vh; background:#0f172a; color:#e2e8f0; font-family:'Segoe UI',sans-serif; }
    .main-content { margin-left:240px; flex:1; padding:32px; min-height:100vh; }
    .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; }
    .page-header h2 { font-size:24px; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
    .page-header p { font-size:14px; color:#64748b; margin:0; }
    .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
    .search-box { display:flex; align-items:center; gap:8px; background:#1e293b; border:1px solid #334155; border-radius:8px; padding:8px 14px; flex:1; max-width:400px; }
    .search-box mat-icon { color:#64748b; font-size:18px; }
    .search-box input { background:none; border:none; outline:none; color:#e2e8f0; font-size:14px; width:100%; }
    .search-box input::placeholder { color:#475569; }
    .count-badge { background:#1e293b; border:1px solid #334155; border-radius:20px; padding:6px 14px; font-size:13px; color:#94a3b8; white-space:nowrap; }
    .data-table-wrap { background:#1e293b; border:1px solid #334155; border-radius:12px; overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:#162032; }
    th { padding:12px 16px; text-align:left; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.5px; border-bottom:1px solid #334155; }
    td { padding:13px 16px; font-size:14px; color:#cbd5e1; border-bottom:1px solid #1e293b; }
    tbody tr:last-child td { border-bottom:none; }
    tbody tr:hover { background:#253347; }
    .action-btns { display:flex; gap:4px; }
    .btn-primary { display:flex; align-items:center; gap:6px; background:#1d4ed8; color:#fff; border:none; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; transition:background .2s; }
    .btn-primary:hover { background:#2563eb; }
    .btn-primary:disabled { background:#334155; color:#64748b; cursor:not-allowed; }
    .btn-secondary { background:#1e293b; color:#94a3b8; border:1px solid #334155; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-secondary:hover { background:#334155; color:#e2e8f0; }
    .btn-icon { background:none; border:none; cursor:pointer; padding:6px; border-radius:6px; display:flex; align-items:center; color:#64748b; transition:all .2s; }
    .btn-icon.edit:hover { background:#1d4ed820; color:#4f8ef7; }
    .btn-icon.delete:hover { background:#ef444420; color:#ef4444; }
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
    .form-group input { background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 12px; color:#e2e8f0; font-size:14px; outline:none; transition:border-color .2s; width:100%; box-sizing:border-box; }
    .form-group input:focus { border-color:#4f8ef7; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  `],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <div class="page-header">
          <div>
            <h2>Supplier Management</h2>
            <p>Manage your suppliers and vendor contacts</p>
          </div>
          <button class="btn-primary" (click)="openAdd()"><mat-icon>add</mat-icon> Add Supplier</button>
        </div>

        <div class="alert-success" *ngIf="successMsg">{{ successMsg }}</div>
        <div class="alert-error" *ngIf="errorMsg && !showModal">{{ errorMsg }}</div>

        <div class="toolbar">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search suppliers..." [(ngModel)]="searchTerm" (input)="search()" />
          </div>
          <span class="count-badge">{{ filtered.length }} suppliers</span>
        </div>

        <div class="data-table-wrap" *ngIf="!loading && filtered.length > 0">
          <table>
            <thead>
              <tr><th>Name</th><th>Contact Person</th><th>Email</th><th>PhoneNumber</th><th>Address</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of filtered">
                <td><strong>{{ s.name }}</strong></td>
                <td>{{ s.contactPerson || '—' }}</td>
                <td>{{ s.email }}</td>
                <td>{{ s.phoneNumber || '—' }}</td>
                <td>{{ s.address || '—' }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn-icon edit" (click)="openEdit(s)"><mat-icon>edit</mat-icon></button>
                    <button class="btn-icon delete" (click)="delete(s.id)"><mat-icon>delete</mat-icon></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" *ngIf="!loading && filtered.length === 0"><mat-icon>local_shipping</mat-icon><p>No suppliers found.</p></div>
        <div class="loading-state" *ngIf="loading"><div class="spinner"></div><p>Loading...</p></div>
      </main>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Supplier' : 'Add Supplier' }}</h3>
          <button class="btn-icon" (click)="closeModal()"><mat-icon>close</mat-icon></button>
        </div>
        <div class="modal-body">
          <div class="alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>
          <div class="form-group"><label>Supplier Name *</label><input type="text" [(ngModel)]="form.name" placeholder="e.g. Acme Corp" /></div>
          <div class="form-group"><label>Contact Person</label><input type="text" [(ngModel)]="form.contactPerson" placeholder="e.g. John Doe" /></div>
          <div class="form-row">
            <div class="form-group"><label>Email *</label><input type="email" [(ngModel)]="form.email" placeholder="supplier@example.com" /></div>
            <div class="form-group"><label>PhoneNumber</label><input type="text" [(ngModel)]="form.phoneNumber" placeholder="+91 9999999999" /></div>
          </div>
          <div class="form-group"><label>Address</label><input type="text" [(ngModel)]="form.address" placeholder="Street, City, Country" /></div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeModal()">Cancel</button>
          <button class="btn-primary" (click)="save()" [disabled]="loading">{{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Add Supplier') }}</button>
        </div>
      </div>
    </div>
  `
})
export class SuppliersComponent implements OnInit {
  suppliers: any[] = []; filtered: any[] = []; searchTerm = ''; showModal = false; isEditing = false;
  loading = false; errorMsg = ''; successMsg = ''; form: any = { name: '', email: '', phoneNumber: '', address: '', contactPerson: '' }; editingId: number | null = null;

  constructor(private supplierService: SupplierService, private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadSuppliers(); }

  loadSuppliers() {
    this.loading = true;
    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => { this.suppliers = data; this.filtered = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load suppliers.'; this.cdr.detectChanges(); }
    });
  }

  search() {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.suppliers.filter(s => s.name?.toLowerCase().includes(t) || s.email?.toLowerCase().includes(t) || s.contactPerson?.toLowerCase().includes(t));
  }

  openAdd() { this.isEditing = false; this.form = { name: '', email: '', phoneNumber: '', address: '', contactPerson: '' }; this.editingId = null; this.showModal = true; }
  openEdit(s: any) { this.isEditing = true; this.editingId = s.id; this.form = { name: s.name, email: s.email, phoneNumber: s.phone, address: s.address, contactPerson: s.contactPerson }; this.showModal = true; }
  closeModal() { this.showModal = false; this.errorMsg = ''; }

  save() {
    if (!this.form.name || !this.form.email) { this.errorMsg = 'Name and email are required.'; return; }
    this.loading = true;
    const call = this.isEditing ? this.supplierService.updateSupplier(this.editingId!, this.form) : this.supplierService.addSupplier(this.form);
    call.subscribe({
      next: () => { this.successMsg = this.isEditing ? 'Supplier updated!' : 'Supplier added!'; this.showModal = false; this.loadSuppliers(); setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000); },
      error: () => { this.loading = false; this.errorMsg = 'Operation failed.'; this.cdr.detectChanges(); }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this supplier?')) return;
    this.supplierService.deleteSupplier(id).subscribe({
      next: () => { this.successMsg = 'Supplier deleted.'; this.loadSuppliers(); setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 3000); },
      error: () => { this.errorMsg = 'Delete failed.'; this.cdr.detectChanges(); }
    });
  }
}
