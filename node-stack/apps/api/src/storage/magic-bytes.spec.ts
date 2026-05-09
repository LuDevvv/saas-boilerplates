import { verifyMagicBytes } from "@node-stack/storage";
import { describe, expect, it } from "vitest";

const bytes = (...nums: number[]): Uint8Array => Uint8Array.from(nums);
const text = (s: string): Uint8Array => new TextEncoder().encode(s);

describe("verifyMagicBytes", () => {
  it("accepts JPEG when bytes start with FF D8 FF", async () => {
    const verdict = await verifyMagicBytes(
      bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46),
      "image/jpeg",
    );
    expect(verdict.ok).toBe(true);
  });

  it("rejects script payloads disguised as JPEG", async () => {
    const scriptHeader = String.fromCharCode(60, 63, 112, 104, 112, 32);
    const verdict = await verifyMagicBytes(text(scriptHeader + "echo 1;"), "image/jpeg");
    expect(verdict.ok).toBe(false);
  });

  it("accepts PNG with the 8-byte signature followed by IHDR chunk", async () => {
    // file-type v22 looks past the bare signature for chunk structure;
    // build a minimal 1x1 PNG header that satisfies the detector.
    const verdict = await verifyMagicBytes(
      bytes(
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // signature
        0x00, 0x00, 0x00, 0x0d,                         // IHDR length = 13
        0x49, 0x48, 0x44, 0x52,                         // "IHDR"
        0x00, 0x00, 0x00, 0x01,                         // width = 1
        0x00, 0x00, 0x00, 0x01,                         // height = 1
        0x08, 0x06, 0x00, 0x00, 0x00,                   // bit depth, color, compression, filter, interlace
        0x1f, 0x15, 0xc4, 0x89,                         // CRC
      ),
      "image/png",
    );
    expect(verdict.ok).toBe(true);
  });

  it("rejects content whose detected MIME differs from declared", async () => {
    // Same PNG header — but client claimed JPEG. Detected MIME wins.
    const verdict = await verifyMagicBytes(
      bytes(
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00,
        0x1f, 0x15, 0xc4, 0x89,
      ),
      "image/jpeg",
    );
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.reason).toMatch(/image\/png/);
    }
  });

  it("accepts PDF with the PDF marker bytes", async () => {
    const verdict = await verifyMagicBytes(
      text("%PDF-1.4\n%\xc4\xe5\xf2\xe5\xeb\xa7\xf3\xa0\xd0\xc4\xc6\n"),
      "application/pdf",
    );
    expect(verdict.ok).toBe(true);
  });

  it("rejects MZ executables disguised as PDF", async () => {
    const verdict = await verifyMagicBytes(
      bytes(0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00),
      "application/pdf",
    );
    expect(verdict.ok).toBe(false);
  });

  it("rejects a bare ZIP container claimed as XLSX (no OOXML manifest)", async () => {
    // PK\x03\x04 alone is detected as application/zip — not enough
    // signal to claim XLSX. file-type returns 'application/zip' which
    // mismatches the declared OOXML spreadsheet MIME.
    const verdict = await verifyMagicBytes(
      bytes(0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(verdict.ok).toBe(false);
  });

  it("accepts text/csv content with normal printable bytes", async () => {
    const verdict = await verifyMagicBytes(
      text("id,name,age\n1,alice,30\n"),
      "text/csv",
    );
    expect(verdict.ok).toBe(true);
  });

  it("rejects binary payload disguised as text/csv (NUL byte)", async () => {
    const verdict = await verifyMagicBytes(
      bytes(0x69, 0x64, 0x00, 0x6e, 0x61, 0x6d, 0x65),
      "text/csv",
    );
    expect(verdict.ok).toBe(false);
  });

  it("rejects an empty buffer", async () => {
    const verdict = await verifyMagicBytes(new Uint8Array(0), "image/png");
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) {
      expect(verdict.reason).toMatch(/empty/i);
    }
  });

  it("fails closed for binary MIME types whose magic bytes can't be detected", async () => {
    const verdict = await verifyMagicBytes(text("anything"), "application/x-shellscript");
    expect(verdict.ok).toBe(false);
  });
});
