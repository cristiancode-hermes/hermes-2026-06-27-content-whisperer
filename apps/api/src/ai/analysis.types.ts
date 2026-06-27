export interface AnalysisResult {
  executiveSummary: string;
  keyPoints: { text: string; relevanceScore: number }[];
  quotes: { text: string; attribution?: string; context?: string }[];
  stats: { label: string; value: string; context?: string }[];
  tone?: string;
  sentiment?: string;
  tags?: string[];
}

export interface AnalysisConfig {
  mode: 'general' | 'technical' | 'academic' | 'news';
  length: 'brief' | 'normal' | 'detailed';
}
