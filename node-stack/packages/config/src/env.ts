import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url("A valid PostgreSQL URL is required"),
  REDIS_URL: z.string().url("A valid Redis URL is required").optional().or(z.literal('')),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),
  JWT_SECRET: z.string().min(16, "JWT Secret must be at least 16 characters long"),
  CORS_ORIGINS: z.string().optional(),
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional().or(z.literal('')),
  MINIO_ENDPOINT: z.string().optional(),
  MINIO_ROOT_USER: z.string().optional(),
  MINIO_ROOT_PASSWORD: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production') {
    if (!data.SENTRY_DSN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SENTRY_DSN'],
        message: 'SENTRY_DSN is required in production',
      });
    }
    if (!data.REDIS_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REDIS_URL'],
        message: 'REDIS_URL is required in production',
      });
    }
  }
});

export type EnvVars = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const formattedErrors = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n  ');
    console.error(`\n❌ Invalid environment variables:\n  ${formattedErrors}\n`);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}
