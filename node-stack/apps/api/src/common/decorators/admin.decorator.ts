import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";

import { JwtAuthGuard } from "@/auth/guards/jwt.guard.js";
import { SuperAdminGuard } from "@/common/guards/super-admin.guard.js";

/**
 * Decorator that applies JwtAuthGuard and SuperAdminGuard.
 * Restricted to super_admin role only.
 */
export function AdminOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, SuperAdminGuard),
    ApiBearerAuth("JWT-auth"),
    ApiResponse({ status: 401, description: "Unauthorized" }),
    ApiResponse({ status: 403, description: "Forbidden: Admin access required" }),
  );
}
