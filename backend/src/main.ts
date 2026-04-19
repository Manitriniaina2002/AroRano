import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  getHttpCorsOptions,
  getListenHost,
  getPrimaryLocalIp,
} from './network-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for local development plus configured LAN/frontend origins.
  app.enableCors(getHttpCorsOptions());

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
  const host = getListenHost();
  await app.listen(port, host);
  const localIP = getPrimaryLocalIp();
  
  console.log(`\n✓ Application is running on: http://localhost:${port}`);
  console.log(`✓ Accessible from network at: http://${localIP}:${port}`);
  console.log(`✓ Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`✓ ESP32 API endpoint: http://${localIP}:${port}/api/esp32/data\n`);
}
bootstrap();
