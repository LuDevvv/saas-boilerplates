import { ApiProperty } from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

/**
 * Shared cursor-pagination DTO. Use as `@Query() query: PaginationDto`
 * on any list endpoint that returns `PaginatedResponse<T>`.
 *
 * Cursor values are opaque base64-encoded JSON blobs the client
 * round-trips between requests; clients MUST NOT inspect or modify
 * them. See `encodeCursor` / `decodeCursor` in @node-stack/utils.
 */
export const PaginationSchema = z.object({
  cursor: z
    .string()
    .optional()
    .describe("Opaque cursor returned by the previous page"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Page size; max 100"),
});

export type PaginationQuery = z.infer<typeof PaginationSchema>;

export class PaginationDto extends createZodDto(PaginationSchema) {
  @ApiProperty({
    required: false,
    description: "Opaque cursor returned by the previous page",
    example: "eyJpZCI6ImFiYzEyMyJ9",
  })
  declare cursor?: string;

  @ApiProperty({
    required: false,
    description: "Page size; min 1, max 100",
    default: 20,
    example: 20,
  })
  declare limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Standard "fetch limit+1, peel off the overflow row" cursor pager.
 *
 * Callers fetch `limit + 1` rows ordered deterministically (e.g. by
 * `(createdAt DESC, id DESC)`), pass the result and the requested
 * limit, and this helper:
 *   - trims the overflow row,
 *   - sets `hasMore = true` when the overflow row was present,
 *   - asks `getCursor(lastRow)` for the opaque cursor of the last
 *     surviving row, or returns `null` when there is no next page.
 */
export function buildPage<T>(
  rows: T[],
  limit: number,
  getCursor: (row: T) => string,
): PaginatedResponse<T> {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = data[data.length - 1];
  return {
    data,
    nextCursor: hasMore && lastRow !== undefined ? getCursor(lastRow) : null,
    hasMore,
  };
}
