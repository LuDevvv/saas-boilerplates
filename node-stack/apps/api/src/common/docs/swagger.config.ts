import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';

/**
 * Configure Swagger and Reference UI (Scalar) for the API.
 */
export function setupSwagger(app: INestApplication): ReturnType<typeof SwaggerModule.createDocument> {
  const config = new DocumentBuilder()
    .setTitle('Node Stack API')
    .setDescription(
      'Production-ready Node.js SaaS Backend with NestJS. Explore the API using Swagger or Scalar Reference.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'Enter your workspace API key',
      },
      'ApiKeyAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Default Swagger UI
  SwaggerModule.setup('api/docs', app, cleanupOpenApiDoc(document));

  // Scalar UI
  app.use(
    '/api/reference',
    apiReference({
      spec: {
        content: document,
      },
      theme: 'purple',
      darkMode: true,
    } as unknown as Parameters<typeof apiReference>[0]),
  );

  return document;
}
