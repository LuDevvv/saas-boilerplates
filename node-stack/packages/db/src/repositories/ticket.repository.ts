import { Injectable, Inject } from "@nestjs/common";
import { eq, and, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DB_TOKEN } from "../tokens.js";
import * as schema from "../schema/index.js";
import { tickets, type Ticket, type NewTicket } from "../schema/tickets.js";

@Injectable()
export class TicketRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Find a single ticket by ID
   */
  async findById(id: string): Promise<Ticket | undefined> {
    const [result] = await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);
    return result;
  }

  /**
   * Find ticket by workspace
   */
  async findByWorkspace(workspaceId: string): Promise<Ticket[]> {
    return this.db
      .select()
      .from(tickets)
      .where(eq(tickets.workspaceId, workspaceId))
      .orderBy(desc(tickets.createdAt));
  }

  /**
   * Find ticket by workspace and status
   */
  async findByWorkspaceAndStatus(
    workspaceId: string,
    status: Ticket["status"]
  ): Promise<Ticket[]> {
    return this.db
      .select()
      .from(tickets)
      .where(
        and(
          eq(tickets.workspaceId, workspaceId),
          eq(tickets.status, status)
        )
      )
      .orderBy(desc(tickets.createdAt));
  }

  /**
   * Create a new ticket
   */
  async create(data: NewTicket): Promise<Ticket> {
    const [result] = await this.db
      .insert(tickets)
      .values(data)
      .returning();
    return result;
  }

  /**
   * Update a ticket
   */
  async update(id: string, data: Partial<NewTicket>): Promise<Ticket | undefined> {
    const [result] = await this.db
      .update(tickets)
      .set(data)
      .where(eq(tickets.id, id))
      .returning();
    return result;
  }

  /**
   * Soft delete a ticket
   */
  async softDelete(id: string): Promise<void> {
    await this.db
      .update(tickets)
      .set({ status: "deleted", deletedAt: new Date() })
      .where(eq(tickets.id, id));
  }

  /**
   * Hard delete a ticket
   */
  async delete(id: string): Promise<void> {
    await this.db
      .delete(tickets)
      .where(eq(tickets.id, id));
  }
}
