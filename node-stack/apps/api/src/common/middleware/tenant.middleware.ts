import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId =
      req.params?.id ||
      req.params?.workspaceId ||
      req.params?.["ws-id"] ||
      (req.query?.workspaceId as string);

    if (tenantId) {
      (req as any).tenantId = tenantId;
    }
    next();
  }
}
