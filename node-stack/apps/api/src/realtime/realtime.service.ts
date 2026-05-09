import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { RealtimeGateway } from '@/realtime/realtime.gateway.js';

export interface RealtimeEventPayload {
  userId: string;
  workspaceId?: string;
  data: unknown;
}

@Injectable()
export class RealtimeService implements OnModuleInit {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  onModuleInit(): void {
    this.logger.log('RealtimeService initialized - listening for internal events');
  }

  @OnEvent('ai_job.completed')
  async handleAiJobCompleted(payload: { userId: string; workspaceId: string; jobId: string; result: unknown }): Promise<void> {
    this.logger.log(`AI job completed for user ${payload.userId}, job ${payload.jobId}`);
    
    // Transient real-time update
    this.emitToUser(payload.userId, 'ai_job.completed', {
      jobId: payload.jobId,
      result: payload.result,
      timestamp: new Date().toISOString(),
    });

    if (payload.workspaceId) {
      this.emitToWorkspace(payload.workspaceId, 'ai_job.completed', {
        jobId: payload.jobId,
        result: payload.result,
        userId: payload.userId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @OnEvent('webhook.delivery.failed')
  async handleWebhookDeliveryFailed(payload: { workspaceId: string; webhookId: string; error: string; attempts: number }): Promise<void> {
    this.logger.log(`Webhook delivery failed for workspace ${payload.workspaceId}, webhook ${payload.webhookId}`);
    
    this.emitToWorkspace(payload.workspaceId, 'webhook.delivery.failed', {
      webhookId: payload.webhookId,
      error: payload.error,
      attempts: payload.attempts,
      timestamp: new Date().toISOString(),
    });
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    this.realtimeGateway.emitToUser(userId, event, data);
  }

  emitToWorkspace(workspaceId: string, event: string, data: unknown): void {
    this.realtimeGateway.emitToWorkspace(workspaceId, event, data);
  }
}
