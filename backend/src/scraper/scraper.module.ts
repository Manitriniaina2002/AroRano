import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetEntry } from './dataset-entry.entity';
import { ScrapingJob } from './scraper.entity';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScrapingJob, DatasetEntry])],
  controllers: [ScraperController],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}