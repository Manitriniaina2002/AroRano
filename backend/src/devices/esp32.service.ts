import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ESP32Reading } from './esp32-reading.entity';
import { CreateESP32ReadingDto, ESP32StatsDto } from './esp32.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ESP32Service {
  private readonly logger = new Logger(ESP32Service.name);

  constructor(
    @InjectRepository(ESP32Reading)
    private esp32Repository: Repository<ESP32Reading>,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Receive and store ESP32 sensor data
   */
  async receiveESP32Data(dto: CreateESP32ReadingDto): Promise<ESP32Reading> {
    try {
      const reading = this.esp32Repository.create({
        deviceId: dto.device_id,
        timestamp: new Date(dto.timestamp),
        waterLevelCm: dto.water_level_cm,
        waterLevelPercent: dto.water_level_percent,
        temperature: dto.temperature,
        humidity: dto.humidity,
        rainDetected: dto.rain_detected,
        pumpStatus: dto.pump_status,
        alert: dto.alert,
      });

      const savedReading = await this.esp32Repository.save(reading);

      // Check for alerts and notify if needed
      if (dto.alert !== 'NORMAL') {
        this.logger.warn(`Alert from device ${dto.device_id}: ${dto.alert}`);
        this.eventsGateway.broadcastAlert(dto.device_id, dto.alert);
      }

      // Broadcast the new reading in real-time
      this.eventsGateway.broadcastESP32Reading(dto.device_id, savedReading);

      return savedReading;
    } catch (error) {
      this.logger.error(`Failed to store ESP32 data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get latest reading from a specific device
   */
  async getLatestReading(deviceId: string): Promise<ESP32Reading | null> {
    return await this.esp32Repository.findOne({
      where: { deviceId },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Get all readings for a device (paginated)
   */
  async getDeviceReadings(
    deviceId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<{ data: ESP32Reading[]; total: number }> {
    const [data, total] = await this.esp32Repository.findAndCount({
      where: { deviceId },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { data, total };
  }

  /**
   * Get readings within a time range
   */
  async getReadingsByDateRange(
    deviceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ESP32Reading[]> {
    return await this.esp32Repository
      .createQueryBuilder('reading')
      .where('reading.deviceId = :deviceId', { deviceId })
      .andWhere('reading.timestamp >= :startDate', { startDate })
      .andWhere('reading.timestamp <= :endDate', { endDate })
      .orderBy('reading.timestamp', 'DESC')
      .getMany();
  }

  /**
   * Calculate statistics for a device
   */
  async getDeviceStats(
    deviceId: string,
    hoursBack: number = 24,
  ): Promise<ESP32StatsDto> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const readings = await this.esp32Repository
      .createQueryBuilder('reading')
      .where('reading.deviceId = :deviceId', { deviceId })
      .andWhere('reading.timestamp >= :cutoffTime', { cutoffTime })
      .orderBy('reading.timestamp', 'DESC')
      .getMany();

    if (readings.length === 0) {
      return this.getEmptyStats(deviceId);
    }

    const waterLevels = readings.map((r) => r.waterLevelCm);
    const temperatures = readings.map((r) => r.temperature);
    const humidities = readings.map((r) => r.humidity);
    const rainCount = readings.filter((r) => r.rainDetected).length;

    return {
      avgWaterLevelCm: Math.round((waterLevels.reduce((a, b) => a + b, 0) / waterLevels.length) * 10) / 10,
      avgWaterLevelPercent: Math.round(readings.reduce((a, b) => a + b.waterLevelPercent, 0) / readings.length),
      avgTemperature: Math.round((temperatures.reduce((a, b) => a + b, 0) / temperatures.length) * 10) / 10,
      avgHumidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
      maxWaterLevelCm: Math.max(...waterLevels),
      minWaterLevelCm: Math.min(...waterLevels),
      maxTemperature: Math.max(...temperatures),
      minTemperature: Math.min(...temperatures),
      rainDetectedCount: rainCount,
      totalReadings: readings.length,
      latestAlert: readings[0]?.alert || 'UNKNOWN',
      latestPumpStatus: readings[0]?.pumpStatus || 'UNKNOWN',
    };
  }

  /**
   * Get all devices that have sent data
   */
  async getAllDevices(): Promise<string[]> {
    const result = await this.esp32Repository
      .createQueryBuilder('reading')
      .select('DISTINCT reading.deviceId', 'deviceId')
      .orderBy('reading.deviceId', 'ASC')
      .getRawMany();

    return result.map((r) => r.deviceId);
  }

  /**
   * Delete old readings (data retention)
   */
  async deleteOldReadings(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const result = await this.esp32Repository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`Deleted ${result.affected} old readings older than ${daysOld} days`);
    return result.affected || 0;
  }

  private getEmptyStats(deviceId: string): ESP32StatsDto {
    return {
      avgWaterLevelCm: 0,
      avgWaterLevelPercent: 0,
      avgTemperature: 0,
      avgHumidity: 0,
      maxWaterLevelCm: 0,
      minWaterLevelCm: 0,
      maxTemperature: 0,
      minTemperature: 0,
      rainDetectedCount: 0,
      totalReadings: 0,
      latestAlert: 'NO_DATA',
      latestPumpStatus: 'NO_DATA',
    };
  }
}
