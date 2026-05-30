import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

const BASE_URL = 'http://localhost:5000/api/uploads';

@Injectable({
  providedIn: 'root',
})
export class Waste {
  constructor(private http: HttpClient, private authService: Auth) {}

  // ── Upload Waste Image ────────────────────────────────────────────────────
  // formData must contain: image (File), type (string), weight (number)
  uploadWaste(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
      // NOTE: Do NOT set Content-Type here; browser sets it automatically for multipart
    });
    return this.http.post(`${BASE_URL}`, formData, { headers });
  }
}
