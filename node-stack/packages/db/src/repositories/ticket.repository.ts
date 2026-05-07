import { Injectable, Inject } from "@nestjs/common";
import { eq, and, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DB_TOKEN } from "../tokens.js";
import * as schema from "../schema/index.js";
import { tickets, type Ticket, type NewTicket } from "../schema/tickets.js";

type Tx = NodePgDatabase<typeof schema>;

@Injectable()
export class TicketRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: Tx,
  ) {}

  async findById(id: string, tx?: Tx): Promise<Ticket | undefined> {
    const database = tx ?? this.db;
    const [result] = await database
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);
    return result;
  }

  async findByWorkspace(workspaceId: string, tx?: Tx): Promise<Ticket[]> {
    const database = tx ?? this.db;
    return database
      .select()
      .from(tickets)
      .where(eq(tickets.workspaceId, workspaceId))
      .orderBy(desc(tickets.createdAt));
  }

  async findByWorkspaceAndStatus(
    workspaceId: string,
    status: Ticket["status"],
    tx?: Tx,
  ): Promise<Ticket[]> {
    const database = tx ?? this.db;
    return database
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

  async create(data: NewTicket, tx?: Tx): Promise<Ticket> {
    const database = tx ?? this.db;
    const [result] = await database
      .insert(tickets)
      .values(data)
      .returning();
    return result;
  }

  async update(
    id: string,
    data: Partial<NewTicket>,
    tx?: Tx,
  ): Promise<Ticket | undefined> {
    const database = tx ?? this.db;
    const [result] = await database
      .update(tickets)
      .set(data)
      .where(eq(tickets.id, id))
      .returning();
    return result;
  }

  async softDelete(id: string, tx?: Tx): Promise<void> {
    const database = tx ?? this.db;
    await database
      .update(tickets)
      .set({ status: "deleted", deletedAt: new Date() })
      .where(eq(tickets.id, id));
  }

  async delete(id: string, tx?: Tx): Promise<void> {
    const database = tx ?? this.db;
    await database
      .delete(tickets)
      .where(eq(tickets.id, id));
  }
}
