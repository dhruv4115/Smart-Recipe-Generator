import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const allowedOrigins = configService.get<string[]>('cors.allowedOrigins') || [];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Smart Recipe Generator API')
    .setDescription('REST API for Smart Recipe Generator')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
  console.log(`🚀 Smart Recipe API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
