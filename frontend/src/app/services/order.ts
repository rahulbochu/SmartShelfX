import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/purchase-orders';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // Backend returns Page<> so extract content array
  getAllOrders(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}?page=0&size=100`, { headers: this.getHeaders() })
      .pipe(map(data => {
        if (Array.isArray(data)) return data;
        if (data?.content) return data.content;
        return [];
      }));
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createOrder(order: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, order, { headers: this.getHeaders() });
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status?status=${status}`, {}, { headers: this.getHeaders() });
  }

  cancelOrder(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getHeaders() });
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getHeaders() });
  }

  updateOrder(id: number, order: any): Observable<any> {
    // No update endpoint exists — use status update
    return this.updateOrderStatus(id, order.status);
  }
}
