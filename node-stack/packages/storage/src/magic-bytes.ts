import { fileTypeFromBuffer } from "file-type";

/**
 * Defense-in-depth content verification for uploads.
 *
 * Uploads come in via S3 presigned URLs, so the API never sees the
 * bytes during the upload itself; the client-declared MIME and
 * filename are advisory until we re-fetch a sample on confirm.
 * The confirm-upload flow range-fetches the first
 * `MAGIC_BYTES_PROBE_SIZE` bytes and runs them through this verifier
 * — file-type detects the actual format from the magic bytes; if
 * the result disagrees with what the client declared at presign-
 * time we reject the upload.
 *
 * file-type does not produce a verdict for plain-text formats
 * (no canonical signature). For the handful of text MIME types
 * that UPLOAD_POLICIES allows we fall back to a printable-byte
 * scan — enough to stop a binary payload smuggled as text/csv.
 */
export const MAGIC_BYTES_PROBE_SIZE = 4096;

export type MagicByteVerdict =
  | { ok: true; matchedMimeType: string }
  | { ok: false; reason: string };

const TEXT_LIKE_MIME_TYPES = new Set<string>([
  "text/csv",
  "text/plain",
  "application/json",
]);

function isProbablyText(buf: Uint8Array): boolean {
  if (buf.length === 0) return false;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i] ?? 0;
    if (byte === 0x00) return false; // NUL byte ⇒ binary
    const isControl =
      byte < 0x09 ||
      (byte > 0x0d && byte < 0x20 && byte !== 0x1b);
    if (isControl) return false;
  }
  return true;
}

export async function verifyMagicBytes(
  buf: Uint8Array,
  declaredMimeType: string,
): Promise<MagicByteVerdict> {
  if (buf.length === 0) {
    return { ok: false, reason: "Empty file (zero bytes)" };
  }

  const detected = await fileTypeFromBuffer(buf);
  if (detected) {
    if (detected.mime === declaredMimeType) {
      return { ok: true, matchedMimeType: detected.mime };
    }
    return {
      ok: false,
      reason: `Content magic bytes resolve to ${detected.mime} but were declared as ${declaredMimeType}`,
    };
  }

  // file-type could not identify a binary signature; only safe to
  // accept this for the small set of allowed text formats.
  if (TEXT_LIKE_MIME_TYPES.has(declaredMimeType)) {
    if (isProbablyText(buf)) {
      return { ok: true, matchedMimeType: declaredMimeType };
    }
    return {
      ok: false,
      reason: `Content contains binary data but was declared as ${declaredMimeType}`,
    };
  }

  return {
    ok: false,
    reason: `Could not verify magic bytes for declared MIME type ${declaredMimeType}`,
  };
}
