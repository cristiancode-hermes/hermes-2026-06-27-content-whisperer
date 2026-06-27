import type { Summary } from './source.model';

export interface SearchResult {
  id: number;
  title: string;
  rawContent: string;
  sourceType: string;
  summary?: Summary;
}
