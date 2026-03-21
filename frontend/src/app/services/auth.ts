import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<string> {
    return this.http.post(this.apiUrl + '/login',
      { email, password },
      { responseType: 'text' }
    );
  }

  register(username: string, email: string, password: string, role: string): Observable<string> {
    return this.http.post(this.apiUrl + '/register',
      { username, email, password, role },
      { responseType: 'text' }
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
