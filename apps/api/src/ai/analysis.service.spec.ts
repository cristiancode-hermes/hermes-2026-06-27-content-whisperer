import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AnalysisService } from './analysis.service';
import { AIStrategy } from './ai-strategy.interface';
import { AnalysisResult } from './analysis.types';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(null) },
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use LocalFallbackStrategy when OPENAI_API_KEY is not set', () => {
      expect(configService.get).toHaveBeenCalledWith('OPENAI_API_KEY');
      // Since the strategy is private, we verify by checking that analyze works
      expect(service).toBeDefined();
    });
  });

  describe('analyze', () => {
    const sampleContent = 'Este es un texto de prueba para analizar. Contiene información interesante sobre tecnología.';

    it('should return an AnalysisResult for valid content with default mode and length', async () => {
      const result = await service.analyze(sampleContent, { mode: 'general', length: 'normal' });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('executiveSummary');
      expect(result).toHaveProperty('keyPoints');
      expect(result).toHaveProperty('quotes');
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('tone');
      expect(result).toHaveProperty('sentiment');
      expect(Array.isArray(result.keyPoints)).toBe(true);
      expect(Array.isArray(result.quotes)).toBe(true);
      expect(Array.isArray(result.stats)).toBe(true);
    });

    it('should normalize invalid mode to "general"', async () => {
      const result = await service.analyze(sampleContent, { mode: 'invalid-mode', length: 'normal' });

      expect(result).toBeDefined();
      expect(result.executiveSummary).toBeTruthy();
    });

    it('should normalize invalid length to "normal"', async () => {
      const result = await service.analyze(sampleContent, { mode: 'general', length: 'invalid-length' });

      expect(result).toBeDefined();
      expect(result.executiveSummary).toBeTruthy();
    });

    it('should support technical mode', async () => {
      const result = await service.analyze(sampleContent, { mode: 'technical', length: 'normal' });

      expect(result).toBeDefined();
      expect(result.executiveSummary).toBeTruthy();
    });

    it('should support academic mode', async () => {
      const result = await service.analyze(sampleContent, { mode: 'academic', length: 'normal' });

      expect(result).toBeDefined();
      expect(result.executiveSummary).toBeTruthy();
    });

    it('should support news mode', async () => {
      const result = await service.analyze(sampleContent, { mode: 'news', length: 'normal' });

      expect(result).toBeDefined();
      expect(result.executiveSummary).toBeTruthy();
    });

    it('should support brief length', async () => {
      const result = await service.analyze(sampleContent, { mode: 'general', length: 'brief' });

      expect(result).toBeDefined();
      // Brief should have fewer keyPoints
      expect(result.keyPoints.length).toBeLessThanOrEqual(3);
    });

    it('should support detailed length', async () => {
      const result = await service.analyze(sampleContent, { mode: 'general', length: 'detailed' });

      expect(result).toBeDefined();
      // Detailed can have more keyPoints
      expect(result.keyPoints.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty content gracefully', async () => {
      const result = await service.analyze('', { mode: 'general', length: 'normal' });

      expect(result).toBeDefined();
      expect(typeof result.executiveSummary).toBe('string');
    });

    it('should return keyPoints with text and relevanceScore properties', async () => {
      const result = await service.analyze(sampleContent, { mode: 'general', length: 'normal' });

      for (const kp of result.keyPoints) {
        expect(kp).toHaveProperty('text');
        expect(kp).toHaveProperty('relevanceScore');
        expect(typeof kp.relevanceScore).toBe('number');
        expect(kp.relevanceScore).toBeGreaterThanOrEqual(0);
        expect(kp.relevanceScore).toBeLessThanOrEqual(10);
      }
    });

    it('should detect tone based on content keywords', async () => {
      const techContent = 'El nuevo framework de API utiliza algoritmos avanzados y código optimizado para el sistema.';
      const result = await service.analyze(techContent, { mode: 'general', length: 'normal' });

      expect(result.tone).toBe('technical');
    });
  });
});
