import type { Source } from './source.model';

export interface Collection {
  id: number;
  userId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { sources: number };
  sources?: Source[];
}
