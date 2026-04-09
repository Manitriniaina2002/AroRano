import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppTestModule } from './app-test.module';

async function bootstrap() {
  const app = await NestFactory.create(AppTestModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('AroRano API (Test Mode)')
    .setDescription('AroRano IoT Platform API - Running in Test Mode (In-Memory Data)')
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`✅ Application is running in TEST MODE (in-memory data)`);
  console.log(`📡 Local:        http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  console.log(`💚 Health:       http://localhost:${port}/api/health`);
  console.log(`\n⚠️  Note: Data is stored in memory and will be lost on restart`);
}
bootstrap();
