import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';
import { SensorReading } from './sensor-reading.entity';
import { CreateDeviceDto, UpdateDeviceDto } from './dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(SensorReading)
    private sensorReadingRepository: Repository<SensorReading>,
    private eventsGateway: EventsGateway,
  ) {}

  // Device CRUD operations
  async createDevice(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const device = this.deviceRepository.create(createDeviceDto);
    const savedDevice = await this.deviceRepository.save(device);
    
    // Emit real-time event
    this.eventsGateway.broadcastDeviceCreated(savedDevice);
    
    return savedDevice;
  }

  async getAllDevices(): Promise<Device[]> {
    return await this.deviceRepository.find({
      relations: ['readings'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDeviceById(id: string): Promise<Device | null> {
    return await this.deviceRepository.findOne({
      where: { id },
      relations: ['readings'],
    });
  }

  async updateDevice(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device | null> {
    await this.deviceRepository.update(id, updateDeviceDto);
    const updated = await this.getDeviceById(id);
    
    // Emit real-time event
    if (updated) {
      this.eventsGateway.broadcastDeviceUpdate(id, updated);
    }
    
    return updated;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await this.deviceRepository.delete(id);
    
    // Emit real-time event
    if (result.affected && result.affected > 0) {
      this.eventsGateway.broadcastDeviceDeleted(id);
    }
    
    return (result.affected ?? 0) > 0;
  }

  // Sensor data operations
  async addSensorReading(
    deviceId: string,
    value: number,
    unit: string,
  ): Promise<SensorReading> {
    const reading = this.sensorReadingRepository.create({
      deviceId,
      value,
      unit,
    });
    const savedReading = await this.sensorReadingRepository.save(reading);
    
    // Emit real-time event to subscribed clients
    this.eventsGateway.broadcastSensorReading(deviceId, savedReading);
    
    return savedReading;
  }

  async getDeviceReadings(
    deviceId: string,
    limit: number = 100,
  ): Promise<SensorReading[]> {
    return await this.sensorReadingRepository.find({
      where: { deviceId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getDeviceStats(deviceId: string) {
    const readings = await this.sensorReadingRepository.find({
      where: { deviceId },
      order: { timestamp: 'DESC' },
      take: 1000,
    });

    if (readings.length === 0) {
      return { average: 0, min: 0, max: 0, latest: null };
    }

    const values = readings.map((r) => r.value);
    const average = values.reduce((a, b) => a + b) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = readings[0];

    return { average, min, max, latest };
  }
}
