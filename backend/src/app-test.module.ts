import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { MockDevicesService } from './devices/mock-devices.service';
import { DevicesController } from './devices/devices.controller';
import { DevicesService } from './devices/devices.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventsModule,
  ],
  controllers: [AppController, DevicesController],
  providers: [
    AppService,
    MockDevicesService,
    {
      provide: DevicesService,
      useClass: MockDevicesService,
    },
  ],
})
export class AppTestModule {}
