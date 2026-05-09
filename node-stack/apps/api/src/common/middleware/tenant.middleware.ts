import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

interface TenantRequest extends Request {
  tenantId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, _res: Response, next: NextFunction): void {
    const rawTenantId: string | string[] | undefined =
      req.params?.["id"] ??
      req.params?.["workspaceId"] ??
      req.params?.["ws-id"] ??
      (req.query?.["workspaceId"] as string | string[] | undefined);
    const tenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId;

    if (tenantId) {
      req.tenantId = tenantId;
    }
    next();
  }
}
