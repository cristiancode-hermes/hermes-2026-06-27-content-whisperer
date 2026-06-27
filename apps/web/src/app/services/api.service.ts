import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = 'http://localhost:3000/api';

  protected buildHeaders(extra?: Record<string, string>): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('cw_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        headers = headers.set(key, value);
      }
    }
    return headers;
  }

  protected buildParams(params?: Record<string, string | number | boolean | undefined>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return httpParams;
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return lastValueFrom(
      this.http.get<T>(`${this.baseUrl}${path}`, {
        headers: this.buildHeaders(),
        params: this.buildParams(params),
      })
    );
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return lastValueFrom(
      this.http.post<T>(`${this.baseUrl}${path}`, body ?? {}, {
        headers: this.buildHeaders(),
      })
    );
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return lastValueFrom(
      this.http.patch<T>(`${this.baseUrl}${path}`, body ?? {}, {
        headers: this.buildHeaders(),
      })
    );
  }

  async delete<T>(path: string): Promise<T> {
    return lastValueFrom(
      this.http.delete<T>(`${this.baseUrl}${path}`, {
        headers: this.buildHeaders(),
      })
    );
  }
}
