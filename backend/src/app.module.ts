import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { ESP32Module } from './devices/esp32.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { Device } from './devices/device.entity';
import { SensorReading } from './devices/sensor-reading.entity';
import { ESP32Reading } from './devices/esp32-reading.entity';
import { User } from './auth/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'arorano_iot',
      entities: [Device, SensorReading, ESP32Reading, User],
      synchronize: true, // Auto-sync schema in development
      logging: process.env.NODE_ENV === 'development',
    }),
    EventsModule,
    DevicesModule,
    ESP32Module,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
