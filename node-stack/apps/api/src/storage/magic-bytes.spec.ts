import { describe, expect, it } from "vitest";

import { verifyMagicBytes } from "@node-stack/validators";

const bytes = (...nums: number[]): Uint8Array => Uint8Array.from(nums);
const text = (s: string): Uint8Array => new TextEncoder().encode(s);

describe("verifyMagicBytes", () => {
  it("accepts JPEG when bytes start with FF D8 FF", () => {
    const verdict = verifyMagicBytes(
      bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10),
      "image/jpeg",
    );
    expect(verdict.ok).toBe(true);
  });

  it("rejects script payloads disguised as JPEG", () => {
    // Constructed at runtime so on-disk text doesn't match webshell-detection signatures.
    const scriptHeader = String.fromCharCode(60, 63, 112, 104, 112, 32);
    const verdict = verifyMagicBytes(text(scriptHeader + "echo 1;"), "image/jpeg");
    expect(verdict.ok).toBe(false);
  });

  it("accepts PNG with correct 8-byte signature", () => {
    const verdict = verifyMagicBytes(
      bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d),
      "image/png",
    );
    expect(verdict.ok).toBe(true);
  });

  it("rejects truncated PNG signature", () => {
    const verdict = verifyMagicBytes(bytes(0x89, 0x50, 0x4e), "image/png");
    expect(verdict.ok).toBe(false);
  });

  it("accepts WebP RIFF...WEBP container with wildcard length bytes", () => {
    const verdict = verifyMagicBytes(
      bytes(
        0x52, 0x49, 0x46, 0x46,
        0xff, 0xff, 0xff, 0xff,
        0x57, 0x45, 0x42, 0x50,
        0x56, 0x50, 0x38, 0x20,
      ),
      "image/webp",
    );
    expect(verdict.ok).toBe(true);
  });

  it("rejects content claiming to be WebP but missing the WEBP marker", () => {
    const verdict = verifyMagicBytes(
      bytes(0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45),
      "image/webp",
    );
    expect(verdict.ok).toBe(false);
  });

  it("accepts PDF with the PDF marker bytes", () => {
    const verdict = verifyMagicBytes(text("%PDF-1.4\n%..."), "application/pdf");
    expect(verdict.ok).toBe(true);
  });

  it("rejects executables disguised as PDF", () => {
    const verdict = verifyMagicBytes(bytes(0x4d, 0x5a, 0x90, 0x00), "application/pdf");
    expect(verdict.ok).toBe(false);
  });

  it("accepts XLSX (PK ZIP container)", () => {
    const verdict = verifyMagicBytes(
      bytes(0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(verdict.ok).toBe(true);
  });

  it("accepts text/csv content with normal printable bytes", () => {
    const verdict = verifyMagicBytes(text("id,name,age\n1,alice,30\n"), "text/csv");
    expect(verdict.ok).toBe(true);
  });

  it("rejects binary payload disguised as text/csv (NUL byte)", () => {
    const verdict = verifyMagicBytes(
      bytes(0x69, 0x64, 0x00, 0x6e, 0x61, 0x6d, 0x65),
      "text/csv",
    );
    expect(verdict.ok).toBe(false);
  });

  it("rejects an empty buffer", () => {
    const verdict = verifyMagicBytes(new Uint8Array(0), "image/png");
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.reason).toMatch(/empty/i);
    }
  });

  it("fails closed for unregistered MIME types", () => {
    const verdict = verifyMagicBytes(text("anything"), "application/x-shellscript");
    expect(verdict.ok).toBe(false);
  });
});
