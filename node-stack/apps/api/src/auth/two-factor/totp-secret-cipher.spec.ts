import { UnauthorizedException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { TotpSecretCipher } from "./totp-secret-cipher.js";
import { EncryptionService } from "../../common/services/encryption.service.js";

// Minimal stub: identity encrypt/decrypt for non-strict round-trips so
// we can isolate the cipher's format-guard behavior from the real
// AES-256-GCM utility (covered separately).
class StubEncryption {
  encrypt(input: string): string {
    return input;
  }
  decrypt(input: string): string {
    return input;
  }
}

const stub = new StubEncryption() as unknown as EncryptionService;

describe("TotpSecretCipher", () => {
  it("encrypt + decrypt round-trip a valid 3-part hex blob", () => {
    const cipher = new TotpSecretCipher(stub);
    const blob = "deadbeef:cafebabe:0123456789abcdef";
    const out = cipher.decrypt(cipher.encrypt(blob));
    expect(out).toBe(blob);
  });

  it("throws on legacy plaintext base32 seed", () => {
    const cipher = new TotpSecretCipher(stub);
    expect(() => cipher.decrypt("JBSWY3DPEHPK3PXP")).toThrow(
      UnauthorizedException,
    );
    expect(() => cipher.decrypt("JBSWY3DPEHPK3PXP")).toThrow(
      /please re-enroll your authenticator/,
    );
  });

  it("throws on 2-part input (missing authTag or ciphertext)", () => {
    const cipher = new TotpSecretCipher(stub);
    expect(() => cipher.decrypt("abc:def")).toThrow(UnauthorizedException);
  });

  it("throws on empty string", () => {
    const cipher = new TotpSecretCipher(stub);
    expect(() => cipher.decrypt("")).toThrow(UnauthorizedException);
  });

  it("throws on input with non-hex characters", () => {
    const cipher = new TotpSecretCipher(stub);
    expect(() => cipher.decrypt("zzzz:yyyy:xxxx")).toThrow(UnauthorizedException);
  });
});
