import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // Returns Page<> — extract content
  getAllNotifications(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}?page=0&size=20`, { headers: this.getHeaders() })
      .pipe(map(data => {
        if (Array.isArray(data)) return data;
        if (data?.content) return data.content;
        return [];
      }));
  }

  getUnreadNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/unread`, { headers: this.getHeaders() });
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`, { headers: this.getHeaders() });
  }

  markAsRead(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/read`, {}, { headers: this.getHeaders() });
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/read-all`, {}, { headers: this.getHeaders() });
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
