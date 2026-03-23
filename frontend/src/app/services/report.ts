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

  // Convert plain date string to ISO datetime string backend expects
  private toDateTime(date: string, endOfDay = false): string {
    return endOfDay ? `${date}T23:59:59` : `${date}T00:00:00`;
  }

  // GET /api/reports/dashboard
  getDashboardSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`, { headers: this.getHeaders() });
  }

  // GET /api/reports/stock-movement?from=...&to=...
  getStockMovement(from: string, to: string, productId?: number): Observable<any> {
    const fromDt = this.toDateTime(from);
    const toDt = this.toDateTime(to, true);
    let url = `${this.apiUrl}/stock-movement?from=${fromDt}&to=${toDt}`;
    if (productId) url += `&productId=${productId}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  // GET /api/reports/sales?from=...&to=...
  getSalesReport(from: string, to: string): Observable<any> {
    const fromDt = this.toDateTime(from);
    const toDt = this.toDateTime(to, true);
    return this.http.get<any>(`${this.apiUrl}/sales?from=${fromDt}&to=${toDt}`, { headers: this.getHeaders() });
  }

  // GET /api/reports/expiry
  getExpiryReport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/expiry`, { headers: this.getHeaders() });
  }

  // GET /api/reports/charts/stock-movement?days=30
  getStockMovementChart(days = 30): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/charts/stock-movement?days=${days}`, { headers: this.getHeaders() });
  }

  // GET /api/reports/charts/top-selling?days=30
  getTopSellingChart(days = 30): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/charts/top-selling?days=${days}`, { headers: this.getHeaders() });
  }

  // GET /api/reports/charts/stock-by-category
  getStockByCategoryChart(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/charts/stock-by-category`, { headers: this.getHeaders() });
  }
}
