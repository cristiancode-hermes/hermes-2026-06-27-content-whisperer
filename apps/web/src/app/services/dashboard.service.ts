import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import type { DashboardStats, WordCount } from '../models/dashboard.model';
import type { Source } from '../models/source.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  getStats(): Promise<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats');
  }

  getRecent(): Promise<Source[]> {
    return this.api.get<Source[]>('/dashboard/recent');
  }

  getTopWords(): Promise<WordCount[]> {
    return this.api.get<WordCount[]>('/dashboard/top-words');
  }
}
