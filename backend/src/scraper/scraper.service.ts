import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { URL } from 'url';
import { DatasetEntry } from './dataset-entry.entity';
import { CreateDatasetEntryDto, CreateScrapingJobDto, ExportFormat, ScrapeMode, UpdateDatasetEntryDto } from './scraper.dto';
import { ScrapingJob } from './scraper.entity';

type ContentBlock = {
  sectionTitle: string | null;
  text: string;
};

type ScrapeRunResult = {
  entries: Partial<DatasetEntry>[];
  metadata: Record<string, any>;
};

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    @InjectRepository(ScrapingJob)
    private readonly jobRepository: Repository<ScrapingJob>,
    @InjectRepository(DatasetEntry)
    private readonly entryRepository: Repository<DatasetEntry>,
  ) {}

  async createJob(dto: CreateScrapingJobDto): Promise<ScrapingJob> {
    const job = this.jobRepository.create({
      mode: dto.mode ?? ScrapeMode.WIKIPEDIA_BILINGUAL,
      sourceUrl: dto.sourceUrl,
      targetUrl: dto.targetUrl ?? null,
      sourceLanguage: dto.sourceLanguage ?? 'en',
      targetLanguage: dto.targetLanguage ?? 'mg',
      status: 'pending',
      totalEntries: 0,
      processedEntries: 0,
      errorMessage: null,
      metadata: dto.title ? { title: dto.title } : null,
      startedAt: null,
      completedAt: null,
    });

    const savedJob = await this.jobRepository.save(job);
    void this.runJob(savedJob.id).catch((error) => {
      this.logger.error(`Background scraper run failed for job ${savedJob.id}: ${error.message}`, error.stack);
    });

    return savedJob;
  }

  async runJob(jobId: string): Promise<ScrapingJob> {
    const job = await this.getJob(jobId);
    await this.updateJob(job.id, {
      status: 'running',
      errorMessage: null,
      startedAt: new Date(),
      completedAt: null,
    });

    try {
      const result = await this.scrapeJob(job);
      const savedEntries = await this.entryRepository.save(result.entries);

      const completedJob = await this.updateJob(job.id, {
        status: 'completed',
        totalEntries: savedEntries.length,
        processedEntries: savedEntries.length,
        completedAt: new Date(),
        metadata: {
          ...(job.metadata ?? {}),
          ...result.metadata,
          savedEntries: savedEntries.length,
        },
      });

      return completedJob;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown scraper failure';
      this.logger.error(`Scraper job ${jobId} failed: ${message}`, error instanceof Error ? error.stack : undefined);
      return this.updateJob(job.id, {
        status: 'failed',
        errorMessage: message,
        completedAt: new Date(),
      });
    }
  }

  async listJobs(): Promise<ScrapingJob[]> {
    return this.jobRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getJob(jobId: string): Promise<ScrapingJob> {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException(`Scraping job ${jobId} not found`);
    }

    return job;
  }

  async listEntries(jobId?: string, limit = 100, offset = 0): Promise<{ data: DatasetEntry[]; total: number }> {
    const query = this.entryRepository
      .createQueryBuilder('entry')
      .orderBy('entry.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (jobId) {
      query.where('entry.jobId = :jobId', { jobId });
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async listEntriesForJob(jobId: string): Promise<DatasetEntry[]> {
    return this.entryRepository.find({ where: { jobId }, order: { createdAt: 'DESC' } });
  }

  async createEntry(dto: CreateDatasetEntryDto): Promise<DatasetEntry> {
    const entry = this.entryRepository.create({
      jobId: dto.jobId ?? null,
      sourceUrl: dto.sourceUrl ?? null,
      targetUrl: dto.targetUrl ?? null,
      sourceLanguage: dto.sourceLanguage ?? 'en',
      targetLanguage: dto.targetLanguage ?? 'mg',
      sourceTitle: dto.sourceTitle ?? null,
      targetTitle: dto.targetTitle ?? null,
      sourceText: dto.sourceText,
      targetText: dto.targetText ?? null,
      entryStatus: dto.entryStatus ?? 'pending',
      notes: dto.notes ?? null,
      confidence: dto.confidence ?? null,
      sectionTitle: dto.sectionTitle ?? null,
      sourcePosition: dto.sourcePosition ?? null,
    });

    const savedEntry = await this.entryRepository.save(entry);

    if (dto.jobId) {
      await this.bumpJobCounters(dto.jobId, 1);
    }

    return savedEntry;
  }

  async updateEntry(entryId: string, dto: UpdateDatasetEntryDto): Promise<DatasetEntry> {
    const entry = await this.entryRepository.findOne({ where: { id: entryId } });

    if (!entry) {
      throw new NotFoundException(`Dataset entry ${entryId} not found`);
    }

    Object.assign(entry, {
      targetText: dto.targetText ?? entry.targetText,
      entryStatus: dto.entryStatus ?? entry.entryStatus,
      notes: dto.notes ?? entry.notes,
      confidence: dto.confidence ?? entry.confidence,
      targetTitle: dto.targetTitle ?? entry.targetTitle,
      sectionTitle: dto.sectionTitle ?? entry.sectionTitle,
    });

    return this.entryRepository.save(entry);
  }

  async deleteEntry(entryId: string): Promise<void> {
    const result = await this.entryRepository.delete(entryId);

    if (!result.affected) {
      throw new NotFoundException(`Dataset entry ${entryId} not found`);
    }
  }

  async exportDataset(jobId?: string, format: ExportFormat = ExportFormat.JSON): Promise<{ content: string; contentType: string }> {
    const { data } = await this.listEntries(jobId, 5000, 0);

    if (format === ExportFormat.CSV) {
      return {
        contentType: 'text/csv; charset=utf-8',
        content: this.toCsv(data),
      };
    }

    if (format === ExportFormat.JSONL) {
      return {
        contentType: 'application/x-ndjson; charset=utf-8',
        content: data.map((entry) => JSON.stringify(this.serializeEntry(entry))).join('\n'),
      };
    }

    return {
      contentType: 'application/json; charset=utf-8',
      content: JSON.stringify({ count: data.length, entries: data.map((entry) => this.serializeEntry(entry)) }, null, 2),
    };
  }

  private async scrapeJob(job: ScrapingJob): Promise<ScrapeRunResult> {
    if (job.mode === ScrapeMode.SINGLE_URL) {
      const page = await this.fetchPage(job.sourceUrl);
      const blocks = this.extractContentBlocks(page.html);
      return {
        entries: blocks.map((block, index) => this.buildEntry(job, {
          sourceUrl: page.finalUrl,
          sourceTitle: page.title,
          targetText: null,
          sectionTitle: block.sectionTitle,
          sourceText: block.text,
          sourcePosition: index + 1,
          targetUrl: null,
          targetTitle: null,
        })),
        metadata: {
          sourceTitle: page.title,
          sourceUrl: page.finalUrl,
          mode: job.mode,
          paragraphs: blocks.length,
        },
      };
    }

    const sourcePage = await this.fetchPage(job.sourceUrl);
    const detectedTargetUrl = job.targetUrl ?? this.detectWikipediaLanguageLink(sourcePage.html, 'mg', sourcePage.finalUrl);
    const targetPage = detectedTargetUrl ? await this.fetchPage(detectedTargetUrl) : null;

    const sourceBlocks = this.extractContentBlocks(sourcePage.html);
    const targetBlocks = targetPage ? this.extractContentBlocks(targetPage.html) : [];
    const pairCount = Math.max(sourceBlocks.length, targetBlocks.length);

    const entries = Array.from({ length: pairCount }, (_, index) => {
      const sourceBlock = sourceBlocks[index];
      const targetBlock = targetBlocks[index];

      return this.buildEntry(job, {
        sourceUrl: sourcePage.finalUrl,
        targetUrl: targetPage?.finalUrl ?? detectedTargetUrl ?? null,
        sourceTitle: sourcePage.title,
        targetTitle: targetPage?.title ?? null,
        sectionTitle: sourceBlock?.sectionTitle ?? targetBlock?.sectionTitle ?? null,
        sourceText: sourceBlock?.text ?? '',
        targetText: targetBlock?.text ?? null,
        sourcePosition: index + 1,
      });
    }).filter((entry) => Boolean(entry.sourceText));

    return {
      entries,
      metadata: {
        sourceTitle: sourcePage.title,
        targetTitle: targetPage?.title ?? null,
        sourceUrl: sourcePage.finalUrl,
        targetUrl: targetPage?.finalUrl ?? detectedTargetUrl ?? null,
        sourceParagraphs: sourceBlocks.length,
        targetParagraphs: targetBlocks.length,
        mode: job.mode,
      },
    };
  }

  private buildEntry(job: ScrapingJob, data: {
    sourceUrl: string;
    targetUrl: string | null;
    sourceTitle: string;
    targetTitle: string | null;
    sectionTitle: string | null;
    sourceText: string;
    targetText: string | null;
    sourcePosition: number;
  }): Partial<DatasetEntry> {
    return {
      jobId: job.id,
      sourceUrl: data.sourceUrl,
      targetUrl: data.targetUrl,
      sourceLanguage: job.sourceLanguage,
      targetLanguage: job.targetLanguage,
      sourceTitle: data.sourceTitle,
      targetTitle: data.targetTitle,
      sourceText: data.sourceText,
      targetText: data.targetText,
      entryStatus: data.targetText ? 'translated' : 'pending',
      notes: null,
      confidence: data.targetText ? 0.75 : null,
      sectionTitle: data.sectionTitle,
      sourcePosition: data.sourcePosition,
    };
  }

  private async bumpJobCounters(jobId: string, increment: number): Promise<void> {
    await this.jobRepository
      .createQueryBuilder()
      .update()
      .set({
        totalEntries: () => `totalEntries + ${increment}`,
        processedEntries: () => `processedEntries + ${increment}`,
      })
      .where('id = :jobId', { jobId })
      .execute();
  }

  private async updateJob(jobId: string, partial: Partial<ScrapingJob>): Promise<ScrapingJob> {
    await this.jobRepository.update(jobId, partial);
    return this.getJob(jobId);
  }

  private async fetchPage(url: string): Promise<{ finalUrl: string; html: string; title: string }> {
    const response = await this.requestText(url);
    return {
      finalUrl: response.finalUrl,
      html: response.body,
      title: this.extractTitle(response.body) || response.finalUrl,
    };
  }

  private requestText(urlString: string, redirectCount = 0): Promise<{ finalUrl: string; body: string }> {
    const url = new URL(urlString);
    const client = url.protocol === 'https:' ? httpsRequest : httpRequest;

    return new Promise((resolve, reject) => {
      const request = client(
        url,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'AroRano-Scraper/1.0',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.8,mg;q=0.7',
          },
        },
        (response) => {
          const statusCode = response.statusCode ?? 0;

          if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
            if (redirectCount > 5) {
              reject(new Error(`Too many redirects while fetching ${urlString}`));
              return;
            }

            const redirectedUrl = new URL(response.headers.location, url).toString();
            resolve(this.requestText(redirectedUrl, redirectCount + 1));
            return;
          }

          if (statusCode >= 400) {
            reject(new Error(`Failed to fetch ${urlString}: HTTP ${statusCode}`));
            return;
          }

          response.setEncoding('utf8');
          let body = '';

          response.on('data', (chunk) => {
            body += chunk;
          });

          response.on('end', () => {
            resolve({ finalUrl: url.toString(), body });
          });
        },
      );

      request.on('error', reject);
      request.end();
    });
  }

  private extractTitle(html: string): string {
    const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
    return titleMatch ? this.cleanHtml(titleMatch[1]) : '';
  }

  private detectWikipediaLanguageLink(html: string, languageCode: string, baseUrl: string): string | null {
    const linkRegex = /<link\b([^>]+)>/gi;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(html)) !== null) {
      const attributes = match[1];
      const rel = /rel\s*=\s*['\"]?([^'\"\s>]+)['\"]?/i.exec(attributes)?.[1] ?? '';
      const hreflang = /hreflang\s*=\s*['\"]?([^'\"\s>]+)['\"]?/i.exec(attributes)?.[1] ?? '';
      const href = /href\s*=\s*['\"]([^'\"]+)['\"]/i.exec(attributes)?.[1] ?? '';

      if (rel.includes('alternate') && hreflang.toLowerCase() === languageCode.toLowerCase() && href) {
        return new URL(href, baseUrl).toString();
      }
    }

    return null;
  }

  private extractContentBlocks(html: string): ContentBlock[] {
    const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
    const body = (bodyMatch ? bodyMatch[1] : html)
      .replace(/<!--([\s\S]*?)-->/g, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<template[\s\S]*?<\/template>/gi, ' ');

    const tokenRegex = /<(h[1-3]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
    const blocks: ContentBlock[] = [];
    let currentSection: string | null = null;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(body)) !== null) {
      const tag = match[1].toLowerCase();
      const text = this.cleanHtml(match[2]);

      if (!text) {
        continue;
      }

      if (tag !== 'p' && tag !== 'li') {
        currentSection = text.slice(0, 160);
        continue;
      }

      if (text.length >= 20) {
        blocks.push({
          sectionTitle: currentSection,
          text,
        });
      }
    }

    return blocks;
  }

  private cleanHtml(value: string): string {
    return this.decodeHtmlEntities(
      value
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\[\d+\]/g, ' ')
        .trim(),
    );
  }

  private decodeHtmlEntities(value: string): string {
    const namedEntities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    };

    let output = value;

    Object.entries(namedEntities).forEach(([entity, replacement]) => {
      output = output.split(entity).join(replacement);
    });

    return output.replace(/&#(x?)([0-9a-fA-F]+);/g, (_match, hexFlag: string, codePoint: string) => {
      const base = hexFlag ? 16 : 10;
      const parsed = Number.parseInt(codePoint, base);
      return Number.isNaN(parsed) ? '' : String.fromCodePoint(parsed);
    });
  }

  private serializeEntry(entry: DatasetEntry): Record<string, any> {
    return {
      id: entry.id,
      jobId: entry.jobId,
      sourceUrl: entry.sourceUrl,
      targetUrl: entry.targetUrl,
      sourceLanguage: entry.sourceLanguage,
      targetLanguage: entry.targetLanguage,
      sourceTitle: entry.sourceTitle,
      targetTitle: entry.targetTitle,
      sourceText: entry.sourceText,
      targetText: entry.targetText,
      entryStatus: entry.entryStatus,
      notes: entry.notes,
      confidence: entry.confidence,
      sectionTitle: entry.sectionTitle,
      sourcePosition: entry.sourcePosition,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  private toCsv(entries: DatasetEntry[]): string {
    const headers = [
      'id',
      'jobId',
      'sourceUrl',
      'targetUrl',
      'sourceLanguage',
      'targetLanguage',
      'sourceTitle',
      'targetTitle',
      'sectionTitle',
      'sourcePosition',
      'sourceText',
      'targetText',
      'entryStatus',
      'notes',
      'confidence',
      'createdAt',
      'updatedAt',
    ];

    const escapeCell = (value: unknown) => {
      const text = value === null || value === undefined ? '' : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = entries.map((entry) => headers.map((header) => escapeCell((entry as Record<string, any>)[header])).join(','));
    return [headers.join(','), ...rows].join('\n');
  }
}