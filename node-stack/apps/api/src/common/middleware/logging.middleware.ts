import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

import { logWithContext } from "../logger";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const level: "info" | "error" = statusCode >= 400 ? "error" : "info";

      logWithContext(level, "Request completed", {
        method: req.method,
        path: req.path,
        statusCode,
        durationMs: duration,
        requestId: (req as any).requestId,
        tenantId: (req as any).tenantId,
        userId: (req as any).user?.id,
      });
    });

    next();
  }
}
