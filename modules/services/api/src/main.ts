import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: Use on development environment only
  const config = new DocumentBuilder()
    .setTitle('Vidya')
    .setDescription('The Vidya API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Endpoints for authentication', {
      description: 'Docs',
      url: 'https://github.com/akdasa-studios/vidya/blob/main/docs/adr/001%20OTP%20Authentication.md',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(process.env.PORT ?? 8001);
}
bootstrap();
