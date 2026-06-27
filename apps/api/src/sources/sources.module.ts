import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { Source } from '../entities/source.entity';
import { Summary } from '../entities/summary.entity';
import { KeyPoint } from '../entities/keypoint.entity';
import { Quote } from '../entities/quote.entity';
import { Stat } from '../entities/stat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Source, Summary, KeyPoint, Quote, Stat])],
  controllers: [SourcesController],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourcesModule {}
