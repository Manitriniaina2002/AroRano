import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DevicesService } from './devices/devices.service';

/**
 * Seed script to populate the database with sample IoT devices
 * Run with: npm run seed
 */
async function seed() {
  const app = await NestFactory.create(AppModule);
  const devicesService = app.get(DevicesService);

  const sampleDevices = [
    {
      name: 'Living Room Temperature',
      type: 'temperature',
      location: 'Living Room',
      status: 'active',
    },
    {
      name: 'Bedroom Humidity',
      type: 'humidity',
      location: 'Bedroom',
      status: 'active',
    },
    {
      name: 'Front Door Motion',
      type: 'motion',
      location: 'Front Door',
      status: 'active',
    },
    {
      name: 'Garage Light',
      type: 'light',
      location: 'Garage',
      status: 'active',
    },
    {
      name: 'Basement Pressure',
      type: 'pressure',
      location: 'Basement',
      status: 'inactive',
    },
  ];

  console.log('🌱 Seeding database with sample devices...');

  for (const device of sampleDevices) {
    try {
      const created = await devicesService.createDevice(device);
      console.log(`✅ Created device: ${created.name}`);

      // Add some sample readings
      const readings = Array.from({ length: 10 }, (_, i) => ({
        value: Math.random() * 30 + 15,
        unit: device.type === 'temperature' ? '°C' : device.type === 'humidity' ? '%' : 'units',
      }));

      for (const reading of readings) {
        await devicesService.addSensorReading(created.id, reading.value, reading.unit);
      }

      console.log(`   Added 10 sample readings for ${created.name}`);
    } catch (error) {
      console.error(`❌ Error creating device ${device.name}:`, error);
    }
  }

  console.log('✨ Seeding complete!');
  await app.close();
}

seed().catch(console.error);
