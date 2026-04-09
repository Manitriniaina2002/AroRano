import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { EventsModule } from './events/events.module';
import { Device } from './devices/device.entity';
import { SensorReading } from './devices/sensor-reading.entity';

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
      entities: [Device, SensorReading],
      synchronize: true, // Auto-sync schema in development
      logging: process.env.NODE_ENV === 'development',
    }),
    EventsModule,
    DevicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
