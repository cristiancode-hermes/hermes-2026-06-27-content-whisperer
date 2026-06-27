import { Injectable } from '@nestjs/common';
import { AIStrategy } from './ai-strategy.interface';
import { AnalysisResult, AnalysisConfig } from './analysis.types';

@Injectable()
export class LocalFallbackStrategy implements AIStrategy {
  async analyze(content: string, config: AnalysisConfig): Promise<AnalysisResult> {
    const cleanContent = content.trim();

    // --- Executive Summary ---
    const sentences = this.splitSentences(cleanContent);
    const summaryLength = config.length === 'brief' ? 3 : config.length === 'detailed' ? 8 : 5;
    const executiveSummary = sentences.slice(0, summaryLength).join(' ');

    // --- Key Points via TF-IDF-like scoring ---
    const keyPoints = this.extractKeyPoints(cleanContent, sentences, config.length);

    // --- Quote extraction ---
    const quotes = this.extractQuotes(cleanContent);

    // --- Stats extraction ---
    const stats = this.extractStats(cleanContent);

    // --- Tone & sentiment analysis ---
    const { tone, sentiment } = this.analyzeToneAndSentiment(cleanContent);

    return {
      executiveSummary,
      keyPoints,
      quotes,
      stats,
      tone,
      sentiment,
    };
  }

  private splitSentences(text: string): string[] {
    return text.split(/[.!?]+\s+/).filter(s => s.trim().length > 20);
  }

  private extractKeyPoints(content: string, sentences: string[], length: string): { text: string; relevanceScore: number }[] {
    // Simple term frequency scoring
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const freq = new Map<string, number>();
    for (const w of words) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }

    const scored = sentences.map(s => {
      const sWords = s.toLowerCase().split(/\s+/);
      const score = sWords.reduce((sum, w) => sum + (freq.get(w) || 0), 0) / sWords.length;
      return { text: s.trim(), score };
    });

    scored.sort((a, b) => b.score - a.score);

    const limit = length === 'brief' ? 3 : length === 'detailed' ? 7 : 5;
    return scored.slice(0, limit).map((s, i) => ({
      text: s.text,
      relevanceScore: Math.min(10, Math.round((s.score / (scored[0]?.score || 1)) * 10)),
    }));
  }

  private extractQuotes(content: string): { text: string; attribution?: string; context?: string }[] {
    const quotePatterns = [
      /[""]([^""]+)[""]\s*[—–-]\s*([^,\n]+)/g,
      /[""]([^""]+)[""]/g,
    ];

    const quotes: { text: string; attribution?: string }[] = [];
    const seen = new Set<string>();

    for (const pattern of quotePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (!seen.has(match[1])) {
          seen.add(match[1]);
          quotes.push({
            text: match[1],
            attribution: match[2]?.trim(),
          });
        }
      }
    }

    return quotes.slice(0, 5);
  }

  private extractStats(content: string): { label: string; value: string; context?: string }[] {
    const statPattern = /(\d+(?:[.,]\d+)?%?)\s*(?:de|del|de los)?\s*([^,.]+)/gi;
    const stats: { label: string; value: string; context?: string }[] = [];
    const seen = new Set<string>();

    let match;
    while ((match = statPattern.exec(content)) !== null) {
      const key = `${match[1]}-${match[2]}`;
      if (!seen.has(key)) {
        seen.add(key);
        stats.push({
          label: match[2].trim().substring(0, 100),
          value: match[1],
        });
      }
    }

    return stats.slice(0, 6);
  }

  private analyzeToneAndSentiment(content: string): { tone: string; sentiment: string } {
    const positiveWords = ['bueno', 'excelente', 'mejor', 'beneficio', 'éxito', 'mejora', 'innovador', 'eficaz'];
    const negativeWords = ['malo', 'problema', 'riesgo', 'peligro', 'dificultad', 'fracaso', 'limitación'];

    const lower = content.toLowerCase();
    let positive = 0, negative = 0;
    for (const w of positiveWords) {
      if (lower.includes(w)) positive++;
    }
    for (const w of negativeWords) {
      if (lower.includes(w)) negative++;
    }

    const sentiment = positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral';

    // Detect tone
    const techWords = ['algoritmo', 'framework', 'api', 'código', 'sistema', 'software', 'hardware', 'datos'];
    const academicWords = ['estudio', 'investigación', 'teoría', 'hipótesis', 'según', 'análisis', 'metodología'];
    const newsWords = ['última hora', 'noticia', 'informe', 'reporta', 'declaró', 'anunció'];

    let tech = 0, academic = 0, news = 0;
    for (const w of techWords) { if (lower.includes(w)) tech++; }
    for (const w of academicWords) { if (lower.includes(w)) academic++; }
    for (const w of newsWords) { if (lower.includes(w)) news++; }

    const tone = tech > academic && tech > news ? 'technical' :
                 academic > tech && academic > news ? 'academic' :
                 news > tech && news > academic ? 'journalistic' : 'general';

    return { tone, sentiment };
  }
}
