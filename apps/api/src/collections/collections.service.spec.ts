import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CollectionsService } from './collections.service';
import { Collection } from '../entities/collection.entity';
import { CollectionSource } from '../entities/collection-source.entity';

describe('CollectionsService', () => {
  let service: CollectionsService;
  let colRepo: jest.Mocked<Repository<Collection>>;
  let csRepo: jest.Mocked<Repository<CollectionSource>>;

  const mockColRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockCsRepo = {
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        { provide: getRepositoryToken(Collection), useValue: mockColRepo },
        { provide: getRepositoryToken(CollectionSource), useValue: mockCsRepo },
      ],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
    colRepo = module.get(getRepositoryToken(Collection));
    csRepo = module.get(getRepositoryToken(CollectionSource));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return collections with source counts', async () => {
      const collections = [
        { id: 1, userId: 1, name: 'Col 1', updatedAt: new Date('2024-02-01') },
        { id: 2, userId: 1, name: 'Col 2', updatedAt: new Date('2024-01-01') },
      ];
      mockColRepo.find.mockResolvedValue(collections);
      mockCsRepo.count.mockResolvedValueOnce(3).mockResolvedValueOnce(5);

      const result = await service.findAll(1);

      expect(mockColRepo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { updatedAt: 'DESC' },
      });
      expect(mockCsRepo.count).toHaveBeenCalledTimes(2);
      expect(mockCsRepo.count).toHaveBeenCalledWith({ where: { collectionId: 1 } });
      expect(mockCsRepo.count).toHaveBeenCalledWith({ where: { collectionId: 2 } });
      expect(result).toEqual([
        { ...collections[0], _count: { sources: 3 } },
        { ...collections[1], _count: { sources: 5 } },
      ]);
    });

    it('should return empty array when user has no collections', async () => {
      mockColRepo.find.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
      expect(mockCsRepo.count).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const mockCollection = { id: 1, userId: 1, name: 'My Collection' };
    const mockSources = [
      { id: 10, title: 'Source 1' },
      { id: 11, title: 'Source 2' },
    ];

    it('should return a collection with its sources', async () => {
      mockColRepo.findOne.mockResolvedValue(mockCollection);
      mockCsRepo.find.mockResolvedValue(
        mockSources.map(s => ({ source: s })),
      );

      const result = await service.findOne(1, 1);

      expect(mockColRepo.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: 1 } });
      expect(mockCsRepo.find).toHaveBeenCalledWith({
        where: { collectionId: 1 },
        relations: { source: { summary: true } },
        order: { addedAt: 'DESC' },
      });
      expect(result).toEqual({ ...mockCollection, sources: mockSources });
    });

    it('should throw NotFoundException when collection does not exist', async () => {
      mockColRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
      expect(mockCsRepo.find).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const data = { name: 'New Collection', description: 'A description' };

    it('should create and return a new collection', async () => {
      const createdCollection = { id: 1, userId: 1, name: data.name, description: data.description };
      mockColRepo.findOne.mockResolvedValue(null);
      mockColRepo.create.mockReturnValue(createdCollection);
      mockColRepo.save.mockResolvedValue(createdCollection);

      const result = await service.create(1, data);

      expect(mockColRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 1, name: data.name },
      });
      expect(mockColRepo.create).toHaveBeenCalledWith({
        userId: 1,
        name: data.name,
        description: data.description,
      });
      expect(mockColRepo.save).toHaveBeenCalledWith(createdCollection);
      expect(result).toEqual(createdCollection);
    });

    it('should create with null description when not provided', async () => {
      mockColRepo.findOne.mockResolvedValue(null);
      mockColRepo.create.mockReturnValue({});
      mockColRepo.save.mockResolvedValue({});

      await service.create(1, { name: 'Minimal' });

      expect(mockColRepo.create).toHaveBeenCalledWith({
        userId: 1,
        name: 'Minimal',
        description: null,
      });
    });

    it('should throw ConflictException when a collection with the same name exists', async () => {
      const existing = { id: 1, userId: 1, name: data.name };
      mockColRepo.findOne.mockResolvedValue(existing);

      await expect(service.create(1, data)).rejects.toThrow(ConflictException);
      expect(mockColRepo.create).not.toHaveBeenCalled();
      expect(mockColRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update collection name and description', async () => {
      const existing = { id: 1, userId: 1, name: 'Old Name', description: 'Old desc' };
      mockColRepo.findOne.mockResolvedValue(existing);
      mockColRepo.save.mockResolvedValue({ ...existing, name: 'New Name', description: 'New desc' });

      const result = await service.update(1, 1, { name: 'New Name', description: 'New desc' });

      expect(mockColRepo.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: 1 } });
      expect(mockColRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Name', description: 'New desc' }),
      );
      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException when collection does not exist', async () => {
      mockColRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, 1, { name: 'Nope' })).rejects.toThrow(NotFoundException);
      expect(mockColRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a collection', async () => {
      const collection = { id: 1, userId: 1 };
      mockColRepo.findOne.mockResolvedValue(collection);
      mockColRepo.remove.mockResolvedValue(undefined);

      await service.remove(1, 1);

      expect(mockColRepo.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: 1 } });
      expect(mockColRepo.remove).toHaveBeenCalledWith(collection);
    });

    it('should throw NotFoundException when collection does not exist', async () => {
      mockColRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
      expect(mockColRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe('addSource', () => {
    it('should add a source to a collection', async () => {
      const collection = { id: 1, userId: 1 };
      mockColRepo.findOne.mockResolvedValue(collection);
      mockCsRepo.findOne.mockResolvedValue(null);
      mockCsRepo.save.mockResolvedValue({ collectionId: 1, sourceId: 5 });

      const result = await service.addSource(1, 5, 1);

      expect(mockColRepo.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: 1 } });
      expect(mockCsRepo.findOne).toHaveBeenCalledWith({ where: { collectionId: 1, sourceId: 5 } });
      expect(mockCsRepo.save).toHaveBeenCalledWith({ collectionId: 1, sourceId: 5 });
      expect(result).toEqual({ collectionId: 1, sourceId: 5 });
    });

    it('should throw NotFoundException when collection does not exist', async () => {
      mockColRepo.findOne.mockResolvedValue(null);

      await expect(service.addSource(999, 5, 1)).rejects.toThrow(NotFoundException);
      expect(mockCsRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when source is already in collection', async () => {
      mockColRepo.findOne.mockResolvedValue({ id: 1, userId: 1 });
      mockCsRepo.findOne.mockResolvedValue({ id: 10, collectionId: 1, sourceId: 5 });

      await expect(service.addSource(1, 5, 1)).rejects.toThrow(ConflictException);
      expect(mockCsRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('removeSource', () => {
    it('should remove a source from a collection', async () => {
      const collection = { id: 1, userId: 1 };
      const cs = { id: 10, collectionId: 1, sourceId: 5 };
      mockColRepo.findOne.mockResolvedValue(collection);
      mockCsRepo.findOne.mockResolvedValue(cs);
      mockCsRepo.remove.mockResolvedValue(undefined);

      await service.removeSource(1, 5, 1);

      expect(mockColRepo.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: 1 } });
      expect(mockCsRepo.findOne).toHaveBeenCalledWith({ where: { collectionId: 1, sourceId: 5 } });
      expect(mockCsRepo.remove).toHaveBeenCalledWith(cs);
    });

    it('should throw NotFoundException when collection does not exist', async () => {
      mockColRepo.findOne.mockResolvedValue(null);

      await expect(service.removeSource(999, 5, 1)).rejects.toThrow(NotFoundException);
      expect(mockCsRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when source is not in collection', async () => {
      mockColRepo.findOne.mockResolvedValue({ id: 1, userId: 1 });
      mockCsRepo.findOne.mockResolvedValue(null);

      await expect(service.removeSource(1, 999, 1)).rejects.toThrow(NotFoundException);
      expect(mockCsRepo.remove).not.toHaveBeenCalled();
    });
  });
});
