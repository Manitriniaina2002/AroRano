import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DatasetEntry } from './dataset-entry.entity';

@Entity('scraping_jobs')
export class ScrapingJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  mode: string;

  @Column({ type: 'varchar', length: 500 })
  sourceUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  targetUrl: string | null;

  @Column({ type: 'varchar', length: 20, default: 'en' })
  sourceLanguage: string;

  @Column({ type: 'varchar', length: 20, default: 'mg' })
  targetLanguage: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'int', default: 0 })
  totalEntries: number;

  @Column({ type: 'int', default: 0 })
  processedEntries: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DatasetEntry, (entry) => entry.job)
  entries: DatasetEntry[];
}