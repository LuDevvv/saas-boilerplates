import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";

import { JwtAuthGuard } from "@/auth/guards/jwt.guard.js";
import { AdminGuard } from "@/common/guards/admin.guard.js";

/**
 * Decorator that applies JwtAuthGuard and AdminGuard.
 * Restricted to users with administrative roles (admin, super_admin).
 */
export function AdminOnly(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    UseGuards(JwtAuthGuard, AdminGuard),
    ApiBearerAuth("JWT-auth"),
    ApiResponse({ status: 401, description: "Unauthorized" }),
    ApiResponse({ status: 403, description: "Forbidden: Admin access required" }),
  );
}
