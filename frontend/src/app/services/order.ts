import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createOrder(order: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, order, { headers: this.getHeaders() });
  }

  updateOrder(id: number, order: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, order, { headers: this.getHeaders() });
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
