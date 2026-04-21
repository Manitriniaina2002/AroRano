import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ESP32Service } from './esp32.service';
import { CreateESP32ReadingDto, CreateESP32CommandDto, ESP32CommandResponseDto, ESP32ReadingResponseDto, ESP32StatsDto } from './esp32.dto';
import { ESP32Reading } from './esp32-reading.entity';

@ApiTags('esp32')
@Controller('api/esp32')
export class ESP32Controller {
  constructor(private readonly esp32Service: ESP32Service) {}

  /**
   * Receive data from ESP32 device
   * POST /api/esp32/data
   */
  @Post('data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Receive ESP32 sensor data',
    description: 'Receive real-time sensor data from ESP32 device (water level, temperature, humidity, etc.)',
  })
  @ApiOkResponse({ type: ESP32ReadingResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid data format' })
  async receiveData(@Body() dto: CreateESP32ReadingDto): Promise<ESP32Reading> {
    return await this.esp32Service.receiveESP32Data(dto);
  }

  /**
   * Get recent ESP32 data from all devices
   * GET /api/esp32/data
   */
  @Get('data')
  @ApiOperation({
    summary: 'Get recent ESP32 data',
    description: 'Retrieve recent sensor readings from all ESP32 devices',
  })
  @ApiOkResponse({ type: [ESP32ReadingResponseDto] })
  async getRecentData(
    @Query('limit') limit: string = '50',
    @Query('deviceId') deviceId?: string,
  ): Promise<ESP32Reading[]> {
    const limitNum = Math.min(parseInt(limit) || 50, 500);
    if (limitNum < 1) {
      throw new BadRequestException('limit must be >= 1');
    }
    return await this.esp32Service.getRecentData(limitNum, deviceId);
  }

  /**
   * Get latest reading from a device
   * GET /api/esp32/devices/:deviceId/latest
   */
  @Get('devices/:deviceId/latest')
  @ApiOperation({ summary: 'Get latest reading from device' })
  @ApiOkResponse({ type: ESP32ReadingResponseDto })
  async getLatestReading(@Param('deviceId') deviceId: string): Promise<ESP32Reading | null> {
    return await this.esp32Service.getLatestReading(deviceId);
  }

  /**
   * Get readings from a device (paginated)
   * GET /api/esp32/devices/:deviceId/readings
   */
  @Get('devices/:deviceId/readings')
  @ApiOperation({ summary: 'Get paginated readings from device' })
  @ApiOkResponse({ type: [ESP32ReadingResponseDto] })
  async getReadings(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit: string = '100',
    @Query('offset') offset: string = '0',
  ): Promise<{ data: ESP32Reading[]; total: number }> {
    const limitNum = Math.min(parseInt(limit) || 100, 1000); // Max 1000 per request
    const offsetNum = parseInt(offset) || 0;

    if (limitNum < 1 || offsetNum < 0) {
      throw new BadRequestException('limit must be >= 1 and offset must be >= 0');
    }

    return await this.esp32Service.getDeviceReadings(deviceId, limitNum, offsetNum);
  }

  /**
   * Get readings within a date range
   * GET /api/esp32/devices/:deviceId/readings/range
   */
  @Get('devices/:deviceId/readings/range')
  @ApiOperation({ summary: 'Get readings within date range' })
  @ApiOkResponse({ type: [ESP32ReadingResponseDto] })
  async getReadingsByRange(
    @Param('deviceId') deviceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ESP32Reading[]> {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate query parameters are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO 8601 format (e.g., 2026-04-19T00:00:00Z)');
    }

    if (start > end) {
      throw new BadRequestException('startDate must be before endDate');
    }

    return await this.esp32Service.getReadingsByDateRange(deviceId, start, end);
  }

  /**
   * Get device statistics
   * GET /api/esp32/devices/:deviceId/stats
   */
  @Get('devices/:deviceId/stats')
  @ApiOperation({
    summary: 'Get device statistics',
    description: 'Get aggregated statistics (averages, min/max, etc.) for a device',
  })
  @ApiOkResponse({ type: ESP32StatsDto })
  async getStats(
    @Param('deviceId') deviceId: string,
    @Query('hoursBack') hoursBack: string = '24',
  ): Promise<ESP32StatsDto> {
    const hours = parseInt(hoursBack) || 24;

    if (hours < 1 || hours > 8760) {
      // Max 1 year
      throw new BadRequestException('hoursBack must be between 1 and 8760');
    }

    return await this.esp32Service.getDeviceStats(deviceId, hours);
  }

  /**
   * Send a fill reservoir command to a device
   * POST /api/esp32/devices/:deviceId/fill
   */
  @Post('devices/:deviceId/fill')
  @ApiOperation({ summary: 'Send fill reservoir command to device' })
  @ApiOkResponse({ type: ESP32CommandResponseDto })
  async fillReservoir(
    @Param('deviceId') deviceId: string,
    @Body() dto: CreateESP32CommandDto,
  ) {
    return await this.esp32Service.requestFillReservoir(deviceId, dto.requestedBy, dto.durationSeconds, dto.notes);
  }

  /**
   * Get latest command for a device
   * GET /api/esp32/devices/:deviceId/commands/latest
   */
  @Get('devices/:deviceId/commands/latest')
  @ApiOperation({ summary: 'Get latest command for device' })
  @ApiOkResponse({ type: ESP32CommandResponseDto })
  async getLatestCommand(@Param('deviceId') deviceId: string) {
    return await this.esp32Service.getLatestCommand(deviceId);
  }

  /**
   * Get commands for a device
   * GET /api/esp32/devices/:deviceId/commands
   */
  @Get('devices/:deviceId/commands')
  @ApiOperation({ summary: 'Get command history for device' })
  @ApiOkResponse({ type: [ESP32CommandResponseDto] })
  async getCommands(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    if (limitNum < 1 || offsetNum < 0) {
      throw new BadRequestException('limit must be >= 1 and offset must be >= 0');
    }

    return await this.esp32Service.getDeviceCommands(deviceId, limitNum, offsetNum);
  }

  /**
   * Acknowledge an ESP32 command
   * PATCH /api/esp32/devices/:deviceId/commands/:commandId
   */
  @Patch('devices/:deviceId/commands/:commandId')
  @ApiOperation({ summary: 'Acknowledge or complete a command' })
  @ApiOkResponse({ type: ESP32CommandResponseDto })
  async acknowledgeCommand(
    @Param('deviceId') deviceId: string,
    @Param('commandId') commandId: string,
    @Body() body: { status?: 'acknowledged' | 'executed' | 'failed'; errorMessage?: string },
  ) {
    return await this.esp32Service.acknowledgeCommand(deviceId, commandId, body.status ?? 'acknowledged', body.errorMessage);
  }

  /**
   * Get all devices that have sent data
   * GET /api/esp32/devices
   */
  @Get('devices')
  @ApiOperation({ summary: 'Get all ESP32 devices' })
  async getAllDevices(): Promise<{ devices: string[] }> {
    const devices = await this.esp32Service.getAllDevices();
    return { devices };
  }

  /**
   * Health check endpoint for ESP32
   * GET /api/esp32/health
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check for ESP32 API' })
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    return {
      status: 'OK',
      timestamp: new Date(),
    };
  }

  /**
   * Get API status and information
   * GET /api/esp32
   */
  @Get()
  @ApiOperation({ summary: 'Get ESP32 API status' })
  async getStatus(): Promise<{ status: string; message: string; endpoints: object; timestamp: Date }> {
    return {
      status: 'operational',
      message: 'ESP32 API is running',
      endpoints: {
        health: 'GET /api/esp32/health',
        getAllDevices: 'GET /api/esp32/devices',
        receiveData: 'POST /api/esp32/data',
        getLatestReading: 'GET /api/esp32/devices/:deviceId/latest',
        getReadings: 'GET /api/esp32/devices/:deviceId/readings',
        getReadingsByRange: 'GET /api/esp32/devices/:deviceId/readings/range',
        getStats: 'GET /api/esp32/devices/:deviceId/stats',
        fillReservoir: 'POST /api/esp32/devices/:deviceId/fill',
        getLatestCommand: 'GET /api/esp32/devices/:deviceId/commands/latest',
        getCommands: 'GET /api/esp32/devices/:deviceId/commands',
        acknowledgeCommand: 'PATCH /api/esp32/devices/:deviceId/commands/:commandId',
      },
      timestamp: new Date(),
    };
  }
}
