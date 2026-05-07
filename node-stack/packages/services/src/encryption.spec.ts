import { describe, expect, it } from "vitest";

import { EncryptionUtils } from "./encryption.js";

const TEST_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("EncryptionUtils", () => {
  it("encrypts and decrypts a round-trip", () => {
    const utils = new EncryptionUtils(TEST_KEY);
    const plaintext = "JBSWY3DPEHPK3PXP";
    const encrypted = utils.encrypt(plaintext);
    const decrypted = utils.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("produces ciphertext in the expected iv:tag:ct hex format", () => {
    const utils = new EncryptionUtils(TEST_KEY);
    const encrypted = utils.encrypt("any-secret");
    expect(encrypted).toMatch(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);
  });

  it("produces different ciphertexts for the same plaintext (random IV)", () => {
    const utils = new EncryptionUtils(TEST_KEY);
    const a = utils.encrypt("same-input");
    const b = utils.encrypt("same-input");
    expect(a).not.toBe(b);
  });

  it("throws on tampered ciphertext segment", () => {
    const utils = new EncryptionUtils(TEST_KEY);
    const encrypted = utils.encrypt("hello world");
    const [iv, tag, ct] = encrypted.split(":");
    // Flip one character of the ciphertext segment.
    const tampered = `${iv}:${tag}:${ct.slice(0, -1)}${ct.endsWith("0") ? "1" : "0"}`;
    expect(() => utils.decrypt(tampered)).toThrow();
  });

  it("throws on tampered authTag", () => {
    const utils = new EncryptionUtils(TEST_KEY);
    const encrypted = utils.encrypt("hello world");
    const [iv, tag, ct] = encrypted.split(":");
    const tampered = `${iv}:${tag.slice(0, -1)}${tag.endsWith("0") ? "1" : "0"}:${ct}`;
    expect(() => utils.decrypt(tampered)).toThrow();
  });

  it("throws on tampered IV", () => {
    const utils = new EncryptionUtils(TEST_KEY);
    const encrypted = utils.encrypt("hello world");
    const [iv, tag, ct] = encrypted.split(":");
    const tampered = `${iv.slice(0, -1)}${iv.endsWith("0") ? "1" : "0"}:${tag}:${ct}`;
    expect(() => utils.decrypt(tampered)).toThrow();
  });

  it("rejects a too-short raw key", () => {
    // Non-hex-length strings are truncated/padded to KEY_LENGTH (32) by
    // Buffer.from(rawKey).subarray; a 4-byte string yields a 4-byte
    // buffer which fails the length check.
    expect(() => new EncryptionUtils("abc")).toThrow(/must be exactly/);
  });

  it("falls through (passthrough) when constructed with no key", () => {
    // EncryptionUtils with empty rawKey enters disabled mode where
    // encrypt/decrypt are identity. This is the inherited behavior the
    // TotpSecretCipher wrapper guards against; we test it here so a
    // future refactor that removes the passthrough surfaces the
    // change.
    const utils = new EncryptionUtils();
    expect(utils.encrypt("plain")).toBe("plain");
    expect(utils.decrypt("plain")).toBe("plain");
  });
});
