import { encodeCursor, decodeCursor } from "@node-stack/utils";
import { buildPage } from "@node-stack/validators";
import { describe, expect, it } from "vitest";

describe("encodeCursor / decodeCursor", () => {
  it("round-trips an opaque cursor", () => {
    const original = { id: "abc-123", createdAt: "2026-05-07T00:00:00.000Z" };
    const encoded = encodeCursor(original);
    expect(typeof encoded).toBe("string");
    expect(decodeCursor<typeof original>(encoded)).toEqual(original);
  });

  it("returns null for malformed cursors", () => {
    expect(decodeCursor("$$$not-base64$$$")).toBeNull();
    expect(decodeCursor(Buffer.from("not-json").toString("base64"))).toBeNull();
  });
});

describe("buildPage", () => {
  const rows = [
    { id: "1", value: "a" },
    { id: "2", value: "b" },
    { id: "3", value: "c" },
  ];
  const cursorFn = (row: { id: string }): string => encodeCursor({ id: row.id });

  it("returns hasMore=true and trims overflow row when limit was exceeded", () => {
    const page = buildPage(rows, 2, cursorFn);
    expect(page.data).toHaveLength(2);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).not.toBeNull();
    expect(decodeCursor(page.nextCursor!)).toEqual({ id: "2" });
  });

  it("returns hasMore=false and null cursor when result fits", () => {
    const page = buildPage(rows, 5, cursorFn);
    expect(page.data).toHaveLength(3);
    expect(page.hasMore).toBe(false);
    expect(page.nextCursor).toBeNull();
  });

  it("returns empty page with null cursor when no rows", () => {
    const page = buildPage<{ id: string }>([], 10, cursorFn);
    expect(page.data).toEqual([]);
    expect(page.hasMore).toBe(false);
    expect(page.nextCursor).toBeNull();
  });

  it("handles limit=0 by returning empty page", () => {
    const page = buildPage(rows, 0, cursorFn);
    expect(page.data).toEqual([]);
    expect(page.hasMore).toBe(true);
    // nextCursor is null because trimmed slice is empty (no last row).
    expect(page.nextCursor).toBeNull();
  });
});
