import type { Queue, KVNamespace, R2Bucket } from "@cloudflare/workers-types";
import type { QueueMessage, EmailJobPayload } from "@workspace/types";

/**
 * Global environment bindings for Cloudflare Workers.
 * Includes secrets, KV namespaces, R2 buckets, and Queues.
 */
export type Bindings = {
  /** PostgreSQL connection string for Neon */
  DATABASE_URL: string;
  /** Secret key for JWT signing and verification */
  JWT_SECRET: string;
  /** Key for AES-GCM encryption of sensitive data at rest */
  ENCRYPTION_KEY: string;
  /** Canonical public URL of the application */
  PUBLIC_APP_URL: string;
  /** Cloudflare Turnstile secret key for bot protection */
  TURNSTILE_SECRET_KEY: string;
  /** Standard Hono rate limiter binding */
  RATE_LIMITER: {
    limit: (req: { key: string }) => Promise<{ success: boolean }>;
  };
  /** R2 Storage bucket for assets */
  R2_BUCKET: R2Bucket;
  R2_BUCKET_NAME: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_ENDPOINT: string;
  R2_PUBLIC_URL: string;
  /** Generic background jobs queue */
  JOBS_QUEUE: Queue<any>;
  /** Specialized queue for transactional emails */
  EMAIL_QUEUE: Queue<EmailJobPayload>;
  /** Resend API key for direct email delivery */
  RESEND_API_KEY: string;
  /** KV Namespace for usage tracking */
  USAGE_KV: KVNamespace;
  /** KV Namespace for system-wide caching */
  CACHE_KV: KVNamespace;
  /** KV Namespace for rate limit state */
  RATE_LIMIT_KV: KVNamespace;
  /** Polar.sh access token */
  POLAR_ACCESS_TOKEN: string;
  /** Polar.sh webhook secret for HMAC validation */
  POLAR_WEBHOOK_SECRET: string;
  /** Active billing provider (Fixed to Polar) */
  BILLING_PROVIDER: "polar";
  /** Sentry DSN for error tracking */
  SENTRY_DSN: string;
  SENTRY_ENVIRONMENT?: string;
  SENTRY_TRACES_SAMPLE_RATE?: number;
  SENTRY_ENABLE_LOGS?: boolean;
  SENTRY_SEND_DEFAULT_PII?: boolean;
  /** OAuth 2.0 Credentials */
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  /** Node environment state */
  NODE_ENV: "development" | "production" | "test";
  /** PostHog analytics configuration */
  POSTHOG_PROJECT_KEY: string;
  POSTHOG_API_KEY?: string;
  POSTHOG_HOST?: string;
  /** Axiom logging configuration */
  AXIOM_TOKEN: string;
  AXIOM_DATASET: string;
};

/**
 * Context variables injected into every request by middleware.
 */
export type Variables = {
  /** Current authenticated user ID */
  userId: string;
  /** Active workspace ID (if scoped) */
  workspaceId?: string;
  /** User's role within the current workspace */
  workspaceRole?: string;
  /** Flattened list of user permissions for the current context */
  permissions?: string[];
  /** Structured user profile info */
  user: {
    id: string;
    email: string;
    role: string;
  };
  /** IP address of the requesting client */
  clientIp: string;
  /** Preferred language of the user */
  lang: "en" | "es";
  /** Sentry SDK integration for request tracking */
  sentry: {
    captureException: (error: Error) => void;
  };
};

/**
 * Global application context type consumed by Hono handlers.
 */
export type AppContext = {
  Bindings: Bindings;
  Variables: Variables;
};
