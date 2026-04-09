import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SensorReading } from './sensor-reading.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // e.g., 'temperature', 'humidity', 'motion', etc.

  @Column({ type: 'varchar', length: 100 })
  location: string;

  @Column({ type: 'varchar', length: 50 })
  status: string; // 'active', 'inactive', 'error'

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>; // Additional device info

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SensorReading, (reading) => reading.device, { cascade: true })
  readings: SensorReading[];
}
