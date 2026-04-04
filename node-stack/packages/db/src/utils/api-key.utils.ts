import { createHash, randomBytes } from 'node:crypto';

/**
 * Stripe-style API Key generation.
 * Format: sk_[env]_[32_random_chars]
 */
export function generateApiKey(env: 'live' | 'test' = 'live'): string {
  const bytes = randomBytes(24).toString('base64url'); // ~32 chars
  return `sk_${env}_${bytes}`;
}

/**
 * SHA-256 hashing for secure storage.
 * Stripe pattern: Store the hash of the full key.
 */
export function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Preview extraction for UI list.
 * First 10 chars (e.g., sk_live_ab...)
 */
export function getKeyPreview(key: string): string {
  return key.slice(0, 10);
}
