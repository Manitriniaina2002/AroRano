import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Device } from './device.entity';

@Entity('sensor_readings')
@Index(['deviceId', 'createdAt'])
export class SensorReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  deviceId: string;

  @Column({ type: 'float' })
  value: number; // Sensor reading value

  @Column({ type: 'varchar', length: 50 })
  unit: string; // e.g., '°C', '%', 'RPM', etc.

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Device, (device) => device.readings, { onDelete: 'CASCADE' })
  device: Device;
}
