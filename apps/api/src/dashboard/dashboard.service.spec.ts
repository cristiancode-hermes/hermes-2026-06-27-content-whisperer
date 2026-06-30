import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { Source } from '../entities/source.entity';
import { Collection } from '../entities/collection.entity';
import { Quote } from '../entities/quote.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let sourceRepo: jest.Mocked<Repository<Source>>;
  let colRepo: jest.Mocked<Repository<Collection>>;
  let quoteRepo: jest.Mocked<Repository<Quote>>;

  const mockQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getRawMany: jest.fn(),
  };

  const mockSourceRepo = {
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockColRepo = {
    count: jest.fn(),
  };

  const mockQuoteRepo = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Source), useValue: mockSourceRepo },
        { provide: getRepositoryToken(Collection), useValue: mockColRepo },
        { provide: getRepositoryToken(Quote), useValue: mockQuoteRepo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    sourceRepo = module.get(getRepositoryToken(Source));
    colRepo = module.get(getRepositoryToken(Collection));
    quoteRepo = module.get(getRepositoryToken(Quote));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return aggregated stats for a user', async () => {
      mockSourceRepo.count.mockResolvedValue(42);
      mockColRepo.count.mockResolvedValue(5);
      mockQueryBuilder.getCount.mockResolvedValue(120);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { mode: 'general', count: '20' },
          { mode: 'technical', count: '15' },
          { mode: 'academic', count: '7' },
        ])
        .mockResolvedValueOnce([
          { month: '2024-01', count: '10' },
          { month: '2024-02', count: '15' },
        ]);

      const result = await service.getStats(1);

      expect(mockSourceRepo.count).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(mockColRepo.count).toHaveBeenCalledWith({ where: { userId: 1 } });

      expect(mockQuoteRepo.createQueryBuilder).toHaveBeenCalledWith('q');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('q.source', 's');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('s.userId = :userId', { userId: 1 });

      expect(mockSourceRepo.createQueryBuilder).toHaveBeenCalledWith('s');

      expect(result).toEqual({
        totalSources: 42,
        totalCollections: 5,
        totalQuotes: 120,
        activeModes: 3,
        modeDistribution: [
          { mode: 'general', count: '20' },
          { mode: 'technical', count: '15' },
          { mode: 'academic', count: '7' },
        ],
        monthlyActivity: [
          { month: '2024-01', count: '10' },
          { month: '2024-02', count: '15' },
        ],
      });
    });

    it('should return zero counts when user has no data', async () => {
      mockSourceRepo.count.mockResolvedValue(0);
      mockColRepo.count.mockResolvedValue(0);
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getStats(1);

      expect(result.totalSources).toBe(0);
      expect(result.totalCollections).toBe(0);
      expect(result.totalQuotes).toBe(0);
      expect(result.activeModes).toBe(0);
      expect(result.modeDistribution).toEqual([]);
      expect(result.monthlyActivity).toEqual([]);
    });

    it('should count active modes correctly', async () => {
      mockSourceRepo.count.mockResolvedValue(10);
      mockColRepo.count.mockResolvedValue(2);
      mockQueryBuilder.getCount.mockResolvedValue(5);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { mode: 'general', count: '3' },
          { mode: 'technical', count: '0' },
          { mode: 'news', count: '7' },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.getStats(1);

      expect(result.activeModes).toBe(2); // general and news have count > 0, technical has 0
    });
  });

  describe('getRecent', () => {
    it('should return last 5 sources with summary relation', async () => {
      const sources = [
        { id: 5, title: 'Source 5', createdAt: new Date('2024-06-01') },
        { id: 4, title: 'Source 4', createdAt: new Date('2024-05-01') },
        { id: 3, title: 'Source 3', createdAt: new Date('2024-04-01') },
        { id: 2, title: 'Source 2', createdAt: new Date('2024-03-01') },
        { id: 1, title: 'Source 1', createdAt: new Date('2024-02-01') },
      ];
      mockSourceRepo.find.mockResolvedValue(sources);

      const result = await service.getRecent(1);

      expect(mockSourceRepo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: { summary: true },
        order: { createdAt: 'DESC' },
        take: 5,
      });
      expect(result).toEqual(sources);
      expect(result).toHaveLength(5);
    });

    it('should return empty array when user has no sources', async () => {
      mockSourceRepo.find.mockResolvedValue([]);

      const result = await service.getRecent(1);

      expect(result).toEqual([]);
    });
  });

  describe('getTopWords', () => {
    it('should return top 20 most frequent words from last 100 sources', async () => {
      const sources = [
        { rawContent: 'tecnología innovadora para el futuro digital' },
        { rawContent: 'la innovación tecnológica es importante para el desarrollo' },
        { rawContent: 'el futuro digital requiere innovación constante' },
      ];
      mockSourceRepo.find.mockResolvedValue(sources);

      const result = await service.getTopWords(1);

      expect(mockSourceRepo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        select: { rawContent: true },
        take: 100,
      });

      // Each result should have word and count
      expect(result.length).toBeGreaterThan(0);
      for (const item of result) {
        expect(item).toHaveProperty('word');
        expect(item).toHaveProperty('count');
        expect(typeof item.count).toBe('number');
        expect(item.count).toBeGreaterThan(0);
      }
    });

    it('should filter stop words and short words', async () => {
      const sources = [
        { rawContent: 'el la los las de del en y a que es' },
      ];
      mockSourceRepo.find.mockResolvedValue(sources);

      const result = await service.getTopWords(1);

      // All words in the content are stop words or short (< 5 chars), so result should be empty
      expect(result).toEqual([]);
    });

    it('should return words sorted by frequency descending', async () => {
      const sources = [
        { rawContent: 'innovación innovación innovación tecnología tecnología digital' },
      ];
      mockSourceRepo.find.mockResolvedValue(sources);

      const result = await service.getTopWords(1);

      // 'innovación' appears 3 times, 'tecnología' appears 2 times, 'digital' appears 1 time
      expect(result[0].word).toBe('innovación');
      expect(result[0].count).toBe(3);
      expect(result[1].word).toBe('tecnología');
      expect(result[1].count).toBe(2);
      expect(result[2].word).toBe('digital');
      expect(result[2].count).toBe(1);
    });

    it('should return empty array when user has no sources', async () => {
      mockSourceRepo.find.mockResolvedValue([]);

      const result = await service.getTopWords(1);

      expect(result).toEqual([]);
    });
  });
});
