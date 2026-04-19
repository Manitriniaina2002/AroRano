import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ESP32Reading } from './esp32-reading.entity';
import { ESP32Service } from './esp32.service';
import { ESP32Controller } from './esp32.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([ESP32Reading]), EventsModule],
  controllers: [ESP32Controller],
  providers: [ESP32Service],
  exports: [ESP32Service],
})
export class ESP32Module {}
