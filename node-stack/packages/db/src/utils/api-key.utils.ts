import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Stripe-style API Key generation.
 * Format: sk_[env]_[32_random_chars]
 */
export function generateApiKey(env: 'live' | 'test' = 'live'): string {
  const bytes = randomBytes(24).toString('base64url'); // ~32 chars
  return `sk_${env}_${bytes}`;
}

/**
 * HMAC-SHA256 hashing with pepper for secure storage.
 */
export function hashKey(key: string, pepper: string): string {
  return createHmac('sha256', pepper).update(key).digest('hex');
}

/**
 * Preview extraction for UI list.
 * First 10 chars (e.g., sk_live_ab...)
 */
export function getKeyPreview(key: string): string {
  return key.slice(0, 10);
}

/**
 * Extract prefix from API key (first 10 characters)
 */
export function extractPrefix(key: string): string {
  return key.slice(0, 10);
}

/**
 * Constant-time comparison to prevent timing attacks
 */
export function verifyApiKey(rawKey: string, hashedKey: string, pepper: string): boolean {
  const hash = Buffer.from(hashKey(rawKey, pepper), 'hex');
  const storedHash = Buffer.from(hashedKey, 'hex');

  if (hash.length !== storedHash.length) {
    return false;
  }

  return timingSafeEqual(hash, storedHash);
}
