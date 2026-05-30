import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

const BASE_URL = 'http://localhost:5000/api/users';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  constructor(private http: HttpClient, private authService: Auth) {}

  // ── Get Logged-In User Profile ────────────────────────────────────────────
  getProfile(): Observable<any> {
    return this.http.get(`${BASE_URL}/profile`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  // ── Get Top 10 Leaderboard ────────────────────────────────────────────────
  getLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}/leaderboard`);
  }
}
