/**
 * Cursor-encoding helpers shared by paginated list endpoints.
 *
 * The DTO/response types and the `buildPage` helper live in
 * `@node-stack/validators` (they depend on Nest + Swagger metadata);
 * these primitives stay in `@node-stack/utils` so non-Nest packages
 * can encode/decode cursors without pulling Nest in.
 */

export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

export function decodeCursor<T extends Record<string, unknown>>(
  cursor: string,
): T | null {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8")) as T;
  } catch {
    return null;
  }
}
