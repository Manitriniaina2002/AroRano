import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS - Allow ESP32 and other clients
  app.enableCors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('AroRano API')
    .setDescription('AroRano Full-Stack Application API')
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  // Get local IP for reference
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }
  
  console.log(`\n✓ Application is running on: http://localhost:${port}`);
  console.log(`✓ Accessible from network at: http://${localIP}:${port}`);
  console.log(`✓ Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`✓ ESP32 API endpoint: http://${localIP}:${port}/api/esp32/data\n`);
}
bootstrap();
