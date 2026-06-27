import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Source } from '../entities/source.entity';
import { Collection } from '../entities/collection.entity';
import { KeyPoint } from '../entities/keypoint.entity';
import { Quote } from '../entities/quote.entity';
import { Stat } from '../entities/stat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Source, Collection, KeyPoint, Quote, Stat])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
