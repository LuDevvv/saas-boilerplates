import { Injectable, Logger, NotFoundException, ForbiddenException } from "@nestjs/common";
import { TicketRepository } from "@node-stack/db";
import { type Ticket, type NewTicket } from "@node-stack/db";
import {
  CreateTicketDto,
  UpdateTicketDto,
} from "@node-stack/validators";

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepository: TicketRepository,
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

    const ticket = await this.ticketRepository.create(data);
    
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

    let tickets: Ticket[];
    
    if (status) {
      tickets = await this.ticketRepository.findByWorkspaceAndStatus(
        workspaceId,
        status as Ticket["status"]
      );
    } else {
      tickets = await this.ticketRepository.findByWorkspace(workspaceId);
    }

    // Apply cursor pagination if provided
    if (cursor) {
      const cursorIndex = tickets.findIndex(t => t.id === cursor);
      if (cursorIndex !== -1) {
        tickets = tickets.slice(cursorIndex + 1);
      }
    }

    // Apply limit
    const limitedData = tickets.slice(0, limit);
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
    const ticket = await this.ticketRepository.findById(id);

    if (!ticket) {
      throw new NotFoundException(`Ticket not found`);
    }

    // Verify workspace ownership
    if (ticket.workspaceId !== workspaceId) {
      throw new ForbiddenException(`Access denied to this ticket`);
    }

    return ticket;
  }

  /**
   * Update a ticket
   */
  async update(
    workspaceId: string,
    id: string,
    dto: UpdateTicketDto,
  ): Promise<Ticket> {
    // First verify access
    await this.findById(workspaceId, id);

    const updated = await this.ticketRepository.update(id, dto);

    if (!updated) {
      throw new NotFoundException(`Ticket not found`);
    }

    this.logger.log(`Updated ticket ${id}`);
    
    return updated;
  }

  /**
   * Soft delete a ticket
   */
  async softDelete(workspaceId: string, id: string): Promise<void> {
    // Verify access first
    await this.findById(workspaceId, id);

    await this.ticketRepository.softDelete(id);
    
    this.logger.log(`Soft deleted ticket ${id}`);
  }
}
