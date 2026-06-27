import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import type { Source } from '../models/source.model';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private readonly api = inject(ApiService);

  analyzeText(content: string, mode: string, length: string): Promise<Source> {
    return this.api.post<Source>('/analysis/text', { content, mode, length });
  }

  analyzeUrl(url: string, mode: string, length: string): Promise<Source> {
    return this.api.post<Source>('/analysis/url', { url, mode, length });
  }
}
