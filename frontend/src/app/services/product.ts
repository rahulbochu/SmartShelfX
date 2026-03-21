import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';
  private usersUrl = 'http://localhost:8080/api/users';
  private vendorsUrl = 'http://localhost:8080/api/vendors';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // Handles both plain array [] and wrapped responses
  private toArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data?.content && Array.isArray(data.content)) return data.content;
    if (data?.products && Array.isArray(data.products)) return data.products;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  }

  getAllProducts(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(map(data => this.toArray(data)));
  }

  getLowStockProducts(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/low-stock`, { headers: this.getHeaders() })
      .pipe(map(data => this.toArray(data)));
  }

  addProduct(product: any): Observable<any> {
    // Clean up the request — remove empty/null fields that could cause issues
    const payload: any = {
      name: product.name,
      category: product.category || null,
      description: product.description || null,
      price: product.price ? Number(product.price) : null,
      currentStock: product.currentStock ? Number(product.currentStock) : 0,
      reorderLevel: product.reorderLevel ? Number(product.reorderLevel) : 10,
      reorderQuantity: product.reorderQuantity ? Number(product.reorderQuantity) : 50,
      isPerishable: product.isPerishable || false,
    };
    // Only include sku if provided
    if (product.sku && product.sku.trim()) payload.sku = product.sku.trim();
    // Only include vendorId if it's a valid number
    if (product.vendorId && product.vendorId !== 'null') payload.vendorId = Number(product.vendorId);
    // Only include unit if backend supports it
    if (product.unit) payload.unit = product.unit;

    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  updateProduct(id: number, product: any): Observable<any> {
    const payload: any = {
      name: product.name,
      category: product.category || null,
      description: product.description || null,
      price: product.price ? Number(product.price) : null,
      currentStock: product.currentStock ? Number(product.currentStock) : 0,
      reorderLevel: product.reorderLevel ? Number(product.reorderLevel) : 10,
      reorderQuantity: product.reorderQuantity ? Number(product.reorderQuantity) : 50,
      isPerishable: product.isPerishable || false,
    };
    if (product.sku && product.sku.trim()) payload.sku = product.sku.trim();
    if (product.vendorId && product.vendorId !== 'null') payload.vendorId = Number(product.vendorId);

    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any>(this.usersUrl, { headers: this.getHeaders() })
      .pipe(map(data => this.toArray(data)));
  }

  getAllVendors(): Observable<any[]> {
    return this.http.get<any>(this.vendorsUrl, { headers: this.getHeaders() })
      .pipe(map(data => this.toArray(data)));
  }
}
