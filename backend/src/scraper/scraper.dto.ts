import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export enum ScrapeMode {
  WIKIPEDIA_BILINGUAL = 'wikipedia-bilingual',
  URL_PAIR = 'url-pair',
  SINGLE_URL = 'single-url',
}

export enum EntryStatus {
  PENDING = 'pending',
  TRANSLATED = 'translated',
  REVIEWED = 'reviewed',
  REJECTED = 'rejected',
}

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  JSONL = 'jsonl',
}

export class CreateScrapingJobDto {
  @IsUrl({ require_protocol: true })
  sourceUrl: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  targetUrl?: string;

  @IsOptional()
  @IsString()
  sourceLanguage?: string;

  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(ScrapeMode)
  mode?: ScrapeMode;
}

export class CreateDatasetEntryDto {
  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  sourceUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  targetUrl?: string;

  @IsOptional()
  @IsString()
  sourceLanguage?: string;

  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @IsOptional()
  @IsString()
  sourceTitle?: string;

  @IsOptional()
  @IsString()
  targetTitle?: string;

  @IsString()
  sourceText: string;

  @IsOptional()
  @IsString()
  targetText?: string;

  @IsOptional()
  @IsEnum(EntryStatus)
  entryStatus?: EntryStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsString()
  sectionTitle?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sourcePosition?: number;
}

export class UpdateDatasetEntryDto {
  @IsOptional()
  @IsString()
  targetText?: string;

  @IsOptional()
  @IsEnum(EntryStatus)
  entryStatus?: EntryStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsString()
  targetTitle?: string;

  @IsOptional()
  @IsString()
  sectionTitle?: string;
}

export class ExportQueryDto {
  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat;
}