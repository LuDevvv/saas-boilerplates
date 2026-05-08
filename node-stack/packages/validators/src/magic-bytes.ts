/**
 * Magic-byte signature detection for uploaded files.
 *
 * Defends against the "PHP-as-jpg" / disguised-extension class of
 * attacks: a client may declare any MIME + filename it likes, but the
 * file's leading bytes either match the declared type or do not.
 *
 * Used by the storage `completeUpload` flow after S3 reports the
 * object exists; we range-fetch the first ~32 bytes and check them
 * against this table. Mismatch ⇒ delete the object and reject.
 *
 * Signature table is intentionally short — only formats listed in
 * `UPLOAD_POLICIES` are recognised. Unknown MIME types are rejected
 * fail-closed.
 */

export const MAGIC_BYTES_PROBE_SIZE = 32;

export type MagicByteVerdict =
  | { ok: true; matchedMimeType: string }
  | { ok: false; reason: string };

interface BinarySignature {
  readonly mimeType: string;
  readonly bytes: ReadonlyArray<number | null>; // null = wildcard byte
  readonly offset?: number;
}

const BINARY_SIGNATURES: readonly BinarySignature[] = [
  { mimeType: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  {
    mimeType: "image/png",
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  { mimeType: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF87a / GIF89a
  {
    mimeType: "image/webp",
    bytes: [
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      null, null, null, null, // 4-byte length (wildcard)
      0x57, 0x45, 0x42, 0x50, // "WEBP"
    ],
  },
  { mimeType: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // %PDF-
  {
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    bytes: [0x50, 0x4b, 0x03, 0x04], // PK.. (ZIP/OOXML container)
  },
  {
    mimeType: "application/vnd.ms-excel",
    bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], // CFB
  },
];

const TEXT_LIKE_MIME_TYPES = new Set<string>([
  "text/csv",
  "text/plain",
  "application/json",
]);

function bytesMatch(
  buf: Uint8Array,
  signature: BinarySignature,
): boolean {
  const offset = signature.offset ?? 0;
  if (buf.length < offset + signature.bytes.length) return false;
  for (let i = 0; i < signature.bytes.length; i++) {
    const expected = signature.bytes[i];
    if (expected === null) continue;
    if (buf[offset + i] !== expected) return false;
  }
  return true;
}

function isProbablyText(buf: Uint8Array): boolean {
  if (buf.length === 0) return false;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i] ?? 0;
    if (byte === 0x00) return false; // NUL byte = binary
    // allow tab/LF/CR + printable ASCII + UTF-8 continuation bytes
    const isControl =
      byte < 0x09 ||
      (byte > 0x0d && byte < 0x20 && byte !== 0x1b);
    if (isControl) return false;
  }
  return true;
}

/**
 * Probe the first bytes of an uploaded object and decide whether they
 * match the declared MIME type. Caller is expected to have already
 * verified the MIME is allowed by the relevant upload policy.
 */
export function verifyMagicBytes(
  buf: Uint8Array,
  declaredMimeType: string,
): MagicByteVerdict {
  if (buf.length === 0) {
    return { ok: false, reason: "Empty file (zero bytes)" };
  }

  // Binary formats: must match a known signature for the declared type.
  for (const sig of BINARY_SIGNATURES) {
    if (sig.mimeType !== declaredMimeType) continue;
    if (bytesMatch(buf, sig)) {
      return { ok: true, matchedMimeType: sig.mimeType };
    }
    return {
      ok: false,
      reason: `Content does not match declared MIME type ${declaredMimeType}`,
    };
  }

  // Text-like formats: no canonical magic bytes, do a printable-ASCII
  // check to stop binary payloads being smuggled as text/csv etc.
  if (TEXT_LIKE_MIME_TYPES.has(declaredMimeType)) {
    if (isProbablyText(buf)) {
      return { ok: true, matchedMimeType: declaredMimeType };
    }
    return {
      ok: false,
      reason: `Content contains binary data but was declared as ${declaredMimeType}`,
    };
  }

  // MIME wasn't covered by either table — fail closed.
  return {
    ok: false,
    reason: `No magic-byte signature registered for MIME type ${declaredMimeType}`,
  };
}
