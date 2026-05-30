import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:5000/api/auth';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private http: HttpClient) {}

  // ── Register ──────────────────────────────────────────────────────────────
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${BASE_URL}/register`, { username, email, password });
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${BASE_URL}/login`, { email, password });
  }

  // ── Token Helpers ─────────────────────────────────────────────────────────
  saveToken(token: string): void {
    localStorage.setItem('gl_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('gl_token');
  }

  saveUser(user: any): void {
    localStorage.setItem('gl_user', JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem('gl_user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('gl_token');
    localStorage.removeItem('gl_user');
  }

  // ── Auth Header Helper ────────────────────────────────────────────────────
  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
  }
}
