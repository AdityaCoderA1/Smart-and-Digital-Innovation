import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class Challenge {
  private apiUrl = 'http://localhost:5000/api/challenges';

  constructor(private http: HttpClient, private auth: Auth) {}

  getChallenges(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateProgress(challengeId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });
    return this.http.post(`${this.apiUrl}/progress`, { challengeId }, { headers });
  }
}
