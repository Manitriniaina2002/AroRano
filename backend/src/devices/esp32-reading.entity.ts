import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('esp32_readings')
@Index(['deviceId', 'createdAt'])
@Index(['deviceId'])
export class ESP32Reading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  deviceId: string; // e.g., 'reservoir_01'

  @Column({ type: 'timestamp' })
  timestamp: Date; // ESP32 reported timestamp

  @Column({ type: 'float' })
  waterLevelCm: number; // Water level in centimeters

  @Column({ type: 'smallint' })
  waterLevelPercent: number; // Water level as percentage (0-100)

  @Column({ type: 'float' })
  temperature: number; // Temperature in Celsius

  @Column({ type: 'smallint' })
  humidity: number; // Humidity percentage (0-100)

  @Column({ type: 'boolean' })
  rainDetected: boolean; // Rain detection status

  @Column({ type: 'varchar', length: 50 })
  pumpStatus: string; // 'ON' or 'OFF'

  @Column({ type: 'varchar', length: 50 })
  alert: string; // Alert status: 'NORMAL', 'WARNING', 'CRITICAL', etc.

  @CreateDateColumn()
  createdAt: Date; // Server-side timestamp when data was received
}
