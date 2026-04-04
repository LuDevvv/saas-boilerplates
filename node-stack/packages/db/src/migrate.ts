import { Logger } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const logger = new Logger("Migration");

async function runMigrations() {
  const connectionString =
    process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("MIGRATION_DATABASE_URL or DATABASE_URL must be set");
    process.exit(1);
  }

  logger.log(
    `Running migrations via: ${
      process.env.MIGRATION_DATABASE_URL
        ? "MIGRATION_DATABASE_URL (direct)"
        : "DATABASE_URL"
    }`,
  );

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  logger.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./migrations" });
  logger.log("Migrations complete.");

  await pool.end();
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
