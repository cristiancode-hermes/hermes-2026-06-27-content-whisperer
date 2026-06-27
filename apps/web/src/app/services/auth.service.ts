import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import type { User } from '../models/user.model';
import type { AuthResponse } from '../models/auth.model';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(this.loadUser());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  private loadUser(): User | null {
    const stored = localStorage.getItem('cw_user');
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        localStorage.removeItem('cw_user');
      }
    }
    return null;
  }

  async login(email: string, password: string): Promise<void> {
    const res = await this.api.post<AuthResponse>('/auth/login', { email, password });
    this.setSession(res);
  }

  async register(name: string, email: string, password: string): Promise<void> {
    const res = await this.api.post<AuthResponse>('/auth/register', { name, email, password });
    this.setSession(res);
  }

  logout(): void {
    localStorage.removeItem('cw_token');
    localStorage.removeItem('cw_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('cw_token', res.token);
    localStorage.setItem('cw_user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }
}
