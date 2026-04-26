import { Module } from "@nestjs/common";
import { TicketRepository } from "@node-stack/db";

import { TicketController } from "@/tickets/tickets.controller.js";
import { TicketService } from "@/tickets/tickets.service.js";

@Module({
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
  exports: [TicketService],
})
export class TicketModule {}
