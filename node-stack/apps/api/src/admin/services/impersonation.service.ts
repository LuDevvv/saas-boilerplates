import { Injectable, Logger } from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class ImpersonationService {
  private readonly logger = new Logger(ImpersonationService.name);

  constructor(
    private authService: AuthService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Generates a token pair for a target user for impersonation.
   * Logs the action for security auditing using unified event emitter.
   * 
   * @param adminId The ID of the super admin performing the action.
   * @param targetUserId The ID of the user to impersonate.
   * @param context Metadata about the request (IP, UA)
   */
  async impersonate(adminId: string, targetUserId: string, context: { ipAddress?: string; userAgent?: string } = {}) {
    this.logger.log(`Admin ${adminId} is impersonating user ${targetUserId}`);

    const tokens = await this.authService.createImpersonationSession(targetUserId);

    // Track the impersonation in audit logs via unified Event Emitter
    this.eventEmitter.emit("audit.log", {
      action: "user.impersonated",
      userId: adminId,
      entityType: "user",
      entityId: targetUserId,
      metadata: {
        reason: "Admin support/troubleshooting",
        timestamp: new Date().toISOString(),
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return tokens;
  }
}
