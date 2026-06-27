import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Source } from '../entities/source.entity';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source) private readonly sourceRepo: Repository<Source>,
  ) {}

  async findAll(userId: number, query: { page?: number; limit?: number; type?: string; q?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.type) where.sourceType = query.type;
    if (query.q) {
      where.title = Like(`%${query.q}%`);
    }

    const [data, total] = await this.sourceRepo.findAndCount({
      where,
      relations: { summary: true, keyPoints: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: number, userId: number) {
    const source = await this.sourceRepo.findOne({
      where: { id, userId },
      relations: { summary: true, keyPoints: true, quotes: true, stats: true },
    });
    if (!source) throw new NotFoundException('Source not found');
    return source;
  }

  async update(id: number, userId: number, data: { title?: string; notes?: string }) {
    const source = await this.findOne(id, userId);
    if (data.title !== undefined) source.title = data.title;
    if (data.notes !== undefined) source.notes = data.notes;
    return this.sourceRepo.save(source);
  }

  async remove(id: number, userId: number) {
    const source = await this.findOne(id, userId);
    await this.sourceRepo.remove(source);
  }

  async search(userId: number, q: string) {
    if (!q || q.length < 2) return [];
    return this.sourceRepo.find({
      where: [
        { userId, title: Like(`%${q}%`) },
        { userId, rawContent: Like(`%${q}%`) },
      ],
      relations: { summary: true },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}
