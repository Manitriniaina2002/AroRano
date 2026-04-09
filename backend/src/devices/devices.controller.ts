import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { Device } from './device.entity';
import { SensorReading } from './sensor-reading.entity';
import { CreateDeviceDto, UpdateDeviceDto, AddReadingDto } from './dto';

@ApiTags('devices')
@Controller('api/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new IoT device' })
  @ApiOkResponse({ type: Device })
  async createDevice(@Body() createDeviceDto: CreateDeviceDto): Promise<Device> {
    return await this.devicesService.createDevice(createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all IoT devices' })
  @ApiOkResponse({ type: [Device] })
  async getAllDevices(): Promise<Device[]> {
    return await this.devicesService.getAllDevices();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by ID' })
  @ApiOkResponse({ type: Device })
  async getDeviceById(@Param('id') id: string): Promise<Device | null> {
    return await this.devicesService.getDeviceById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update device' })
  @ApiOkResponse({ type: Device })
  async updateDevice(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<Device | null> {
    return await this.devicesService.updateDevice(id, updateDeviceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete device' })
  async deleteDevice(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.devicesService.deleteDevice(id);
    return { success };
  }

  @Post(':id/readings')
  @ApiOperation({ summary: 'Add sensor reading for device' })
  @ApiOkResponse({ type: SensorReading })
  async addReading(
    @Param('id') deviceId: string,
    @Body() addReadingDto: AddReadingDto,
  ): Promise<SensorReading> {
    return await this.devicesService.addSensorReading(
      deviceId,
      addReadingDto.value,
      addReadingDto.unit,
    );
  }

  @Get(':id/readings')
  @ApiOperation({ summary: 'Get sensor readings for device' })
  @ApiOkResponse({ type: [SensorReading] })
  async getReadings(
    @Param('id') deviceId: string,
  ): Promise<SensorReading[]> {
    return await this.devicesService.getDeviceReadings(deviceId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get device statistics' })
  async getStats(@Param('id') deviceId: string) {
    return await this.devicesService.getDeviceStats(deviceId);
  }
}
