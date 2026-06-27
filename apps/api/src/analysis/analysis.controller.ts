import { Controller, Post, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalysisService } from '../ai/analysis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../entities/source.entity';
import { Summary } from '../entities/summary.entity';
import { KeyPoint } from '../entities/keypoint.entity';
import { Quote } from '../entities/quote.entity';
import { Stat } from '../entities/stat.entity';
import { AnalyzeTextDto } from './dto/analyze-text.dto';
import { AnalyzeUrlDto } from './dto/analyze-url.dto';

@ApiTags('Analysis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    @InjectRepository(Source) private readonly sourceRepo: Repository<Source>,
    @InjectRepository(Summary) private readonly summaryRepo: Repository<Summary>,
    @InjectRepository(KeyPoint) private readonly kpRepo: Repository<KeyPoint>,
    @InjectRepository(Quote) private readonly quoteRepo: Repository<Quote>,
    @InjectRepository(Stat) private readonly statRepo: Repository<Stat>,
  ) {}

  @Post('text')
  @HttpCode(201)
  async analyzeText(@Req() req: any, @Body() dto: AnalyzeTextDto) {
    const result = await this.analysisService.analyze(dto.content, {
      mode: dto.mode || 'general',
      length: dto.length || 'normal',
    });

    // Generate title from first sentence
    const firstSentence = dto.content.split(/[.!?]+/).filter(s => s.trim().length > 10)[0];
    const title = firstSentence ? firstSentence.trim().substring(0, 200) : 'Análisis de texto';

    const source = await this.sourceRepo.save({
      userId: req.user.id,
      title,
      sourceType: 'text',
      rawContent: dto.content,
      mode: dto.mode || 'general',
      analysisLength: dto.length || 'normal',
    } as any);

    await this.summaryRepo.save({
      sourceId: source.id,
      executiveSummary: result.executiveSummary,
      tone: result.tone || null,
      sentiment: result.sentiment || null,
    } as any);

    if (result.keyPoints?.length) {
      await this.kpRepo.save(
        result.keyPoints.map((kp: any, i: number) => ({
          sourceId: source.id,
          text: kp.text,
          relevanceScore: kp.relevanceScore || 5,
          sortOrder: i,
        })) as any,
      );
    }

    if (result.quotes?.length) {
      await this.quoteRepo.save(
        result.quotes.map((q: any, i: number) => ({
          sourceId: source.id,
          text: q.text,
          attribution: q.attribution || null,
          context: q.context || null,
          sortOrder: i,
        })) as any,
      );
    }

    if (result.stats?.length) {
      await this.statRepo.save(
        result.stats.map((s: any, i: number) => ({
          sourceId: source.id,
          label: s.label,
          value: s.value,
          context: s.context || null,
          sortOrder: i,
        })) as any,
      );
    }

    return this.sourceRepo.findOne({
      where: { id: source.id },
      relations: { summary: true, keyPoints: true, quotes: true, stats: true },
    });
  }

  @Post('url')
  @HttpCode(201)
  async analyzeUrl(@Req() req: any, @Body() dto: AnalyzeUrlDto) {
    // Try to extract content from URL (simple approach)
    let content: string;
    try {
      const response = await fetch(dto.url);
      const html = await response.text();
      content = this.extractTextFromHtml(html);
    } catch {
      content = `[Contenido extraído de ${dto.url}]`;
    }

    const result = await this.analysisService.analyze(content, {
      mode: dto.mode || 'general',
      length: dto.length || 'normal',
    });

    const source = await this.sourceRepo.save({
      userId: req.user.id,
      title: `Análisis de URL`,
      sourceType: 'url',
      originalUrl: dto.url,
      rawContent: content,
      mode: dto.mode || 'general',
      analysisLength: dto.length || 'normal',
    } as any);

    await this.summaryRepo.save({
      sourceId: source.id,
      executiveSummary: result.executiveSummary,
      tone: result.tone || null,
      sentiment: result.sentiment || null,
    } as any);

    if (result.keyPoints?.length) {
      await this.kpRepo.save(
        result.keyPoints.map((kp: any, i: number) => ({
          sourceId: source.id,
          text: kp.text,
          relevanceScore: kp.relevanceScore || 5,
          sortOrder: i,
        })) as any,
      );
    }

    if (result.quotes?.length) {
      await this.quoteRepo.save(
        result.quotes.map((q: any, i: number) => ({
          sourceId: source.id,
          text: q.text,
          attribution: q.attribution || null,
          context: q.context || null,
          sortOrder: i,
        })) as any,
      );
    }

    if (result.stats?.length) {
      await this.statRepo.save(
        result.stats.map((s: any, i: number) => ({
          sourceId: source.id,
          label: s.label,
          value: s.value,
          context: s.context || null,
          sortOrder: i,
        })) as any,
      );
    }

    return this.sourceRepo.findOne({
      where: { id: source.id },
      relations: { summary: true, keyPoints: true, quotes: true, stats: true },
    });
  }

  private extractTextFromHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50000);
  }
}
