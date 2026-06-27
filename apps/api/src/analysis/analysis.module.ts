import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from '../ai/analysis.service';
import { Source } from '../entities/source.entity';
import { Summary } from '../entities/summary.entity';
import { KeyPoint } from '../entities/keypoint.entity';
import { Quote } from '../entities/quote.entity';
import { Stat } from '../entities/stat.entity';
import { SourcesModule } from '../sources/sources.module';

@Module({
  imports: [TypeOrmModule.forFeature([Source, Summary, KeyPoint, Quote, Stat]), SourcesModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
