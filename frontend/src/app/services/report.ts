import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getInventorySummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inventory-summary`, { headers: this.getHeaders() });
  }

  getStockMovement(from: string, to: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock-movement?from=${from}&to=${to}`, { headers: this.getHeaders() });
  }

  getTopProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-products`, { headers: this.getHeaders() });
  }

  getLowStockReport(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/low-stock`, { headers: this.getHeaders() });
  }

  getOrderStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/order-stats`, { headers: this.getHeaders() });
  }
}
