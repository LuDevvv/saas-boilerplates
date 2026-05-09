import { Injectable, Logger, NotFoundException, ForbiddenException, Inject } from "@nestjs/common";
import { DB_TOKEN, TicketRepository, withTenantTx } from "@node-stack/db";
import { type Ticket, type NewTicket , Database } from "@node-stack/db";
import {
  CreateTicketDto,
  UpdateTicketDto,
} from "@node-stack/validators";

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepository: TicketRepository,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  /**
   * Create a new ticket
   */
  async create(
    workspaceId: string,
    userId: string,
    dto: CreateTicketDto,
  ): Promise<Ticket> {
    this.logger.debug(`Creating ticket in workspace ${workspaceId}`);

    const data: NewTicket = {
      workspaceId,
      name: dto.name,
      description: dto.description,
      createdBy: userId,
      status: "pending",
    };

    const ticket = await withTenantTx(
      workspaceId,
      (tx) => this.ticketRepository.create(data, tx),
      this.db,
    );

    this.logger.log(`Created ticket ${ticket.id} in workspace ${workspaceId}`);

    return ticket;
  }

  /**
   * List tickets for a workspace
   */
  async list(
    workspaceId: string,
    query: { status?: string; cursor?: string; limit?: number },
  ): Promise<{ data: Ticket[]; nextCursor?: string }> {
    const { status, cursor, limit = 20 } = query;

    const tickets = await withTenantTx(
      workspaceId,
      (tx) =>
        status
          ? this.ticketRepository.findByWorkspaceAndStatus(
              workspaceId,
              status as Ticket["status"],
              tx,
            )
          : this.ticketRepository.findByWorkspace(workspaceId, tx),
      this.db,
    );
    let filtered = tickets;

    // Apply cursor pagination if provided
    if (cursor) {
      const cursorIndex = filtered.findIndex(t => t.id === cursor);
      if (cursorIndex !== -1) {
        filtered = filtered.slice(cursorIndex + 1);
      }
    }

    // Apply limit
    const limitedData = filtered.slice(0, limit);
    const nextCursor = limitedData.length === limit ? limitedData[limitedData.length - 1]?.id : undefined;

    return {
      data: limitedData,
      nextCursor,
    };
  }

  /**
   * Find a ticket by ID (with workspace validation)
   */
  async findById(workspaceId: string, id: string): Promise<Ticket> {
    return withTenantTx(workspaceId, async (tx) => {
      const ticket = await this.ticketRepository.findById(id, tx);
      if (!ticket) {
        throw new NotFoundException(`Ticket not found`);
      }
      if (ticket.workspaceId !== workspaceId) {
        throw new ForbiddenException(`Access denied to this ticket`);
      }
      return ticket;
    }, this.db);
  }

  async update(
    workspaceId: string,
    id: string,
    dto: UpdateTicketDto,
  ): Promise<Ticket> {
    const updated = await withTenantTx(workspaceId, async (tx) => {
      const ticket = await this.ticketRepository.findById(id, tx);
      if (!ticket || ticket.workspaceId !== workspaceId) {
        throw new NotFoundException(`Ticket not found`);
      }
      const next = await this.ticketRepository.update(id, dto, tx);
      if (!next) {
        throw new NotFoundException(`Ticket not found`);
      }
      return next;
    }, this.db);

    this.logger.log(`Updated ticket ${id}`);
    return updated;
  }

  async softDelete(workspaceId: string, id: string): Promise<void> {
    await withTenantTx(workspaceId, async (tx) => {
      const ticket = await this.ticketRepository.findById(id, tx);
      if (!ticket || ticket.workspaceId !== workspaceId) {
        throw new NotFoundException(`Ticket not found`);
      }
      await this.ticketRepository.softDelete(id, tx);
    }, this.db);
    this.logger.log(`Soft deleted ticket ${id}`);
  }
}
