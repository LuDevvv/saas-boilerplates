import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";
import { SuperAdminGuard } from "../guards/super-admin.guard";

/**
 * Decorator that applies JwtAuthGuard and SuperAdminGuard.
 * Restricted to super_admin role only.
 */
export function AdminOnly() {
  return applyDecorators(UseGuards(JwtAuthGuard, SuperAdminGuard));
}
