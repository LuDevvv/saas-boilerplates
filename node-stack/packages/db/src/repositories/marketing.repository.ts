import { Injectable, Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema/index.js";
import { waitlist, type NewWaitlistEntry, type WaitlistEntry } from "../schema/marketing.js";
import { DB_TOKEN } from "../tokens.js";

@Injectable()
export class MarketingRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Add a new email to the waitlist
   */
  async joinWaitlist(data: NewWaitlistEntry): Promise<WaitlistEntry> {
    const [result] = await this.db
      .insert(waitlist)
      .values(data)
      .onConflictDoUpdate({
        target: [waitlist.email],
        set: { 
          name: data.name ?? null,
          source: data.source ?? "marketing_site"
        }
      })
      .returning();
    return result;
  }

  /**
   * Find a waitlist entry by email
   */
  async findByEmail(email: string): Promise<WaitlistEntry | undefined> {
    const [result] = await this.db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, email))
      .limit(1);
    return result;
  }

  /**
   * Get total waitlist count
   */
  async getWaitlistCount(): Promise<number> {
    const result = await this.db
      .select({ count: waitlist.id })
      .from(waitlist);
    return result.length;
  }
}
