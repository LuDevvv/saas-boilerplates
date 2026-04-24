import { Module } from "@nestjs/common";
import { TicketController } from "./tickets.controller.js";
import { TicketService } from "./tickets.service.js";
import { TicketRepository } from "@node-stack/db";

@Module({
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
  exports: [TicketService],
})
export class TicketModule {}
