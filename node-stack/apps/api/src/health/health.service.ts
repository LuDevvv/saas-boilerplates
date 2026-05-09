import { Injectable } from "@nestjs/common";
import { db } from "@node-stack/db";
import { sql } from "drizzle-orm";

@Injectable()
export class HealthService {
  async getPgBouncerPools(): Promise<{ status: string; pools: unknown[] }> {
    try {
      const result = await (db.execute as (query: unknown) => Promise<{ rows: unknown[] }>)(sql`SHOW pools`);
      return { status: "ok", pools: result.rows };
    } catch {
      return { status: "unavailable", pools: [] };
    }
  }
}
