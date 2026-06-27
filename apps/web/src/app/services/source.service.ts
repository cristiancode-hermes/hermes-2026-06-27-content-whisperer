import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import type { Source } from '../models/source.model';
import type { SearchResult } from '../models/search.model';

@Injectable({ providedIn: 'root' })
export class SourceService {
  private readonly api = inject(ApiService);

  findAll(params?: { page?: number; limit?: number; search?: string; sourceType?: string }): Promise<{ data: Source[]; total: number; page: number; limit: number }> {
    return this.api.get('/sources', params as Record<string, string | number | boolean | undefined>);
  }

  findOne(id: number): Promise<Source> {
    return this.api.get<Source>(`/sources/${id}`);
  }

  update(id: number, data: Partial<Source>): Promise<Source> {
    return this.api.patch<Source>(`/sources/${id}`, data);
  }

  remove(id: number): Promise<void> {
    return this.api.delete<void>(`/sources/${id}`);
  }

  search(query: string): Promise<SearchResult[]> {
    return this.api.get<SearchResult[]>('/sources/search', { q: query });
  }
}
