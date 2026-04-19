import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DevicesService } from './devices/devices.service';
import { DeviceType } from './devices/device-types';

/**
 * Seed script to populate the database with AroRano IoT devices
 * These are the actual hardware components connected to the ESP32
 * Run with: npm run seed
 */
async function seed() {
  const app = await NestFactory.create(AppModule);
  const devicesService = app.get(DevicesService);

  const sampleDevices = [
    // Sensors
    {
      name: 'Capteur de pluie',
      type: DeviceType.RAIN_SENSOR,
      location: 'Réservoir d\'eau',
      status: 'active',
      metadata: { pin: 'GPIO_ADC', unit: 'mm' },
    },
    {
      name: 'Capteur Ultrasonic',
      type: DeviceType.ULTRASONIC,
      location: 'Réservoir d\'eau',
      status: 'active',
      metadata: { trigPin: 'GPIO_5', echoPin: 'GPIO_18', unit: 'cm' },
    },
    {
      name: 'DHT22 (Temp/Humidité)',
      type: DeviceType.DHT22,
      location: 'Réservoir d\'eau',
      status: 'active',
      metadata: { pin: 'GPIO_4', unit: '°C / %' },
    },
    
    // Actuators
    {
      name: 'Pompe à eau',
      type: DeviceType.WATER_PUMP,
      location: 'Réservoir d\'eau',
      status: 'active',
      metadata: { pin: 'GPIO_12', controlType: 'relay' },
    },
    {
      name: 'Relais 1 canal',
      type: DeviceType.RELAY,
      location: 'Réservoir d\'eau',
      status: 'active',
      metadata: { pin: 'GPIO_14', capacity: '10A' },
    },
    
    // Indicators
    {
      name: 'Buzzer',
      type: DeviceType.BUZZER,
      location: 'Réservoir d\'eau',
      status: 'active',
      metadata: { pin: 'GPIO_25', frequency: '1kHz' },
    },
    {
      name: 'LED rouge/vert/jaune',
      type: DeviceType.LED_RGB,
      location: 'Réservoir d\'eau',
      status: 'active',
      metadata: { redPin: 'GPIO_26', greenPin: 'GPIO_27', yellowPin: 'GPIO_32' },
    },
    {
      name: 'Écran LCD',
      type: DeviceType.LCD_SCREEN,
      location: 'Réservoir d\'eau',
      status: 'active',
      metadata: { interface: 'I2C', address: '0x27', size: '16x2' },
    },
    
    // Control
    {
      name: 'Bouton poussoir',
      type: DeviceType.PUSH_BUTTON,
      location: 'Réservoir d\'eau',
      status: 'active',
      metadata: { pin: 'GPIO_35', pullupMode: true },
    },
    
    // Microcontroller
    {
      name: 'ESP32 Contrôleur Principal',
      type: DeviceType.ESP32,
      location: 'Réservoir d\'eau',
      status: 'active',
      metadata: {
        model: 'ESP32-WROOM-32',
        firmware: 'v1.0',
        wifiEnabled: true,
      },
    },
  ];

  console.log('🌱 Seeding database with AroRano IoT devices...');

  for (const device of sampleDevices) {
    try {
      const created = await devicesService.createDevice(device);
      console.log(`✅ Created device: ${created.name} (${created.type})`);

      // Add sample readings for sensor-type devices
      const sensorTypes = [
        DeviceType.RAIN_SENSOR,
        DeviceType.ULTRASONIC,
        DeviceType.DHT22,
      ];

      if (sensorTypes.includes(created.type as DeviceType)) {
        const readings = Array.from({ length: 5 }, (_, i) => {
          let value = 0;
          let unit = 'units';

          if (created.type === DeviceType.RAIN_SENSOR) {
            value = Math.random() * 50;
            unit = 'mm';
          } else if (created.type === DeviceType.ULTRASONIC) {
            value = Math.random() * 300 + 20; // 20-320cm
            unit = 'cm';
          } else if (created.type === DeviceType.DHT22) {
            value = Math.random() * 10 + 20; // 20-30°C
            unit = '°C';
          }

          return { value, unit };
        });

        for (const reading of readings) {
          await devicesService.addSensorReading(created.id, reading.value, reading.unit);
        }

        console.log(`   ✓ Added 5 sample readings for ${created.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating device ${device.name}:`, error);
    }
  }

  console.log('✨ Seeding complete!');
  await app.close();
}

seed().catch(console.error);
