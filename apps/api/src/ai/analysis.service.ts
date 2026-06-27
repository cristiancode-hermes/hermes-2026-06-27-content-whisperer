import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIStrategy } from './ai-strategy.interface';
import { LocalFallbackStrategy } from './local-fallback.strategy';
import { AnalysisConfig } from './analysis.types';
// import { OpenAIStrategy } from './openai.strategy';

@Injectable()
export class AnalysisService {
  private strategy: AIStrategy;

  constructor(configService: ConfigService) {
    const apiKey = configService.get<string>('OPENAI_API_KEY');
    // if (apiKey) {
    //   this.strategy = new OpenAIStrategy(apiKey);
    // } else {
    this.strategy = new LocalFallbackStrategy();
    // }
  }

  async analyze(content: string, config: { mode: string; length: string }) {
    const analysisConfig = {
      mode: (['general', 'technical', 'academic', 'news'].includes(config.mode)
        ? config.mode
        : 'general') as AnalysisConfig['mode'],
      length: (['brief', 'normal', 'detailed'].includes(config.length)
        ? config.length
        : 'normal') as AnalysisConfig['length'],
    };
    return this.strategy.analyze(content, analysisConfig);
  }
}
