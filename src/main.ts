import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module';
import { API_KEY_HEADER } from './modules/portaria/infrastructure/auth/api-key.guard';
import { DomainErrorFilter } from './shared/infrastructure/http/domain-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalFilters(new DomainErrorFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Condly API')
    .setDescription(
      'Gerenciamento de condomínio e apartamentos com integração com o sistema de portaria Condly',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', in: 'header', name: API_KEY_HEADER },
      'api-key',
    )
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = process.env.PORT || process.env.APP_PORT || 8080;
  await app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger: http://localhost:${port}/docs`);
  });
}
void bootstrap();
