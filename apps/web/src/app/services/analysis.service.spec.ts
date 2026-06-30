import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AnalysisService } from './analysis.service';
import type { Source } from '../models/source.model';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AnalysisService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('analyzeText', () => {
    it('should POST to /analysis/text', async () => {
      const mockSource: Source = {
        id: 1,
        userId: 1,
        title: 'Text Analysis Result',
        sourceType: 'text',
        rawContent: 'Test content',
        mode: 'summarize',
        analysisLength: 'medium',
        analyzedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const resultPromise = service.analyzeText('Sample text to analyze', 'summarize', 'medium');

      const req = httpTesting.expectOne('http://localhost:3000/api/analysis/text');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        content: 'Sample text to analyze',
        mode: 'summarize',
        length: 'medium',
      });
      req.flush(mockSource);

      const result = await resultPromise;
      expect(result).toEqual(mockSource);
    });
  });

  describe('analyzeUrl', () => {
    it('should POST to /analysis/url', async () => {
      const mockSource: Source = {
        id: 2,
        userId: 1,
        title: 'URL Analysis Result',
        sourceType: 'url',
        originalUrl: 'https://example.com',
        rawContent: 'URL content',
        mode: 'analyze',
        analysisLength: 'long',
        analyzedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const resultPromise = service.analyzeUrl('https://example.com', 'analyze', 'long');

      const req = httpTesting.expectOne('http://localhost:3000/api/analysis/url');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        url: 'https://example.com',
        mode: 'analyze',
        length: 'long',
      });
      req.flush(mockSource);

      const result = await resultPromise;
      expect(result).toEqual(mockSource);
    });
  });
});
