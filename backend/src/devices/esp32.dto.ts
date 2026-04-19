import { IsString, IsNumber, IsBoolean, IsDateString, IsIn, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateESP32ReadingDto {
  @ApiProperty({ example: 'reservoir_01', description: 'Device identifier' })
  @IsString()
  device_id: string;

  @ApiProperty({ example: '2026-04-19T06:30:00Z', description: 'Timestamp from ESP32 (optional, server uses current time if not provided)', required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiProperty({ example: 35.2, description: 'Water level in centimeters' })
  @IsNumber()
  @Min(0)
  water_level_cm: number;

  @ApiProperty({ example: 68, description: 'Water level as percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  water_level_percent: number;

  @ApiProperty({ example: 27.5, description: 'Temperature in Celsius' })
  @IsNumber()
  temperature: number;

  @ApiProperty({ example: 75, description: 'Humidity percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @ApiProperty({ example: false, description: 'Rain detection status' })
  @IsBoolean()
  rain_detected: boolean;

  @ApiProperty({ example: 'OFF', enum: ['ON', 'OFF'], description: 'Pump status' })
  @IsString()
  @IsIn(['ON', 'OFF'])
  pump_status: string;

  @ApiProperty({
    example: 'NORMAL',
    enum: ['NORMAL', 'WARNING', 'CRITICAL'],
    description: 'Alert level',
  })
  @IsString()
  @IsIn(['NORMAL', 'WARNING', 'CRITICAL'])
  alert: string;
}

export class ESP32ReadingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  waterLevelCm: number;

  @ApiProperty()
  waterLevelPercent: number;

  @ApiProperty()
  temperature: number;

  @ApiProperty()
  humidity: number;

  @ApiProperty()
  rainDetected: boolean;

  @ApiProperty()
  pumpStatus: string;

  @ApiProperty()
  alert: string;

  @ApiProperty()
  createdAt: Date;
}

export class ESP32StatsDto {
  @ApiProperty({ description: 'Average water level in cm' })
  avgWaterLevelCm: number;

  @ApiProperty({ description: 'Average water level percentage' })
  avgWaterLevelPercent: number;

  @ApiProperty({ description: 'Average temperature' })
  avgTemperature: number;

  @ApiProperty({ description: 'Average humidity' })
  avgHumidity: number;

  @ApiProperty({ description: 'Max water level recorded' })
  maxWaterLevelCm: number;

  @ApiProperty({ description: 'Min water level recorded' })
  minWaterLevelCm: number;

  @ApiProperty({ description: 'Max temperature recorded' })
  maxTemperature: number;

  @ApiProperty({ description: 'Min temperature recorded' })
  minTemperature: number;

  @ApiProperty({ description: 'Times rain was detected' })
  rainDetectedCount: number;

  @ApiProperty({ description: 'Total readings count' })
  totalReadings: number;

  @ApiProperty({ description: 'Latest alert status' })
  latestAlert: string;

  @ApiProperty({ description: 'Latest pump status' })
  latestPumpStatus: string;
}
