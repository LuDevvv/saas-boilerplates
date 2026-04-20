import { SetMetadata } from "@nestjs/common";

/**
 * Decorator to mark a controller method for audit logging.
 * The action name will be persisted in the audit log.
 */
export const AuditLog = (action: string) => SetMetadata("audit", action);
