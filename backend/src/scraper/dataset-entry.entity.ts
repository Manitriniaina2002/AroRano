import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ScrapingJob } from './scraper.entity';

@Entity('dataset_entries')
@Index(['jobId', 'createdAt'])
@Index(['entryStatus'])
export class DatasetEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  jobId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  targetUrl: string | null;

  @Column({ type: 'varchar', length: 20, default: 'en' })
  sourceLanguage: string;

  @Column({ type: 'varchar', length: 20, default: 'mg' })
  targetLanguage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sourceTitle: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetTitle: string | null;

  @Column({ type: 'text' })
  sourceText: string;

  @Column({ type: 'text', nullable: true })
  targetText: string | null;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  entryStatus: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'float', nullable: true })
  confidence: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sectionTitle: string | null;

  @Column({ type: 'int', nullable: true })
  sourcePosition: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ScrapingJob, (job) => job.entries, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'jobId' })
  job: ScrapingJob | null;
}