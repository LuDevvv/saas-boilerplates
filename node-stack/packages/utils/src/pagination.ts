// Lightweight cursor-based pagination helper
import type { PaginatedResponse } from "./dto/pagination.dto";

/**
 * Encode an object into a base64 cursor string.
 */
export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

/**
 * Decode a base64 cursor string back into an object.
 * Returns null if decoding fails.
 */
export function decodeCursor<T extends Record<string, unknown>>(
  cursor: string,
): T | null {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8")) as T;
  } catch {
    return null;
  }
}

// A very loose Query type placeholder; in real setup, import the query builder type from your DB lib
type Query<_T, R> = {
  where?: (condition: unknown) => Query<_T, R>;
  orderBy?: (field: unknown) => Query<_T, R>;
  limit: (count: number) => Promise<R>;
};

/**
 * Paginate a pre-built Drizzle query.
 * Accepts optional cursor for cursor-based pagination.
 * The caller is responsible for orderBy on the query for correct pagination.
 */
export async function paginate<T>(
  query: Query<unknown, T[]>,
  options: { limit: number; cursor?: string | null },
): Promise<PaginatedResponse<T>> {
  const { limit, cursor } = options;

  // If a cursor is provided, decode and try to apply a cursor filter before ordering
  if (cursor) {
    const cursorData = decodeCursor<{ id: string }>(cursor);
    if (cursorData?.id) {
      try {
        // Attempt to apply a cursor filter using Drizzle's GT operator if available
         
        const { gt } = require("drizzle-orm");
         
        const { schema } = require("@node-stack/db");
        if (schema.workspaces?.id && query.where) {
          query.where(gt(schema.workspaces.id, cursorData.id));
        }
      } catch {
        // If dynamic import/apply fails, continue without cursor filtering
      }
    }
  }

  // Always enforce a deterministic order when paginating
  try {
    if (query.orderBy) {
      query.orderBy(require("@node-stack/db").schema.workspaces?.id);
    }
  } catch {
    // ignore if not available
  }

  // Fetch limit+1 to determine hasMore
  const results = (await query.limit(limit + 1)) as unknown as T[];
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  return {
    data,
    nextCursor:
      hasMore && data.length > 0
        ? encodeCursor({
            id:
              (data[data.length - 1] as Record<string, unknown>).id ??
              (data[data.length - 1] as Record<string, unknown>).workspaceId,
          })
        : null,
    hasMore,
  };
}
