import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from '@common/filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger, ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ZodValidationPipe());
  patchNestJsSwagger();

  const config = new DocumentBuilder()
    .setTitle('Translation API')
    .setDescription('The Translation API description')
    .setVersion('1.0')
    .addTag('translation')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new DomainExceptionFilter(httpAdapterHost));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
