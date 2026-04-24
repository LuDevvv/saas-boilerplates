import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor.js';

/**
 * Decorator that enables idempotency for the endpoint.
 * Requires the 'Idempotency-Key' header.
 */
export function Idempotent() {
  return applyDecorators(
    UseInterceptors(IdempotencyInterceptor),
    ApiHeader({
      name: 'Idempotency-Key',
      description: 'Unique key to ensure request idempotency. Required for write operations.',
      required: false, // Set to false if we don't want to force it in Swagger UI for every request, but the prompt says "obligatorio"
    }),
  );
}

