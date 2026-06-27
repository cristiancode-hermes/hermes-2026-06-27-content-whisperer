import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../entities/collection.entity';
import { CollectionSource } from '../entities/collection-source.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection) private readonly colRepo: Repository<Collection>,
    @InjectRepository(CollectionSource) private readonly csRepo: Repository<CollectionSource>,
  ) {}

  async findAll(userId: number) {
    const collections = await this.colRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    // Attach source count
    const result: any[] = [];
    for (const col of collections) {
      const count = await this.csRepo.count({ where: { collectionId: col.id } });
      result.push({ ...col, _count: { sources: count } } as any);
    }
    return result;
  }

  async findOne(id: number, userId: number) {
    const collection = await this.colRepo.findOne({ where: { id, userId } });
    if (!collection) throw new NotFoundException('Collection not found');

    const sources = await this.csRepo.find({
      where: { collectionId: id },
      relations: { source: { summary: true } },
      order: { addedAt: 'DESC' },
    });

    return { ...collection, sources: sources.map(s => s.source) };
  }

  async create(userId: number, data: { name: string; description?: string }) {
    const existing = await this.colRepo.findOne({ where: { userId, name: data.name } });
    if (existing) throw new ConflictException('Collection with this name already exists');

    const collection = this.colRepo.create({ userId, name: data.name, description: data.description || null } as any);
    return this.colRepo.save(collection);
  }

  async update(id: number, userId: number, data: { name?: string; description?: string }) {
    const collection = await this.colRepo.findOne({ where: { id, userId } });
    if (!collection) throw new NotFoundException('Collection not found');
    if (data.name !== undefined) collection.name = data.name;
    if (data.description !== undefined) collection.description = data.description;
    return this.colRepo.save(collection);
  }

  async remove(id: number, userId: number) {
    const collection = await this.colRepo.findOne({ where: { id, userId } });
    if (!collection) throw new NotFoundException('Collection not found');
    await this.colRepo.remove(collection);
  }

  async addSource(collectionId: number, sourceId: number, userId: number) {
    const collection = await this.colRepo.findOne({ where: { id: collectionId, userId } });
    if (!collection) throw new NotFoundException('Collection not found');

    const existing = await this.csRepo.findOne({ where: { collectionId, sourceId } });
    if (existing) throw new ConflictException('Source already in collection');

    return this.csRepo.save({ collectionId, sourceId } as any);
  }

  async removeSource(collectionId: number, sourceId: number, userId: number) {
    const collection = await this.colRepo.findOne({ where: { id: collectionId, userId } });
    if (!collection) throw new NotFoundException('Collection not found');

    const cs = await this.csRepo.findOne({ where: { collectionId, sourceId } });
    if (!cs) throw new NotFoundException('Source not in collection');
    await this.csRepo.remove(cs);
  }
}
