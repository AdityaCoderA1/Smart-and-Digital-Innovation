import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const AI_SERVICE_URL = 'http://localhost:8000/api/chat';

export interface ChatRequest {
  user_query: string;
}

export interface ChatResponse {
  user_query: string;
  detected_item: string;
  category: string;
  recyclable: boolean;
  disposal_method: string;
  environmental_impact: string;
  ai_response: string;
}

@Injectable({
  providedIn: 'root',
})
export class Chatbot {
  constructor(private http: HttpClient) {}

  // ── Send Message to AI Service ────────────────────────────────────────────
  chat(query: string): Observable<ChatResponse> {
    const body: ChatRequest = { user_query: query };
    return this.http.post<ChatResponse>(AI_SERVICE_URL, body);
  }
}
