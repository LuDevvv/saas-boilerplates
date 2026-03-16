import type { Config } from "drizzle-kit";

/**
 * Configuration for Drizzle Kit.
 * Maps schemas and output directories for migrations.
 */
export default {
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "",
  },
} satisfies Config;
