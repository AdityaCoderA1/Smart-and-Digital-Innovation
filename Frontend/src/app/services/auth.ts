import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, userData);
  }

  logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userProfile');
  }

  getToken() {
    return localStorage.getItem('userToken');
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}
