import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../entities/source.entity';
import { Collection } from '../entities/collection.entity';
import { Quote } from '../entities/quote.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Source) private readonly sourceRepo: Repository<Source>,
    @InjectRepository(Collection) private readonly colRepo: Repository<Collection>,
    @InjectRepository(Quote) private readonly quoteRepo: Repository<Quote>,
  ) {}

  async getStats(userId: number) {
    const totalSources = await this.sourceRepo.count({ where: { userId } });
    const totalCollections = await this.colRepo.count({ where: { userId } });
    const quotesResult = await this.quoteRepo
      .createQueryBuilder('q')
      .innerJoin('q.source', 's')
      .where('s.userId = :userId', { userId })
      .getCount();

    // Mode distribution
    const modeDist = await this.sourceRepo
      .createQueryBuilder('s')
      .select('s.mode', 'mode')
      .addSelect('COUNT(s.id)', 'count')
      .where('s.userId = :userId', { userId })
      .groupBy('s.mode')
      .getRawMany();

    // Monthly activity
    const monthlyActivity = await this.sourceRepo
      .createQueryBuilder('s')
      .select("strftime('%Y-%m', s.createdAt)", 'month')
      .addSelect('COUNT(s.id)', 'count')
      .where('s.userId = :userId', { userId })
      .groupBy("strftime('%Y-%m', s.createdAt)")
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalSources,
      totalCollections,
      totalQuotes: quotesResult,
      activeModes: modeDist.filter((m: any) => parseInt(m.count) > 0).length,
      modeDistribution: modeDist,
      monthlyActivity,
    };
  }

  async getRecent(userId: number) {
    return this.sourceRepo.find({
      where: { userId },
      relations: { summary: true },
      order: { createdAt: 'DESC' },
      take: 5,
    });
  }

  async getTopWords(userId: number) {
    const sources = await this.sourceRepo.find({
      where: { userId },
      select: { rawContent: true } as any,
      take: 100,
    });

    const freq = new Map<string, number>();
    const stopWords = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'en', 'y', 'a', 'que', 'es', 'por', 'con', 'un', 'una', 'se', 'su', 'al', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'este', 'entre', 'porque', 'todo', 'esta', 'son', 'era', 'para', 'fue', 'muy', 'sin', 'sobre', 'también', 'había', 'cada', 'dos', 'sido', 'gran', 'ese', 'tiene', 'ser', 'han', 'tanto', 'otro', 'parte', 'donde', 'años', 'mayor', 'durante', 'ello', 'contra', 'hasta', 'desde', 'luego', 'entonces', 'ellas', 'ellos', 'quien', 'hacen', 'hace', 'dice']);

    for (const s of sources) {
      const words = s.rawContent.toLowerCase().split(/\s+/).filter(w => w.length > 4 && !stopWords.has(w));
      for (const w of words) {
        freq.set(w, (freq.get(w) || 0) + 1);
      }
    }

    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
  }
}
