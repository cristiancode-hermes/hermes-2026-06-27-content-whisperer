import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SourcesService } from './sources.service';
import { Source } from '../entities/source.entity';

describe('SourcesService', () => {
  let service: SourcesService;
  let sourceRepo: jest.Mocked<Repository<Source>>;

  const mockSourceRepo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourcesService,
        { provide: getRepositoryToken(Source), useValue: mockSourceRepo },
      ],
    }).compile();

    service = module.get<SourcesService>(SourcesService);
    sourceRepo = module.get(getRepositoryToken(Source));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated sources with default pagination', async () => {
      const sources = [{ id: 1, title: 'Source 1', userId: 1 }];
      mockSourceRepo.findAndCount.mockResolvedValue([sources, 1]);

      const result = await service.findAll(1, {});

      expect(mockSourceRepo.findAndCount).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: { summary: true, keyPoints: true },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({ data: sources, total: 1, page: 1, limit: 10 });
    });

    it('should filter by source type when type query param is provided', async () => {
      const sources = [{ id: 2, title: 'Article', userId: 1, sourceType: 'article' }];
      mockSourceRepo.findAndCount.mockResolvedValue([sources, 1]);

      const result = await service.findAll(1, { type: 'article' });

      expect(mockSourceRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1, sourceType: 'article' },
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('should search by title when q query param is provided', async () => {
      const sources = [{ id: 3, title: 'Test Title', userId: 1 }];
      mockSourceRepo.findAndCount.mockResolvedValue([sources, 1]);

      const result = await service.findAll(1, { q: 'Test' });

      expect(mockSourceRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 1,
            title: expect.any(Object),
          }),
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('should respect custom page and limit parameters', async () => {
      mockSourceRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(1, { page: 3, limit: 5 });

      expect(mockSourceRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  describe('findOne', () => {
    const source = {
      id: 1,
      title: 'My Source',
      userId: 1,
      summary: {},
      keyPoints: [],
      quotes: [],
      stats: [],
    };

    it('should return a source by id and userId with relations', async () => {
      mockSourceRepo.findOne.mockResolvedValue(source);

      const result = await service.findOne(1, 1);

      expect(mockSourceRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        relations: { summary: true, keyPoints: true, quotes: true, stats: true },
      });
      expect(result).toEqual(source);
    });

    it('should throw NotFoundException when source is not found', async () => {
      mockSourceRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    function makeSource() {
      return {
        id: 1,
        userId: 1,
        title: 'Original Title',
        notes: 'Original notes',
      };
    }

    it('should update title and notes', async () => {
      const source = makeSource();
      mockSourceRepo.findOne.mockResolvedValue(source);
      mockSourceRepo.save.mockResolvedValue({
        ...source,
        title: 'Updated Title',
        notes: 'Updated notes',
      });

      const result = await service.update(1, 1, {
        title: 'Updated Title',
        notes: 'Updated notes',
      });

      expect(mockSourceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Title', notes: 'Updated notes' }),
      );
      expect(result.title).toBe('Updated Title');
    });

    it('should update only title when notes is not provided', async () => {
      const source = makeSource();
      mockSourceRepo.findOne.mockResolvedValue(source);
      mockSourceRepo.save.mockResolvedValue({
        ...source,
        title: 'New Title',
      });

      const result = await service.update(1, 1, { title: 'New Title' });

      expect(mockSourceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Title', notes: 'Original notes' }),
      );
      expect(result.title).toBe('New Title');
    });

    it('should throw NotFoundException if source does not exist', async () => {
      mockSourceRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, 1, { title: 'Nope' })).rejects.toThrow(NotFoundException);
      expect(mockSourceRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a source by id and userId', async () => {
      const source = { id: 1, userId: 1 };
      mockSourceRepo.findOne.mockResolvedValue(source);
      mockSourceRepo.remove.mockResolvedValue(undefined);

      await service.remove(1, 1);

      expect(mockSourceRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        relations: { summary: true, keyPoints: true, quotes: true, stats: true },
      });
      expect(mockSourceRepo.remove).toHaveBeenCalledWith(source);
    });

    it('should throw NotFoundException if source does not exist', async () => {
      mockSourceRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
      expect(mockSourceRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should return empty array when query is empty', async () => {
      const result = await service.search(1, '');

      expect(result).toEqual([]);
      expect(mockSourceRepo.find).not.toHaveBeenCalled();
    });

    it('should return empty array when query has fewer than 2 characters', async () => {
      const result = await service.search(1, 'a');

      expect(result).toEqual([]);
      expect(mockSourceRepo.find).not.toHaveBeenCalled();
    });

    it('should search sources by title and rawContent', async () => {
      const sources = [
        { id: 1, title: 'Test Article', userId: 1 },
        { id: 2, title: 'Another', rawContent: 'contains test', userId: 1 },
      ];
      mockSourceRepo.find.mockResolvedValue(sources);

      const result = await service.search(1, 'test');

      expect(mockSourceRepo.find).toHaveBeenCalledWith({
        where: [
          { userId: 1, title: expect.any(Object) },
          { userId: 1, rawContent: expect.any(Object) },
        ],
        relations: { summary: true },
        order: { createdAt: 'DESC' },
        take: 20,
      });
      expect(result).toEqual(sources);
    });
  });
});
