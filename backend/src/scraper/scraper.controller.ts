import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateDatasetEntryDto, CreateScrapingJobDto, ExportFormat, ExportQueryDto, UpdateDatasetEntryDto } from './scraper.dto';
import { ScraperService } from './scraper.service';

@ApiTags('scraper')
@Controller('api/scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Create and start a scraping job' })
  createJob(@Body() dto: CreateScrapingJobDto) {
    return this.scraperService.createJob(dto);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List scraping jobs' })
  listJobs() {
    return this.scraperService.listJobs();
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get scraping job by id' })
  getJob(@Param('jobId') jobId: string) {
    return this.scraperService.getJob(jobId);
  }

  @Post('jobs/:jobId/run')
  @ApiOperation({ summary: 'Run an existing scraping job again' })
  runJob(@Param('jobId') jobId: string) {
    return this.scraperService.runJob(jobId);
  }

  @Get('jobs/:jobId/entries')
  @ApiOperation({ summary: 'List entries for a scraping job' })
  listJobEntries(@Param('jobId') jobId: string) {
    return this.scraperService.listEntriesForJob(jobId);
  }

  @Get('entries')
  @ApiOperation({ summary: 'List dataset entries' })
  listEntries(
    @Query('jobId') jobId?: string,
    @Query('limit') limit = '100',
    @Query('offset') offset = '0',
  ) {
    const limitNum = Math.min(Number.parseInt(limit, 10) || 100, 1000);
    const offsetNum = Number.parseInt(offset, 10) || 0;
    return this.scraperService.listEntries(jobId, limitNum, offsetNum);
  }

  @Post('entries')
  @ApiOperation({ summary: 'Create a manual dataset entry' })
  createEntry(@Body() dto: CreateDatasetEntryDto) {
    return this.scraperService.createEntry(dto);
  }

  @Patch('entries/:entryId')
  @ApiOperation({ summary: 'Update a dataset entry' })
  updateEntry(@Param('entryId') entryId: string, @Body() dto: UpdateDatasetEntryDto) {
    return this.scraperService.updateEntry(entryId, dto);
  }

  @Delete('entries/:entryId')
  @ApiOperation({ summary: 'Delete a dataset entry' })
  deleteEntry(@Param('entryId') entryId: string) {
    return this.scraperService.deleteEntry(entryId);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export dataset as JSON, CSV, or JSONL' })
  async exportDataset(
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const format = query.format ?? ExportFormat.JSON;
    const exported = await this.scraperService.exportDataset(query.jobId, format);

    response.setHeader('Content-Type', exported.contentType);

    if (format === ExportFormat.CSV) {
      response.setHeader('Content-Disposition', 'attachment; filename="arorano-dataset.csv"');
    } else if (format === ExportFormat.JSONL) {
      response.setHeader('Content-Disposition', 'attachment; filename="arorano-dataset.jsonl"');
    } else {
      response.setHeader('Content-Disposition', 'attachment; filename="arorano-dataset.json"');
    }

    return exported.content;
  }

  @Get('health')
  @ApiOperation({ summary: 'Scraper health check' })
  health() {
    return {
      status: 'OK',
      timestamp: new Date(),
    };
  }
}