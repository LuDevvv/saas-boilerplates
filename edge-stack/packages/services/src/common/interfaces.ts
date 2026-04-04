import type { JobType, QueueMessage, EmailJobPayload } from "@workspace/types";

/**
 * Interface for the Queue Service.
 * Used for dependency injection in business services.
 */
export interface IQueueService {
  emit(message: QueueMessage): Promise<void>;
  enqueue<T>(type: JobType, payload: T): Promise<void>;
  enqueueWelcomeEmail(data: { email: string; name: string }): Promise<void>;
  enqueuePasswordResetEmail(data: {
    email: string;
    token: string;
  }): Promise<void>;
  enqueueBillingSync(data: {
    userId: string;
    workspaceId: string;
    stripeCustomerId: string;
    payload: Record<string, any>;
  }): Promise<void>;
  enqueueActivityLog(data: {
    workspaceId: string;
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
  enqueueUsageSync(data: {
    workspaceId: string;
    metricName: string;
    currentUsage: number;
  }): Promise<void>;
}

/**
 * Interface for the JWT Service.
 */
export interface IJwtService {
  signToken(payload: Record<string, any>): Promise<string>;
  verifyToken(token: string): Promise<Record<string, unknown>>;
}

/**
 * Interface for the Cache Service (KV).
 */
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Helper to generate consistent cache keys.
 */
export const CACHE_KEYS = {
  userSession: (userId: string) => `user:session:${userId}`,
  userWorkspaces: (userId: string) => `user:workspaces:${userId}`,
  workspaceMeta: (workspaceId: string) => `workspace:meta:${workspaceId}`,
  userMembership: (userId: string, workspaceId: string) =>
    `user:membership:${userId}:${workspaceId}`,
  workspacePlan: (workspaceId: string) => `workspace:plan:${workspaceId}`,
};

/**
 * Interface for the Email Service.
 */
export interface IEmailService {
  sendWelcomeEmail(email: string, name: string): Promise<unknown>;
  sendPasswordResetEmail(email: string, resetLink: string): Promise<unknown>;
  sendVerificationEmail(email: string, verifyLink: string): Promise<unknown>;
  sendTeamInviteEmail(
    email: string,
    invitedByEmail: string,
    workspaceName: string,
    inviteLink: string,
  ): Promise<unknown>;
}
