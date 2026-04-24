import { Injectable } from "@nestjs/common";
import { db } from "@node-stack/db";
import { sql } from "drizzle-orm";

@Injectable()
export class HealthService {
  async getPgBouncerPools(): Promise<{ status: string; pools: unknown[] }> {
    try {
      const result = await db.execute(sql`SHOW pools` as any);
      return { status: "ok", pools: result.rows };
    } catch {
      return { status: "unavailable", pools: [] };
    }
  }
}
