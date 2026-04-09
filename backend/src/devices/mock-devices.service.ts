import { Injectable } from '@nestjs/common';

/**
 * In-memory mock of the DevicesService for testing without database
 */
@Injectable()
export class MockDevicesService {
  private devices = new Map();
  private readings = new Map();

  async createDevice(data: any) {
    const id = Math.random().toString(36).substr(2, 9);
    const device = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
    this.devices.set(id, device);
    return device;
  }

  async getAllDevices() {
    return Array.from(this.devices.values());
  }

  async getDeviceById(id: string) {
    return this.devices.get(id) || null;
  }

  async updateDevice(id: string, data: any) {
    const device = this.devices.get(id);
    if (!device) return null;
    const updated = { ...device, ...data, updatedAt: new Date() };
    this.devices.set(id, updated);
    return updated;
  }

  async deleteDevice(id: string) {
    return this.devices.delete(id);
  }

  async addSensorReading(deviceId: string, value: number, unit: string) {
    if (!this.readings.has(deviceId)) {
      this.readings.set(deviceId, []);
    }
    const reading = {
      id: Math.random().toString(36).substr(2, 9),
      deviceId,
      value,
      unit,
      timestamp: new Date(),
    };
    this.readings.get(deviceId).push(reading);
    return reading;
  }

  async getDeviceReadings(deviceId: string) {
    return (this.readings.get(deviceId) || []).reverse();
  }

  async getDeviceStats(deviceId: string) {
    const readings = this.readings.get(deviceId) || [];
    if (readings.length === 0) {
      return { average: 0, min: 0, max: 0, latest: null };
    }
    const values = readings.map((r: any) => r.value);
    return {
      average: values.reduce((a: number, b: number) => a + b) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: readings[0],
    };
  }
}
