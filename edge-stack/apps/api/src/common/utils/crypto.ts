/**
 * Utility for secure password hashing and verification using the WebCrypto API.
 * Optimized for Cloudflare Workers (Edge runtime).
 * Uses PBKDF2 with SHA-256.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Converts a Uint8Array or ArrayBuffer to a hex string.
 */
function bufToHex(buffer: ArrayBuffer | Uint8Array): string {
  const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(view)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Converts a hex string to a Uint8Array.
 */
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Derives a key from a password and salt using PBKDF2.
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  return await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    KEY_LENGTH * 8,
  );
}

/**
 * Hashes a password with a randomly generated salt.
 * Returns a string in the format: salt.hash (hex encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await deriveKey(password, salt);

  return `${bufToHex(salt)}.${bufToHex(hash)}`;
}

/**
 * Verifies if a password matches a given hash/salt combo.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, originalHashHex] = storedHash.split(".");
  if (!saltHex || !originalHashHex) return false;

  const salt = hexToBuf(saltHex);
  const derivedHash = await deriveKey(password, salt);
  const derivedHashHex = bufToHex(derivedHash);

  return derivedHashHex === originalHashHex;
}
