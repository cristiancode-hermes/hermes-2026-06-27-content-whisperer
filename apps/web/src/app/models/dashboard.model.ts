export interface DashboardStats {
  totalSources: number;
  totalCollections: number;
  totalQuotes: number;
  activeModes: number;
  modeDistribution: { mode: string; count: string }[];
  monthlyActivity: { month: string; count: string }[];
}

export interface WordCount {
  word: string;
  count: number;
}
