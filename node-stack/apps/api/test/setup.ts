import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnprocessableEntityException } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { createZodValidationPipe } from 'nestjs-zod';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

// Mock Redis at the module level since services create their own instances via `new Redis()`
jest.mock('ioredis', () => require('ioredis-mock'));

let app: INestApplication;

export async function createApp(): Promise<INestApplication> {
  if (app) return app;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new (createZodValidationPipe({
      createValidationException: (error: any) => {
        return new UnprocessableEntityException({
          statusCode: 422,
          message: "Validation failed",
          errors: error.errors.map((e: any) => ({
            path: e.path,
            message: e.message,
          })),
        });
      },
    }))(),
  );
  
  app.setGlobalPrefix('v1', {
    exclude: [
      "/api/docs",
      "/api/docs-json",
      "/billing/webhook",
      "/health",
      "/health/live",
      "/health/ready",
    ],
  });
  
  await app.init();
  return app;
}

export function getRequest() {
  return request(app.getHttpServer());
}
