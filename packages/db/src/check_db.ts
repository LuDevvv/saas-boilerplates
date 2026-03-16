import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { rolePermissions, permissions } from "./schema/permissions";
import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(__dirname, "../.env") });

async function check() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("--- Permissions Table ---");
  const p = await db.select().from(permissions);
  console.table(p);

  console.log("--- Role Permissions Table ---");
  const rp = await db.select().from(rolePermissions);
  console.table(rp);
}

check().catch(console.error);
