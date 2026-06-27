export interface Source {
  id: number;
  userId: number;
  title: string;
  sourceType: 'text' | 'url';
  originalUrl?: string;
  rawContent: string;
  mode: string;
  notes?: string;
  analysisLength?: string;
  analyzedAt: string;
  createdAt: string;
  updatedAt: string;
  summary?: Summary;
  keyPoints?: KeyPoint[];
  quotes?: Quote[];
  stats?: Stat[];
  collections?: { id: number; name: string }[];
}

export interface Summary {
  id: number;
  sourceId: number;
  executiveSummary: string;
  tone?: string;
  sentiment?: string;
  createdAt: string;
}

export interface KeyPoint {
  id: number;
  sourceId: number;
  text: string;
  relevanceScore: number;
  sortOrder: number;
}

export interface Quote {
  id: number;
  sourceId: number;
  text: string;
  attribution?: string;
  context?: string;
  sortOrder: number;
}

export interface Stat {
  id: number;
  sourceId: number;
  label: string;
  value: string;
  context?: string;
  sortOrder: number;
}
