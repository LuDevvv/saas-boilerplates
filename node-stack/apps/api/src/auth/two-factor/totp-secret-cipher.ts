import { Injectable, UnauthorizedException } from "@nestjs/common";

import { EncryptionService } from "@/common/services/encryption.service.js";

// AES-256-GCM blob produced by EncryptionService is `iv:authTag:ciphertext`,
// each segment lowercase hex. Anything that does not match is either a
// legacy plaintext base32 TOTP seed or unrelated content; either way it
// is not safe to call decrypt() on it (the wrapped utility silently
// returns the input unchanged for non-3-part values, defeating the
// encryption guarantee for legacy enrollments).
const ENCRYPTED_BLOB_FORMAT = /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i;

@Injectable()
export class TotpSecretCipher {
  constructor(private readonly encryption: EncryptionService) {}

  encrypt(plaintext: string): string {
    return this.encryption.encrypt(plaintext);
  }

  decrypt(stored: string): string {
    if (!ENCRYPTED_BLOB_FORMAT.test(stored)) {
      // Legacy plaintext seeds from before TOTP-at-rest encryption was
      // introduced fall through to here; force users to re-enroll
      // rather than silently accept an unencrypted seed.
      throw new UnauthorizedException(
        "Stored 2FA secret is invalid; please re-enroll your authenticator.",
      );
    }
    return this.encryption.decrypt(stored);
  }
}
