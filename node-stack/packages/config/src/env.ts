import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url("A valid PostgreSQL URL is required"),
  REDIS_URL: z.string().url("A valid Redis URL is required").optional().or(z.literal('')),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be ≥32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be ≥32 chars"),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/i, "ENCRYPTION_KEY must be 32 bytes (64 hex chars)"),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(1),
  CORS_ORIGINS: z.string().optional(),
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional().or(z.literal('')),
  MINIO_ENDPOINT: z.string().optional(),
  MINIO_ROOT_USER: z.string().optional(),
  MINIO_ROOT_PASSWORD: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  METRICS_TOKEN: z.string().optional().default('dev-metrics-token'),
  BILLING_PROVIDER: z.enum(['mock', 'polar']).default('mock'),
  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_ORGANIZATION_ID: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_SERVER: z.enum(['sandbox', 'production']).default('production'),
}).superRefine((data, ctx) => {
  if (data.BILLING_PROVIDER === 'polar') {
    if (!data.POLAR_ACCESS_TOKEN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['POLAR_ACCESS_TOKEN'],
        message: 'POLAR_ACCESS_TOKEN is required when BILLING_PROVIDER is polar',
      });
    }
  }
  if (data.JWT_REFRESH_SECRET === data.JWT_SECRET) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['JWT_REFRESH_SECRET'],
      message: 'JWT_REFRESH_SECRET must differ from JWT_SECRET',
    });
  }
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
