import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private apiUrl = 'http://localhost:8080/api/vendors';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getAllSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addSupplier(supplier: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, supplier, { headers: this.getHeaders() });
  }

  updateSupplier(id: number, supplier: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, supplier, { headers: this.getHeaders() });
  }

  deleteSupplier(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
