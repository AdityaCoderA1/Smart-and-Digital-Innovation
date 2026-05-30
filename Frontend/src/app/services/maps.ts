import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:5000/api/centers';

@Injectable({
  providedIn: 'root',
})
export class Maps {
  constructor(private http: HttpClient) {}

  // ── Get All Recycling Centers ─────────────────────────────────────────────
  getRecyclingCenters(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE_URL}`);
  }
}
