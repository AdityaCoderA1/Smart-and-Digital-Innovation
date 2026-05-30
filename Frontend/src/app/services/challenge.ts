import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

const BASE_URL = 'http://localhost:5000/api/challenges';

@Injectable({
  providedIn: 'root',
})
export class Challenge {
  constructor(private http: HttpClient, private authService: Auth) {}

  // ── Get All Challenges ────────────────────────────────────────────────────
  getChallenges(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}`);
  }

  // ── Update User Progress ──────────────────────────────────────────────────
  updateProgress(challengeId: string): Observable<any> {
    return this.http.post(
      `${BASE_URL}/progress`,
      { challengeId },
      { headers: this.authService.getAuthHeaders() }
    );
  }
}
