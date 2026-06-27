import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SourcesModule } from './sources/sources.module';
import { AnalysisModule } from './analysis/analysis.module';
import { CollectionsModule } from './collections/collections.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DATABASE_TYPE', 'sqlite');
        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            url: config.get<string>('DATABASE_URL'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          } as any;
        }
        return {
          type: 'better-sqlite3',
          database: config.get<string>('DATABASE_URL', 'data/whisperer.db'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        } as any;
      },
    }),
    AuthModule,
    SourcesModule,
    AnalysisModule,
    CollectionsModule,
    DashboardModule,
  ],
})
export class AppModule {}
