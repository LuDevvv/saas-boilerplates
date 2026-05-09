export const DB_TOKEN = Symbol("DRIZZLE_DB");
export const POOL_TOKEN = Symbol("PG_POOL");

/** Read-only Drizzle instance pointing at the replica (or falls back to primary). */
export const READ_DB_TOKEN = Symbol("DRIZZLE_READ_DB");
