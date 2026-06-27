import { AnalysisResult, AnalysisConfig } from './analysis.types';

export interface AIStrategy {
  analyze(content: string, config: AnalysisConfig): Promise<AnalysisResult>;
}
