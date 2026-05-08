import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * AES-256-GCM encryption utility for sensitive data at rest.
 * Format: iv:authTag:ciphertext (hex-encoded)
 */
export class EncryptionUtils {
  private readonly key: Buffer;

  constructor(rawKey?: string) {
    if (!rawKey) {
      this.key = Buffer.alloc(0);
      return;
    }

    this.key =
      rawKey.length === KEY_LENGTH * 2
        ? Buffer.from(rawKey, "hex")
        : Buffer.from(rawKey).subarray(0, KEY_LENGTH);

    if (this.key.length !== KEY_LENGTH) {
      throw new Error(
        `Encryption key must be exactly ${KEY_LENGTH} bytes.`,
      );
    }
  }

  get isEnabled(): boolean {
    return this.key.length === KEY_LENGTH;
  }

  encrypt(plaintext: string): string {
    if (!this.isEnabled) return plaintext;

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  decrypt(ciphertext: string): string {
    if (!this.isEnabled) return ciphertext;

    const parts = ciphertext.split(":");
    if (parts.length !== 3) {
      return ciphertext;
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex!, "hex");
    const authTag = Buffer.from(authTagHex!, "hex");

    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted!, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
