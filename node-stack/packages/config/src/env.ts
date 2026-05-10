import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url("A valid PostgreSQL URL is required"),
  REDIS_URL: z.string().url("A valid Redis URL is required").optional().or(z.literal('')),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_PREFIX: z.string().optional(),
  REDIS_TLS: z.coerce.boolean().optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be ≥32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be ≥32 chars"),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/i, "ENCRYPTION_KEY must be 32 bytes (64 hex chars)"),
  API_KEY_PEPPER: z.string().min(32).optional(),
  TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(1),
  CORS_ORIGINS: z.string().optional(),
  FRONTEND_URL: z.string().url().optional().or(z.literal('')),
  APP_URL: z.string().url().optional().or(z.literal('')),
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional().or(z.literal('')),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  MINIO_ENDPOINT: z.string().optional(),
  MINIO_ROOT_USER: z.string().optional(),
  MINIO_ROOT_PASSWORD: z.string().optional(),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_BUCKET: z.string().optional(),
  MINIO_PUBLIC_URL: z.string().optional(),
  STORAGE_LOCAL_PATH: z.string().optional(),
  STORAGE_LOCAL_URL: z.string().optional(),
  EMAIL_PROVIDER: z.enum(['resend', 'ses', 'console', 'fallback']).default('console'),
  EMAIL_FROM: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['openai', 'openrouter', 'anthropic']).default('openai'),
  METRICS_TOKEN: z.string().optional().default('dev-metrics-token'),
  BILLING_PROVIDER: z.enum(['mock', 'polar']).default('mock'),
  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_ORGANIZATION_ID: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_SERVER: z.enum(['sandbox', 'production']).default('production'),
  POLAR_PORTAL_URL: z.string().url().optional().or(z.literal('')),
  // Polar product IDs — map semantic plan names ("pro", "elite") to actual
  // Polar product UUIDs from your dashboard. Copy from Products → Product ID.
  POLAR_PRODUCT_ID_PRO: z.string().optional(),
  POLAR_PRODUCT_ID_ELITE: z.string().optional(),
  POLAR_PRODUCT_ID_FREE: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().url().optional().or(z.literal('')),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional().or(z.literal('')),
  META_PIXEL_ID: z.string().optional(),
  META_ACCESS_TOKEN: z.string().optional(),
  META_API_VERSION: z.string().optional().default('v19.0'),
  META_TEST_EVENT_CODE: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_WELCOME_TEMPLATE: z.string().optional().default('welcome_message'),
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

export function validateEnv(config: Record<string, unknown>): EnvVars {
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
